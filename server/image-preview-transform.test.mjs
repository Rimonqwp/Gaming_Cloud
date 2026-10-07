import test from 'node:test';
import assert from 'node:assert/strict';
import { zoomAtPoint } from '../src/app/pages/user-dashboard/imagePreviewTransform.ts';

const initial = { scale: 1, x: 0, y: 0 };
const imagePoint = (view, point) => ({ x: (point.x - view.x) / view.scale, y: (point.y - view.y) / view.scale });

test('指针下的图像坐标在连续缩放及移动指针后保持不变', () => {
  let view = initial;
  for (const [factor, point] of [[1.6, { x: 720, y: 180 }], [1.3, { x: 130, y: 280 }], [0.8, { x: 490, y: 210 }]]) {
    const before = imagePoint(view, point);
    view = zoomAtPoint(view, factor, point);
    const after = imagePoint(view, point);
    assert.ok(Math.abs(before.x - after.x) < 1e-9);
    assert.ok(Math.abs(before.y - after.y) < 1e-9);
  }
});

test('缩放限制为 100% 至 800%，到达上限后位置不漂移', () => {
  const max = zoomAtPoint(initial, 100, { x: 320, y: 160 });
  assert.equal(max.scale, 8);
  assert.deepEqual(zoomAtPoint(max, 2, { x: 500, y: 40 }), max);
  assert.deepEqual(zoomAtPoint(max, 0.001, { x: 10, y: 80 }), initial);
});

test('相同指针位置的放大和缩小可恢复原来的视图', () => {
  const view = { scale: 2, x: -250, y: -140 };
  const point = { x: 340, y: 190 };
  assert.deepEqual(zoomAtPoint(zoomAtPoint(view, 2, point), 0.5, point), view);
});

test('连续滚轮缩放回到 100% 时清除浮点误差与平移', () => {
  let view = initial;
  const point = { x: 760, y: 204 };
  for (let index = 0; index < 5; index++) view = zoomAtPoint(view, Math.exp(0.24), point);
  for (let index = 0; index < 5; index++) view = zoomAtPoint(view, Math.exp(-0.24), point);
  assert.deepEqual(view, initial);
});
