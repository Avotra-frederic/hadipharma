# Configuration mobile HadiPharma

## 1. Développement local

### Démarrer l’application web pour test mobile
```bash
cd frontend
npm run dev:host
```

L’application sera accessible sur :
- http://localhost:5173
- http://<votre-ip>:5173

### Tester depuis un téléphone ou un émulateur externe
1. Vérifiez que votre téléphone et votre PC sont sur le même réseau Wi‑Fi.
2. Ouvrez l’URL fournie par Vite avec l’IP locale de votre machine.
3. Si vous utilisez un émulateur Android, ouvrez l’URL dans le navigateur de l’émulateur.

### Si votre backend est lancé localement
Assurez-vous que l’API pointe bien vers votre environnement local :
```env
VITE_API_BASE_URL=http://<votre-ip>:3000/api
```

## 2. Capacitor

### Synchronisation native
```bash
cd frontend
npm run cap:sync
```

### Ouvrir Android Studio
```bash
cd frontend
npm run cap:android
```

### Ouvrir Xcode (iOS)
```bash
cd frontend
npm run cap:ios
```

## 3. Mise en ligne

### Build de production
```bash
cd frontend
npm run build
```

### Déploiement web
Publiez le contenu du dossier `frontend/dist` sur votre hébergeur web (Vercel, Netlify, Nginx, etc.).

### Déploiement mobile
1. Générez les assets natifs si nécessaire.
2. Compilez l’application Android/iOS via Capacitor depuis Android Studio / Xcode.
3. Publiez sur Google Play Store ou l’App Store.

## 4. Recommandations réseau
Pour les tests locaux avec un appareil externe, il est souvent nécessaire de configurer le forwarding si votre backend ou votre front est exposé sur une autre machine.

Exemples utiles :
- Frontend Vite : `5173`
- Backend API : `3000`
- WebSocket notifications : `3000`

Si vous avez un reverse proxy ou un firewall, ouvrez ces ports.
