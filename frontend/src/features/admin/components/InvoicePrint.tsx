import React from 'react';
import type { IOrder } from '../types';

interface InvoicePrintProps {
  order: IOrder;
  pharmacy: {
    name: string;
    address: string;
    phone: string;
  };
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ order, pharmacy }) => {
  const total = order.medications.reduce((sum, med) => sum + (med.price * med.quantity), 0);
  const today = new Date().toLocaleDateString('fr-DZ');

  React.useEffect(() => {
    // Auto print when component mounts
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="hidden print:block p-8 bg-white">
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .invoice-container { width: 100%; }
        }
      `}</style>
      
      <div className="invoice-container max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">{pharmacy.name}</h1>
          <p className="text-gray-600">{pharmacy.address}</p>
          <p className="text-gray-600">Tél: {pharmacy.phone}</p>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">FACTURE</h3>
            <p className="text-sm text-gray-600">N°: {order._id?.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-gray-600">Date: {today}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-gray-900 mb-2">CLIENT</h3>
            <p className="text-sm text-gray-600">{order.userName || 'N/A'}</p>
            {order.userPhone && <p className="text-sm text-gray-600">{order.userPhone}</p>}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-t-2">
              <th className="text-left py-2 text-gray-900 font-bold">Description</th>
              <th className="text-center py-2 text-gray-900 font-bold">Quantité</th>
              <th className="text-right py-2 text-gray-900 font-bold">P. Unitaire</th>
              <th className="text-right py-2 text-gray-900 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.medications.map((med, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-3 text-gray-900">{med.medicationName}</td>
                <td className="text-center py-3 text-gray-900">{med.quantity}</td>
                <td className="text-right py-3 text-gray-900">
                  {med.price.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}
                </td>
                <td className="text-right py-3 text-gray-900">
                  {(med.price * med.quantity).toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-t-2 border-b-2">
              <span className="font-bold text-gray-900">TOTAL</span>
              <span className="font-bold text-gray-900 text-lg">
                {total.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 pt-8 border-t">
          <p>Merci pour votre achat!</p>
          <p>Conservez cette facture pour vos dossiers</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;
