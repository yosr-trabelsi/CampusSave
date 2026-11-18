# CampusSave

Plateforme intelligente de lutte contre le gaspillage alimentaire.
Projet pédagogique intégrateur - 3ème année E-Business - ESSECT.

## Stack
- Web : React.js (`frontend-web/`)
- Mobile : Flutter (`frontend-mobile/`)
- Backend : Node.js / Express (`backend/`)
- Base de données et services : Firebase (Auth, Firestore, Cloud Messaging)
- Paiement : Konnect (mode test)

## Structure
- `frontend-web/` : application web
- `frontend-mobile/` : application mobile
- `backend/` : API REST
- `documentation/` : maquettes, UML, schéma de base, API, rapport

## Installation

### Backend
```bash
cd backend
npm install
cp .env.example .env   # puis remplir les valeurs
npm run dev
```

### Web
```bash
cd frontend-web
npm install
cp .env.example .env   # puis remplir les valeurs
npm run dev
```

### Mobile
```bash
cd frontend-mobile
flutter pub get
flutter run
```

## Configuration Firebase
Créer un projet Firebase, activer Authentication, Firestore et Cloud Messaging,
puis renseigner les variables dans les fichiers `.env` (jamais de clés dans Git).

## Équipe
- Personne 1 : Ayoub Mzoughi
- Personne 2 : Takwa Toukebri
- Personne 3 : Zeyneb Mabrouk
- Personne 4 : Molka Amor
- Personne 5 : Yosr Trabelsi
- Personne 6 : Islem Nefzi
