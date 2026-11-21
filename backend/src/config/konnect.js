// Sandbox par défaut. En production : KONNECT_BASE_URL=https://api.konnect.network/api/v2
const DEFAULT_BASE_URL = 'https://api.sandbox.konnect.network/api/v2';

function getKonnectConfig() {
  const apiKey = process.env.KONNECT_API_KEY;
  const walletId = process.env.KONNECT_WALLET_ID;
  const baseUrl = (process.env.KONNECT_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');

  if (!apiKey || !walletId) {
    throw Object.assign(
      new Error('Konnect non configuré (KONNECT_API_KEY et KONNECT_WALLET_ID manquants)'),
      { status: 500 }
    );
  }
  return { apiKey, walletId, baseUrl };
}

module.exports = { getKonnectConfig, DEFAULT_BASE_URL };
