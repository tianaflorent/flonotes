#  FloNotes

> Application mobile de prise de notes personnelle, sécurisée et moderne, développée avec React Native & Expo.

---

##  Aperçu

FloNotes est une application fullstack permettant à chaque utilisateur de créer, organiser et retrouver ses notes personnelles. Chaque compte dispose de ses propres notes, favoris, archives et corbeille, stockés en base de données MySQL.

---

##  Fonctionnalités

- 🔐 **Authentification** — Inscription / Connexion sécurisée avec JWT
- 📝 **Création de notes** — Éditeur avec formatage (gras, italique, couleurs, polices)
- 🌟 **Favoris** — Épingler les notes importantes
- 🗄️ **Archives** — Archiver les notes sans les supprimer
- 🗑️ **Corbeille** — Suppression douce (soft delete)
- 🌙 **Mode sombre** — Thème clair / sombre
- 🔍 **Recherche** — Filtrer les notes en temps réel
- 📐 **Vue grille / liste** — Affichage personnalisable
- 👤 **Multi-utilisateurs** — Chaque compte a ses propres données isolées

---

##  Stack Technique

| Couche | Technologie |
|---|---|
| Mobile | React Native + Expo |
| Navigation | Expo Router |
| Styles | NativeWind (Tailwind CSS) |
| Backend | Node.js (HTTP natif, sans framework) |
| Base de données | MySQL 8 + phpMyAdmin |
| Authentification | JWT (jsonwebtoken) |
| Stockage sécurisé | expo-secure-store |
| Modélisation BDD | draw.io (ERD) |
| Maquettes UI | Figma |

---

##  Structure de la Base de Données

```
users
├── id (PK, AUTO_INCREMENT)
├── email (UNIQUE, NOT NULL)
├── password (VARCHAR 255)
├── google_id (VARCHAR 191)
├── name (VARCHAR 255)
├── avatar (VARCHAR 500)
└── created_at (TIMESTAMP)

notes
├── id (PK, AUTO_INCREMENT)
├── user_id (FK → users.id, ON DELETE CASCADE)
├── title (VARCHAR 500)
├── content (TEXT)
├── format (JSON)
├── trashed (TINYINT DEFAULT 0)
├── archived (TINYINT DEFAULT 0)
├── favorite (TINYINT DEFAULT 0)
├── updated_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

**Relation :** 1 user → N notes

---

## 📁 Structure du Projet

```
flonotes/
├── app/                        # Pages (Expo Router)
│   ├── (auth)/
│   │   ├── login.tsx           # Page de connexion
│   │   └── register.tsx        # Page d'inscription
│   ├── note/
│   │   └── [id].tsx            # Édition d'une note existante
│   ├── index.tsx               # Accueil — liste des notes
│   ├── edit.tsx                # Éditeur de nouvelle note
│   ├── Archive.tsx             # Notes archivées
│   ├── Trash.tsx               # Corbeille
│   ├── favorites.tsx           # Notes favorites
│   ├── search.tsx              # Recherche
│   ├── settings.tsx            # Paramètres
│   └── _layout.tsx             # Layout racine + navigation
├── assets/                     # Images, fonts, icônes
├── components/
│   └── navigation/
│       └── NavbarBottom.tsx    # Barre de navigation bas
├── constants/                  # Constantes globales
├── context/
│   ├── AuthContext.tsx         # Gestion authentification
│   ├── NotesContext.tsx        # Gestion des notes (API)
│   └── ThemeContext.tsx        # Thème clair / sombre
├── hooks/                      # Hooks personnalisés
├── lib/
│   └── api.ts                  # Client HTTP (fetch + JWT auto)
├── notes-backend/              # Serveur Node.js
│   ├── src/
│   │   ├── config/db.ts        # Connexion MySQL + init tables
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── notes.controller.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── notes.routes.ts
│   │   ├── utils/
│   │   │   ├── auth.utils.ts
│   │   │   └── response.ts
│   │   └── index.ts
│   ├── .env                    # Variables d'environnement (non versionné)
│   └── package.json
├── .gitignore
├── app.json
├── babel.config.js
├── eslint.config.js
├── metro.config.js
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

---

##  Installation & Lancement

### Prérequis

- Node.js v18+
- WAMP démarré (icône verte 🟢)
- Expo Go installé sur votre téléphone

### 1. Cloner le projet

```bash
git clone https://github.com/VOTRE_USERNAME/flonotes.git
cd flonotes
```

### 2. Installer les dépendances frontend

```bash
npm install
```

### 3. Configurer et démarrer le backend

```bash
cd notes-backend
npm install
```

Créez `.env` dans `notes-backend/` :

```properties
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=notes_app
JWT_SECRET=votre_secret_jwt_ici
JWT_EXPIRES_IN=7d
```

Créez la base dans MySQL :

```sql
CREATE DATABASE notes_app;
```

Lancez le serveur :

```bash
npm run dev
```

> ✅ Démarre sur `http://localhost:3000` et crée les tables automatiquement.

### 4. Lancer l'application

Revenez à la racine :

```bash
cd ..
npx expo start
```

Scannez le QR code avec **Expo Go** sur votre téléphone.

> ⚠️ Téléphone et PC doivent être sur le **même réseau WiFi**.

---

## 🔌 API Endpoints

### Auth

| Méthode | Route | Description |
|---|---|---|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion |
| GET | `/auth/me` | Profil utilisateur connecté |

### Notes

| Méthode | Route | Description |
|---|---|---|
| GET | `/notes` | Récupérer toutes les notes |
| POST | `/notes` | Créer une note |
| PUT | `/notes/:id` | Modifier / archiver / mettre en favori |
| DELETE | `/notes/:id` | Supprimer définitivement |

---

## 🔐 Sécurité

- Mots de passe hashés avec **bcryptjs** (12 rounds)
- Authentification par **JWT** (expire après 7 jours)
- Token stocké dans **expo-secure-store**
- Chaque requête vérifiée par `getUserIdFromToken`
- Isolation totale des données : `WHERE user_id = ?` sur toutes les requêtes

---

## 👨‍💻 Auteur

Développé par **TIANA Florent**

---

## 📄 Licence

Ce projet est réalisé dans le cadre d'un projet académique.
