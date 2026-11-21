const test = require('node:test');
const assert = require('node:assert');

process.env.JWT_SECRET = 'secret-de-test';
const qr = require('../src/services/qrTokenService');

test('un token valide est accepté', () => {
  assert.strictEqual(qr.verifyToken(qr.createToken('order123')), 'order123');
});

test('un token modifié est refusé', () => {
  const [id, sig] = qr.createToken('order123').split('.');
  assert.strictEqual(qr.verifyToken(`order999.${sig}`), null);
  assert.strictEqual(qr.verifyToken(`${id}.${sig.slice(0, -1)}0`), null);
});

test('des entrées invalides sont refusées', () => {
  for (const bad of [undefined, null, 42, '', 'abc', '.', 'abc.']) {
    assert.strictEqual(qr.verifyToken(bad), null);
  }
});
