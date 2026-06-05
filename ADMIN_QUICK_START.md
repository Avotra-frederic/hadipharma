# 🚀 Guide de Démarrage Rapide - Panel Admin

## 📋 Prérequis
- Base de données MongoDB connectée
- Backend en cours d'exécution sur `http://localhost:5000`
- Frontend en cours d'exécution sur `http://localhost:5173`

---

## 1️⃣ Se Connecter et Créer une Pharmacie

### Étape 1: Se Connecter
```
1. Accédez à http://localhost:5173/auth/login
2. Entrez vos identifiants (email/password)
3. Cliquez sur "Connexion"
```

### Étape 2: Créer une Pharmacie
```
1. Naviguez vers /pharmacy/create ou le lien "Créer une Pharmacie"
2. Remplissez les informations:
   - Nom de la pharmacie
   - Adresse
   - Téléphone
   - WhatsApp (optionnel)
   - Horaires d'ouverture
   - 24h/24?
   - Localisation (GPS optionnel)
3. Cliquez sur "Créer"
4. ✅ Vous êtes automatiquement promu "admin"
```

### Étape 3: Accéder au Panel Admin
```
1. Naviguez vers /admin
2. Vous verrez automatiquement votre pharmacie sélectionnée
3. Le dashboard s'affiche
```

---

## 2️⃣ Ajouter un Médicament

### Dans le Panel Admin:
```
1. Cliquez sur "💊 Médicaments" dans le menu
2. Cliquez sur "+ Ajouter Médicament"
3. Un formulaire s'ouvre avec les champs:
   
   ✅ REQUIS:
   - Nom: "Paracétamol 500mg"
   - Catégorie: Sélectionnez "Analgésiques"
   - Prix: "150" (DZD)
   
   ❌ OPTIONNEL:
   - Description: "Soulage la douleur et la fièvre"
   - Photo: Téléchargez une image
   - Nécessite ordonnance: Cochez si applicable
   - Actif: Laissez coché
   
4. Cliquez sur "Enregistrer"
5. ✅ Le médicament apparaît dans la liste
6. Le stock est créé automatiquement avec quantité 0
```

### Catégories Disponibles:
```
- Analgésiques
- Antibiotiques
- Antiviraux
- Antihistaminiques
- Antiacides
- Antidiarrhéiques
- Antiémétiques
- Anti-inflammatoires
- Antiseptiques
- Anxiolytiques
- Bronchodilatateurs
- Corticostéroïdes
- Dépuratifs
- Désinfectants
- Diurétiques
- Hypoglycémiants
- Laxatifs
- Mucolytiques
- Vasodilatateurs
- Vitamines
- Autres
```

---

## 3️⃣ Gérer le Stock

### Afficher le Stock:
```
1. Cliquez sur "📦 Stock" dans le menu
2. Vous verrez une table avec:
   - Nom du médicament
   - Quantité actuelle
   - Quantité minimale
   - Statut (✓ OK ou ⚠️ Stock Faible)
```

### Modifier la Quantité:
```
1. Trouvez le médicament dans la liste
2. Cliquez sur le bouton "Modifier"
3. Entrez la nouvelle quantité
4. Cliquez "Enregistrer" pour confirmer
5. ✅ La quantité est mise à jour
```

### Filtrer:
```
- Recherchez par nom de médicament
- Cochez "Afficher seulement le stock faible" pour voir les produits faibles
```

---

## 4️⃣ Gérer les Commandes

### Afficher les Commandes:
```
1. Cliquez sur "📋 Commandes" dans le menu
2. Vous verrez les statistiques en haut:
   - Total Commandes
   - En Attente
   - Complétées
   - Revenu Total
```

### Filtrer par Statut:
```
Cliquez sur les boutons de filtrage:
- Tous
- En Attente
- Confirmée
- En Préparation
- Prête
- Complétée
- Annulée
```

### Voir les Détails:
```
1. Cliquez sur une commande pour la développer
2. Vous verrez:
   - Client (nom, téléphone)
   - Articles achetés (quantité, prix)
   - Total
   - Date
```

### Changer le Statut:
```
1. Développez la commande
2. Utilisez le sélecteur "Changer le statut"
3. Sélectionnez le nouveau statut
4. ✅ Le changement est immédiat
```

### Workflow Typique:
```
pending (En attente)
  ↓
confirmed (Confirmée)
  ↓
preparing (En préparation)
  ↓
ready (Prête pour retrait)
  ↓
completed (Complétée)

ou à tout moment: cancelled (Annulée)
```

---

## 5️⃣ Gérer les Achats/Factures

