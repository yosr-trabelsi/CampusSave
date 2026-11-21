# CampusSave - Application mobile (Flutter) - Personne 3

Remplace le dossier `frontend-mobile/` du dépôt (mêmes chemins que le squelette).

## Périmètre
- Structure et navigation (barre du bas / barre latérale sur tablette)
- Inscription, connexion, profil
- Interface étudiant : offres (recherche, catégories, prix max, tri), détail, réservation, paiement Konnect, QR code, commandes, tableau de bord
- Design responsive (1 colonne téléphone, plusieurs colonnes tablette, barre latérale >= 800 px) au style du web

## Lancer
1. Backend : `cd backend && npm install && npm run dev` (voir `INTEGRATION.md` : routes offers/orders à monter dans `app.js`, `FIREBASE_ENABLED=true`).
2. Dans `frontend-mobile/` : `flutter create .` (les dossiers `android/` et `ios/` ne contiennent que des `.gitkeep`).
3. `dart pub global activate flutterfire_cli` puis `flutterfire configure` (même projet Firebase que le web/backend) -> génère `lib/firebase_options.dart`.
   Console Firebase : Authentication > Email/Mot de passe activé.
4. `flutter pub get` puis `flutter run`.
   - Émulateur Android : `http://10.0.2.2:5000/api` (défaut)
   - Téléphone réel : `flutter run --dart-define=API_URL=http://IP_DU_PC:5000/api`

## Android (android/app/src/main/AndroidManifest.xml)
- `<uses-permission android:name="android.permission.INTERNET"/>`
- Dans `<manifest>` : `<queries><intent><action android:name="android.intent.action.VIEW"/><data android:scheme="https"/></intent></queries>`
- Dans `<application>` (dev, API en http) : `android:usesCleartextTraffic="true"`
- `minSdkVersion 23` dans `android/app/build.gradle`.

## Comptes
Seuls les comptes **étudiant** peuvent se connecter au mobile ; commerçants et administrateurs sont renvoyés vers le web.
