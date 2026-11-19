const test = require('node:test');
const assert = require('node:assert');

process.env.KONNECT_API_KEY = 'cle-test';
process.env.KONNECT_WALLET_ID = 'wallet-test';
delete process.env.KONNECT_BASE_URL;
const payment = require('../src/services/paymentService');

const fakeResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(body),
});

test('initPayment appelle le bon endpoint avec la clé et les montants en millimes', async () => {
  let call;
  global.fetch = async (url, opts) => { call = { url, opts }; return fakeResponse(200, { payUrl: 'https://pay', paymentRef: 'ref1' }); };

  const out = await payment.initPayment({
    amountMillimes: 7500, orderId: 'o1', description: 'test',
    webhookUrl: 'https://api/webhook', successUrl: 'https://ok', failUrl: 'https://ko',
  });

  assert.deepStrictEqual(out, { payUrl: 'https://pay', paymentRef: 'ref1' });
  assert.strictEqual(call.url, 'https://api.sandbox.konnect.network/api/v2/payments/init-payment');
  assert.strictEqual(call.opts.method, 'POST');
  assert.strictEqual(call.opts.headers['x-api-key'], 'cle-test');
  const body = JSON.parse(call.opts.body);
  assert.strictEqual(body.amount, 7500);
  assert.strictEqual(body.token, 'TND');
  assert.strictEqual(body.receiverWalletId, 'wallet-test');
});

test('getPaymentDetails lit payment.status', async () => {
  let url;
  global.fetch = async (u) => { url = u; return fakeResponse(200, { payment: { status: 'completed' } }); };
  const details = await payment.getPaymentDetails('ref1');
  assert.ok(url.endsWith('/payments/ref1'));
  assert.ok(payment.isCompleted(details));
  assert.ok(!payment.isCompleted({ status: 'pending' }));
});

test('une erreur Konnect devient une erreur 502', async () => {
  global.fetch = async () => fakeResponse(401, { message: 'unauthorized' });
  await assert.rejects(() => payment.getPaymentDetails('x'), (e) => e.status === 502);
});
