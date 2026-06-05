# Hadipharma - Système d'Authentification

## Vue d'ensemble

Le système d'authentification de Hadipharma utilise des cookies HTTPOnly pour une sécurité renforcée. L'authentification est gérée côté serveur avec Express.js.

## Architecture

### Frontend (React + TypeScript)
- **AuthProvider**: Context React pour gérer l'état d'authentification global
- **useAuth**: Hook personnalisé pour les opérations d'authentification
- **ProtectedRoute**: Composant pour protéger les routes nécessitant une authentification
- **GuestRoute**: Composant pour les pages accessibles uniquement aux utilisateurs non connectés

### API Endpoints (Backend Express)
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

## Utilisation

### 1. Connexion
```typescript
import { useAuthContext } from '../features/auth';

const { signIn, isLoading, error } = useAuthContext();

const handleLogin = async () => {
  try {
    await signIn({ email, password });
    // Redirection automatique
  } catch (error) {
    // Gestion des erreurs
  }
};
```

### 2. Inscription
```typescript
const { signUp } = useAuthContext();

const handleRegister = async () => {
  try {
    await signUp({ name, email, password, confirmPassword });
  } catch (error) {
    // Gestion des erreurs
  }
};
```

### 3. Protection des Routes
```typescript
import { ProtectedRoute } from '../features/auth';

// Route protégée
<Route path="/profil" element={
  <ProtectedRoute>
    <UserProfile />
  </ProtectedRoute>
} />
```

### 4. Vérification de l'Authentification
```typescript
const { isAuthenticated, user, signOut } = useAuthContext();

if (isAuthenticated) {
  // Utilisateur connecté
  console.log('Bienvenue', user.name);
}
```

## Sécurité

- **Cookies HTTPOnly**: Les tokens JWT sont stockés dans des cookies HTTPOnly
- **Credentials: 'include'**: Envoi automatique des cookies avec chaque requête
- **Vérification côté serveur**: Chaque requête protégée vérifie la validité du token
- **Auto-refresh**: Vérification périodique de la validité de la session

## Configuration Backend (Express.js)

### Middleware d'authentification
```javascript
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Utiliser cookie-parser
app.use(cookieParser());

// Middleware de vérification
const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

### Routes d'authentification
```javascript
// Login
app.post('/api/auth/login', async (req, res) => {
  // Validation des credentials
  // Génération du token JWT
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  // Stockage dans cookie HTTPOnly
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
  });

  res.json({ user, message: 'Login successful' });
});

// Vérification de l'authentification
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ user });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Logout successful' });
});
```

## Variables d'environnement

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3000/api
```

### Backend (.env)
```
JWT_SECRET=votre_cle_secrete_jwt
NODE_ENV=development
```

## Gestion des Erreurs

Le système gère automatiquement les erreurs suivantes :
- **401 Unauthorized**: Token manquant ou invalide
- **403 Forbidden**: Token expiré
- **400 Bad Request**: Données d'inscription invalides
- **409 Conflict**: Email déjà utilisé

## États de Chargement

Tous les hooks d'authentification incluent des états de chargement :
- `isLoading`: Indique si une opération est en cours
- `error`: Message d'erreur en cas d'échec

## Redirections Automatiques

- **Après connexion**: Redirection vers la page demandée ou vers l'accueil
- **Après inscription**: Redirection vers l'accueil
- **Accès non autorisé**: Redirection vers la page de connexion