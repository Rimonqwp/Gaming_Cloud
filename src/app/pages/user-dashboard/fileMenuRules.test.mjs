import test from 'node:test';
import assert from 'node:assert/strict';
import { fileMenuGroups, contextSelection } from './fileMenuRules.ts';
const root='/home/server'; const folder={path:root+'/config',folder:true};
const ordinary={path:root+'/x.txt',folder:false,bytes:10};
const zip={path:root+'/x.zip',folder:false}; const rar={path:root+'/x.rar',folder:false};
const menu=(entry,selection=entry?[entry]:[],extra={})=>fileMenuGroups({entry,selection,root,busy:false,canPaste:false,visibleCount:2,...extra});
const actions=groups=>groups.flat().map(item=>item.action);
const cases=[
  ['blank',undefined,[],['folder','file','upload','paste','selectAll','refresh','path']],
  ['root',{path:root,folder:true},[],['open','folder','file','upload','paste','path','details']],
  ['folder',folder,[folder],['open','cut','copy','paste','folder','file','compress','download','rename','path','details','delete']],
  ['text',ordinary,[ordinary],['edit','cut','copy','compress','download','rename','path','details','delete']],
  ['binary',{path:root+'/x.bin',folder:false},[],['cut','copy','compress','download','rename','path','details','delete']],
  ['zip',zip,[zip],['extract','cut','copy','download','rename','path','details','delete']],
  ['rar',rar,[rar],['cut','copy','download','rename','path','details','delete']],
  ['mixed',folder,[folder,ordinary],['cut','copy','compress','download','path','cancel','delete']],
  ['all zip',zip,[zip,{...zip,path:root+'/other.zip'}],['cut','copy','extract','compress','download','path','cancel','delete']],
];
for (const [name,entry,selection,expected] of cases) test(name+' menu has ordered, unique actions',()=>{
  const groups=menu(entry,selection); const actual=actions(groups);
  assert.deepEqual(actual,expected); assert.equal(new Set(actual).size,actual.length);
  assert.ok(groups.every(group=>group.length));
  if(actual.includes('delete')) assert.equal(actual.at(-1),'delete');
});
test('selection rules preserve groups only for selected targets',()=>{
  const paths=[folder.path,ordinary.path];
  assert.deepEqual(contextSelection(paths,folder,root),paths);
  assert.deepEqual(contextSelection(paths,zip,root),[zip.path]);
  assert.deepEqual(contextSelection(paths,undefined,root),[]);
  assert.deepEqual(contextSelection(paths,{path:root,folder:true},root),[]);
});
test('paste stays visible while disabled, and busy disables all mutation actions',()=>{
  assert.equal(menu(folder).flat().find(i=>i.action==='paste').disabled,true);
  assert.equal(menu(folder,[folder],{canPaste:true}).flat().find(i=>i.action==='paste').disabled,false);
  const busy=menu(folder,[folder],{busy:true,canPaste:true}).flat();
  for(const action of ['cut','copy','paste','folder','file','compress','download','rename','delete']) assert.equal(busy.find(i=>i.action===action).disabled,true);
  assert.equal(menu(undefined,[],{visibleCount:0}).flat().find(i=>i.action==='selectAll').disabled,true);
});
