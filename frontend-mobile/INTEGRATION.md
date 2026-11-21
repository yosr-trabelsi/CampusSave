# Liaison Mobile <-> Backend <-> Web (CampusSave, version compus2)

L'application mobile réutilise **le même backend Node/Express et la même base Firebase** que le web.
Les appels sont ceux de `frontend-web/src/services/api.js`.

## Routes utilisées

| Écran mobile | Appel backend | Équivalent web |
|---|---|---|
| Inscription | `POST /api/auth/register` `{name,email,password(8+),role:"student",phone?}` | `registerUser` (Register.jsx) |
| Connexion | SDK Firebase `signInWithEmailAndPassword` | `AuthContext.login` |
| Profil | `GET /api/auth/me`, `PUT /api/auth/me` `{name,phone}` | `AuthContext` / `updateProfile` |
| Offres | `GET /api/offers` (recherche, catégorie, prix max : côté app) | `getOffers` (Offers.jsx) |
| Réservation | `POST /api/orders` `{offerId,quantity}` | `createOrder` |
| Mes commandes / statistiques | `GET /api/orders/my-orders` | `getMyOrders` |
| Paiement Konnect | `POST /api/payments/init`, `GET /api/payments/:orderId/status` (polling 3 s) | (Checkout.jsx vide pour l'instant) |
| QR code | `GET /api/qr/:orderId` (`token` affiché avec `qr_flutter`) | — |
| Notifications FCM | `POST /api/notifications/token` `{fcmToken}` | — |

## Style
Palette, rayon (18), ombres, badges, cartes statistiques et barre latérale verte reprises de `frontend-web/src/index.css`
(police Plus Jakarta Sans, vert `#1f9d63`, fond `#f4f3ec`, accent orange `#ff7a3d`).

## Points à corriger dans le projet pour que le mobile (et le web) fonctionnent

1. **`backend/src/app.js` ne monte que `/auth`, `/qr`, `/notifications`, `/payments`.**
   Les routes `/offers`, `/orders` (et `/admin`, `/merchants`, `/users` utilisées par le web) existent mais ne sont pas branchées : tout appel renvoie 404.
   Ajouter dans `app.js`, avant `app.use(notFound)` :
   ```js
   app.use('/api/offers', require('./routes/offerRoutes'));
   app.use('/api/orders', require('./routes/orderRoutes'));
   ```
2. **CORS** : `cors.js` n'autorise que `WEB_URL`. Le mobile n'est pas concerné (pas de navigateur), rien à faire.
3. **Statut « récupérée »** : `qrController` écrit `collected`, alors que le web (MyOrders / StudentDashboard) attend `completed`.
   Le mobile accepte les deux ; côté web il faut aligner (sinon « Repas sauvés » reste à 0).
4. **Champs d'offre utilisés par le web mais non enregistrés par `offerController.createOffer`** :
   `category`, `imageUrl`, `pickupStart`, `pickupEnd`. Le mobile les affiche s'ils existent (sinon catégorie « Autre »).
5. **QR sans paiement** : `createOrder` ne pose pas `paymentStatus` et `getOrderQr` ne bloque que si ce champ existe et diffère de `paid`.
   Ajouter `paymentStatus: 'unpaid'` dans `createOrder`. Le mobile n'affiche le QR que pour les commandes payées.
6. **Paiement** : renseigner `PUBLIC_API_URL`, `KONNECT_*`, `JWT_SECRET` dans `.env`. Sans webhook public, le mobile fonctionne quand même
   (`GET /payments/:orderId/status` interroge Konnect lui-même).
7. `FIREBASE_ENABLED=true` dans `backend/.env` (sinon `db` et `auth` sont `null` et toutes les routes plantent).
