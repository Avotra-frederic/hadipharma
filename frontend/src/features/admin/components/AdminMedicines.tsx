import React, { useState, useEffect } from 'react';
import { usePharmacyAdmin } from '../hooks/usePharmacyAdmin';
import { getMedications, createMedication, updateMedication, deleteMedication } from '../api/admin';
import { MedicineForm } from './MedicineForm';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useToast } from '../../../features/ui/toast';
import type { IMedication } from '../types';

interface MedicinesProps {
  onNavigate?: (section: string) => void;
}

export const AdminMedicines: React.FC<MedicinesProps> = ({ onNavigate }) => {
  const { pharmacy } = usePharmacyAdmin();
  const [medicines, setMedicines] = useState<IMedication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<IMedication | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<IMedication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  // Load medicines
  useEffect(() => {
    if (!pharmacy?._id) return;
    loadMedicines();
  }, [pharmacy?._id]);

  const loadMedicines = async () => {
    if (!pharmacy?._id) return;
    try {
      setLoading(true);
      const data = await getMedications(pharmacy._id as string);
      setMedicines(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingMedicine(null);
    setShowForm(true);
  };

  const handleEditClick = (medicine: IMedication) => {
    setEditingMedicine(medicine);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: Partial<IMedication>, photo?: File) => {
    if (!pharmacy?._id) return;

    try {
      if (editingMedicine?._id) {
        // Update
        await updateMedication(pharmacy._id as string, editingMedicine._id, formData, photo);
        setSuccessMessage('Médicament mis à jour avec succès');
      } else {
        // Create
        await createMedication(pharmacy._id as string, formData, photo);
        setSuccessMessage('Médicament ajouté avec succès');
      }
      setShowForm(false);
      setEditingMedicine(null);
      await loadMedicines();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDeleteClick = (medicine: IMedication) => {
    if (!pharmacy?._id) return;
    setDeleteCandidate(medicine);
    setConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    if (!pharmacy?._id || !deleteCandidate) return;

    try {
      await deleteMedication(pharmacy._id as string, deleteCandidate._id);
      showToast('Médicament supprimé avec succès', 'success');
      setSuccessMessage('Médicament supprimé avec succès');
      await loadMedicines();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(message);
      showToast(message, 'error');
    } finally {
      setDeleteCandidate(null);
      setConfirmationOpen(false);
    }
  };

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && medicines.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Médicaments</h1>
          <p className="text-gray-600 mt-2">{pharmacy?.name}</p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          + Ajouter Médicament
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          {successMessage}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div
            className="absolute inset-0"
            onClick={() => {
              setShowForm(false);
              setEditingMedicine(null);
            }}
          />
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingMedicine ? 'Modifier Médicament' : 'Ajouter Médicament'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {editingMedicine
                    ? 'Mettez à jour les informations du médicament.'
                    : 'Remplissez les détails du nouveau médicament.'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => {
                  setShowForm(false);
                  setEditingMedicine(null);
                }}
                className="rounded-full border border-slate-200 bg-white p-2 text-gray-500 transition hover:border-slate-300 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <MedicineForm
                initialData={editingMedicine || undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingMedicine(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom ou catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Medicines List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.map((medicine) => (
          <div key={medicine._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
            {/* Medicine Image */}
            {medicine.photo && (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${medicine.photo}`}
                alt={medicine.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{medicine.name}</h3>
                  <p className="text-sm text-gray-600">{medicine.category}</p>
                </div>
                {medicine.requiresPrescription && (
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                    Rx
                  </span>
                )}
              </div>
              
              {medicine.description && (
                <p className="text-sm text-gray-600 mb-3">{medicine.description}</p>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-blue-600">
                  {medicine.price.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}
                </span>
                {!medicine.active && (
                  <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                    Inactif
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(medicine)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded font-medium transition"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteClick(medicine)}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded font-medium transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMedicines.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Aucun médicament trouvé</p>
          <button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            + Ajouter le premier médicament
          </button>
        </div>
      )}

      <ConfirmModal
        open={confirmationOpen}
        title="Supprimer le médicament"
        message={`Voulez-vous vraiment supprimer ${deleteCandidate?.name || 'ce médicament'} ?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmationOpen(false);
          setDeleteCandidate(null);
        }}
      />
    </div>
  );
};

export default AdminMedicines;
