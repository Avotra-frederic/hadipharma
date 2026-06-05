import React, { useState } from 'react';
import { useAuthContext } from '../../auth/hooks/useAuthContext';
import { usePharmacyAdmin } from '../hooks/usePharmacyAdmin';
import AdminDashboard from './AdminDashboard';
import AdminMedicines from './AdminMedicines';
import AdminStockManager from './AdminStockManager';
import AdminOrdersManager from './AdminOrdersManager';

export const AdminPanel: React.FC = () => {
  const { user } = useAuthContext();
  const { pharmacy, isPharmacyAdmin, loading } = usePharmacyAdmin();
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Vérification des droits d'accès...</div>
      </div>
    );
  }

  if (!isPharmacyAdmin || !pharmacy) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès Refusé</h1>
          <p className="text-gray-600 mb-6">
            Vous devez être propriétaire d'une pharmacie pour accéder au panel d'administration.
          </p>
          <p className="text-sm text-gray-600">
            Veuillez créer une pharmacie d'abord.
          </p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: '📊 Tableau de Bord', icon: '📊' },
    { id: 'medicines', label: '💊 Médicaments', icon: '💊' },
    { id: 'stock', label: '📦 Stock', icon: '📦' },
    { id: 'orders', label: '📋 Commandes', icon: '📋' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{pharmacy.name}</h2>
          <p className="text-sm text-gray-600 mt-1">{user?.username}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <a
            href="/profile"
            className="text-sm text-gray-600 hover:text-gray-900 block px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            ⚙️ Paramètres
          </a>
          <a
            href="/logout"
            className="text-sm text-red-600 hover:text-red-900 block px-4 py-2 rounded-lg hover:bg-red-50 transition mt-2"
          >
            🚪 Déconnexion
          </a>
        </div>
      </aside>

      {/* Mobile Menu */}
      <div className="md:hidden fixed top-0 right-0 z-50">
        {/* Will be implemented as drawer if needed */}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          {activeSection === 'dashboard' && <AdminDashboard onNavigate={setActiveSection} />}
          {activeSection === 'medicines' && <AdminMedicines onNavigate={setActiveSection} />}
          {activeSection === 'stock' && <AdminStockManager onNavigate={setActiveSection} />}
          {activeSection === 'orders' && <AdminOrdersManager onNavigate={setActiveSection} />}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
