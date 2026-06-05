# 📡 API Reference - Panel Admin

## Base URL
```
http://localhost:5000/api
```

## Authentication
Tous les endpoints requièrent un token JWT dans les cookies:
```
Cookie: auth_token=<JWT_TOKEN>
```

---

## 🏥 Pharmacy Routes

### Médicaments (Medications)

#### GET - Récupérer tous les médicaments
```
GET /pharmacy/:pharmacyId/medications
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>

Response:
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Paracétamol 500mg",
    "description": "Soulage la douleur",
    "category": "Analgésiques",
    "requiresPrescription": false,
    "price": 150,
    "active": true,
    "photo": "/uploads/medicine1.jpg",
    "pharmacy": "507f1f77bcf86cd799439012",
    "createdAt": "2024-05-15T10:00:00Z",
    "updatedAt": "2024-05-15T10:00:00Z"
  }
]
```

#### POST - Créer un médicament
```
POST /pharmacy/:pharmacyId/medications
Headers:
  - Content-Type: multipart/form-data
  - Cookie: auth_token=<TOKEN>
Middleware: auth, pharmacyAdminOnly

Body (multipart):
{
  "data": {
    "name": "Ibuprofène 400mg",
    "category": "Anti-inflammatoires",
    "price": 200,
    "description": "Anti-inflammatoire puissant",
    "requiresPrescription": false,
    "active": true,
    "quantity": 50,
    "minQuantity": 10
  },
  "photo": <File>
}

Response:
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Ibuprofène 400mg",
  ... (comme GET)
}
```

#### PUT - Modifier un médicament
```
PUT /pharmacy/:pharmacyId/medications/:medicineId
Headers:
  - Content-Type: multipart/form-data
  - Cookie: auth_token=<TOKEN>
Middleware: auth, pharmacyAdminOnly

Body (multipart):
{
  "data": {
    "name": "Ibuprofène 400mg",
    "price": 220,
    ... (autres champs optionnels)
  },
  "photo": <File> (optionnel)
}

Response: Médicament modifié
```

#### DELETE - Supprimer un médicament
```
DELETE /pharmacy/:pharmacyId/medications/:medicineId
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, pharmacyAdminOnly

Response: 204 No Content
```

---

### Stock

#### GET - Récupérer le stock
```
GET /pharmacy/:pharmacyId/stocks
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>

Response:
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "medicationId": "507f1f77bcf86cd799439011",
    "medicationName": "Paracétamol 500mg",
    "pharmacyId": "507f1f77bcf86cd799439012",
    "quantity": 45,
    "minQuantity": 10,
    "updatedAt": "2024-05-15T12:30:00Z"
  }
]
```

#### PUT - Modifier la quantité du stock
```
PUT /pharmacy/:pharmacyId/stocks/:medicationId
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>

Body:
{
  "quantity": 50
}

Response: Stock modifié
```

#### POST - Créer ou mettre à jour le stock
```
POST /pharmacy/:pharmacyId/stocks/:medicationId
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, pharmacyAdminOnly

Body:
{
  "quantity": 50,
  "minQuantity": 10
}

Response: Stock créé/modifié
```

---

### Commandes (Orders)

#### GET - Récupérer les commandes
```
GET /pharmacy/:pharmacyId/orders
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>

Response:
[
  {
    "_id": "607f1f77bcf86cd799439030",
    "userId": "507f1f77bcf86cd799439001",
    "userName": "Ahmed Ben Ali",
    "userPhone": "+213123456789",
    "medications": [
      {
        "medicationId": "507f1f77bcf86cd799439011",
        "medicationName": "Paracétamol 500mg",
        "quantity": 2,
        "price": 150
      }
    ],
    "total": 300,
    "status": "pending",
    "pharmacyId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-05-15T14:00:00Z"
  }
]
```

#### GET - Récupérer une commande spécifique
```
GET /pharmacy/:pharmacyId/orders/:orderId
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>

Response: Commande détaillée
```

