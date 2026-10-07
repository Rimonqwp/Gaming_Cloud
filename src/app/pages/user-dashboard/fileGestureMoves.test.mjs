import test from 'node:test';
import assert from 'node:assert/strict';
import { planFileMove } from './fileGestureMoves.ts';

const root = '/home/server';
const folder = path => ({ path: root + path, folder: true, modified: 'before' });
const file = path => ({ path: root + path, folder: false, modified: 'before', content: 'original' });
const entries = [folder(''), folder('/config'), folder('/backups'), folder('/config/nested'), file('/config/nested/test.txt'), file('/config/settings.ini')];

test('moving a folder preserves descendants and coalesces selected children', () => {
  const result = planFileMove(entries, [root + '/config', root + '/config/nested/test.txt'], root + '/backups', root, 'now');
  assert.equal(result.count, 1);
  assert.deepEqual(result.paths, [root + '/backups/config']);
  assert.equal(result.relocate(root + '/config/nested/test.txt'), root + '/backups/config/nested/test.txt');
  assert.equal(result.entries.find(entry => entry.path.endsWith('/test.txt')).content, 'original');
  assert.equal(entries[1].path, root + '/config');
});

test('multi-file moves leave unrelated entries intact', () => {
  const result = planFileMove(entries, [root + '/config/nested/test.txt', root + '/config/settings.ini'], root + '/backups', root, 'now');
  assert.equal(result.count, 2);
  assert.deepEqual(result.paths, [root + '/backups/test.txt', root + '/backups/settings.ini']);
  assert.equal(result.entries[1], entries[1]);
});

test('rejects cycles, moving root and non-folder destinations', () => {
  assert.throws(() => planFileMove(entries, [root + '/config'], root + '/config/nested', root, 'now'), /自身/);
  assert.throws(() => planFileMove(entries, [root], root + '/backups', root, 'now'), /根目录/);
  assert.throws(() => planFileMove(entries, [root + '/config'], root + '/config/settings.ini', root, 'now'), /目标文件夹/);
  assert.throws(() => planFileMove(entries, [root + '/config'], '/home', root, 'now'), /目标文件夹/);
});

test('rejects name conflicts atomically, including same-named batch items', () => {
  const occupied = [...entries, file('/backups/settings.ini')];
  assert.throws(() => planFileMove(occupied, [root + '/config/nested/test.txt', root + '/config/settings.ini'], root + '/backups', root, 'now'), /同名/);
  assert.equal(occupied.at(-1).content, 'original');
  const duplicates = [...entries, file('/config/test.txt')];
  assert.throws(() => planFileMove(duplicates, [root + '/config/nested/test.txt', root + '/config/test.txt'], root + '/backups', root, 'now'), /同名/);
});

test('dropping in the current parent is a no-op', () => {
  const result = planFileMove(entries, [root + '/config/settings.ini'], root + '/config', root, 'now');
  assert.equal(result.count, 0);
  assert.deepEqual(result.entries, entries);
});
