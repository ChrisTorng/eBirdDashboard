import test from 'node:test';
import assert from 'node:assert/strict';
import {shortLocation} from '../site/location-name.mjs';
test('bilingual hotspot strips nested English, retains meaningful Chinese parentheses',()=>{
 assert.equal(shortLocation('台北--新莊塔寮坑溪(建國二路-好市多)(Taipei--Xinzhuang River (between Road & Costco))'),'台北--新莊塔寮坑溪(建國二路-好市多)');
 assert.equal(shortLocation('高雄（中崙公園）（Kaohsiung Park）'),'高雄（中崙公園）');
 assert.equal(shortLocation('地點 (25.0123, 121.0123), Taiwan'),'地點');
});
test('pure English and unnamed coordinate locations remain identifiable',()=>{
 assert.equal(shortLocation('Central Park (North)'),'Central Park (North)');
 assert.equal(shortLocation('25.0123, 121.0123'),'25.0123, 121.0123');
 assert.equal(shortLocation('(-25.01, 121.01)'),'(-25.01, 121.01)');
 assert.equal(shortLocation('新北市(第2區)'),'新北市(第2區)');
});
