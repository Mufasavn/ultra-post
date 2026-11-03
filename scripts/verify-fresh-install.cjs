// Explicit owner-approved verification of the new real profile; no sample accounts or keys.
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {_electron}=require('C:/Users/DAT-DIGITAL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const executable=path.resolve('release/win-unpacked/Ultra PostUltra Post.exe'),expected=path.join(process.env.APPDATA,'ultra-postultra-post-v2'),legacy=path.join(process.env.APPDATA,'ultra-postultra-post');
async function hash(file){return crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');}
const legacySnapshot=()=>Promise.all(['state.json','Local State'].map(f=>hash(path.join(legacy,f))));
async function launch(){const env={...process.env,ULTRA_TEST_MODE:'1'};delete env.ULTRA_TEST_DATA;delete env.ULTRA_SMOKE_TEST;const a=await _electron.launch({executablePath:executable,args:[],env,timeout:30000});const p=await a.firstWindow();await p.waitForSelector('h1');return {a,p};}
async function verify(instance){
 const r=await instance.p.evaluate(()=>window.ultra.call('state'));assert.equal(r.ok,true);assert.equal(r.data.pages.length,0);assert.equal(r.data.posts.length,0);assert.equal(r.data.settings.lockEnabled,false);assert.equal(r.data.providers.length,9);assert.ok(r.data.providers.every(p=>!p.hasKey));assert.equal(await instance.p.locator('#lock-screen').count(),0);
 const info=await instance.a.evaluate(({app})=>({profile:app.getPath('userData'),session:app.getPath('sessionData'),version:app.getVersion(),packaged:app.isPackaged}));assert.equal(info.profile,expected);assert.equal(info.session,expected);assert.equal(info.version,'0.3.1');assert.equal(info.packaged,true);return info;
}
(async()=>{let instance;const before=await legacySnapshot();try{
 instance=await launch();const info=await verify(instance);
 for(const id of ['home','compose','linkedin','calendar','posts','pages','api','logs']){await instance.p.locator(`[data-route="${id}"]`).click();assert.equal(await instance.p.locator('h1').count(),1);}
 await instance.p.locator('#ui-theme').selectOption('dark');await instance.p.waitForFunction(()=>document.documentElement.dataset.theme==='dark');await instance.p.locator('[data-route="home"]').click();await instance.p.screenshot({path:'test-output/fresh-install.png',fullPage:true});
 await instance.a.close();instance=null;const keyBefore=JSON.parse(await fs.readFile(path.join(expected,'Local State'),'utf8')).os_crypt.encrypted_key;
 instance=await launch();await verify(instance);assert.equal(await instance.p.locator('html').getAttribute('data-theme'),'dark');await instance.a.close();instance=null;
 assert.equal(JSON.parse(await fs.readFile(path.join(expected,'Local State'),'utf8')).os_crypt.encrypted_key,keyBefore);assert.deepEqual(await legacySnapshot(),before);
 await fs.writeFile('test-output/fresh-install-verification.json',JSON.stringify({...info,verified:true,unlocked:true,empty:true,providers:9,restartVerified:true,legacyUnchanged:true},null,2));
 console.log('PASS: real fresh profile, no password or sample data, all screens, preserved theme and Windows key after restart; legacy state/key unchanged.');
}finally{await instance?.a.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
