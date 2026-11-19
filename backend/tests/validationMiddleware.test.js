const test = require('node:test');
const assert = require('node:assert');
const { validate, registerRules } = require('../src/middleware/validationMiddleware');

function run(body) {
  const res = { code: null, json(p) { this.payload = p; return this; }, status(c) { this.code = c; return this; } };
  let nextCalled = false;
  validate(registerRules)({ body }, res, () => { nextCalled = true; });
  return { res, nextCalled };
}

test('étudiant valide', () => {
  const { nextCalled } = run({ email: 'a@b.tn', password: '12345678', fullName: 'Yosr', role: 'student' });
  assert.ok(nextCalled);
});

test('le rôle admin est refusé', () => {
  const { res, nextCalled } = run({ email: 'a@b.tn', password: '12345678', fullName: 'Yosr', role: 'admin' });
  assert.ok(!nextCalled);
  assert.strictEqual(res.code, 400);
});

test('commerçant : businessName et address obligatoires', () => {
  const { res } = run({ email: 'a@b.tn', password: '12345678', fullName: 'Yosr', role: 'merchant' });
  assert.strictEqual(res.code, 400);
  assert.ok(res.payload.errors.some((e) => e.startsWith('businessName')));
  assert.ok(res.payload.errors.some((e) => e.startsWith('address')));
});

test('email et mot de passe invalides', () => {
  const { res } = run({ email: 'pas-un-email', password: '123', name: 'Y', role: 'student' });
  assert.ok(res.payload.errors.length >= 3);
});
