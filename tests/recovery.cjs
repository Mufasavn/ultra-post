const {app,safeStorage}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const V=require('../lib/vault.cjs'),D=require('../lib/domain.cjs'),L=require('../lib/lock.cjs');
const mode=process.argv[2],root=path.resolve(process.argv[3]);app.setPath('userData',root);
app.whenReady().then(async()=>{
 const target=path.join(root,'state.json'),media=path.join(root,'test-media');
 if(mode==='prepare'){
  await fs.mkdir(root,{recursive:true});const original=D.defaults();original.pages.push({id:'test-page',name:'Private Page',token:'fixture-page-token'});original.posts.push({id:'test-post',pageId:'test-page',text:'Private draft',status:'draft'});original.providers[0].key='fixture-api-key';original.lock=await L.makePassword('fixture-password');original.lockBackoff={failures:5,until:Date.now()+60000};V.mediaKey(original);
  await fs.writeFile(target,V.encodeState(original,safeStorage));await V.writeMedia(media,Buffer.from('private-media'),V.mediaKey(original));console.log('Fixture ready.');
 }else if(mode==='verify'){
  const backup=(await fs.readdir(root)).find(f=>f.startsWith('state.json.before-lock-reset-'));assert.ok(backup);
  const original=V.decodeState(await fs.readFile(path.join(root,backup),'utf8'),safeStorage);const current=V.decodeState(await fs.readFile(target,'utf8'),safeStorage);const expected=structuredClone(original);delete expected.lock;delete expected.lockBackoff;assert.deepEqual(current,expected);
  assert.equal((await V.readMedia(media,V.mediaKey(current))).toString(),'private-media');
  for(const file of [target,path.join(root,backup)]){const raw=await fs.readFile(file,'utf8');for(const secret of ['Private draft','fixture-api-key','fixture-page-token','fixture-password'])assert.ok(!raw.includes(secret));}
  console.log('PASS: real Windows encryption, verified encrypted backup, lock removal, all Page/API/post data preserved and media readable.');
 }else throw Error('Unknown fixture mode.');app.quit();
}).catch(()=>{console.error('Recovery fixture failed.');app.exit(1);});
