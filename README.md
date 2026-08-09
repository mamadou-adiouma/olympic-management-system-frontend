```markdown
# 🇸🇳 Olympic Management System

[![Laravel Version](https://img.shields.io/badge/Laravel-10.x%20%2F%2011.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![PHP Version](https://img.shields.io/badge/PHP-%E2%89%A5%208.1-777BB4?style=for-the-badge&logo=php)](https://www.php.net)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)

---

## Description

**OMS • DAKAR 2026** est une plateforme fullstack dédiée à la gestion des Jeux Olympiques de la Jeunesse (JOJ Dakar 2026). Le projet combine :

- une API Laravel performante,
- un frontend React moderne,
- une interface SOAP pour l’intégration de services externes.

La plateforme permet de gérer les athlètes, les disciplines, les épreuves, les résultats, les médailles, et de produire des statistiques avancées pour un tableau de bord analytique.

---

## Stack Technique

- **Backend :** Laravel (PHP 8.2+)
- **Base de données :** MySQL
- **Frontend :** React (JSX), Tailwind CSS, Lucide React
- **API :** REST (JSON) + SOAP (XML)

---

## Fonctionnalités

- Gestion des disciplines et épreuves
  - création, consultation, mise à jour
  - suivi des statuts : `Programmé`, `En cours`, `Terminé`

- Gestion des athlètes
  - inscription et recherche multicritère
  - filtres : sexe, discipline, pays, mot-clé
  - historique des performances

- Résultats et médailles
  - soumission des performances
  - classement automatique des athlètes
  - mise à jour dynamique du palmarès

- Tableau de bord et analytics
  - statistiques en temps réel
  - classement des pays pondéré (`Or=7`, `Argent=4`, `Bronze=1`)
  - suivi de performance sur 7 jours

- Service SOAP natif
  - accès XML pour intégrations tierces
  - idéal pour affichage en stade ou connexions externes

---

## Prérequis

- PHP ≥ 8.2
- extension PHP `ext-soap`
- Composer
- MySQL
- Node.js / npm (pour le frontend)

---

## Installation

## Backend Laravel

1. Cloner le projet :
   ```bash
   git clone [https://github.com/mamadou-adiouma/olympic-management-system-backend.git]
   cd olympic-management-system
   ```

2. Installer les dépendances PHP :
   ```bash
   composer install
   ```

3. Configurer l’environnement :
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Mettre à jour la configuration de la base de données dans `.env` :
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=nom_de_la_base
   DB_USERNAME=root
   DB_PASSWORD=
   ```

5. Exécuter les migrations et charger les données de démonstration :
   ```bash
   php artisan migrate --seed
   ```

6. Lancer le serveur Laravel :
   ```bash
   php artisan serve
   ```

L’API sera accessible sur `http://localhost:8000`.

---

## Frontend React

1. Cloner le projet :
   ```bash
   git clone [https://github.com/mamadou-adiouma/olympic-management-system-frontend.git]
   cd olympic-management-system
   ```

2. Se placer dans le dossier frontend :
   ```bash
   cd client
   ```

3. Installer les dépendances :
   ```bash
   npm install ou npm i
   ```

4. Lancer l’application :
   ```bash
   npm run dev
   ```

---


## Endpoints Principaux (REST)

- `GET /api/dashboard/stats` — métriques globales pour le dashboard
- `GET /api/athletes` — liste des athlètes
- `POST /api/athletes` — création d’un athlète
- `GET /api/disciplines` — liste des disciplines
- `POST /api/disciplines` — ajout d’une discipline
- `GET /api/epreuves` — consultation des épreuves
- `POST /api/epreuves` — création d’une épreuve
- `POST /api/resultats` — soumission d’un résultat
- `GET /api/medailles/tableau` — tableau des médailles par pays


## Web Service SOAP

Point d’entrée : `POST http://localhost:8000/soap`

Exemple de requête SOAP :

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
   <soapenv:Body>
      <getAthleteHistory>
         <codeAthlete>code athlete</codeAthlete>
      </getAthleteHistory>
   </soapenv:Body>
</soapenv:Envelope>
```

---

## Tests & Documentation

- Collection Postman : `joj-collections-postman.json`
- Swagger UI : `http://localhost:8000/api/documentation` (si activé)

---

## Licence

MIT
```