import test from 'node:test';
import assert from 'node:assert/strict';
import { createPortRules, validatePortRule, parsePortRuleImport, isExposedManagementPort } from './gameServerPortRules.ts';
const draft = { protocol: 'TCP', range: '25565', source: '0.0.0.0/0', title: '游戏', description: '', enabled: true, risk: '低风险' };
test('port ranges reject invalid, reversed and out-of-bounds values', () => {
  for (const range of ['0', '65536', '22.5', '25570-25565', '1-65536', '1,2']) assert.ok(validatePortRule({ ...draft, range }));
  for (const range of ['1', '65535', '25565-25570']) assert.equal(validatePortRule({ ...draft, range }), null);
});
test('sources reject malformed IPv4 addresses and CIDR masks', () => {
  for (const source of ['999.0.0.1/24', '192.168.1.0/33', '192.168.1.0', 'arbitrary']) assert.ok(validatePortRule({ ...draft, source }));
  assert.equal(validatePortRule({ ...draft, source: '192.168.1.0/24' }), null);
});
test('batch imports validate every row before returning any rules', () => {
  assert.equal(parsePortRuleImport('TCP,25566,0.0.0.0/0,备用\nUDP,19133,192.168.1.0/24,基岩版').length, 2);
  assert.throws(() => parsePortRuleImport('TCP,25566,0.0.0.0/0,备用\nTCP,70000,0.0.0.0/0,错误'), /第 2 行/);
  assert.throws(() => parsePortRuleImport('INVALID,22,0.0.0.0\/0,错误'), /协议/);
});
test('management exposure follows range, enable state and source restriction', () => {
  const rules = createPortRules(25565, 'Minecraft');
  assert.equal(rules.length, 6);
  assert.equal(rules.filter(rule => rule.enabled).length, 5);
  assert.equal(rules.filter(isExposedManagementPort).length, 1);
  const rcon = rules.find(rule => rule.range === '25575');
  assert.equal(isExposedManagementPort({ ...rcon, source: '192.168.1.0/24' }), false);
  assert.equal(isExposedManagementPort({ ...rcon, enabled: false }), false);
  assert.equal(isExposedManagementPort({ ...rcon, range: '25570-25580' }), true);
});
