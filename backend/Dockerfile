FROM php:8.2-fpm

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev

# Installer les extensions PHP nécessaires
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Définir le répertoire de travail
WORKDIR /var/www

# Copier les fichiers du projet
COPY . .

# Installer les dépendances PHP
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Donner les permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Exposer le port 9000
EXPOSE 9000

CMD ["php-fpm"]
```

---

### 3. **backend/.dockerignore**
```
vendor/
node_modules/
.env
.git/
storage/logs/*
storage/framework/cache/*
storage/framework/sessions/*
storage/framework/views/*
tests/
.phpunit.result.cache