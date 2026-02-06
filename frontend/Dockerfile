FROM node:18-alpine

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Exposer le port 3000
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
```

---

### 5. **frontend/.dockerignore**
```
node_modules/
build/
.env
.git/
npm-debug.log
.DS_Store