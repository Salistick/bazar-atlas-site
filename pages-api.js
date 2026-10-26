/* Static Pages adapter. Reads only files generated from the published SQLite. */
(() => {
  'use strict';
  const nativeFetch=window.fetch.bind(window);
  const base=new URL('./',document.baseURI);
  const buildId=window.BAZAAR_BUILD_ID || '';
  const presenceURL='https://raw.githubusercontent.com/Salistick/bazar-atlas-site/refs/heads/codex/active-data/active.json';
  let liveRevision='';
  const versioned=url=>{
    if(buildId) url.searchParams.set('v',buildId);
    if(liveRevision&&url.pathname.includes('/site-data/'))url.searchParams.set('live',liveRevision);
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
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const official=text.match(/^([A-Z][a-z]{2})\s+(\d{1,2})\s+(\d{4}),\s+(\d{1,2}):(\d{2})\s+(CEST|CET)$/);
    const normalized=official?official[3]+'-'+String(months.indexOf(official[1])+1).padStart(2,'0')+'-'+official[2].padStart(2,'0')+'T'+official[4].padStart(2,'0')+':'+official[5]+':00'+(official[6]==='CEST'?'+02:00':'+01:00'):text;
    const iso=normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/);
    if(!iso)return NaN;
    const [year,month,day,hour,minute,second]=iso.slice(1,7).map(value=>Number(value||0));
    if(year<1970||month<1||month>12||day<1||day>new Date(Date.UTC(year,month,0)).getUTCDate()||hour>23||minute>59||second>59)return NaN;
    return Date.parse(normalized);
  };
  const expired=card=>Number.isFinite(deadline(card.end))&&deadline(card.end)<=Date.now();
  const active=card=>Number.isFinite(deadline(card.end))&&deadline(card.end)>Date.now();
  const validHistory=card=>expired(card)&&(!card.snapshot?.auction?.end||deadline(card.snapshot.auction.end)===deadline(card.end));
  const newestFirst=(a,b)=>deadline(b.end)-deadline(a.end)||Number(b.id)-Number(a.id);
  const presenceState={checkedAt:-Infinity,value:null,request:null};
  function validatePresence(value){
    const now=Date.now()/1000;
    if(value?.version!==1||value.source!=='official_current_catalog'||
       !Number.isFinite(value.verifiedAt)||value.verifiedAt>now||now-value.verifiedAt>7200||
       !Number.isFinite(value.updatedAt)||value.updatedAt>now||value.updatedAt<value.verifiedAt||
       !/^[a-f0-9]{40}$/.test(value.baseRevision||'')||
       !Array.isArray(value.auctions)||!value.auctions.length||value.auctions.length>100000)return null;
    const cards=new Map();
    for(const card of value.auctions){
      const id=String(card?.id||''),end=deadline(card?.end);
      if(!/^[1-9]\d*$/.test(id)||cards.has(id)||!Number.isFinite(end)||end<=value.verifiedAt*1000||
         !['currentBid','minimumBid'].every(key=>typeof card[key]==='string'&&/^(?:\d[\d,]*)?$/.test(card[key])))return null;
      cards.set(id,{id,end:card.end,currentBid:card.currentBid,minimumBid:card.minimumBid});
    }
    return {...value,cards};
  }
  async function activePresence(){
    if(presenceState.request)return presenceState.request;
    if(Date.now()-presenceState.checkedAt<60000){
      const value=presenceState.value,age=value?Date.now()/1000-value.verifiedAt:Infinity;
      return age>=0&&age<=7200?value:null;
    }
    presenceState.request=(async()=>{
      try{
        const url=new URL(presenceURL);
        url.searchParams.set('check',String(Math.floor(Date.now()/60000)));
        const options={cache:'no-store'};
        if(typeof AbortSignal!=='undefined'&&AbortSignal.timeout)options.signal=AbortSignal.timeout(3000);
        const response=await nativeFetch(url,options);
        if(!response.ok)throw new Error('Active presence unavailable');
        const body=await response.text();
        if(body.length>5000000)throw new Error('Active presence exceeds size limit');
        const value=validatePresence(JSON.parse(body));
        if(!value)throw new Error('Active presence did not pass validation');
        if(value.baseRevision!==liveRevision){
          liveRevision=value.baseRevision;
          cache.clear();
        }
        presenceState.value=value;
      }catch(error){
        // Keep previously verified removals through a transient raw-file outage;
        // an unavailable source is neither evidence of removal nor reinstatement.
        const previous=presenceState.value,age=previous?Date.now()/1000-previous.verifiedAt:Infinity;
        if(age<0||age>7200)presenceState.value=null;
      }finally{
        presenceState.checkedAt=Date.now();
        presenceState.request=null;
      }
      return presenceState.value;
    })();
    return presenceState.request;
  }
  function presenceCard(card,presence){
    if(!presence)return card;
    const current=presence.cards.get(String(card.id));
    if(!current||deadline(current.end)!==deadline(card.end))return null;
    return {...card,...current,snapshot:card.snapshot?{...card.snapshot,
      auction:{...card.snapshot.auction,end:current.end,currentBid:current.currentBid,minimumBid:current.minimumBid},
      displayCard:{...card.snapshot.displayCard,...current}}:card.snapshot};
  }
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
  async function projectedCoverage(presence=undefined){
    if(presence===undefined)presence=await activePresence();
    const [source,lookup]=await Promise.all([data('coverage'),data('lookup')]);
    const activeCards=lookup.filter(card=>card.type==='current').map(card=>presenceCard(card,presence)).filter(card=>card&&active(card));
    const history=new Set(lookup.filter(card=>card.type==='past'&&expired(card)).map(card=>String(card.id)));
    for(const card of lookup)if(card.type==='current'&&expired(card)&&card.snapshotComplete===true)history.add(String(card.id));
    const upcoming=activeCards.map(card=>deadline(card.end));
    return {...source,active:activeCards.length,downloaded:activeCards.filter(card=>card.snapshotComplete===true).length,history:history.size,
      activeVerificationAt:presence?.verifiedAt||null,
      activePresenceRevision:presence?presence.baseRevision+':'+presence.updatedAt:null,
      activePresenceSource:presence?'official_current_catalog':'published_snapshot',
      verifiedOfficialTotal:presence?[...presence.cards.values()].filter(active).length:source.verifiedOfficialTotal,
      nextExpiryAt:upcoming.length?Math.min(...upcoming):null};
  }
  async function projectedIndex(kind){
    const presence=await activePresence();
    const [index,current,coverage]=await Promise.all([data('index-'+kind),data('index-current'),projectedCoverage(presence)]);
    let auctions;
    if(kind==='current')auctions=current.auctions.map(card=>presenceCard(card,presence)).filter(card=>card&&active(card));
    else{
      const merged=new Map(index.auctions.filter(validHistory).map(card=>[String(card.id),card]));
      for(const card of current.auctions){
        if(validHistory(card)&&card.snapshotComplete===true&&!merged.has(String(card.id)))merged.set(String(card.id),historicalCard(card));
      }
      auctions=[...merged.values()].sort(newestFirst);
    }
    return {...index,auctions,total:auctions.length,coverage,nextExpiryAt:coverage.nextExpiryAt,
      worlds:[...new Set(auctions.map(card=>card.world).filter(Boolean))].sort()};
  }
  async function detail(id){
    const presence=await activePresence();
    const [result,lookup]=await Promise.all([data('details/'+id),data('lookup')]);
    const card=lookup.find(item=>String(item.id)===String(id)&&item.type==='past') ||
      lookup.find(item=>String(item.id)===String(id));
    if(card?.type==='past'&&!validHistory({...card,snapshot:result.snapshot}))throw new Error('A data de encerramento deste histórico não passou na validação.');
    if(card?.type==='current'&&active(card)&&presence){
      const verified=presenceCard({...card,snapshot:result.snapshot},presence);
      if(!verified)throw new Error('Este leilão já não consta no catálogo ativo verificado.');
      return {...result,snapshot:verified.snapshot};
    }
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
        const presence=await activePresence();
        const card=(await data('lookup')).find(c=>String(c.id)===id);
        const verified=card?presenceCard(card,presence):presence?.cards.get(id);
        return json({active:!!verified&&active(verified),currentBid:verified?.currentBid||'',source:presence?'official_current_catalog':'published'});
      }
      if(action==='search') {
        await activePresence();
        const body=JSON.parse(options.body || '{}');
        const card=(await data('lookup')).find(c=>String(c.name).toLowerCase()===String(body.name).trim().toLowerCase());
        return card?json(await detail(card.id)):json({error:'Personagem ausente da base publicada.'},404);
      }
      return json({error:'Esta operação requer o servidor local.'},405);
    } catch(error) {return json({error:error.message},404);}
  };
})();
