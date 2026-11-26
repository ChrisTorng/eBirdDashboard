// eBird exports may omit empty trailing optional fields in individual records.
const required=['Submission ID','Common Name','Scientific Name','Count','Location ID','Location','Date','Time','Protocol','Duration (Min)','All Obs Reported','Distance Traveled (km)'];
const optionalTail=new Set(['Breeding Code','Observation Details','Checklist Comments','ML Catalog Numbers']);
export function parsePersonalCSV(csv,Papa){
 const result=Papa.parse(csv.replace(/^\uFEFF/,''),{header:false,delimiter:',',skipEmptyLines:'greedy'});
 if(result.errors.length){const e=result.errors[0];throw Error('CSV 解析錯誤（資料列 '+(Number.isInteger(e.row)?e.row+1:'未知')+'）：'+e.message)}
 const [rawHeader,...records]=result.data;
 if(!rawHeader)throw Error('CSV 沒有標題列');
 const header=rawHeader.map(x=>x.trim());
 if(new Set(header).size!==header.length||header.some(x=>!x))throw Error('CSV 標題有空白或重複欄位');
 const missing=required.filter(x=>!header.includes(x));
 if(missing.length)throw Error('CSV 缺少必要欄位：'+missing.join('、'));
 let padded=0;
 const rows=records.map((r,i)=>{
  if(r.length>header.length)throw Error('CSV 第 '+(i+2)+' 筆欄位過多（'+r.length+'/'+header.length+'）');
  if(r.length<header.length){
   const omitted=header.slice(r.length);
   if(!omitted.every(x=>optionalTail.has(x)))throw Error('CSV 第 '+(i+2)+' 筆缺少非選填欄位：'+omitted.join('、'));
   padded++;
  }
  return Object.fromEntries(header.map((key,j)=>[key,r[j]??'']));
 });
 return {rows,padded};
}
