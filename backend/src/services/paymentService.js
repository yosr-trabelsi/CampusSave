// Appels HTTP vers l'API Konnect (doc : https://docs.konnect.network)
//   POST {base}/payments/init-payment   -> { payUrl, paymentRef }
//   GET  {base}/payments/{paymentRef}   -> { payment: { status: 'completed' | 'pending', ... } }
// Authentification : header x-api-key. Montants en millimes (1 TND = 1000).
const { getKonnectConfig } = require('../config/konnect');

async function request(path, options = {}) {
  const { apiKey, baseUrl } = getKonnectConfig();

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
  });

  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!res.ok) {
    throw Object.assign(new Error(`Konnect a refusé la requête (HTTP ${res.status})`), {
      status: 502,
      details: data,
    });
  }
  return data;
}

async function initPayment({
  amountMillimes, orderId, description, webhookUrl, successUrl, failUrl,
  firstName, lastName, email, phoneNumber, lifespan = 15,
}) {
  const { walletId } = getKonnectConfig();

  const data = await request('/payments/init-payment', {
    method: 'POST',
    body: JSON.stringify({
      receiverWalletId: walletId,
      token: 'TND',
      amount: amountMillimes,
      type: 'immediate',
      description,
      acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
      lifespan,
      checkoutForm: false,
      addPaymentFeesToAmount: false,
      orderId,
      webhook: webhookUrl,
      successUrl,
      failUrl,
      firstName, lastName, email, phoneNumber, // ignorés si undefined
    }),
  });

  if (!data.payUrl || !data.paymentRef) {
    throw Object.assign(new Error('Réponse Konnect inattendue'), { status: 502, details: data });
  }
  return { payUrl: data.payUrl, paymentRef: data.paymentRef };
}

async function getPaymentDetails(paymentRef) {
  const data = await request(`/payments/${encodeURIComponent(paymentRef)}`, { method: 'GET' });
  return data.payment || data;
}

// D'après la doc Konnect : se fier à payment.status ("completed" = payé)
const isCompleted = (details) => details?.status === 'completed';

module.exports = { initPayment, getPaymentDetails, isCompleted };
