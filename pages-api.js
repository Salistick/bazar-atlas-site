/* Static Pages adapter. Reads only files generated from the published SQLite. */
(() => {
  'use strict';
  const nativeFetch=window.fetch.bind(window);
  const base=new URL('./',document.baseURI);
  const cache=new Map();
  window.BAZAAR_STATIC=true;
  async function data(name) {
    if(!cache.has(name)) cache.set(name,(async()=>{
      const response=await nativeFetch(new URL('site-data/'+name+'.json.gz',base));
      if(!response.ok) throw new Error('Registro indisponível na base publicada.');
      const stream=response.body.pipeThrough(new DecompressionStream('gzip'));
      return new Response(stream).json();
    })().catch(error=>{cache.delete(name);throw error;}));
    return cache.get(name);
  }
  const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
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
      if(typeof input==='string' && input.startsWith('/') && !input.startsWith('//')) return nativeFetch(new URL(input.slice(1),base),options);
      return nativeFetch(input,options);
    }
    const action=url.pathname.slice('/api/bazaar/'.length), id=url.searchParams.get('auctionid') || '';
    try {
      if(action==='index-status') return json(await data('coverage'));
      if(action==='filter-index') return json(await data(url.searchParams.get('type')==='past'?'index-past':'index-current'));
      if(action==='detail') return json(await data('details/'+id));
      if(action==='estimate') return json(await estimate(id));
      if(action==='status') return json({status:'published',scheduleInstalled:false});
      if(action==='recent') return json({auctions:[]});
      if(action==='reminders') return json({reminders:{},mode:'browser'});
      if(action==='live-bid') {
        const card=(await data('lookup')).find(c=>String(c.id)===id);
        return json({active:!!card && Date.parse(card.end)>Date.now(),currentBid:card?.currentBid || '',source:'published'});
      }
      if(action==='search') {
        const body=JSON.parse(options.body || '{}');
        const card=(await data('lookup')).find(c=>String(c.name).toLowerCase()===String(body.name).trim().toLowerCase());
        return card?json(await data('details/'+card.id)):json({error:'Personagem ausente da base publicada.'},404);
      }
      return json({error:'Esta operação requer o servidor local.'},405);
    } catch(error) {return json({error:error.message},404);}
  };
})();
