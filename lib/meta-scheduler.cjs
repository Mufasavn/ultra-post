const {publish}=require('./publisher.cjs'),{request,ApiError}=require('./providers.cjs');
function timestamp(value,now=Date.now()){
 const t=Date.parse(value);if(!Number.isFinite(t)||t<now+20*60000||t>now+28*86400000)throw Error('Lịch Facebook trong ứng dụng cần cách hiện tại ít nhất 20 phút và tối đa 28 ngày.');return Math.floor(t/1000);
}
function decodeTime(value){if(typeof value==='number')return value;if(typeof value==='string'&&/^\d+$/.test(value))return Number(value);return Math.floor(Date.parse(value)/1000);}
async function readStatus(post,page,version,{fetcher=fetch}={}){
 const fields=post.kind==='video'?'id,published,scheduled_publish_time,status':'id,is_published,scheduled_publish_time';
 const b=await request(`https://graph.facebook.com/${version}/${encodeURIComponent(post.facebookId)}?fields=${fields}`,{headers:{Authorization:`Bearer ${page.token}`}},fetcher);
 const isPublished=post.kind==='video'?b.published:b.is_published;
 if(isPublished===true)return {status:'published',publishedAt:new Date().toISOString(),error:null};
 const time=decodeTime(b.scheduled_publish_time),expected=Math.floor(Date.parse(post.scheduledAt)/1000);
 if(isPublished===false&&Number.isFinite(time)&&time===expected&&time>Date.now()/1000)return {status:'scheduled',error:null,metaVerifiedAt:new Date().toISOString()};
 return {status:'meta_pending',error:'Facebook đã nhận ID nhưng chưa xác nhận đúng lịch. Không gửi lại; hãy đồng bộ để kiểm tra.'};
}
async function schedule(post,page,version,options={}){
 const t=timestamp(post.scheduledAt);
 const result=await publish(post,page,version,{...options,scheduledTimestamp:t});
 // A successful upload alone is not proof that Facebook retained the schedule.
 try{return {...result,...await readStatus({...post,facebookId:result.facebookId},page,version,options),scheduler:'facebook',cloud:false};}
 catch{return {...result,status:'meta_pending',scheduler:'facebook',cloud:false,error:'Đã nhận ID Facebook; chưa đọc lại được lịch. Không tự gửi lại. Nhấn đồng bộ để xác minh.'};}
}
async function removeSchedule(post,page,version,{fetcher=fetch}={}){
 if(Date.parse(post.scheduledAt)<Date.now()+120000)throw Error('Lịch còn dưới hai phút; hãy kiểm tra trực tiếp trên Facebook để tránh xóa nhầm bài vừa xuất bản.');
 // Read first: never silently delete a post already published or whose state is unclear.
 const status=await readStatus(post,page,version,{fetcher});if(status.status!=='scheduled')throw Error('Chưa xác nhận đây là bài đang chờ lịch. Hãy kiểm tra Facebook; không tự xóa.');
 let r,b;try{r=await fetcher(`https://graph.facebook.com/${version}/${encodeURIComponent(post.facebookId)}`,{method:'DELETE',redirect:'error',headers:{Authorization:`Bearer ${page.token}`},signal:AbortSignal.timeout(60000)});b=await r.json();}catch{throw new ApiError('Chưa xác định lịch đã được xóa. Hãy đồng bộ và đối chiếu trước khi tạo lại.','uncertain');}
 if(!r.ok||b.success!==true)throw new ApiError('Facebook chưa xác nhận xóa lịch. Không thay đổi bản nháp.','uncertain');
 return {status:'draft',scheduler:null,facebookId:null,permalink:null,error:null,scheduledAt:null,cloud:false};
}
module.exports={timestamp,decodeTime,readStatus,schedule,removeSchedule};
