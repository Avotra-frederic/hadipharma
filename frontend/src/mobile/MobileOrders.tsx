import React from 'react';
import { LiaClipboardListSolid, LiaCheckCircleSolid, LiaClockSolid } from 'react-icons/lia';

const orders = [
  { id: 'ORD-001', status: 'Validée', date: 'Aujourd\'hui', amount: '12 500 FCFA' },
  { id: 'ORD-002', status: 'En cours', date: 'Hier', amount: '4 200 FCFA' },
];

export const MobileOrders: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <LiaClipboardListSolid size={24} />
          </div>
          <div>
            <h2 className="font-semibold">Mes commandes</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Suivi et validation des achats.</p>
          </div>
        </div>
      </div>

      {orders.map((order) => (
        <div key={order.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{order.id}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{order.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{order.amount}</p>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {order.status === 'Validée' ? <LiaCheckCircleSolid size={14} /> : <LiaClockSolid size={14} />}
                {order.status}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
