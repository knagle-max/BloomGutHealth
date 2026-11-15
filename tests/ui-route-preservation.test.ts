import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import ledger from '../docs/verification/V06_UI_ROUTE_PRESERVATION_20261115.json';
import {navigationGroups,athleteNavigationGroups} from '../client/src/content/navigation';
test('the UI preservation ledger covers every actual route and every retained navigation target resolves through the existing router',()=>{
 const text=readFileSync('client/src/App.tsx','utf8'),source=ts.createSourceFile('App.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),paths:string[]=[];
 const visit=(node:ts.Node)=>{if((ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node))&&node.tagName.getText(source)==='Route')for(const prop of node.attributes.properties)if(ts.isJsxAttribute(prop)&&prop.name.getText(source)==='path'&&prop.initializer&&ts.isStringLiteral(prop.initializer))paths.push(prop.initializer.text);ts.forEachChild(node,visit);};visit(source);
 assert.equal(ledger.appSourceSha256,createHash('sha256').update(text).digest('hex'),'Route changes require actual preservation-ledger review');assert.deepEqual(paths.sort(),ledger.routes.map(row=>row.path).sort());assert.equal(ledger.fallback.component,'NotFound');
 for(const route of ledger.routes)assert.ok(route.preserveActions.length>0);
 for(const path of [...navigationGroups,...athleteNavigationGroups].flatMap(group=>group.items.map(item=>item.path)))assert.ok(paths.some(route=>new RegExp('^'+route.replace(/:[^/]+/g,'[^/]+')+'$').test(path)),path+' must retain an actual route');
 assert.ok(ledger.routes.some(row=>row.baselineLayout==='SOURCE_AUDITED_RUNTIME_THEME_CHECK_PENDING'),'Source enumeration never masquerades as full interaction coverage');
});
