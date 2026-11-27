import {intervalStats} from './geo.mjs';
export const stamp=c=>new Date(c.date+'T'+(c.time||'00:00')+':00').getTime();
const localDay=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
export function bucketDate(date,mode){const d=new Date(date+'T00:00:00');if(mode==='week')d.setDate(d.getDate()-(d.getDay()+6)%7);if(mode==='month')d.setDate(1);return localDay(d)}
export function aggregateRows(rows,mode){
 if(mode==='checklist')return rows.map(c=>({key:c.id,time:stamp(c),label:c.date+' '+c.time,rows:[c],species:c.species,individuals:c.individuals,visits:1,unknown:c.unknown||0}));
 const m=new Map();for(const c of rows){const key=bucketDate(c.date,mode);if(!m.has(key))m.set(key,[]);m.get(key).push(c)}
 return [...m].sort(([a],[b])=>a.localeCompare(b)).map(([key,rs])=>{const s=intervalStats(rs);const last=new Date(key+'T00:00:00');if(mode==='week')last.setDate(last.getDate()+6);if(mode==='month')last.setMonth(last.getMonth()+1,0);return {key,time:new Date(key+'T00:00:00').getTime(),label:mode==='month'?key.slice(0,7):mode==='week'?key+' ～ '+localDay(last):key,rows:rs,species:s.species,individuals:s.individuals,visits:s.visits,unknown:s.unknown}});
}
export function visibleBuckets(buckets,start,end){if(!buckets.length)return [];const min=buckets[0].time,max=buckets.at(-1).time;const lo=min+(max-min)*start/100,hi=min+(max-min)*end/100;return buckets.filter(b=>b.time>=lo-.5&&b.time<=hi+.5)}
export function panWindow(start,end,delta){const width=end-start;const next=Math.max(0,Math.min(100-width,start+delta));return [next,next+width]}
export function zoomWindow(start,end,factor,anchor){const width=end-start;const w=Math.min(100,Math.max(.05,width*factor));const a=start+width*Math.max(0,Math.min(1,anchor));const next=Math.max(0,Math.min(100-w,a-w*anchor));return [next,next+w]}
export function wheelIntent(e){if(e.ctrlKey)return 'zoom';if(e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return 'pan';return 'scroll'}

export function sortBuckets(buckets,order){const field=['species','individuals','visits'].includes(order)?order:null;return [...buckets].sort((a,b)=>(field?b[field]-a[field]:0)||a.time-b.time||a.key.localeCompare(b.key))}
export function visibleRankBuckets(buckets,start,end){if(!buckets.length)return [];const max=buckets.length-1;return buckets.slice(Math.max(0,Math.round(max*start/100)),Math.min(max,Math.round(max*end/100))+1)}
export function nearestTimeBucket(buckets,t){if(!buckets.length)return undefined;let lo=0,hi=buckets.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(buckets[mid].time<t)lo=mid+1;else hi=mid}return lo>0&&Math.abs(buckets[lo-1].time-t)<=Math.abs(buckets[lo].time-t)?buckets[lo-1]:buckets[lo]}
