const HOST = 'ebird-dashboard.christorng.idv.tw';
const ISSUER = 'https://christorng.cloudflareaccess.com';
const json = (body, status=200) => Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
let keyCache = null;
const decode = s => Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'=')), c=>c.charCodeAt(0));
const parse = s => JSON.parse(new TextDecoder().decode(decode(s)));
async function authenticated(req,env){
  try {
    const jwt=req.headers.get('Cf-Access-Jwt-Assertion');
    if(!jwt||!env.ACCESS_AUD) return false;
    const [h,p,s,...extra]=jwt.split('.');
    if(!h||!p||!s||extra.length) return false;
    const header=parse(h), claims=parse(p), now=Math.floor(Date.now()/1000);
    if(header.alg!=='RS256'||!header.kid||claims.iss!==ISSUER||!Array.isArray(claims.aud)||!claims.aud.includes(env.ACCESS_AUD)||!Number.isFinite(claims.exp)||claims.exp<=now||(claims.nbf&&claims.nbf>now)||!claims.email) return false;
    if(!keyCache||keyCache.exp<Date.now()||!keyCache.keys.some(k=>k.kid===header.kid)){
      const r=await fetch(ISSUER+'/cdn-cgi/access/certs');
      if(!r.ok)return false;
      keyCache={keys:(await r.json()).keys,exp:Date.now()+300000};
    }
    const jwk=keyCache.keys.find(k=>k.kid===header.kid);
    if(!jwk)return false;
    const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(s),new TextEncoder().encode(h+'.'+p));
  }catch{return false}
}
export function speciesKey(name){const t=name.trim().split(/\s+/);return t.length>=2&&/^[A-Z][a-z]+$/.test(t[0])&&/^[a-z]+$/.test(t[1])&&!['sp','spp','x'].includes(t[1])&&!/[×/]|\sx\s|\shybrid\b/i.test(name)?t.slice(0,2).join(' '):null}
export function summarize(obs){let species=new Set(),individuals=0,unknown=0;for(const o of obs){let k=speciesKey(o.scientific);if(k)species.add(k);if(o.count==='X')unknown++;else individuals+=o.count}return {species:species.size,individuals,unknown}}
function validate(c){
  if(!c||!/^S\d+$/.test(c.id)||!/^L\d+$/.test(c.location_id)||typeof c.location!=='string'||c.location.length>1000||!/^\d{4}-\d{2}-\d{2}$/.test(c.date)||typeof c.time!=='string'||c.time.length>20||!Array.isArray(c.observations)||!c.observations.length||c.observations.length>1000)return false;
  return c.observations.every(o=>o&&typeof o.common==='string'&&o.common.length<=400&&typeof o.scientific==='string'&&o.scientific.length<=400&& (o.count==='X'||(Number.isSafeInteger(o.count)&&o.count>=0)));
}
export default {async fetch(req,env){
  const url=new URL(req.url);
  if(url.hostname!==HOST||!url.pathname.startsWith('/api/'))return json({error:'Not found'},404);
  if(!await authenticated(req,env))return json({error:'Access authentication required'},401);
  if(req.method==='POST'&&req.headers.get('Origin')!=='https://'+HOST)return json({error:'Invalid origin'},403);
  try {
    if(req.method==='GET'&&url.pathname==='/api/locations'){
      const r=await env.DB.prepare('SELECT location_id, MAX(location) AS location, COUNT(*) AS visits, MAX(date) AS latest FROM checklists GROUP BY location_id ORDER BY visits DESC, location').all();
      return json(r.results);
    }
    if(req.method==='GET'&&url.pathname==='/api/trend'){
      const id=url.searchParams.get('location'); const from=url.searchParams.get('from')||'0000-01-01', to=url.searchParams.get('to')||'9999-12-31';
      if(!/^L\d+$/.test(id||'')||![from,to].every(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)))return json({error:'Invalid query'},400);
      const r=await env.DB.prepare('SELECT id,date,time,duration,distance,complete,species,individuals,unknown FROM checklists WHERE location_id=? AND date BETWEEN ? AND ? ORDER BY date,time,id').bind(id,from,to).all();return json(r.results);
    }
    if(req.method==='GET'&&url.pathname==='/api/checklist'){
      const id=url.searchParams.get('id');if(!/^S\d+$/.test(id||''))return json({error:'Invalid ID'},400);
      const r=await env.DB.prepare('SELECT * FROM checklists WHERE id=?').bind(id).first();if(!r)return json({error:'Not found'},404);
      return json({...r,observations:JSON.parse(r.observations)});
    }
    if(req.method==='POST'&&url.pathname==='/api/import'){
      const raw=await req.text();if(raw.length>500000)return json({error:'Batch too large'},413);
      const rows=JSON.parse(raw);if(!Array.isArray(rows)||!rows.length||rows.length>30||!rows.every(validate))return json({error:'Invalid checklist batch'},400);
      const sql='INSERT INTO checklists (id,location_id,location,date,time,duration,distance,protocol,complete,species,individuals,unknown,observations) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET location_id=excluded.location_id,location=excluded.location,date=excluded.date,time=excluded.time,duration=excluded.duration,distance=excluded.distance,protocol=excluded.protocol,complete=excluded.complete,species=excluded.species,individuals=excluded.individuals,unknown=excluded.unknown,observations=excluded.observations';
      const number=x=>typeof x==='number'&&Number.isFinite(x)?x:null;
      await env.DB.batch(rows.map(c=>{const s=summarize(c.observations);return env.DB.prepare(sql).bind(c.id,c.location_id,c.location,c.date,c.time,number(c.duration),number(c.distance),typeof c.protocol==='string'?c.protocol.slice(0,100):null,c.complete===1?1:0,s.species,s.individuals,s.unknown,JSON.stringify(c.observations))}));
      return json({imported:rows.length});
    }
    return json({error:'Not found'},404);
  }catch(e){return json({error:'Request failed'},500)}
}};