const {classify,ratio}=require('./domain.cjs');
class ApiError extends Error{constructor(message,kind,status){super(message);this.kind=kind;this.status=status;}}
async function request(url,init={},fetcher=fetch){
 let r;try{r=await fetcher(url,{...init,redirect:'error',signal:AbortSignal.timeout(60000)});}catch{throw new ApiError('Không kết nối được nhà cung cấp.','temporary');}
 let b;try{b=await r.json();}catch{throw new ApiError('Nhà cung cấp trả về dữ liệu không hợp lệ.',r.ok?'invalid':classify(r.status),r.status);}
 if(!r.ok){const e=new ApiError(`Yêu cầu API thất bại (${r.status}).`,classify(r.status,b),r.status);e.retryAfter=Math.min(10,Math.max(1,Number(r.headers?.get('retry-after'))||2));throw e;}
 return b;
}
function options(key,body){return {method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify(body)};}
async function completion(p,prompt,fetcher=fetch){
 let text;
 if(p.type==='gemini'){
 const body=await request(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(p.model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':p.key},body:JSON.stringify({systemInstruction:{parts:[{text:require('./editorial.cjs').SYSTEM}]},contents:[{parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:1200}})},fetcher);
 text=body.candidates?.[0]?.content?.parts?.filter(x=>!x.thought).map(x=>x.text||'').join('');
 }else{
 const base=p.type==='openrouter'?'https://openrouter.ai/api/v1':'https://api.deepseek.com';
 const body=await request(`${base}/chat/completions`,options(p.key,{model:p.model,messages:[{role:'system',content:require('./editorial.cjs').SYSTEM},{role:'user',content:prompt}],max_tokens:1200,...(p.type==='deepseek'?{thinking:{type:'disabled'}}:{})}),fetcher);
 text=body.choices?.[0]?.message?.content;
 }
 if(!text?.trim())throw new ApiError('Model không trả về nội dung.','invalid');return text.trim();
}
async function fallback(providers,run,{fetcher=fetch,onEvent=()=>{},allowPaid=false,sleep=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 let count=0;
 for(const p of providers.filter(x=>x.enabled&&x.key)){
 if(!allowPaid&&((p.type==='deepseek')||(p.type==='openrouter'&&!p.model.endsWith(':free')&&p.model!=='openrouter/free'))){onEvent(p,'Bỏ qua nguồn trả phí theo cài đặt');continue;}
 count++;for(let attempt=0;attempt<2;attempt++){
 try{const value=await run(p,fetcher);onEvent(p,'Thành công');return {value,providerId:p.id,label:p.label};}
 catch(e){onEvent(p,e.message);if(e.kind==='temporary'&&attempt===0){await sleep((e.retryAfter||2)*1000);continue;}if(['auth','exhausted','temporary'].includes(e.kind))break;throw e;}
 }
 }
 throw Error(count?'Các kết nối hiện không khả dụng. Bản nháp vẫn được giữ; hãy kiểm tra API.':'Chưa có API khả dụng. Hãy nhập key hoặc bật nguồn trả phí trong cài đặt.');
}
async function quota(p,fetcher=fetch){
 const headers={Authorization:`Bearer ${p.key}`};let b;
 if(p.type==='tavily'){
 b=await request('https://api.tavily.com/usage',{headers},fetcher);const a=b.account||{},k=b.key||{};
 const accountRemain=Math.max(0,(a.plan_limit||0)-(a.plan_usage||0));const keyRemain=Number.isFinite(k.limit)?Math.max(0,k.limit-k.usage):null;
 return {percent:ratio(accountRemain,a.plan_limit),remaining:accountRemain,total:a.plan_limit,unit:'credit / gói',detail:`Key: ${keyRemain??'không đặt mức'} • Tài khoản: ${a.current_plan||'—'}`,at:new Date().toISOString()};
 }
 if(p.type==='openrouter'){
 b=(await request('https://openrouter.ai/api/v1/key',{headers},fetcher)).data;
 if(p.model.endsWith(':free')||p.model==='openrouter/free'){const q=b.free_model_daily_requests;return {percent:ratio(q?.remaining,q?.limit),remaining:q?.remaining??null,total:q?.limit??null,unit:'lượt / ngày UTC',detail:'Hạn mức dùng chung tài khoản',at:new Date().toISOString()};}
 return {percent:ratio(b.limit_remaining,b.limit),remaining:b.limit_remaining,total:b.limit,unit:'USD / hạn mức key',detail:'Không phải số dư toàn tài khoản',at:new Date().toISOString()};
 }
 if(p.type==='deepseek'){
 b=await request('https://api.deepseek.com/user/balance',{headers},fetcher);const q=b.balance_infos?.find(x=>x.currency==='USD')||b.balance_infos?.[0];return {percent:null,remaining:q?Number(q.total_balance):null,total:null,unit:q?.currency||'USD',detail:'Số dư chính thức; chưa có mốc để tính %',at:new Date().toISOString()};
 }
 await request('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100',{headers:{'x-goog-api-key':p.key}},fetcher);
 return {percent:null,remaining:null,total:null,unit:'credit dự án',detail:'Key hợp lệ. API key không cho biết credit Google AI Pro đã áp dụng.',at:new Date().toISOString()};
}
async function models(p,fetcher=fetch){
 if(p.type==='tavily')return [{id:'basic',name:'Basic'},{id:'advanced',name:'Advanced'}];
 if(p.type==='gemini'){const b=await request('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100',{headers:{'x-goog-api-key':p.key}},fetcher);return (b.models||[]).filter(x=>x.supportedGenerationMethods?.includes('generateContent')).map(x=>({id:x.name.replace('models/',''),name:x.displayName||x.name}));}
 const base=p.type==='openrouter'?'https://openrouter.ai/api/v1':'https://api.deepseek.com';
 const b=await request(`${base}/models`,{headers:{Authorization:`Bearer ${p.key}`}},fetcher);return (b.data||[]).map(x=>({id:x.id,name:x.name||x.id}));
}
async function search(p,query,fetcher=fetch){return request('https://api.tavily.com/search',options(p.key,{query,search_depth:p.model||'basic',max_results:3,include_raw_content:false}),fetcher);}
module.exports={request,ApiError,completion,fallback,quota,models,search};
