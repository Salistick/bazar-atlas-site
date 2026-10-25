/* Static Pages adapter. Reads only files generated from the published SQLite. */
(() => {
  'use strict';
  const nativeFetch=window.fetch.bind(window);
  const base=new URL('./',document.baseURI);
  const buildId=window.BAZAAR_BUILD_ID || '';
  const versioned=url=>{
    if(buildId) url.searchParams.set('v',buildId);
    return url;
  };
  const cache=new Map();
  window.BAZAAR_STATIC=true;
  async function data(name) {
    if(!cache.has(name)) cache.set(name,(async()=>{
      const response=await nativeFetch(versioned(new URL('site-data/'+name+'.json.gz',base)));
      if(!response.ok) throw new Error('Registro indisponível na base publicada.');
      const stream=response.body.pipeThrough(new DecompressionStream('gzip'));
      return new Response(stream).json();
    })().catch(error=>{cache.delete(name);throw error;}));
    return cache.get(name);
  }
  const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
  const deadline=value=>{
    const text=String(value || '').replace(/\s+/g,' ').trim();
    if(/^\d{4}-\d{2}-\d{2}T/.test(text)) return Date.parse(text);
    const match=text.match(/^([A-Z][a-z]{2})\s+(\d{1,2})\s+(\d{4}),\s+(\d{1,2}:\d{2})\s+(CEST|CET)$/);
    if(!match)return NaN;
    const month=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(match[1])+1;
    return Date.parse(match[3]+'-'+String(month).padStart(2,'0')+'-'+match[2].padStart(2,'0')+'T'+match[4].padStart(5,'0')+':00'+(match[5]==='CEST'?'+02:00':'+01:00'));
  };
  const expired=card=>Number.isFinite(deadline(card.end))&&deadline(card.end)<=Date.now();
  const pendingResult={resultStatus:'pending',paymentConfirmed:false,finalBid:null,
    sourceStatus:'',sold:false,cancelled:false,finished:false,finalResultPending:true};
  function historicalSnapshot(snapshot){
    return {...snapshot,auction:{...snapshot.auction,...pendingResult,type:'past'},
      displayCard:{...snapshot.displayCard,...pendingResult,type:'past',market:'past'}};
  }
  function historicalCard(card){
    return {...card,...pendingResult,type:'past',market:'past',
      snapshot:card.snapshot?historicalSnapshot(card.snapshot):card.snapshot};
  }
  async function projectedCoverage(){
    const [source,lookup]=await Promise.all([data('coverage'),data('lookup')]);
    const active=lookup.filter(card=>card.type==='current'&&!expired(card));
    const history=new Set(lookup.filter(card=>card.type==='past').map(card=>String(card.id)));
    for(const card of lookup)if(card.type==='current'&&expired(card)&&card.snapshotComplete===true)history.add(String(card.id));
    const upcoming=active.map(card=>deadline(card.end)).filter(value=>Number.isFinite(value)&&value>Date.now());
    return {...source,active:active.length,downloaded:active.filter(card=>card.snapshotComplete===true).length,history:history.size,
      nextExpiryAt:upcoming.length?Math.min(...upcoming):null};
  }
  async function projectedIndex(kind){
    const [index,current,coverage]=await Promise.all([data('index-'+kind),data('index-current'),projectedCoverage()]);
    let auctions;
    if(kind==='current')auctions=current.auctions.filter(card=>!expired(card));
    else{
      const merged=new Map(index.auctions.map(card=>[String(card.id),card]));
      for(const card of current.auctions){
        if(expired(card)&&card.snapshotComplete===true&&!merged.has(String(card.id)))merged.set(String(card.id),historicalCard(card));
      }
      auctions=[...merged.values()];
    }
    return {...index,auctions,total:auctions.length,coverage,nextExpiryAt:coverage.nextExpiryAt,
      worlds:[...new Set(auctions.map(card=>card.world).filter(Boolean))].sort()};
  }
  async function detail(id){
    const [result,lookup]=await Promise.all([data('details/'+id),data('lookup')]);
    const card=lookup.find(item=>String(item.id)===String(id)&&item.type==='past') ||
      lookup.find(item=>String(item.id)===String(id));
    return card?.type==='current'&&card.snapshotComplete===true&&expired(card)
      ? {...result,snapshot:historicalSnapshot(result.snapshot)} : result;
  }
  const vocation=value=>String(value || '').toLowerCase().replace(/^(elite |royal |master |elder |exalted )/,'');
  const serverKind=card=>card.pvpType&&card.battleyeColor?card.pvpType+'|'+card.battleyeColor:null;
  async function estimate(id) {
    const target=(await data('details/'+id)).snapshot;
    const card=target.displayCard || {}, kind=serverKind(card);
    const sales=(await data('sales')).filter(s=>String(s.id)!==id);
    const keys=['magic','club','sword','axe','distance','fist'];
    const skill=key=>Number(target.skills?.[key]?.level || 0);
    const primary=keys.reduce((best,key)=>skill(key)>skill(best)?key:best,keys[0]);
    const matches=kind?sales.filter(s=>vocation(s.character.vocation)===vocation(target.character.vocation)&&
      Math.abs(Number(s.character.level)-Number(target.character.level))<=100&&
      Math.abs(Number(s.skills?.[primary]?.level || 0)-skill(primary))<=5&&serverKind(s)===kind):[];
    const prices=matches.map(s=>Number(s.price)).sort((a,b)=>a-b), n=prices.length;
    const raw=n?(prices[Math.floor(n/2)]+prices[Math.floor((n-1)/2)])/2:null;
    // Python round uses ties-to-even, including the median of two integer bids.
    const median=raw===null?null:raw%1===0.5?(Math.floor(raw)%2===0?Math.floor(raw):Math.ceil(raw)):Math.round(raw);
    return {count:n,median,comparables:matches,available:sales.length,limited:false,source:'Published Bazaar history only',reason:!kind?'missing_server_metadata':!n?'no_local_comparables':null};
  }
  window.fetch=async (input,options={})=>{
    const url=new URL(typeof input==='string'?input:input.url,base);
    if(url.origin!==base.origin) return nativeFetch(input,options);
    if(!url.pathname.startsWith('/api/bazaar/')) {
      // Existing root-relative catalog requests must honor a project Pages path.
      if(typeof input==='string' && input.startsWith('/') && !input.startsWith('//')) return nativeFetch(versioned(new URL(input.slice(1),base)),options);
      return nativeFetch(input,options);
    }
    const action=url.pathname.slice('/api/bazaar/'.length), id=url.searchParams.get('auctionid') || '';
    try {
      if(action==='index-status') return json(await projectedCoverage());
      if(action==='filter-index') return json(await projectedIndex(url.searchParams.get('type')==='past'?'past':'current'));
      if(action==='detail') return json(await detail(id));
      if(action==='estimate') return json(await estimate(id));
      if(action==='status') return json({status:'published',scheduleInstalled:false});
      if(action==='recent') return json({auctions:[]});
      if(action==='reminders') return json({reminders:{},mode:'browser'});
      if(action==='live-bid') {
        const card=(await data('lookup')).find(c=>String(c.id)===id);
        return json({active:!!card && deadline(card.end)>Date.now(),currentBid:card?.currentBid || '',source:'published'});
      }
      if(action==='search') {
        const body=JSON.parse(options.body || '{}');
        const card=(await data('lookup')).find(c=>String(c.name).toLowerCase()===String(body.name).trim().toLowerCase());
        return card?json(await detail(card.id)):json({error:'Personagem ausente da base publicada.'},404);
      }
      return json({error:'Esta operação requer o servidor local.'},405);
    } catch(error) {return json({error:error.message},404);}
  };
})();
