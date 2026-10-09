import test from 'node:test';
import assert from 'node:assert/strict';
import { nextTaskRun } from './gameServerTasksData.ts';

test('daily preview uses Shanghai time and advances after the scheduled minute', () => {
  assert.equal(nextTaskRun('0 4 * * *', new Date('2026-10-09T19:59:59Z')), '2026-10-10 04:00');
  assert.equal(nextTaskRun('0 4 * * *', new Date('2026-10-09T20:00:00Z')), '2026-10-11 04:00');
});

test('hourly and weekly schedules use the local date and weekday', () => {
  assert.equal(nextTaskRun('5 * * * *', new Date('2026-10-09T23:59:00Z')), '2026-10-10 08:05');
  assert.equal(nextTaskRun('0 4 * * 1', new Date('2026-10-09T19:59:00Z')), '2026-10-12 04:00');
});

test('monthly previews skip months without the requested day and handle leap years', () => {
  assert.equal(nextTaskRun('0 4 31 * *', new Date('2026-10-31T19:59:00Z')), '2026-12-31 04:00');
  assert.equal(nextTaskRun('0 4 29 2 *', new Date('2026-01-01T00:00:00Z')), '2028-02-29 04:00');
});

test('custom schedules move to the following occurrence as time passes', () => {
  assert.equal(nextTaskRun('*/30 * * * *', new Date('2026-10-09T19:29:59Z')), '2026-10-10 03:30');
  assert.equal(nextTaskRun('*/30 * * * *', new Date('2026-10-09T19:30:00Z')), '2026-10-10 04:00');
});

test('invalid or impossible schedules have no preview', () => {
  const now = new Date('2026-10-09T19:30:00Z');
  assert.equal(nextTaskRun('invalid', now), null);
  assert.equal(nextTaskRun('0 4 31 2 *', now), null);
});