#### POST - Créer une commande
```
POST /pharmacy/:pharmacyId/orders
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>

Body:
{
  "user": "507f1f77bcf86cd799439001",
  "medicines": [
    {
      "medicine": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "price": 150
    }
  ],
  "totalAmount": 300,
  "status": "pending"
}

Response: Commande créée
```

#### PUT - Modifier le statut d'une commande
```
PUT /pharmacy/:pharmacyId/orders/:orderId
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, pharmacyAdminOnly

Body:
{
  "status": "confirmed"
}

Response: Commande modifiée

Statuts valides:
- pending
- confirmed
- preparing
- ready
- completed
- cancelled
```

---

### Achats (Purchases)

#### GET - Récupérer les achats
```
GET /pharmacy/:pharmacyId/purchases
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>

Response:
[
  {
    "_id": "607f1f77bcf86cd799439040",
    "pharmacy": "507f1f77bcf86cd799439012",
    "supplier": "507f1f77bcf86cd799439100",
    "medicines": [
      {
        "medicine": "507f1f77bcf86cd799439011",
        "quantity": 100,
        "unitPrice": 120
      }
    ],
    "totalAmount": 12000,
    "status": "pending",
    "purchaseDate": "2024-05-15T15:00:00Z",
    "createdAt": "2024-05-15T15:00:00Z"
  }
]
```

#### GET - Récupérer un achat spécifique
```
GET /pharmacy/:pharmacyId/purchases/:purchaseId
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>

Response: Achat détaillé
```

#### POST - Créer un achat
```
POST /pharmacy/:pharmacyId/purchases
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, pharmacyAdminOnly

Body:
{
  "supplier": "507f1f77bcf86cd799439100",
  "medicines": [
    {
      "medicine": "507f1f77bcf86cd799439011",
      "quantity": 100,
      "unitPrice": 120
    }
  ],
  "totalAmount": 12000,
  "status": "pending"
}

Response: Achat créé
```

#### PUT - Modifier le statut d'un achat
```
PUT /pharmacy/:pharmacyId/purchases/:purchaseId/status
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, pharmacyAdminOnly

Body:
{
  "status": "received"
}

Response: Achat modifié

Statuts valides:
- pending
- confirmed
- received
- cancelled
```

---

### Statistiques

#### GET - Statistiques de la pharmacie
```
GET /pharmacy/:pharmacyId/stats
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>

Response:
{
  "totalOrders": 45,
  "pendingOrders": 5,
  "totalMedications": 120,
  "lowStockCount": 3,
  "todayRevenue": 15000
}
```

---

### Admins de Pharmacie

#### GET - Récupérer les admins de la pharmacie
```
GET /pharmacy/:pharmacyId/admins
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, pharmacyAdminOnly

Response:
[
  {
    "_id": "507f1f77bcf86cd799439050",
    "user": {
      "_id": "507f1f77bcf86cd799439001",
      "username": "Ahmed",
      "email": "ahmed@example.com",
      "role": "admin"
    },
    "permissions": {
      "manageMedicines": true,
      "manageStocks": true,
      "manageOrders": true,
      "managePurchases": true,
      "viewStatistics": true
    },
    "createdAt": "2024-05-15T10:00:00Z"
  }
]
```

---

## 👨‍💼 Admin Routes

### Pharmacies

#### GET - Récupérer toutes les pharmacies
```
GET /admin/pharmacies
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, adminOnly

Response:
{
  "pharmacies": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Pharmacie Central",
      "address": "123 Rue Principale",
      "phone": "+213123456789",
      ... (autres champs)
    }
  ]
}
```

#### GET - Détails d'une pharmacie
```
GET /admin/pharmacies/:id
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, adminOnly

Response:
{
  "pharmacy": { ... pharmacie complète }
}
```

#### PUT - Modifier l'abonnement d'une pharmacie
```
PUT /admin/pharmacies/:id/subscription
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, adminOnly

Body:
{
  "status": "active",
  "endDate": "2025-05-15",
  "features": {
    "maxMedicines": 1000,
    "maxOrders": 10000
  }
}

Response: Pharmacie modifiée
```

