// Display-only normalization, based on eBird/alerts/parser.js.
// Retain the original name and coordinates in the dataset.
const han=/\p{Script=Han}/u;
const coordinates=/^[+-]?\d+(?:\.\d+)?\s*[,，]\s*[+-]?\d+(?:\.\d+)?$/;
export function shortLocation(value){
 const original=String(value??'').trim();
 if(!han.test(original))return original;
 // Remove redundant English/coordinate annotations, including nested parentheses.
 let out='',start=-1,depth=0;
 for(let i=0;i<original.length;i++){
  const ch=original[i];
  if(ch==='('||ch==='（'){if(depth++===0)start=i;continue}
  if((ch===')'||ch==='）')&&depth>0){if(--depth===0){const group=original.slice(start,i+1),body=group.slice(1,-1).trim();if(han.test(body)||(!/[A-Za-z]/.test(body)&&!coordinates.test(body)))out+=group;start=-1}continue}
  if(depth===0)out+=ch;
 }
 if(depth>0)out+=original.slice(start);
 out=out.replace(/,\s*[A-Za-z][A-Za-z ,'’.-]*$/u,'').replace(/^[A-Za-z]+\s*(?:--|[-,，:：])?\s*(?=\p{Script=Han})/u,'').trim();
 return out||original;
}
