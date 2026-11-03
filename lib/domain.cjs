const crypto = require('node:crypto');
const BRAND = 'Ultra PostUltra Post';
const slots = [
 ['gemini-primary','gemini','Gemini • credit Google AI Pro','gemini-3.5-flash-lite'],
 ...[1,2,3].map(n=>[`openrouter-${n}`,'openrouter',`OpenRouter ${n}`,'openrouter/free']),
 ['gemini-backup','gemini','Gemini dự phòng','gemini-3.5-flash-lite'],
 ['deepseek','deepseek','DeepSeek dự phòng','deepseek-flash'],
 ...[1,2,3].map(n=>[`tavily-${n}`,'tavily',`Tavily ${n}`,'basic'])
];
function defaults(){return {version:1,pages:[],posts:[],logs:[],settings:{graphVersion:'v25.0',monthlyBudget:3,allowPaid:false,language:'vi',theme:'light'},providers:slots.map(([id,type,label,model])=>({id,type,label,model,key:'',enabled:true,quota:null,status:'Chưa kết nối'}))};}
function url(value){let u;try{u=new URL(value);}catch{throw Error('Đường dẫn chưa hợp lệ.');}if(u.protocol!=='https:'||u.username||u.password)throw Error('Chỉ hỗ trợ link HTTPS không chứa thông tin đăng nhập.');return u;}
function linkedin(value){const u=url(value);if(!/(^|\.)linkedin\.com$/i.test(u.hostname)||!/^\/(posts\/[^/]+|feed\/update\/urn:li:(activity|share|ugcPost):\d+)/.test(decodeURIComponent(u.pathname)))throw Error('Hãy nhập link bài LinkedIn cụ thể, không phải trang chủ.');return u.href;}
function canonical(value){const u=url(value);u.hash='';for(const k of [...u.searchParams.keys()])if(k.startsWith('utm_')||['trk','trackingId'].includes(k))u.searchParams.delete(k);return u.href.replace(/\/$/,'');}
function validatePost(p,pages,{schedule=false}={}){
 if(!pages.some(x=>x.id===p.pageId))throw Error('Hãy chọn Fanpage đích.');
 if(!String(p.text||'').trim())throw Error('Nội dung bài đang trống.');
 if(p.text.length>60000)throw Error('Bài viết vượt giới hạn 60.000 ký tự của ứng dụng.');
 if(!['text','link','images','video'].includes(p.kind))throw Error('Loại bài không hợp lệ.');
 if(p.mode==='linkedin'){if(p.sourceUrl)linkedin(p.sourceUrl);if(!p.complete)throw Error('Cần xác nhận đã lấy đủ văn bản và media gốc.');}
 if(p.kind==='link')url(p.link);
 if(['images','video'].includes(p.kind)&&!p.media?.length)throw Error('Hãy bổ sung tệp ảnh/video gốc.');
 if(p.kind==='video'&&p.media.length!==1)throw Error('Mỗi bài video cần đúng một video.');
 if(p.kind==='images'&&p.media.length>10)throw Error('Ứng dụng hỗ trợ tối đa 10 ảnh mỗi bài.');
 if(p.kind==='video'&&!p.media.every(m=>m.mime?.startsWith('video/')))throw Error('Tệp không phải video.');
 if(p.kind==='images'&&!p.media.every(m=>m.mime?.startsWith('image/')))throw Error('Danh sách có tệp không phải ảnh.');
 if(schedule&&(!p.scheduledAt||!Number.isFinite(Date.parse(p.scheduledAt))||Date.parse(p.scheduledAt)<Date.now()+60000))throw Error('Chọn lịch cách hiện tại ít nhất một phút.');
 return p;
}
function ratio(remaining,total){return Number.isFinite(remaining)&&Number.isFinite(total)&&total>0?Math.max(0,Math.min(100,Math.round(remaining/total*100))):null;}
function classify(status,body={}){
 const reason=body?.error?.metadata?.reason;
 if(reason==='in_flight_budget_exhausted')return 'temporary';
 if(status===401||status===403)return 'auth';
 if(status===402||status===432)return 'exhausted';
 if(status===429)return 'temporary';
 if(status>=500)return 'temporary';
 return 'invalid';
}
function duplicate(p,posts){return posts.find(x=>x.id!==p.id&&x.pageId===p.pageId&&['scheduled','publishing','published','uncertain','meta_pending','processing'].includes(x.status)&&((p.sourceUrl&&x.sourceUrl&&canonical(x.sourceUrl)===canonical(p.sourceUrl))||x.text===p.text));}
function id(){return crypto.randomUUID();}
module.exports={BRAND,slots,defaults,url,linkedin,canonical,validatePost,ratio,classify,duplicate,id};
