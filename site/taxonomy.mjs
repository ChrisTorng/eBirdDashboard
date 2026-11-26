// Official eBird taxonomy, pinned to the November 2026 release.
// No inference from scientific-name prefixes or geography.
export const VERSION='2026';
export const SOURCE='https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=csv&locale=zh';
export function parseCSV(text){
 const rows=[];let row=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++}else quoted=false}else field+=c}
 else if(c==='"'&&field==='')quoted=true;else if(c===','){row.push(field);field=''}else if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(Boolean))rows.push(row);row=[];field=''}else field+=c}
 if(quoted)throw Error('Unterminated CSV field');row.push(field);if(row.some(Boolean))rows.push(row);return rows;
}
const norm=s=>String(s??'').normalize('NFC').trim();
export function parseTaxonomyCSV(csv){
 const [header,...rows]=parseCSV(csv.replace(/^\uFEFF/,''));
 const idx=(...names)=>header.findIndex(x=>names.includes(x.trim().toUpperCase().replace(/[ -]/g,'_')));
 const cols={code:idx('SPECIES_CODE'),scientific:idx('SCIENTIFIC_NAME'),common:idx('COMMON_NAME','PRIMARY_COM_NAME'),category:idx('CATEGORY'),reportAs:idx('REPORT_AS'),concept:idx('TAXON_CONCEPT_ID','TAXON_CONCEPT_IDENTIFIER')};
 if(['code','scientific','common','category','reportAs'].some(k=>cols[k]<0))throw Error('Official CSV fields missing: '+header.join(','));
 const taxa=rows.map(r=>Object.fromEntries(Object.entries(cols).map(([k,i])=>[k,i<0?'':norm(r[i])]))).filter(r=>r.code&&r.scientific&&r.category);
 const species=taxa.filter(r=>r.category==='species');
 if(taxa.length<15000||species.length!==11201||!species.some(t=>t.scientific==='Apus affinis')||species.some(t=>t.scientific==='Apus nipalensis')||!species.some(t=>t.scientific==='Schoeniclus spodocephalus'))throw Error('Taxonomy does not match the published 2026 release; species='+species.length+', taxa='+taxa.length);
 if(new Set(taxa.map(t=>t.code)).size!==taxa.length)throw Error('Duplicate official taxon codes');
 return {version:VERSION,source:SOURCE,taxa};
}
export async function fetchOfficialTaxonomy(fetcher=fetch){
 let last;
 for(const suffix of ['&version=2026','&version=2026.0','']){try{const r=await fetcher(SOURCE+suffix,{headers:{Accept:'text/csv'}});if(!r.ok)throw Error('HTTP '+r.status);const t=parseTaxonomyCSV(await r.text());return {...t,source:SOURCE+suffix}}catch(e){last=e}}
 throw Error('Official 2026 taxonomy unavailable: '+last?.message);
}
export function taxonomyIndex(data){
 if(data?.version!==VERSION||!Array.isArray(data.taxa))throw Error('Taxonomy version mismatch');
 const byCode=new Map(),bySci=new Map(),byCommon=new Map();
 for(const t of data.taxa){byCode.set(t.code,t);for(const [m,key] of [[bySci,norm(t.scientific)],[byCommon,norm(t.common)]]){if(!m.has(key))m.set(key,[]);m.get(key).push(t)}}
 return {byCode,bySci,byCommon};
}
const allowedParent=new Set(['issf','intergrade','form','domestic']);
export function resolveTaxon(o,index){
 const matches=index.bySci.get(norm(o.scientific))||[];
 // Common name disambiguates scientific-name collisions, but cannot replace a conflicting scientific name.
 const exact=matches.filter(t=>norm(t.common)===norm(o.common));
 const t=exact.length===1?exact[0]:matches.length===1?matches[0]:null;
 if(!t)return {...o,taxon_code:null,taxon_concept_id:null,category:null,species_code:null,resolution:matches.length?'ambiguous':'unmatched'};
 let parent=t.category==='species'?t:allowedParent.has(t.category)?index.byCode.get(t.reportAs):null;
 if(parent?.category!=='species')parent=null;
 // Domestic taxa generally do not count; only official established feral exceptions.
 if(t.category==='domestic'&&!['Columba livia (Feral Pigeon)','Cairina moschata (Established Feral)'].includes(t.scientific))parent=null;
 return {...o,taxon_code:t.code,taxon_concept_id:t.concept||null,category:t.category,species_code:parent?.code||null,species_concept_id:parent?.concept||null,resolution:'matched'};
}
export function summarizeOfficial(observations,index){
 const resolved=observations.map(o=>resolveTaxon(o,index));let individuals=0,unknown=0,unresolved=0;const species=new Set();
 for(const o of resolved){if(o.species_code)species.add(o.species_code);if(o.count==='X')unknown++;else individuals+=o.count;if(o.resolution!=='matched')unresolved++}
 return {species:species.size,individuals,unknown,unresolved,taxonomy_version:VERSION,observations:resolved};
}