### Afficher les Achats:
```
1. Cliquez sur "🛒 Achats" (si disponible) ou trouvez dans le menu
2. Vous verrez les statistiques:
   - Total Achats
   - En Attente
   - Reçus
   - Dépense Totale
```

### Statuts des Achats:
```
pending (En attente)
  ↓
confirmed (Confirmée)
  ↓
received (Reçue)

ou: cancelled (Annulée)
```

### Voir la Facture:
```
1. Développez un achat
2. Cliquez sur "📄 Télécharger la Facture"
3. La facture s'affiche en mode impression
4. Utilisez Ctrl+P pour imprimer ou exporter en PDF
```

---

## 📊 Tableau de Bord (Dashboard)

### Cartes Statistiques:
```
1. Commandes Totales - Nombre total de commandes
2. Commandes en Attente - À traiter
3. Médicaments - Total de produits
4. Stock Faible - Produits sous le minimum
5. Revenu d'aujourd'hui - Montant généré aujourd'hui
```

### Raccourcis Rapides:
```
- 💊 Gérer Médicaments - Ajouter/modifier/supprimer
- 📦 Gérer Stock - Voir et mettre à jour les quantités
- 📋 Gérer Commandes - Traiter les commandes
```

---

## 🔍 Recherche et Filtrage

### Rechercher des Médicaments:
```
1. Allez dans "💊 Médicaments"
2. Entrez dans la barre de recherche
3. Recherche par:
   - Nom du médicament
   - Catégorie
```

### Filtrer le Stock:
```
- Recherche par nom
- Afficher uniquement stock faible
```

### Filtrer les Commandes:
```
- Filtrer par statut (tous, pending, confirmed, etc.)
```

---

## ⚙️ Paramètres

### Accéder aux Paramètres:
```
1. Cliquez sur "⚙️ Paramètres" en bas du menu
2. Vous pouvez:
   - Modifier vos informations personnelles
   - Changer votre mot de passe
   - Gérer vos préférences
```

### Se Déconnecter:
```
1. Cliquez sur "🚪 Déconnexion" en bas du menu
2. ✅ Vous êtes déconnecté
```

---

## 📱 Interface Mobile

Le panel admin est responsive et fonctionne sur:
- Desktop (1920x1080 et plus)
- Tablet (768px+)
- Mobile (320px+)

Sur mobile, le menu latéral se replie pour laisser plus d'espace au contenu.

---

## 🐛 Dépannage

### Le panel ne charge pas
```
✓ Vérifiez que vous êtes connecté
✓ Vérifiez que vous possédez une pharmacie
✓ Rafraîchissez la page (F5)
✓ Vérifiez la console pour les erreurs
```

### Les données ne se mettent pas à jour
```
✓ Vérifiez que le backend répond
✓ Vérifiez votre connexion réseau
✓ Vérifiez que les tokens ne sont pas expirés
```

### Les erreurs 403 apparaissent
```
✓ Vous ne possédez pas cette pharmacie
✓ Vos permissions ont été révoquées
✓ Reconnectez-vous
```

### Les images ne s'affichent pas
```
✓ Vérifiez l'URL de l'image
✓ Vérifiez que le fichier existe dans /uploads
✓ Vérifiez les permissions du fichier
```

---

## 💡 Conseils Utiles

1. **Mise à jour du Stock**: Mettez à jour le stock dès la réception des achats
2. **Traitement des Commandes**: Changez le statut en temps réel pour que les clients sachent
3. **Alertes Stock**: Vérifiez régulièrement le stock faible
4. **Factures**: Gardez les factures à jour pour la comptabilité
5. **Téléchargement**: Téléchargez les factures régulièrement pour vos dossiers

---

## 🎓 Exemples de Workflow

### Workflow d'un Médicament:
```
1. Créer le médicament
   → Nom: Ibuprofène 400mg
   → Catégorie: Anti-inflammatoires
   → Prix: 200 DZD

2. Initialiser le stock
   → Quantité: 50
   → Minimum: 10

3. Vendre le médicament
   → Commande créée
   → Stock diminue

4. Réapprovisionner
   → Créer un achat
   → Stock augmente
```

### Workflow d'une Commande:
```
1. Client commande
   → Statut: pending

2. Confirmer
   → Statut: confirmed

3. Préparer
   → Statut: preparing

4. Prêt pour retrait
   → Statut: ready

5. Complétée
   → Statut: completed
   → Facture générée
```

---

## 📞 Support

Pour toute question ou problème:
1. Consultez ce guide
2. Vérifiez la checklist (ADMIN_CHECKLIST.md)
3. Vérifiez la documentation complète (ADMIN_PANEL_COMPLETE.md)
4. Contactez le support technique

**Dernière mise à jour:** Mai 2026
