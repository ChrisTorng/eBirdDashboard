import test from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {parsePersonalCSV} from '../site/personal-csv.mjs';
const header='Submission ID,Common Name,Scientific Name,Taxonomic Order,Count,State/Province,County,Location ID,Location,Latitude,Longitude,Date,Time,Protocol,Duration (Min),All Obs Reported,Distance Traveled (km),Area Covered (ha),Number of Observers,Breeding Code,Observation Details,Checklist Comments,ML Catalog Numbers';
const row='S1,Test Bird,Testus birdus,1,2,TW,,L1,Test Place,25,121,2026-11-26,12:15 PM,Traveling,10,1,0.1,,1';
test('accept eBird export rows with 19 through 23 fields, including quoted comments',()=>{
 const text=[header,row,row+',S',row+',,"heard, seen"',row+',,,"line1\nline2"',row+',,,,123'].join('\r\n');
 const p=parsePersonalCSV(text,Papa);
 assert.equal(p.rows.length,5);assert.equal(p.padded,4);
 assert.equal(p.rows[0]['ML Catalog Numbers'],'');assert.equal(p.rows[0].Count,'2');
 assert.equal(p.rows[2]['Observation Details'],'heard, seen');assert.equal(p.rows[3]['Checklist Comments'],'line1\nline2');assert.equal(p.rows[4]['ML Catalog Numbers'],'123');
});
test('reject missing nonoptional suffix or extra fields',()=>{assert.throws(()=>parsePersonalCSV(header+'\n'+row.slice(0,row.lastIndexOf(',')),Papa),/非選填/);assert.throws(()=>parsePersonalCSV(header+'\n'+row+',,,,,extra',Papa),/欄位過多/)});
test('reject malformed quotes and missing headers',()=>{assert.throws(()=>parsePersonalCSV(header+'\n'+row+',,"unfinished',Papa),/CSV 解析錯誤/);assert.throws(()=>parsePersonalCSV(header.replace('Scientific Name','Bad')+'\n'+row,Papa),/必要欄位/)});
