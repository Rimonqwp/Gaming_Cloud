import test from 'node:test';
import assert from 'node:assert/strict';
import { backupScheduleCron, backupScheduleSummary, validateBackupSchedule } from './backupSchedule.ts';
import { nextTaskRun } from './gameServerTasksData.ts';

test('weekly backups honor Sunday and the selected execution time in Shanghai', () => {
  const value = { frequency: 'weekly', weekday: 0, executionTime: '18:45' };
  assert.equal(backupScheduleSummary(value), '每周日 18:45');
  assert.equal(nextTaskRun(backupScheduleCron(value), new Date('2026-10-09T19:59:00Z')), '2026-10-11 18:45');
});

test('monthly backups skip missing dates and preserve the time across year boundaries', () => {
  const value = { frequency: 'monthly', monthDay: 31, executionTime: '23:59' };
  assert.equal(backupScheduleSummary(value), '每月 31 号 23:59');
  assert.equal(nextTaskRun(backupScheduleCron(value), new Date('2026-10-31T16:00:00Z')), '2026-12-31 23:59');
  assert.equal(nextTaskRun(backupScheduleCron(value), new Date('2026-12-31T16:00:00Z')), '2027-01-31 23:59');
});

test('hourly backups use the minute while daily backups retain the full time', () => {
  const value = { frequency: 'hourly', executionTime: '18:25' };
  assert.equal(backupScheduleSummary(value), '每小时第 25 分钟');
  assert.equal(nextTaskRun(backupScheduleCron(value), new Date('2026-10-09T19:26:00Z')), '2026-10-10 04:25');
  assert.equal(nextTaskRun(backupScheduleCron({ ...value, frequency: 'daily' }), new Date('2026-10-09T19:26:00Z')), '2026-10-10 18:25');
});

test('existing configurations default to Monday or day 1 and invalid dates cannot be scheduled', () => {
  assert.equal(backupScheduleSummary({ frequency: 'weekly', executionTime: '04:00' }), '每周一 04:00');
  assert.equal(backupScheduleSummary({ frequency: 'monthly', executionTime: '04:00' }), '每月 1 号 04:00');
  for (const weekday of [-1, 7, 1.5, NaN]) {
    const value = { frequency: 'weekly', weekday, executionTime: '04:00' };
    assert.notEqual(validateBackupSchedule(value), '');
    assert.equal(backupScheduleCron(value), null);
  }
  for (const monthDay of [0, 32, 1.5, NaN]) {
    assert.equal(backupScheduleCron({ frequency: 'monthly', monthDay, executionTime: '04:00' }), null);
  }
  for (const executionTime of ['', '24:00', '04:60']) {
    assert.equal(backupScheduleCron({ frequency: 'daily', executionTime }), null);
  }
});
