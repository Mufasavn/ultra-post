// Local owner recovery, run explicitly with Electron under the original Windows account.
// This maintenance script is not bundled in the application or exposed through IPC.
const {app,safeStorage}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const V=require('../lib/vault.cjs');
const args=process.argv.slice(2),at=args.indexOf('--vault');
if(at<0||!args[at+1]||!(args.includes('--reset-lock')||args.includes('--check-only'))){console.error('Explicit --vault <state.json> and recovery mode arguments are required.');app.exit(2);}else{
 const target=path.resolve(args[at+1]);
 app.setName('ultra-postultra-post');
 app.setPath('userData',path.dirname(target));
 app.setPath('sessionData',path.dirname(target));
 let stage='read';app.whenReady().then(async()=>{
  const before=await fs.readFile(target,'utf8');
  assert.equal(JSON.parse(before).vaultVersion,1,'Unsupported vault version; original file kept.');
  stage='decrypt';const original=V.decodeState(before,safeStorage,()=>{throw Error('Legacy vault is not supported by this recovery tool.');});
  assert.ok(original.settings&&Array.isArray(original.pages)&&Array.isArray(original.providers)&&Array.isArray(original.posts),'Unexpected vault structure; original file kept.');
  if(args.includes('--check-only')){console.log(JSON.stringify({readable:true,lockEnabled:!!original.lock}));app.quit();return;}
  if(!original.lock){console.log(JSON.stringify({reset:false,reason:'No app lock is enabled.'}));app.quit();return;}
  const updated=structuredClone(original);delete updated.lock;delete updated.lockBackoff;
  stage='encode';const encrypted=V.encodeState(updated,safeStorage);
  // Check the complete state survives encryption before touching the original file.
  assert.deepEqual(V.decodeState(encrypted,safeStorage),updated);
  const backup=target+'.before-lock-reset-'+new Date().toISOString().replace(/[:.]/g,'-')+'.bak';
  stage='backup';await fs.copyFile(target,backup,require('node:fs').constants.COPYFILE_EXCL);
  assert.equal(await fs.readFile(backup,'utf8'),before);
  assert.equal(await fs.readFile(target,'utf8'),before,'Vault changed while preparing recovery; reset stopped.');
  const temp=target+'.lock-reset.tmp';
  try{
   stage='write';await fs.writeFile(temp,encrypted,{flag:'wx'});
   assert.deepEqual(V.decodeState(await fs.readFile(temp,'utf8'),safeStorage),updated);
   stage='replace';await fs.rename(temp,target);
   assert.deepEqual(V.decodeState(await fs.readFile(target,'utf8'),safeStorage),updated);
  }catch(error){await fs.unlink(temp).catch(()=>{});throw error;}
  console.log(JSON.stringify({reset:true,backup,verified:true}));app.quit();
 }).catch(error=>{console.error(JSON.stringify({error:'Recovery stopped; no secret values were printed.',stage,code:error.code||error.name}));app.exit(1);});
}
