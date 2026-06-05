# ✅ Checklist de Vérification - Panel Admin

## 🔐 Authentification et Rôles
- [ ] Un utilisateur peut se connecter
- [ ] Un utilisateur peut créer une pharmacie
- [ ] Après création d'une pharmacie, l'utilisateur obtient le rôle "admin"
- [ ] Un enregistrement Admin est créé dans la base de données
- [ ] L'utilisateur peut accéder au panel admin (`/admin`)

## 📱 Panel Admin - Navigation
- [ ] Le menu latéral s'affiche correctement
- [ ] Le nom de la pharmacie s'affiche dans le header
- [ ] Les 4 sections principales sont accessibles:
  - [ ] Tableau de Bord
  - [ ] Médicaments
  - [ ] Stock
  - [ ] Commandes

## 📊 Tableau de Bord
- [ ] Affiche les 4 cartes stats (Commandes, En attente, Médicaments, Stock Faible)
- [ ] Affiche le revenu d'aujourd'hui
- [ ] Affiche les boutons de raccourci vers les autres sections
- [ ] Les raccourcis sont cliquables et naviguent correctement

## 💊 Gestion des Médicaments
- [ ] La liste des médicaments s'affiche
- [ ] Le bouton "+ Ajouter Médicament" fonctionne
- [ ] Le formulaire d'ajout s'ouvre
- [ ] Tous les champs du formulaire sont présents:
  - [ ] Nom (requis)
  - [ ] Catégorie (requis, 21 options)
  - [ ] Prix (requis, > 0)
  - [ ] Description (optionnel)
  - [ ] Photo (optionnel, upload d'image)
  - [ ] Nécessite ordonnance (checkbox)
  - [ ] Actif (checkbox)
- [ ] La validation fonctionne (affiche erreurs si champs vides/invalides)
- [ ] Un médicament peut être ajouté
- [ ] Le formulaire se ferme après l'ajout
- [ ] Le nouveau médicament apparaît dans la liste
- [ ] Les médicaments peuvent être modifiés (bouton Modifier)
- [ ] Les médicaments peuvent être supprimés (bouton Supprimer)
- [ ] La recherche par nom/catégorie fonctionne

## 📦 Gestion du Stock
- [ ] La page stock charge les données
- [ ] Les 3 cartes stats s'affichent (Total, Stock Faible, Quantité)
- [ ] Le tableau du stock affiche:
  - [ ] Nom du médicament
  - [ ] Quantité actuelle
  - [ ] Quantité minimale
  - [ ] Statut (✓ OK ou ⚠️ Stock Faible)
- [ ] Les stocks faibles sont en rouge
- [ ] La recherche fonctionne
- [ ] Le filtre "Stock Faible" fonctionne
- [ ] On peut modifier la quantité en ligne (bouton Modifier)
- [ ] La sauvegarde de la quantité fonctionne

## 📋 Gestion des Commandes
- [ ] La page commandes charge les données
- [ ] Les 4 cartes stats s'affichent
- [ ] Les filtres de statut fonctionnent (Tous, En Attente, Confirmée, etc.)
- [ ] Chaque commande affiche:
  - [ ] ID/Numéro
  - [ ] Statut avec couleur appropriée
  - [ ] Client (nom, téléphone)
  - [ ] Date
  - [ ] Total en monnaie DZD
  - [ ] Nombre d'articles
- [ ] On peut cliquer pour développer les détails
- [ ] Les détails affichent:
  - [ ] Liste complète des articles avec quantité et prix
  - [ ] Infos client
  - [ ] Sélecteur de statut pour changer le statut
- [ ] Le changement de statut fonctionne
- [ ] Les messages de succès/erreur s'affichent

## 🛒 Achats/Factures
- [ ] La page achats s'affiche
- [ ] Les 4 cartes stats s'affichent correctement
- [ ] Les filtres par statut fonctionnent
- [ ] Les achats se développent pour montrer les détails
- [ ] Les détails affichent les articles achetés avec prix unitaire
- [ ] Le changement de statut fonctionne

## 🔄 Intégrations Backend
- [ ] Les routes `/pharmacy/:pharmacyId/medications` fonctionnent
- [ ] Les routes `/pharmacy/:pharmacyId/stocks` fonctionnent
- [ ] Les routes `/pharmacy/:pharmacyId/orders` fonctionnent
- [ ] Les routes `/pharmacy/:pharmacyId/purchases` fonctionnent
- [ ] Les middleware `pharmacyAdminOnly` fonctionnent correctement
- [ ] Les erreurs 403 s'affichent si accès non autorisé

## 🎨 UI/UX
- [ ] L'interface est responsive (mobile, tablet, desktop)
- [ ] Les couleurs sont appropriées pour chaque section
- [ ] Les icônes s'affichent correctement
- [ ] Le loading s'affiche pendant les appels API
- [ ] Les messages d'erreur s'affichent en rouge
- [ ] Les messages de succès s'affichent en vert
- [ ] Les transitions et animations sont fluides

## 🔒 Sécurité
- [ ] Un utilisateur sans rôle admin ne peut pas accéder au panel
- [ ] Un utilisateur ne peut pas accéder à une pharmacie qu'il ne possède pas
- [ ] Les tokens expirent correctement
- [ ] Les données sensibles sont protégées

## ⚡ Performance
- [ ] Les pages chargent rapidement
- [ ] Pas de requêtes réseau inutiles
- [ ] Les états se mettent à jour sans rechargement page
- [ ] Les images se chargent correctement

## 📝 Données Test

### Pour Tester Complètement:
1. Créer 2-3 médicaments avec:
   - Noms différents (Paracétamol, Ibuprofène, Aspirine)
   - Catégories différentes
   - Avec/sans ordonnance
   - Avec photos si possible

2. Vérifier le stock s'affiche correctement

3. Créer quelques commandes fictives pour tester

4. Vérifier les statistiques se mettent à jour

---

## 🚀 Checklist Finale

- [ ] Tous les points ci-dessus sont validés
- [ ] Aucune erreur dans la console JavaScript
- [ ] Aucune erreur dans la console du serveur
- [ ] L'expérience utilisateur est fluide
- [ ] Les données persistent après refresh
- [ ] Le panel est prêt pour production

---

## Notes:
- Les catégories disponibles: Analgésiques, Antibiotiques, Antiviraux, Antihistaminiques, etc. (21 total)
- Les prix doivent être en Dinars Algériens (DZD)
- Les statuts des commandes: pending → confirmed → preparing → ready → completed/cancelled
- Les statuts des achats: pending → confirmed → received / cancelled
