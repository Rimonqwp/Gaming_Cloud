import test from 'node:test';
import assert from 'node:assert/strict';
import { captureFileClipboard, planFileTransfer } from './fileClipboard.ts';
import { archiveBase, createArchiveFiles } from './instanceFileOperations.ts';
const root = '/home/server';
const folder = name => ({ path: root + name, folder: true, modified: 'old', created: 'old' });
const file = (name, text = 'original') => ({ path: root + name, folder: false, modified: 'old', created: 'old', content: new TextEncoder().encode(text), bytes: text.length, tags: ['test'] });
const fixture = () => [folder(''), folder('/a'), folder('/b'), folder('/a/nested'), file('/a/nested/x.txt'), file('/a/y.txt')];
const ready = result => { assert.equal(result.kind, 'ready'); return result; };
const text = entry => new TextDecoder().decode(entry.content);

test('copy captures independent snapshots, normalizes children, and survives source deletion', () => {
  const entries = fixture();
  const clip = captureFileClipboard(entries, [root+'/a', root+'/a/nested/x.txt'], 'copy', root);
  assert.deepEqual(clip.paths, [root+'/a']);
  entries.at(-1).content[0] = 0;
  const result = ready(planFileTransfer(entries.filter(e => !e.path.startsWith(root+'/a')), clip, root+'/b', root, 'now'));
  const copied = result.entries.find(e => e.path === root+'/b/a/y.txt');
  assert.equal(text(copied), 'original'); assert.equal(copied.created, 'now');
  copied.content[0] = 1;
  assert.equal(text(clip.snapshot.at(-1)), 'original');
});
test('same-directory copies preserve extensions and number new copies', () => {
  const entries = fixture(); const clip = captureFileClipboard(entries, [root+'/a/y.txt'], 'copy', root);
  const one = ready(planFileTransfer(entries, clip, root+'/a', root, 'now'));
  assert.deepEqual(one.paths, [root+'/a/y - 副本.txt']);
  const two = ready(planFileTransfer(one.entries, clip, root+'/a', root, 'now'));
  assert.deepEqual(two.paths, [root+'/a/y - 副本 (2).txt']);
});
test('cut moves a folder and its contents, with an editor-path relocation map', () => {
  const entries = fixture(); const clip = captureFileClipboard(entries, [root+'/a', root+'/a/y.txt'], 'cut', root);
  const result = ready(planFileTransfer(entries, clip, root+'/b', root, 'now'));
  assert.equal(result.count, 1); assert.equal(result.relocate(root+'/a/nested/x.txt'), root+'/b/a/nested/x.txt');
  assert.equal(result.relocate(root+'/a/nested/.untitled-1.txt'), root+'/b/a/nested/.untitled-1.txt');
  assert.ok(!result.entries.some(e => e.path === root+'/a')); assert.equal(entries.length, 6);
  assert.equal(result.entries.find(e => e.path.endsWith('/y.txt')).created, 'old');
});
test('cut to current parent is a no-op and stale cut sources fail', () => {
  const entries = fixture(); const clip = captureFileClipboard(entries, [root+'/a/y.txt'], 'cut', root);
  const result = ready(planFileTransfer(entries, clip, root+'/a', root, 'now'));
  assert.equal(result.count, 0); assert.deepEqual(result.entries, entries);
  assert.throws(() => planFileTransfer(entries.slice(0,-1), clip, root+'/b', root, 'now'), /不存在/);
});
test('conflicts stage an entire batch without modifying inputs and can preserve both', () => {
  const entries = [...fixture(), file('/b/y.txt', 'target')];
  const clip = captureFileClipboard(entries, [root+'/a/nested/x.txt', root+'/a/y.txt'], 'cut', root);
  const pending = planFileTransfer(entries, clip, root+'/b', root, 'now');
  assert.equal(pending.kind, 'conflict'); assert.ok(entries.some(e => e.path === root+'/a/y.txt'));
  assert.ok(!entries.some(e => e.path === root+'/b/x.txt'));
  const result = ready(planFileTransfer(entries, clip, root+'/b', root, 'now', { choices: {[pending.conflict.key]:'keep'} }));
  assert.equal(text(result.entries.find(e => e.path === root+'/b/y.txt')), 'target');
  assert.ok(result.entries.some(e => e.path === root+'/b/y - 副本.txt'));
});
test('folder replacement merges, replaces conflicts, and preserves destination-only children', () => {
  const entries = [...fixture(), folder('/b/a'), file('/b/a/y.txt', 'target'), file('/b/a/only.txt','keep')];
  const clip = captureFileClipboard(entries, [root+'/a'], 'cut', root);
  const pending = planFileTransfer(entries, clip, root+'/b', root, 'now');
  const result = ready(planFileTransfer(entries, clip, root+'/b', root, 'now', { choices:{[pending.conflict.key]:'replace'} }));
  assert.equal(text(result.entries.find(e => e.path === root+'/b/a/y.txt')), 'original');
  assert.equal(text(result.entries.find(e => e.path === root+'/b/a/only.txt')), 'keep');
  assert.deepEqual(result.overwritten, [root+'/b/a/y.txt']);
  assert.equal(result.relocate(root+'/a/y.txt'), root+'/b/a/y.txt');
});
test('mixed file/folder conflicts disallow replacement even under apply-all', () => {
  const entries = [...fixture(), folder('/b/y.txt')];
  const clip = captureFileClipboard(entries,[root+'/a/y.txt'],'copy',root);
  const pending = planFileTransfer(entries,clip,root+'/b',root,'now',{choices:{},all:'replace'});
  assert.equal(pending.kind,'conflict'); assert.equal(pending.conflict.canReplace,false);
  const result = ready(planFileTransfer(entries,clip,root+'/b',root,'now',{choices:{},all:'keep'}));
  assert.ok(result.entries.some(e => e.path === root+'/b/y - 副本.txt'));
});
test('apply-all resolves several file conflicts atomically', () => {
  const entries = [...fixture(), file('/b/y.txt','target'), file('/b/x.txt','target')];
  const clip = captureFileClipboard(entries,[root+'/a/y.txt',root+'/a/nested/x.txt'],'copy',root);
  const replaced = ready(planFileTransfer(entries,clip,root+'/b',root,'now',{choices:{},all:'replace'}));
  assert.equal(replaced.overwritten.length,2);
  assert.equal(text(replaced.entries.find(e=>e.path===root+'/b/x.txt')),'original');
  const kept = ready(planFileTransfer(entries,clip,root+'/b',root,'now',{choices:{},all:'keep'}));
  assert.deepEqual(kept.paths,[root+'/b/y - 副本.txt',root+'/b/x - 副本.txt']);
});
test('sources with the same basename do not silently collide during batch paste', () => {
  const entries=[...fixture(),file('/a/x.txt','second')];
  const clip=captureFileClipboard(entries,[root+'/a/nested/x.txt',root+'/a/x.txt'],'cut',root);
  const pending=planFileTransfer(entries,clip,root+'/b',root,'now');
  assert.equal(pending.kind,'conflict');
  const kept=ready(planFileTransfer(entries,clip,root+'/b',root,'now',{choices:{},all:'keep'}));
  assert.deepEqual(kept.paths,[root+'/b/x.txt',root+'/b/x - 副本.txt']);
  assert.equal(text(kept.entries.find(e=>e.path===root+'/b/x - 副本.txt')),'second');
});
test('rejects root, range violations, invalid destinations and descendant cycles', () => {
  const entries=fixture();
  assert.throws(()=>captureFileClipboard(entries,[root],'copy',root),/根目录/);
  assert.throws(()=>captureFileClipboard(entries,['/etc'],'cut',root),/范围/);
  const clip=captureFileClipboard(entries,[root+'/a'],'copy',root);
  for (const dest of [root+'/a',root+'/a/nested']) assert.throws(()=>planFileTransfer(entries,clip,dest,root,'now'),/自身/);
  for (const dest of ['/home',root+'/a/y.txt']) assert.throws(()=>planFileTransfer(entries,clip,dest,root,'now'),/目标/);
});
test('archives across branches use a real common ancestor and keep duplicate filenames distinct',()=>{
  const entries=[file('/a/shared/x.txt'),file('/b/shared/x.txt','other')];
  const paths=entries.map(e=>e.path); const base=archiveBase(paths);
  assert.equal(base,root);
  assert.deepEqual(Object.keys(createArchiveFiles(entries,paths,base)),['a/shared/x.txt','b/shared/x.txt']);
});
