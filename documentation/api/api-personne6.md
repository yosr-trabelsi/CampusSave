# API - partie Personne 6 (paiement, QR Code, notifications)

Base : `http://localhost:5000/api`
Authentification : header `Authorization: Bearer <ID token Firebase>` (sauf webhook).
Erreurs : JSON `{ "error": "..." }` (et `errors: [...]` pour une validation 400).

## Inscription et connexion
- Inscription / profil : routes de Personne 5 (`POST /auth/register`, `GET /auth/profile`).
- Connexion : côté client avec le SDK Firebase, puis récupérer le token :
  - Web : `signInWithEmailAndPassword(auth, email, password)` puis `await user.getIdToken()`
  - Flutter : `FirebaseAuth.instance.signInWithEmailAndPassword(...)` puis `await user.getIdToken()`

## Cycle d'une commande
`pending` (réservation) -> `confirmed` (commerçant) -> `ready` (commerçant) -> `completed` (scan du QR par le commerçant). Ou `cancelled`.
Le paiement est indépendant : il met `paymentStatus` à `pending` puis `paid`, sans toucher à `status`.

## Paiement Konnect (étudiant)
| Méthode | Route | Corps / réponse |
|---|---|---|
| POST | /payments/init | `{ orderId }` -> `{ payUrl, paymentRef }`. Ouvrir `payUrl` dans le navigateur (web) ou avec `url_launcher` / WebView (Flutter) |
| GET | /payments/:orderId/status | `{ orderId, paymentStatus: "unpaid"\|"pending"\|"paid", status }`. À appeler quand l'étudiant revient de la page de paiement |
| GET | /payments/webhook?payment_ref=... | public, appelé uniquement par Konnect |

Le montant vient de `orders.totalPrice` (en TND), converti en millimes côté serveur.

## QR Code
| Méthode | Route | Accès | Réponse |
|---|---|---|---|
| GET | /qr/:orderId | étudiant | `{ token, qrImage }` : `qrImage` est une image base64 à afficher directement (`<img src={qrImage}>` / `Image.memory`). 402 si paiement en attente, 409 si annulée ou déjà récupérée |
| POST | /qr/validate | commerçant | corps `{ token }` (texte lu par le scan). 200 validé, 400 QR invalide, 403 autre commerçant, 409 déjà récupérée / annulée / pas encore confirmée, 402 paiement en attente |

## Notifications
| Méthode | Route | Corps |
|---|---|---|
| POST | /notifications/token | `{ fcmToken }` : à envoyer au lancement de l'app mobile, après connexion |

Le serveur envoie à l'étudiant : "Paiement confirmé" et "Commande récupérée".

## Exemple d'appel (web)
```js
const token = await auth.currentUser.getIdToken();
const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/init`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ orderId }),
});
const { payUrl } = await res.json();
window.location.href = payUrl;
```
