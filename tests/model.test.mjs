import test from 'node:test';import assert from 'node:assert/strict';
import {groupRows,groupLocations,time24} from '../site/model.mjs';
import {taxonomyIndex,summarizeOfficial,parseCSV} from '../site/taxonomy.mjs';
const index=taxonomyIndex({version:'2026',taxa:[
{code:'swift',scientific:'Apus affinis',common:'小雨燕',category:'species',concept:'concept1'},
{code:'swiftgroup',scientific:'Apus affinis [nipalensis Group]',common:'小雨燕（群）',category:'issf',reportAs:'swift',concept:'concept2'},
{code:'bunt',scientific:'Schoeniclus spodocephalus',common:'灰頭黑臉鵐',category:'species',concept:'concept3'},
{code:'slash',scientific:'Schoeniclus spodocephalus/personatus',common:'slash',category:'slash'},
{code:'pigeon',scientific:'Columba livia',common:'原鴿',category:'species'},
{code:'feral',scientific:'Columba livia (Feral Pigeon)',common:'野鴿',category:'domestic',reportAs:'pigeon'},
{code:'domestic',scientific:'Columba livia (Domestic type)',common:'家鴿',category:'domestic',reportAs:'pigeon'}]});
const base={'Submission ID':'S1','Location ID':'L1',Location:'test',Date:'2026-11-26',Time:'12:15 PM','Common Name':'小雨燕','Scientific Name':'Apus affinis',Count:'3'};
test('official parent, X, slash, original taxon and stable links',()=>{const r=groupRows([base,{...base,'Common Name':'小雨燕（群）','Scientific Name':'Apus affinis [nipalensis Group]',Count:'X'},{...base,'Common Name':'slash','Scientific Name':'Schoeniclus spodocephalus/personatus',Count:'2'}],index);assert.equal(r.length,1);assert.equal(r[0].species,1);assert.equal(r[0].individuals,5);assert.equal(r[0].unknown,1);assert.equal(r[0].observations[1].taxon_code,'swiftgroup');assert.equal(r[0].observations[1].species_code,'swift');assert.equal(r[0].observations[1].scientific,'Apus affinis [nipalensis Group]');assert.equal(groupLocations(r)[0].visits,1)});
test('same day separate',()=>assert.equal(groupRows([base,{...base,'Submission ID':'S2'}],index).length,2));
test('AM PM',()=>{assert.equal(time24('12:00 AM'),'00:00');assert.equal(time24('03:18 PM'),'15:18')});
test('unmapped old taxon is not guessed',()=>{const x=summarizeOfficial([{scientific:'Apus nipalensis',common:'小雨燕',count:2}],index);assert.equal(x.species,0);assert.equal(x.unresolved,1)});
test('feral pigeon counts, domestic alone does not',()=>{assert.equal(summarizeOfficial([{scientific:'Columba livia (Feral Pigeon)',common:'野鴿',count:2}],index).species,1);assert.equal(summarizeOfficial([{scientific:'Columba livia (Domestic type)',common:'家鴿',count:2}],index).species,0)});
test('CSV quotes and multiline',()=>assert.deepEqual(parseCSV('a,b\r\n"hello, world","line\n2"\r\n'),[['a','b'],['hello, world','line\n2']]));
