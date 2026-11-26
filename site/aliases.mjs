// Preset derived from the public eBirdScripts/counter/aliases.mjs (blob bf2956f08c55e7695a8bd636bbbb4209a8f8cc00).
// Display-only; never change taxon IDs, parent classification or counts.
export const preset=Object.freeze({
  "greegr": "大白",
  "graher1": "蒼鷺",
  "rocpig1": "野鴿",
  "rocpig": "野鴿",
  "ortdov": "金背",
  "spodov": "珠頸",
  "recdov1": "紅鳩",
  "blabul1": "紅嘴",
  "houswi1": "小雨燕",
  "houswi": "小雨燕",
  "commoo3": "紅冠",
  "lirplo": "小環",
  "comsan": "磯鷸",
  "grnsan": "白腰",
  "whrsha": "白腰鵲鴝",
  "bcnher": "夜鷺",
  "whbwat1": "白腹",
  "litegr": "小白",
  "categr2": "黃頭鷺",
  "orimag1": "喜鵲",
  "formag1": "台灣藍鵲",
  "manher1": "黑冠",
  "grytre1": "樹鵲",
  "kenplo1": "東方",
  "spbduc": "花嘴",
  "weywag8": "東方黃",
  "eaywag": "東方黃鶺鴒",
  "bladro1": "大卷尾",
  "taibar2": "五色鳥",
  "asgsta1": "亞洲",
  "plapri1": "褐頭",
  "yebpri1": "灰頭鷦鶯",
  "gybpri1": "灰頭鷦鶯",
  "comkin1": "翠鳥",
  "zebdov": "斑馬鳩",
  "barswa": "家燕",
  "pacswa1": "洋燕",
  "strswa2": "赤腰燕",
  "y00621": "赤腰燕",
  "strswa1": "赤腰燕",
  "livbul1": "白頭翁",
  "swiwhe1": "斯氏",
  "bkcsta1": "黑領",
  "commyn": "家八",
  "cremyn": "冠八",
  "whvmyn": "白尾",
  "magrob": "鵲鴝",
  "eutspa": "麻雀",
  "nutman": "斑文鳥",
  "chemun": "黑頭文鳥",
  "vibsta4": "葡萄胸",
  "chtsta2": "灰頭椋鳥",
  "strher1": "綠簑鷺",
  "strher": "綠簑鷺",
  "gycwoo1": "小啄木",
  "musduc": "薑母鴨",
  "musduc3": "薑母鴨",
  "musduc2": "薑母鴨",
  "grywag": "灰鶺鴒",
  "brnshr": "紅尾伯勞",
  "brnshr3": "灰頭紅尾伯勞",
  "brnshr1": "褐頭紅尾伯勞",
  "whiwag8": "白面"
});
export function validAliases(input){
 const source=input?.aliases??input;
 if(!source||typeof source!=='object'||Array.isArray(source))throw Error('簡稱格式須為物種代碼與名稱的 JSON 對照表');
 const out=Object.create(null);
 for(const [code,alias] of Object.entries(source)){if(!/^[a-z0-9]+$/.test(code)||typeof alias!=='string'||!alias.trim()||Array.from(alias.trim()).length>80||/[\u0000-\u001f]/.test(alias))throw Error('無效簡稱：'+code);out[code]=alias.trim()}
 return out;
}
export function displayName(o,mode,custom={}){
 const official=o.official_common||o.common;
 if(mode==='official'||!o.taxon_code)return official;
 const alias=Object.hasOwn(custom,o.taxon_code)?custom[o.taxon_code]:mode==='preset'?preset[o.taxon_code]:null;
 return alias||official;
}
