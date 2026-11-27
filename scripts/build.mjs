import {mkdir,copyFile} from 'node:fs/promises';await mkdir('site/vendor',{recursive:true});await Promise.all([['node_modules/echarts/dist/echarts.min.js','echarts.min.js'],['node_modules/papaparse/papaparse.min.js','papaparse.min.js'],['node_modules/fflate/umd/index.js','fflate.js']].map(([src,dest])=>copyFile(src,'site/vendor/'+dest)));
import {writeFile} from 'node:fs/promises';import {fetchOfficialTaxonomy} from '../site/taxonomy.mjs';const taxonomy=await fetchOfficialTaxonomy();await writeFile('site/taxonomy.json',JSON.stringify(taxonomy));console.log('Official taxonomy v'+taxonomy.version+': '+taxonomy.taxa.length+' taxa, '+taxonomy.taxa.filter(t=>t.category==='species').length+' species');

await Promise.all([copyFile('node_modules/leaflet/dist/leaflet.js','site/vendor/leaflet.js'),copyFile('node_modules/leaflet/dist/leaflet.css','site/vendor/leaflet.css')]);

/* Publish HTML and local CSS/JS modules with the same build revision.
   A new HTML must never request a cached stylesheet from another release. */
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const moduleFiles=(await readdir('site')).filter(n=>n.endsWith('.mjs')).sort();
const inputs=['index.html','style.css','taxonomy.json',...moduleFiles];
const hash=createHash('sha256');
for(const name of inputs){hash.update(name);hash.update(await readFile('site/'+name))}
const revision=hash.digest('hex').slice(0,16);
const withVersion=path=>path.replace(/\?v=[a-f0-9]+$/,'')+'?v='+revision;
const html=await readFile('site/index.html','utf8');
await writeFile('site/index.html',html.replace(/((?:src|href)=")(\.\/[^"?#]+\.(?:mjs|js|css|webmanifest))(?:\?v=[a-f0-9]+)?(")/g,(_,a,p,b)=>a+withVersion(p)+b));
for(const name of moduleFiles){const src=await readFile('site/'+name,'utf8');await writeFile('site/'+name,src.replace(/(['"])(\.\/[^'"\s?]+\.(?:mjs|json))(?:\?v=[a-f0-9]+)?\1/g,(_,q,p)=>q+withVersion(p)+q))}
console.log('Versioned site assets '+revision);
