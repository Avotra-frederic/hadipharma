# Hadipharma - Phase 5: Popular Pharmacies & Rating System

## 🎯 Overview
This phase implements the complete pharmacy rating and popular pharmacies system with owner notifications.

## ✨ New Features

### 1. Popular Pharmacies Display
- **Homepage Section**: Displays top 10 most popular pharmacies in a carousel
- **Selection Criteria**: 
  - Must be active and validated
  - Sorted by: popularity flag → rating → review count
  - Limited to top 10

**Endpoint**: `GET /pharmacy/popular`

**Example Response**:
```json
{
  "pharmacies": [
    {
      "_id": "...",
      "name": "Pharmacie Centrale",
      "rating": 4.8,
      "reviews": 45,
      "isPopular": true,
      "isActive": true,
      "isValidated": true,
      ...
    }
  ]
}
```

### 2. Rating & Review System
- **Component**: `RatePharmacy` - 5-star widget
- **Features**:
  - Star rating (1-5) with hover effects
  - Optional review text (max 500 chars)
  - Toast notifications
  - Accessible only to logged-in users

**Endpoint**: `POST /pharmacy/:id/rating`

**Request Body**:
```json
{
  "rating": 5,
  "review": "Excellent service!"
}
```

### 3. Pharmacy Owner Notifications
- **Event**: `pharmacy-validated` - Emitted when superadmin validates pharmacy
- **Notification Contains**:
  - Pharmacy name
  - Validation timestamp
  - Toast message in admin panel

**Example Event**:
```json
{
  "userId": "...",
  "pharmacyId": "...",
  "pharmacyName": "My Pharmacy",
  "message": "Votre pharmacie 'My Pharmacy' a été validée et est maintenant active.",
  "title": "Pharmacie validée"
}
```

## 📁 Files Structure

### Backend
```
src/
├── app/
│   ├── controller/
│   │   └── pharmacy.controller.ts (added: getPopularPharmacies)
│   ├── interface/
│   │   └── pharmacy.interface.ts (added: isPopular field)
│   └── model/
│       └── pharmacy.model.ts (already had: rating, reviews)
├── router/
│   ├── pharmacy.routes.ts (added: GET /popular)
│   └── superadmin.routes.ts (enhanced: pharmacy-validated event)
└── scripts/
    └── init-popular-pharmacies.ts (new: setup script)
```

### Frontend
```
src/
├── features/
│   ├── pharmacy/
│   │   ├── api/
│   │   │   ├── getFeatured.ts (modified: use /popular)
│   │   │   └── getPopularPharmacies.ts (new)
│   │   └── components/
│   │       ├── FeaturesSection.tsx (auto-uses popular)
│   │       └── RatePharmacy.tsx (new: rating widget)
│   └── notifications/
│       ├── hooks/
│       │   └── usePharmacyValidationNotification.ts (new)
│       └── index.ts (export notification hook)
└── pages/
    └── home/Pharmacy.tsx (integrated: RatePharmacy)
```

## 🚀 Usage

### Initialize Popular Pharmacies (First Run)
```bash
cd backend
npm run script:ts -- init-popular-pharmacies.ts
```

This marks the first 10 active, validated pharmacies as popular.

### API Endpoints

**Get Popular Pharmacies**
```bash
GET /api/pharmacy/popular
```

**Submit Rating**
```bash
POST /api/pharmacy/{pharmacyId}/rating
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 4,
  "review": "Great service!"
}
```

**Validate Pharmacy (Superadmin)**
```bash
PUT /api/superadmin/pharmacies/{pharmacyId}/validate
Authorization: Bearer {superadminToken}
```

## 🔐 Data Isolation & Security

✅ **Verified**:
- Pharmacy admins can only manage their own pharmacy
- Ratings are written by any authenticated user
- Validation requires superadmin role
- All data filtered by pharmacyId on backend

## 📱 Responsive Design

✅ **Mobile Optimized**:
- Rating widget: Full width, touch-friendly stars
- Popular carousel: Auto-responsive with Swiper
- All breakpoints: mobile (320px) → tablet (768px) → desktop (1024px+)

## 🎨 User Experience

### Pharmacy Owner Workflow
1. Register pharmacy → "Pending validation"
2. Superadmin validates → Toast notification: "Pharmacie validée!"
3. Owner sees admin dashboard
4. Users rate pharmacy → Rating displayed on homepage

### Customer Workflow
1. Browse popular pharmacies on homepage
2. Click on pharmacy → View medicines
3. Rate pharmacy → 5-star widget + optional review
4. Toast: "Merci pour votre évaluation!"

## 📊 Rating Algorithm

```typescript
// Display priority:
1. isPopular flag (manual designation)
2. Rating (average, highest first)
3. Reviews count (most reviewed first)
4. Created date (newest as tiebreaker)

// Display rules:
- Only show: active + validated pharmacies
- Sort: isPopular DESC → rating DESC → reviews DESC
- Limit: 10 pharmacies max
```

## 🔔 Notification System

Built on existing WebSocket infrastructure:

```typescript
// Backend emits:
emitNotification('pharmacy-validated', {
  userId: pharmacy.user_id,
  pharmacyId: pharmacyId,
  pharmacyName: pharmacy.name,
  message: `Votre pharmacie "${pharmacy.name}" a été validée...`,
  title: 'Pharmacie validée'
});

// Frontend listens via:
usePharmacyValidationNotification()
→ Triggers toast showing validation message
```

## 🧪 Testing

### Manual Test Cases

**Test 1: Popular Pharmacies Display**
1. Visit homepage
2. Should see "Pharmacies populaires" section
3. Click "Voir plus" → Navigate to all popular pharmacies
4. Verify max 10 displayed

**Test 2: Rate Pharmacy**
1. Login as customer
2. Open pharmacy details
3. Scroll to "Évaluer cette pharmacie"
4. Select 4 stars + write review
5. Click "Soumettre" → See success toast

**Test 3: Validation Notification**
1. Superadmin validates pharmacy
2. Pharmacy owner should see toast in admin panel
3. Pharmacy appears in popular list after validation

## 📈 Performance

- `getPopularPharmacies()`: Filters 1-2 aggregate queries (O(n log n))
- Rating submission: Direct update (O(1))
- WebSocket notifications: Real-time delivery

## 🎯 Success Metrics

✅ All 8 requirements completed:
1. Responsive design - VERIFIED
2. Data isolation - VERIFIED  
3. Rating/popularity system - IMPLEMENTED
4. Top 10 popular display - IMPLEMENTED
5. Pharmacy owner notifications - IMPLEMENTED
6. Admin subscription management - EXISTS
7. Admin user management - EXISTS
8. Popular pharmacies on homepage - LIVE

---

**Last Updated**: Phase 5 Complete
**Status**: Production Ready ✅
