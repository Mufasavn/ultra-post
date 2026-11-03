const dns=require('node:dns/promises'),net=require('node:net'),https=require('node:https');
const {url}=require('./domain.cjs');
const blocked=new net.BlockList();
for(const [ip,prefix] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',4],['240.0.0.0',4]])blocked.addSubnet(ip,prefix,'ipv4');
function publicIp(ip){
 if(net.isIP(ip)===4)return !blocked.check(ip,'ipv4');
 if(net.isIP(ip)===6)return /^[23][0-9a-f]{0,3}:/i.test(ip)&&!/^2001:(db8|0|[12]0):/i.test(ip)&&!/^2002:/i.test(ip);
 return false;
}
async function publicUrl(value){const u=url(value);if(u.port&&u.port!=='443')throw Error('Không hỗ trợ cổng mạng riêng.');const host=u.hostname.replace(/^\[|\]$/g,'');if(host==='localhost'||host.endsWith('.local'))throw Error('Không truy cập địa chỉ mạng nội bộ.');const addresses=net.isIP(host)?[{address:host,family:net.isIP(host)}]:await dns.lookup(host,{all:true});if(!addresses.length||addresses.some(x=>!publicIp(x.address)))throw Error('Đường dẫn trỏ tới mạng riêng.');return u;}
async function pinnedGet(value,{maxBytes=2_000_000,binary=false,linkedinOnly=false}={}){
 let target=value;
 for(let i=0;i<5;i++){
 const u=await publicUrl(target),host=u.hostname.replace(/^\[|\]$/g,'');
 if(linkedinOnly&&!/(^|\.)(licdn\.com|licdn-ei\.com)$/.test(host))throw Error('Media không thuộc máy chủ LinkedIn được hỗ trợ.');
 const addresses=net.isIP(host)?[{address:host,family:net.isIP(host)}]:await dns.lookup(host,{all:true});
 if(!addresses.length||addresses.some(x=>!publicIp(x.address)))throw Error('Địa chỉ nguồn không được phép.');
 const result=await new Promise((resolve,reject)=>{
 // Pin validated DNS answers to the TLS connection to prevent DNS rebinding.
 const request=https.request(u,{method:'GET',agent:false,headers:{'User-Agent':'UltraPost/0.1 ProductMetadata',Accept:binary?'image/*,video/mp4':'text/html,text/plain'},lookup:(hostname,options,callback)=>options.all?callback(null,addresses):callback(null,addresses[0].address,addresses[0].family)},r=>{
 if(r.statusCode>=300&&r.statusCode<400){const location=r.headers.location;r.destroy();resolve({redirect:location});return;}
 if(r.statusCode!==200){r.destroy();reject(Error(`Trang nguồn không truy cập được (${r.statusCode}). Hãy bổ sung nội dung thủ công.`));return;}
 const mime=(r.headers['content-type']||'').split(';')[0].toLowerCase();
 if(binary?!/^(image\/(jpeg|png|webp)|video\/(mp4|quicktime))$/.test(mime):!/^(text\/(html|plain)|application\/xhtml\+xml)$/.test(mime)){r.destroy();reject(Error('Nguồn có định dạng chưa hỗ trợ.'));return;}
 if(Number(r.headers['content-length'])>maxBytes){r.destroy();reject(Error('Nguồn vượt giới hạn dung lượng.'));return;}
 const chunks=[];let size=0;r.on('data',chunk=>{size+=chunk.length;if(size>maxBytes){r.destroy(Error('Nguồn vượt giới hạn dung lượng.'));return;}chunks.push(chunk);});r.on('end',()=>resolve({bytes:Buffer.concat(chunks),mime,url:u.href}));r.on('error',reject);
 });
 const timer=setTimeout(()=>request.destroy(Error('Nguồn phản hồi quá chậm.')),binary?120000:25000);request.on('close',()=>clearTimeout(timer));request.on('error',reject);request.end();
 });
 if(result.redirect){target=new URL(result.redirect,u).href;continue;}return result;
 }throw Error('Link chuyển hướng quá nhiều lần.');
}
async function getPublic(value,options={}){const r=await pinnedGet(value,options);return {html:r.bytes.toString('utf8'),url:r.url};}
async function metadata(value){const {load}=require('cheerio');const {html,url:finalUrl}=await getPublic(value);const $=load(html);const title=$('meta[property="og:title"]').attr('content')||$('title').text();const image=$('meta[property="og:image"]').attr('content');const description=$('meta[property="og:description"]').attr('content')||$('meta[name="description"]').attr('content')||'';$('script,style,nav,header,footer,noscript,iframe').remove();const text=($('main').text()||$('body').text()).replace(/\s+/g,' ').trim().slice(0,14000);let safeImage='';try{safeImage=image?(await publicUrl(new URL(image,finalUrl).href)).href:'';}catch{}
 let preview='';if(safeImage){try{const img=await pinnedGet(safeImage,{binary:true,maxBytes:5*1024*1024});if(img.mime.startsWith('image/'))preview=`data:${img.mime};base64,${img.bytes.toString('base64')}`;}catch{/* Preview is optional; never load remote URLs in the renderer. */}}
 return {title:title.trim().slice(0,250),description:description.slice(0,2000),image:preview,text,url:finalUrl,at:new Date().toISOString()};}
async function downloadLinkedin(value){const r=await pinnedGet(value,{binary:true,maxBytes:95*1024*1024,linkedinOnly:true});return {bytes:r.bytes,mime:r.mime,ext:{'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','video/mp4':'.mp4','video/quicktime':'.mov'}[r.mime]};}
module.exports={publicIp,publicUrl,pinnedGet,getPublic,metadata,downloadLinkedin};