---

### Statistiques Avancées

#### GET - Ventes par mois
```
GET /admin/stats/sales-by-month?year=2024
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, adminOnly

Response:
[
  {
    "month": 1,
    "monthName": "jan",
    "totalSales": 250000,
    "ordersCount": 125
  },
  ... (12 mois)
]
```

#### GET - Ventes par année
```
GET /admin/stats/sales-by-year
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, adminOnly

Response:
[
  {
    "year": 2023,
    "totalSales": 2500000,
    "ordersCount": 1200
  },
  {
    "year": 2024,
    "totalSales": 3150000,
    "ordersCount": 1450
  }
]
```

#### GET - Évolution du stock
```
GET /admin/stats/stock-evolution?pharmacyId=<ID>&period=monthly
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, adminOnly

Query Parameters:
- pharmacyId: ID de la pharmacie (requis)
- period: monthly ou yearly (requis)

Response:
[
  {
    "_id": 1,
    "category": "Analgésiques",
    "totalQuantity": 500,
    "avgMinQuantity": 50
  }
]
```

#### GET - Top médicaments par ventes
```
GET /admin/stats/top-medicines?pharmacyId=<ID>&period=monthly&limit=10
Headers:
  - Content-Type: application/json
  - Cookie: auth_token=<TOKEN>
Middleware: auth, adminOnly

Query Parameters:
- pharmacyId: ID de la pharmacie (requis)
- period: monthly ou yearly (requis)
- limit: Nombre de résultats (défaut: 10)

Response:
[
  {
    "name": "Paracétamol 500mg",
    "category": "Analgésiques",
    "totalRevenue": 45000,
    "totalQuantity": 300
  }
]
```

---

## 🔐 Codes d'Erreur

| Code | Message | Cause |
|------|---------|-------|
| 200 | OK | Succès |
| 201 | Created | Ressource créée |
| 204 | No Content | Suppression réussie |
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Token manquant ou expiré |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource non trouvée |
| 500 | Server Error | Erreur serveur |

---

## 🔑 Types de Données

### IMedicine
```typescript
{
  _id?: ObjectId;
  name: string;
  description?: string;
  category: string;
  requiresPrescription: boolean;
  price: number;
  active?: boolean;
  photo?: string;
  pharmacy: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### IStock
```typescript
{
  _id?: ObjectId;
  medication: ObjectId;
  pharmacy: ObjectId;
  quantity: number;
  minQuantity: number;
  lastUpdated?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### IOrder
```typescript
{
  _id?: ObjectId;
  pharmacy: ObjectId;
  user: ObjectId;
  medicines: Array<{
    medicine: ObjectId;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  orderDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### IPurchase
```typescript
{
  _id?: ObjectId;
  pharmacy: ObjectId;
  supplier: ObjectId;
  medicines: Array<{
    medicine: ObjectId;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'received' | 'cancelled';
  purchaseDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
```

---

## 📝 Exemples cURL

### Créer un médicament
```bash
curl -X POST \
  'http://localhost:5000/api/pharmacy/507f1f77bcf86cd799439012/medications' \
  -H 'Content-Type: multipart/form-data' \
  -H 'Cookie: auth_token=<TOKEN>' \
  -F 'data={"name":"Paracétamol","category":"Analgésiques","price":150}' \
  -F 'photo=@/path/to/image.jpg'
```

### Modifier le statut d'une commande
```bash
curl -X PUT \
  'http://localhost:5000/api/pharmacy/507f1f77bcf86cd799439012/orders/607f1f77bcf86cd799439030' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: auth_token=<TOKEN>' \
  -d '{"status":"confirmed"}'
```

### Récupérer les statistiques
```bash
curl -X GET \
  'http://localhost:5000/api/pharmacy/507f1f77bcf86cd799439012/stats' \
  -H 'Cookie: auth_token=<TOKEN>'
```

---

**Documentation mise à jour:** Mai 2026
**Version API:** 1.0
