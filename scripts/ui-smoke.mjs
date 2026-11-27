import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
const root=resolve('site'),mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const server=createServer(async(req,res)=>{try{let p=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+'/')){res.writeHead(404).end();return}const b=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'}).end(b)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const rows=[{id:'S1',location_id:'L1',location:'測試地點 (Test Place (East))',region:'TW-TPQ',lat:25,lon:121,date:'2026-11-20',time:'08:00',species:1,individuals:2,unknown:0,observations:[{common:'測試鳥',scientific:'Testus birdus',taxon_code:'test',species_code:'test',count:2}]}];
  await page.route('**/api/**',async route=>{const p=new URL(route.request().url()).pathname;await route.fulfill({json:p.endsWith('capabilities')?{schema:4}:{rows,next:null,total:1}})});
  await page.route('https://tile.openstreetmap.org/**',r=>r.fulfill({status:204}));
  await page.goto(url);await page.locator('#status').filter({hasText:'已連線私人資料庫'}).waitFor();
  await page.evaluate(()=>{document.getElementById('openMap').click()});
  await page.locator('#mapDialog[open]').waitFor();await page.waitForTimeout(200);
  const map=await page.locator('#map').boundingBox(),dialog=await page.locator('#mapDialog').boundingBox(),side=await page.locator('.mapSide').boundingBox();
  assert(map.height>dialog.height*(viewport.width>760?.9:.65),'Map height insufficient: '+JSON.stringify({map,dialog}));
  if(viewport.width>760)assert(map.x>side.x+side.width-2,'Desktop sidebar is not beside map');
  const dot=await page.locator('#mapLegend .legendDot').first().evaluate(e=>({w:e.getBoundingClientRect().width,c:getComputedStyle(e).backgroundColor}));assert(dot.w>=10&&dot.c!=='rgba(0, 0, 0, 0)','Legend color absent');
  await page.locator('#closeMap').click();
  await page.evaluate(()=>{document.getElementById('checklists').click()});
  await page.locator('#checklistDialog[open]').waitFor();
  assert.equal(await page.locator('#checklistOptions>.checkOption').first().evaluate(e=>getComputedStyle(e).display),'grid');
  await page.mouse.click(2,2);assert.equal(await page.locator('#checklistDialog[open]').count(),0);
  assert.equal(await page.locator('#loadProgress').isVisible(),false);assert.deepEqual(errors,[]);
  console.log('UI layout passed '+viewport.width+'x'+viewport.height+', map '+Math.round(map.width)+'x'+Math.round(map.height));
  await page.close();
 }
}finally{await browser?.close();await new Promise(r=>server.close(r))}
