const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const {_electron}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/DAT-DIGITAL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve('test-output/profiles-'+Date.now()),profileA=path.join(root,'A'),profileB=path.join(root,'B');
const realRoot=path.join(process.env.APPDATA,'ultra-postultra-post');
async function digest(file){try{return crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function productionSnapshot(){return Promise.all(['ultra-postultra-post','ultra-postultra-post-v2'].flatMap(name=>['state.json','Local State'].map(f=>digest(path.join(process.env.APPDATA,name,f)))));}
async function launch(profile){const a=await _electron.launch({executablePath:require('electron'),args:['.'],env:{...process.env,ULTRA_TEST_MODE:'1',ULTRA_TEST_DATA:profile},timeout:30000});const p=await a.firstWindow();await p.waitForSelector('h1');return {a,p};}
async function read(p){const r=await p.evaluate(()=>window.ultra.call('state'));assert.equal(r.ok,true);return r.data;}
function secondInstance(profile){return new Promise((resolve,reject)=>{const child=spawn(require('electron'),['.'],{windowsHide:true,stdio:'ignore',env:{...process.env,ULTRA_TEST_MODE:'1',ULTRA_TEST_DATA:profile}});const timer=setTimeout(()=>{child.kill();reject(Error('Duplicate instance did not exit.'));},15000);child.on('error',reject);child.on('close',code=>{clearTimeout(timer);resolve(code);});});}
async function refusesCorruption(profile){const before=await digest(path.join(profile,'state.json'));assert.equal(await secondInstance(profile),1);assert.equal(await digest(path.join(profile,'state.json')),before);assert.ok((await fs.readFile(path.join(profile,'startup-error.json'),'utf8')).includes('Không ghi đè'));}
(async()=>{await fs.mkdir(root,{recursive:true});const before=await productionSnapshot();let A,B;
try{
 A=await launch(profileA);B=await launch(profileB);
 for(const [instance,expected] of [[A,profileA],[B,profileB]]){const paths=await instance.a.evaluate(({app})=>({data:app.getPath('userData'),session:app.getPath('sessionData')}));assert.equal(paths.data,expected);assert.equal(paths.session,expected);const s=await read(instance.p);assert.equal(s.settings.lockEnabled,false);assert.equal(s.providers.length,9);assert.equal(s.posts.length,0);}
 const save=await A.p.evaluate(()=>window.ultra.call('provider.save',{id:'openrouter-1',key:'fixture-A-only',model:'openrouter/free',enabled:true}));assert.equal(save.ok,true);assert.equal((await read(B.p)).providers[1].hasKey,false);
 assert.equal(await secondInstance(profileA),0);assert.ok(await A.p.locator('h1').isVisible());
 await B.a.close();B=null;await A.a.close();A=null;
 const localA=await digest(path.join(profileA,'Local State')),localB=await digest(path.join(profileB,'Local State'));assert.ok(localA&&localB);assert.notEqual(localA,localB);
 A=await launch(profileA);assert.equal((await read(A.p)).providers.find(p=>p.id==='openrouter-1').hasKey,true);
 const cross=await A.a.evaluate(async({app,safeStorage},file)=>{const r=process.getBuiltinModule('module').createRequire(app.getAppPath()+'/package.json');const s=JSON.parse(await r('node:fs/promises').readFile(file,'utf8'));try{safeStorage.decryptString(Buffer.from(s.ciphertext.slice(4),'base64'));return true;}catch{return false;}},path.join(profileB,'state.json'));assert.equal(cross,false);
 await A.a.close();A=null;
 const wrongKey=path.join(root,'wrong-key'),corrupt=path.join(root,'corrupt');await fs.mkdir(wrongKey);await fs.mkdir(corrupt);
 await fs.copyFile(path.join(profileA,'state.json'),path.join(wrongKey,'state.json'));await fs.copyFile(path.join(profileB,'Local State'),path.join(wrongKey,'Local State'));await refusesCorruption(wrongKey);
 await fs.writeFile(path.join(corrupt,'state.json'),'not a valid vault');await refusesCorruption(corrupt);
 assert.deepEqual(await productionSnapshot(),before);
 console.log('PASS: independent encryption profiles, duplicate-instance rejection, restart decryption, wrong-key/corrupt startup refusal without overwriting and production data/key unchanged.');
}finally{await A?.a.close();await B?.a.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
