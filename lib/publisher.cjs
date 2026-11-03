const {ApiError}=require('./providers.cjs');
async function graph(pageId,token,version,path,fields,{fetcher=fetch,video=false}={}){
 const body=new FormData();body.append('access_token',token);for(const [k,v] of Object.entries(fields))body.append(k,typeof v==='string'?v:JSON.stringify(v));
 let r;try{r=await fetcher(`https://${video?'graph-video':'graph'}.facebook.com/${version}/${encodeURIComponent(pageId)}/${path}`,{method:'POST',body,redirect:'error',signal:AbortSignal.timeout(video?180000:60000)});}catch{throw new ApiError('Chưa xác định Facebook đã nhận bài. Kiểm tra Page trước khi thử lại.','uncertain');}
 let b;try{b=await r.json();}catch{throw new ApiError('Phản hồi Facebook chưa xác định. Kiểm tra Page trước khi thử lại.','uncertain');}
 if(!r.ok||b.error){if(r.status>=500)throw new ApiError('Facebook trả lỗi máy chủ; cần đối chiếu Page trước khi thử lại.','uncertain');throw new ApiError(`Facebook từ chối yêu cầu (${b.error?.code||r.status}). Kiểm tra token, quyền Page và tệp đính kèm.`,'invalid');}return b;
}
async function publish(post,page,version,{fetcher=fetch,readMedia,scheduledTimestamp=null}={}){
 const call=(path,fields,video=false)=>graph(page.facebookId,page.token,version,path,fields,{fetcher,video});
 if(post.kind==='video'){
 const m=await readMedia(post.media[0]);const body=new FormData();body.append('access_token',page.token);body.append('description',post.text);body.append('source',new Blob([m.bytes],{type:m.mime}),m.name);
 if(scheduledTimestamp){body.append('published','false');body.append('scheduled_publish_time',String(scheduledTimestamp));}
 let r,b;try{r=await fetcher(`https://graph-video.facebook.com/${version}/${encodeURIComponent(page.facebookId)}/videos`,{method:'POST',body,redirect:'error',signal:AbortSignal.timeout(180000)});b=await r.json();}catch{throw new ApiError('Kết quả upload video chưa xác định. Kiểm tra Page trước khi thử lại.','uncertain');}
 if(r.status>=500)throw new ApiError('Kết quả upload video cần đối chiếu.','uncertain');
 if(!r.ok||b.error)throw new ApiError(`Facebook từ chối video (${b.error?.code||r.status}).`,'invalid');
 if(!b.id)throw new ApiError('Facebook chưa trả mã video.','uncertain');return {facebookId:b.id,status:scheduledTimestamp?'meta_pending':'processing',permalink:`https://www.facebook.com/${b.id}`};
 }
 let fields={message:post.text};
 if(scheduledTimestamp){fields.published='false';fields.scheduled_publish_time=String(scheduledTimestamp);}
 if(post.kind==='link')fields.link=post.link;
 if(post.kind==='images'){
 const photos=[];for(const media of post.media){const m=await readMedia(media);const body=new FormData();body.append('access_token',page.token);body.append('published','false');body.append('source',new Blob([m.bytes],{type:m.mime}),m.name);let r,b;try{r=await fetcher(`https://graph.facebook.com/${version}/${encodeURIComponent(page.facebookId)}/photos`,{method:'POST',body,redirect:'error',signal:AbortSignal.timeout(60000)});b=await r.json();}catch{throw new ApiError('Upload ảnh bị gián đoạn. Chưa gửi bài; kiểm tra thư viện ảnh Page.','invalid');}if(!r.ok||!b.id)throw new ApiError('Facebook chưa nhận được ảnh.','invalid');photos.push({media_fbid:b.id});}fields.attached_media=photos;
 }
 const b=await call('feed',fields);if(!b.id)throw new ApiError('Facebook chưa trả mã bài.','uncertain');return {facebookId:b.id,status:scheduledTimestamp?'meta_pending':'published',permalink:`https://www.facebook.com/${b.id}`};
}
module.exports={graph,publish};
