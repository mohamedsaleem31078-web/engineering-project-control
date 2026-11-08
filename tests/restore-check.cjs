/* Run against the built Classic PWA; verify backup ZIP, destructive reset and restore. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../dist');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const name=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!name.startsWith(root+path.sep)){res.writeHead(403).end();return}
  fs.readFile(name,(err,data)=>{if(err){res.writeHead(404).end();return}
    res.writeHead(200,{'Content-Type':types[path.extname(name)]||'application/octet-stream'});res.end(data)});
});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext({acceptDownloads:true});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
  await page.waitForFunction(()=>window.GEM_OFFLINE?.ready&&document.querySelector('.head'));
  await page.evaluate(async()=>{await GEM_OFFLINE.ready;
    const s=await GEM_OFFLINE.load();
    s.drawings=[{id:'TEST-PDF-DRAWING',name:'Test Drawing',url:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==',w:400,h:400,pdfPage:1}];
    s.snags=[{id:'A-001',disc:'Architectural',status:'Open',desc:'Offline backup restore test',drawingId:'TEST-PDF-DRAWING',x:37.2,y:48.6,photos:[{caption:'Inspection',date:'2026-11-08',url:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg=='}]}];
    await GEM_OFFLINE.save(s);
  });
  const dl=page.waitForEvent('download',{timeout:30000});
  await page.evaluate(async()=>GEM_OFFLINE.backup());
  const download=await dl;const file=path.join(__dirname,'test-backup-'+process.pid+'.zip');
  await download.saveAs(file);let bytes;
  try{bytes=fs.readFileSync(file)}finally{fs.unlinkSync(file)}
  assert.ok(bytes.length>100,'Backup must be non-empty');
  await page.evaluate(async()=>{const s=await GEM_OFFLINE.load();s.drawings=[];s.snags=[];await GEM_OFFLINE.save(s)});
  await page.reload();await page.waitForFunction(()=>!!window.GEM_OFFLINE?.ready);
  assert.equal(await page.evaluate(async()=>(await GEM_OFFLINE.load()).snags.length),0);
  const base64=bytes.toString('base64');
  await page.evaluate(async b64=>{
    const bin=atob(b64),buffer=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)buffer[i]=bin.charCodeAt(i);
    await GEM_OFFLINE.restore(new File([buffer],'gem-backup.zip',{type:'application/zip'}));
  },base64);
  const restored=await page.evaluate(async()=>await GEM_OFFLINE.load());
  assert.equal(restored.drawings.length,1);
  assert.equal(restored.snags.length,1);
  assert.equal(restored.snags[0].id,'A-001');
  assert.equal(restored.snags[0].photos.length,1);
  assert.equal(restored.snags[0].x,37.2);
  assert.ok(restored.snags[0].photos[0].url.startsWith('data:image/png;base64,'));
  await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.GEM_OFFLINE?.ready);
  const offline=await page.evaluate(async()=>await GEM_OFFLINE.load());
  assert.equal(offline.snags[0].drawingId,'TEST-PDF-DRAWING');
  assert.equal(offline.drawings.length,1);
  assert.deepEqual(errors,[]);
  console.log('PASS Windows/browser ZIP backup, destructive reset, restore, and offline reload');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
