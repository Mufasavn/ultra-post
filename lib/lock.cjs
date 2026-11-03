const crypto=require('node:crypto'),{promisify}=require('node:util');const scrypt=promisify(crypto.scrypt);
async function makePassword(password){if(typeof password!=='string'||password.length<10||password.length>256)throw Error('Mật khẩu cần từ 10 đến 256 ký tự.');const salt=crypto.randomBytes(16).toString('base64');return {salt,hash:(await scrypt(password,salt,32)).toString('base64')};}
async function verify(password,record){if(typeof password!=='string'||password.length>256||!record?.salt||!record?.hash)return false;const derived=await scrypt(password,record.salt,32);const expected=Buffer.from(record.hash,'base64');return expected.length===derived.length&&crypto.timingSafeEqual(expected,derived);}
module.exports={makePassword,verify};
