import { useState } from 'react';
import { LiaQuestionCircleSolid, LiaChevronRightSolid, LiaBookSolid, LiaHeadsetSolid, LiaEnvelopeSolid } from 'react-icons/lia';

type Category = 'all' | 'client' | 'pharmacist' | 'admin' | 'superadmin';

const categories = [
  { id: 'all', label: 'Tout', icon: < LiaBookSolid size={18} /> },
  { id: 'client', label: 'Clients', icon: < LiaQuestionCircleSolid size={18} /> },
  { id: 'pharmacist', label: 'Pharmaciens', icon: < LiaQuestionCircleSolid size={18} /> },
  { id: 'admin', label: 'Administrateurs', icon: < LiaQuestionCircleSolid size={18} /> },
  { id: 'superadmin', label: 'Super Admin', icon: < LiaQuestionCircleSolid size={18} /> },
] as const;

const faqs = [
  // CLIENTS
  {
    category: 'client',
    question: 'Comment créer un compte client ?',
    answer: 'Cliquez sur "S\'inscrire" depuis la page de connexion. Remplissez votre nom d\'utilisateur, adresse email et mot de passe (minimum 8 caractères). Un lien de confirmation vous sera envoyé par email.',
    keywords: ['compte', 'inscription', 'créer', 'client', 'email', 'mot de passe'],
  },
  {
    category: 'client',
    question: 'Comment commander des médicaments ?',
    answer: 'Parcourez les pharmacies, sélectionnez vos médicaments, ajustez les quantités, puis cliquez sur "Ajouter au panier". Finalisez votre commande depuis le panier en choisissant un mode de paiement.',
    keywords: ['commande', 'panier', 'acheter', 'médicaments', 'paiement'],
  },
  {
    category: 'client',
    question: 'Quels modes de paiement sont acceptés ?',
    answer: 'Vous pouvez payer en espèces à la livraison, par carte Visa, PayPal ou Mobile Money. Les modes disponibles dépendent de la pharmacie que vous choisissez.',
    keywords: ['paiement', 'visa', 'paypal', 'mobile money', 'espèces', 'livraison'],
  },
  {
    category: 'client',
    question: 'Comment fonctionne la livraison ?',
    answer: 'La livraison est gratuite pour toutes les commandes. Indiquez votre adresse de livraison lors du checkout. Le délai dépend de la pharmacie et de votre localisation.',
    keywords: ['livraison', 'gratuite', 'adresse', 'délai'],
  },
  {
    category: 'client',
    question: 'Qu\'est-ce qu\'une ordonnance et comment l\'uploader ?',
    answer: 'Certains médicaments nécessitent une ordonnance médicale. Si votre panier contient de tels médicaments, vous devrez confirmer avoir une ordonnance et uploader un fichier (PDF, JPG ou PNG) lors du checkout.',
    keywords: ['ordonnance', 'prescription', 'upload', 'fichier', 'médicament sur ordonnance'],
  },
  {
    category: 'client',
    question: 'Comment suivre mes commandes ?',
    answer: 'Rendez-vous dans "Mon profil" > "Mes commandes" pour voir l\'historique de vos commandes et leur statut en temps réel (En attente, Confirmée, En préparation, Prête, Complétée, Annulée).',
    keywords: ['suivi', 'commande', 'statut', 'historique', 'profil'],
  },
  {
    category: 'client',
    question: 'Comment voir mes ordonnances et leur statut ?',
    answer: 'Dans "Mon profil" > "Mes ordonnances", vous retrouvez toutes les ordonnances uploadées avec leur statut : En attente, Approuvée ou Refusée.',
    keywords: ['ordonnance', 'statut', 'approuvée', 'refusée', 'profil'],
  },
  {
    category: 'client',
    question: 'Comment gérer mes adresses de livraison ?',
    answer: 'Dans "Mon profil" > "Adresses de livraison", vous pouvez ajouter, modifier ou supprimer vos adresses. L\'adresse par défaut sera utilisée lors du checkout.',
    keywords: ['adresse', 'livraison', 'profil', 'gestion'],
  },
  {
    category: 'client',
    question: 'Comment gérer mes modes de paiement ?',
    answer: 'Dans "Mon profil" > "Modes de paiement", enregistrez vos cartes bancaires, compte PayPal ou numéro Mobile Money pour un checkout plus rapide.',
    keywords: ['paiement', 'carte', 'paypal', 'mobile money', 'profil'],
  },
  {
    category: 'client',
    question: 'Comment enregistrer ma pharmacie ?',
    answer: 'Cliquez sur "Inscrivez votre pharmacie" depuis l\'accueil. Remplissez le formulaire avec le nom, adresse (avec géolocalisation automatique), téléphone, email, WhatsApp, horaires d\'ouverture et photo.',
    keywords: ['pharmacie', 'inscription', 'enregistrer', 'propriétaire'],
  },

  // PHARMACIENS
  {
    category: 'pharmacist',
    question: 'Comment accéder au panneau d\'administration de ma pharmacie ?',
    answer: 'Si vous êtes propriétaire ou staff d\'une pharmacie, un menu "Administration" apparaît dans votre profil. Cliquez dessus pour accéder au dashboard.',
    keywords: ['administration', 'panneau', 'pharmacie', 'dashboard', 'accès'],
  },
  {
    category: 'pharmacist',
    question: 'Comment ajouter un médicament à mon catalogue ?',
    answer: 'Dans l\'onglet "Médicaments" du panneau admin, cliquez sur "Ajouter". Renseignez le nom, catégorie, prix, stock, seuil minimum, description, photo, et cochez "Sur ordonnance" si nécessaire.',
    keywords: ['médicament', 'ajouter', 'catalogue', 'stock', 'ordonnance', 'photo'],
  },
  {
    category: 'pharmacist',
    question: 'Comment gérer les stocks ?',
    answer: 'L\'onglet "Stocks" affiche tous les médicaments avec leurs quantités. Vous pouvez mettre à jour les quantités directement. Les alertes de stock faible apparaissent automatiquement.',
    keywords: ['stock', 'quantité', 'alerte', 'seuil', 'inventaire'],
  },
  {
    category: 'pharmacist',
    question: 'Comment gérer les commandes des clients ?',
    answer: 'L\'onglet "Commandes" liste toutes les commandes. Vous pouvez changer le statut (En attente → Confirmée → En préparation → Prête → Complétée). Les pharmaciens peuvent aussi approuver ou refuser les ordonnances attachées.',
    keywords: ['commande', 'statut', 'client', 'validation', 'préparation'],
  },
  {
    category: 'pharmacist',
    question: 'Comment ajouter un membre à mon équipe ?',
    answer: 'Dans l\'onglet "Utilisateurs", cliquez sur "Ajouter un utilisateur". Définissez son nom, email, mot de passe, rôle (pharmacien ou admin) et attribuez-lui des permissions.',
    keywords: ['équipe', 'utilisateur', 'staff', 'ajouter', 'rôle', 'permissions'],
  },
  {
    category: 'pharmacist',
    question: 'Quelles permissions puis-je attribuer ?',
    answer: 'Les permissions disponibles : Gérer les médicaments, Gérer les stocks, Gérer les commandes, Gérer les achats, Voir les statistiques, Gérer les utilisateurs, Gérer les paramètres.',
    keywords: ['permissions', 'droits', 'accès', 'rôle', 'pharmacien', 'admin'],
  },
  {
    category: 'pharmacist',
    question: 'Comment gérer l\'abonnement de ma pharmacie ?',
    answer: 'Dans l\'onglet "Abonnement", vous voyez la date d\'expiration et le statut. Les admins peuvent renouveler l\'abonnement pour 1 mois.',
    keywords: ['abonnement', 'renouveler', 'expiration', 'plan', 'mensuel'],
  },
  {
    category: 'pharmacist',
    question: 'Comment configurer les modes de paiement de ma pharmacie ?',
    answer: 'Dans les paramètres de la pharmacie, activez ou désactivez les modes de paiement : Espèces, Visa, PayPal, Mobile Money. Les clients ne pourront payer que par les modes activés.',
    keywords: ['paiement', 'paramètres', 'visa', 'paypal', 'mobile money', 'configuration'],
  },

  // ADMIN
  {
    category: 'admin',
    question: 'Qu\'est-ce qu\'un administrateur de plateforme ?',
    answer: 'L\'administrateur gère plusieurs pharmacies sur la plateforme. Il peut basculer entre les pharmacies via un sélecteur et accéder à toutes les fonctionnalités de gestion pour chaque pharmacie.',
    keywords: ['admin', 'plateforme', 'multi-pharmacies', 'rôle'],
  },
  {
    category: 'admin',
    question: 'Comment activer/désactiver une pharmacie ?',
    answer: 'Dans l\'onglet "Pharmacies", cliquez sur le bouton "Activer" ou "Désactiver" selon l\'état actuel. Une pharmacie désactivée n\'apparaît plus dans les recherches publiques.',
    keywords: ['pharmacie', 'activer', 'désactiver', 'statut'],
  },
  {
    category: 'admin',
    question: 'Comment gérer les abonnements des pharmacies ?',
    answer: 'L\'onglet "Abonnements" liste toutes les pharmacies avec leur date d\'expiration. Cliquez sur "Gérer" pour modifier la date de fin d\'abonnement.',
    keywords: ['abonnement', 'expiration', 'gestion', 'pharmacie'],
  },
  {
    category: 'admin',
    question: 'Comment modifier le rôle d\'un utilisateur ?',
    answer: 'Dans l\'onglet "Utilisateurs", utilisez le menu déroulant pour changer le rôle d\'un utilisateur : Client, Pharmacien, Admin ou Super Admin.',
    keywords: ['utilisateur', 'rôle', 'modifier', 'changer', 'permissions'],
  },
  {
    category: 'admin',
    question: 'Comment consulter les statistiques ?',
    answer: 'Le tableau de bord affiche les commandes par jour (graphique linéaire), les stocks par catégorie (graphique circulaire) et le top 5 des médicaments par revenu (graphique barres).',
    keywords: ['statistiques', 'graphiques', 'revenu', 'ventes', 'analytique'],
  },

  // SUPER ADMIN
  {
    category: 'superadmin',
    question: 'Qu\'est-ce qu\'un Super Admin ?',
    answer: 'Le Super Admin est le niveau d\'accès le plus élevé. Il gère l\'ensemble de la plateforme : toutes les pharmacies, tous les utilisateurs et tous les abonnements.',
    keywords: ['superadmin', 'super admin', 'plateforme', 'gouvernance', 'accès'],
  },
  {
    category: 'superadmin',
    question: 'Comment activer/désactiver une pharmacie ?',
    answer: 'Dans l\'onglet "Pharmacies", utilisez le bouton "Désactiver" ou "Activer" pour contrôler la visibilité d\'une pharmacie sur la plateforme.',
    keywords: ['pharmacie', 'activer', 'désactiver', 'visibilité'],
  },
  {
    category: 'superadmin',
    question: 'Comment gérer les abonnements ?',
    answer: 'L\'onglet "Abonnements" permet de consulter toutes les pharmacies, leur statut d\'abonnement et la date d\'expiration. Cliquez sur "Gérer" pour modifier la date de fin.',
    keywords: ['abonnement', 'expiration', 'revenue', '50 000'],
  },
  {
    category: 'superadmin',
    question: 'Comment gérer les utilisateurs ?',
    answer: 'Dans l\'onglet "Utilisateurs", vous pouvez activer/désactiver des comptes, changer leur rôle (client/pharmacien/admin), ou supprimer définitivement un utilisateur.',
    keywords: ['utilisateur', 'activer', 'désactiver', 'supprimer', 'rôle'],
  },

  // GÉNÉRAL
  {
    category: 'client',
    question: 'Comment changer le thème (clair/sombre) ?',
    answer: 'Cliquez sur l\'icône de thème dans la barre de navigation pour basculer entre le mode clair et le mode sombre.',
    keywords: ['thème', 'sombre', 'clair', 'mode', 'apparence'],
  },
  {
    category: 'client',
    question: 'Comment se déconnecter ?',
    answer: 'Cliquez sur votre avatar en haut à droite, puis sur "Déconnexion" dans le menu déroulant.',
    keywords: ['déconnexion', 'logout', 'quitter', 'session'],
  },
];

