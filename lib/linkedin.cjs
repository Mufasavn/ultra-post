const D=require('./domain.cjs'),P=require('./providers.cjs');
function candidates(value){D.linkedin(value);const decoded=decodeURIComponent(value);const direct=decoded.match(/urn:li:(share|ugcPost):(\d+)/);if(direct)return [`urn:li:${direct[1]}:${direct[2]}`];const activity=decoded.match(/(?:activity[:\-])(\d+)/);if(!activity)throw Error('Không nhận diện được mã bài LinkedIn. Hãy dán văn bản và tệp gốc.');return [`urn:li:share:${activity[1]}`,`urn:li:ugcPost:${activity[1]}`];}
function mediaAssets(post){
 if(post.content?.multiImage?.images)return {kind:'images',ids:post.content.multiImage.images.map(x=>x.id)};
 const id=post.content?.media?.id;
 if(id?.startsWith('urn:li:video:'))return {kind:'video',ids:[id]};
 if(id?.startsWith('urn:li:image:'))return {kind:'images',ids:[id]};
 if(post.content&&Object.keys(post.content).length)return {kind:'text',ids:[],unsupported:true};
 return {kind:'text',ids:[]};
}
async function importPost(value,settings,{download,store,requestFn=P.request}={}){
 if(!settings.linkedinToken)throw Error('Chưa kết nối quyền đọc LinkedIn. Bạn có thể dán nguyên văn và chọn tệp gốc.');
 const headers={Authorization:`Bearer ${settings.linkedinToken}`,'LinkedIn-Version':settings.linkedinVersion||'202607','X-Restli-Protocol-Version':'2.0.0'};
 let post;
 for(const urn of candidates(value)){try{post=await requestFn(`https://api.linkedin.com/rest/posts/${encodeURIComponent(urn)}`,{headers});break;}catch(e){if(e.status!==404)throw e;}}
 if(!post)throw Error('Không đọc được bài bằng quyền hiện tại. Hãy dùng phần nhập thủ công.');
 if(post.reshareContext) return {text:post.commentary||'',media:[],kind:'text',complete:false,message:'Đây là bài chia sẻ lại. Cần chọn và bổ sung chính xác nội dung gốc trước khi đăng.'};
 const assets=mediaAssets(post),media=[];let error='';
 for(const id of assets.ids){try{if(!/^urn:li:(video|image):[A-Za-z0-9_-]+$/.test(id))throw Error('Mã media không được hỗ trợ.');const type=id.startsWith('urn:li:video:')?'videos':'images';const asset=await requestFn(`https://api.linkedin.com/rest/${type}/${encodeURIComponent(id)}`,{headers});if(!asset.downloadUrl)throw Error('LinkedIn không cung cấp tệp tải xuống.');const file=await download(asset.downloadUrl);if(assets.kind==='video'&&!file.mime.startsWith('video/'))throw Error('Tệp nguồn không phải video.');if(assets.kind==='images'&&!file.mime.startsWith('image/'))throw Error('Tệp nguồn không phải ảnh.');media.push(await store(file));}catch{error='Chưa lấy đủ media qua quyền hiện tại. Hãy bổ sung tệp gốc còn thiếu.';break;}}
 return {text:post.commentary||'',kind:assets.kind,media,complete:!assets.unsupported&&!error,mediaRequired:!!assets.ids.length,message:assets.unsupported?'Loại bài chưa hỗ trợ tự động. Hãy bổ sung văn bản và tệp gốc phù hợp.':error||'Đã lấy văn bản và media. Kiểm tra bản xem trước trước khi xác nhận.'};
}
module.exports={candidates,mediaAssets,importPost};
