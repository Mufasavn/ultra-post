const {spawn}=require('node:child_process'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const version=require('../package.json').version;
async function run(exe,root){
 const resultFile=path.join(root,'smoke-result.json');await fs.rm(resultFile,{force:true});
 const child=spawn(exe,[],{windowsHide:true,stdio:'pipe',env:{...process.env,ULTRA_TEST_MODE:'1',ULTRA_SMOKE_TEST:'1',ULTRA_TEST_DATA:root}});let errors='',code=null,failed;
 child.stderr.on('data',b=>errors+=b.toString());child.on('error',e=>failed=e);const exited=new Promise(resolve=>child.on('close',value=>{code=value;resolve(value);}));
 const deadline=Date.now()+90000;let result;
 while(Date.now()<deadline){if(failed)throw failed;try{result=JSON.parse(await fs.readFile(resultFile,'utf8'));break;}catch{}if(code!==null)throw Error('Portable exited before rendering. '+errors.slice(0,500));await new Promise(r=>setTimeout(r,300));}
 if(!result){child.kill();throw Error('Portable startup timeout. '+errors.slice(0,500));}
 const exitCode=await Promise.race([exited,new Promise(resolve=>{const t=setTimeout(()=>resolve('timeout'),15000);t.unref();})]);if(exitCode==='timeout'){child.kill();throw Error('Portable did not exit.');}assert.equal(exitCode,0);
 assert.equal(result.packaged,true);assert.equal(result.version,version);assert.equal(result.bridge,'function');assert.equal(result.nav,8);assert.equal(result.title,'Ultra PostUltra Post');assert.ok(result.heading);
 assert.equal(result.profile,root);assert.equal(result.sessionProfile,root);assert.equal(result.lockEnabled,false);assert.equal(result.pages,0);assert.equal(result.posts,0);assert.equal(result.providers,9);assert.equal(result.configuredKeys,0);return result;
}
(async()=>{const exe=path.resolve(`release/Ultra-PostUltra-Post-${version}-Windows-x64.exe`),root=path.resolve('test-output/portable-'+Date.now());await fs.mkdir(root,{recursive:true});
 await run(exe,root);const first=JSON.parse(await fs.readFile(path.join(root,'Local State'),'utf8')).os_crypt.encrypted_key;
 await run(exe,root);assert.equal(JSON.parse(await fs.readFile(path.join(root,'Local State'),'utf8')).os_crypt.encrypted_key,first);
 console.log('PASS: actual portable EXE, fresh unlocked profile, isolated encryption/session, all 9 empty API slots, 8 screens and successful restart with the same Windows encryption key.');
})().catch(e=>{console.error(e);process.exitCode=1;});