function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = !searchQuery || faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) || faq.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-6">
            <LiaBookSolid size={48} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">Centre d'Aide</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Bienvenue sur le centre d'aide Hadipharma. Trouvez des réponses à toutes vos questions sur nos fonctionnalités.
          </p>

          {/* Search */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans l'aide..."
                className="w-full px-6 py-4 pr-14 rounded-full text-gray-900 dark:text-white dark:bg-slate-800 bg-white border-0 shadow-2xl text-lg focus:outline-none focus:ring-4 focus:ring-white/20"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                < LiaQuestionCircleSolid size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 md:px-16 -mt-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 p-4 md:p-6">
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 md:px-16 py-12">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aucun résultat</h2>
            <p className="text-gray-500 dark:text-gray-400">Essayez une autre recherche ou changez de catégorie.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => toggleExpand(idx)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <LiaQuestionCircleSolid size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base md:text-lg leading-snug">
                          {faq.question}
                        </h3>
                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                          {categories.find(c => c.id === faq.category)?.label}
                        </span>
                      </div>
                    </div>
                    <LiaChevronRightSolid
                      size={20}
                      className={`shrink-0 text-gray-400 transition-transform ${expandedIndex === idx ? 'rotate-90' : ''}`}
                    />
                  </div>
                  {expandedIndex === idx && (
                    <div className="mt-4 pl-14 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact */}
      <section className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700">
        <div className="container mx-auto px-4 md:px-16 py-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
            <LiaHeadsetSolid size={28} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Besoin d'aide supplémentaire ?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            Si vous n'avez pas trouvé la réponse à votre question, contactez-nous directement et nous vous répondrons dans les plus brefs délais.
          </p>
          <a
            href="mailto:support@hadipharma.com"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors"
          >
            <LiaEnvelopeSolid size={18} />
            Contacter le support
          </a>
        </div>
      </section>
    </div>
  );
}

export default HelpPage;
