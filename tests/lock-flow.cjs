const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs/promises');
const {_electron}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/DAT-DIGITAL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve('test-output/lock-flow-'+Date.now());let a,p;
async function launch(){a=await _electron.launch({executablePath:require('electron'),args:['.'],env:{...process.env,ULTRA_TEST_MODE:'1',ULTRA_TEST_DATA:root},timeout:30000});p=await a.firstWindow();await p.waitForSelector('h1,#lock-screen');}
const call=(name,data)=>p.evaluate(async({name,data})=>window.ultra.call(name,data),{name,data});
async function clock(offset){await a.evaluate((_,offset)=>{globalThis.__realClock??=Date.now;Date.now=()=>globalThis.__realClock()+offset;},offset);}
(async()=>{await fs.mkdir(root,{recursive:true});try{
 await launch();assert.deepEqual((await call('lock.status')).data.locked,false);
 const first='fixture-first-password',second='fixture-second-password';assert.equal((await call('lock.set',{password:'short'})).ok,false);assert.equal((await call('lock.set',{password:first})).ok,true);
 await clock(11*60000);assert.equal((await call('lock.status')).data.locked,true);assert.equal((await call('state')).ok,false);assert.equal((await call('settings.save',{theme:'dark'})).ok,false);await clock(0);
 for(let i=0;i<5;i++)assert.equal((await call('lock.unlock',{password:'incorrect'})).ok,false);
 const blocked=await call('lock.unlock',{password:first});assert.equal(blocked.ok,false);assert.ok(blocked.error.includes('một phút'));
 await clock(61000);assert.equal((await call('lock.unlock',{password:first})).ok,true);await clock(0);
 assert.equal((await call('lock.set',{current:'wrong',password:second})).ok,false);assert.equal((await call('lock.set',{current:first,password:second})).ok,true);
 await a.close();a=null;await launch();assert.equal((await call('lock.status')).data.locked,true);assert.equal((await call('lock.unlock',{password:first})).ok,false);assert.equal((await call('lock.unlock',{password:second})).ok,true);
 assert.equal((await call('lock.set',{current:'wrong',remove:true})).ok,false);assert.equal((await call('lock.set',{current:second,remove:true})).ok,true);
 await a.close();a=null;await launch();assert.equal((await call('lock.status')).data.enabled,false);assert.equal((await call('state')).ok,true);
 const raw=await fs.readFile(path.join(root,'state.json'),'utf8');assert.ok(!raw.includes(first));assert.ok(!raw.includes(second));
 console.log('PASS: fresh profile unlocked, minimum password length, idle auto-lock, protected IPC, five-failure cooldown, correct-password rejection during cooldown, password change, startup lock and verified removal persisted.');
}finally{await a?.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
