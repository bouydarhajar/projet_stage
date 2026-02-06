# Mon Projet Laravel + React

## Prérequis
- Docker
- Docker Compose

## Installation

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/votre-repo.git
cd votre-repo
```

### 2. Configuration Backend
```bash
cp backend/.env.example backend/.env
```

### 3. Démarrer Docker
```bash
docker-compose up -d --build
```

### 4. Installer les dépendances et migrer la base de données
```bash
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan db:seed  # Si vous avez des seeders
```

## Accès

- **Frontend (React)** : http://localhost:3000
- **Backend (Laravel API)** : http://localhost:8000
- **Base de données** : localhost:3306

## Commandes utiles

### Arrêter les conteneurs
```bash
docker-compose down
```

### Voir les logs
```bash
docker-compose logs -f
```

### Accéder au conteneur backend
```bash
docker-compose exec backend bash
```

### Accéder au conteneur frontend
```bash
docker-compose exec frontend sh
```

### Réinstaller les dépendances
```bash
docker-compose exec backend composer install
docker-compose exec frontend npm install
```
