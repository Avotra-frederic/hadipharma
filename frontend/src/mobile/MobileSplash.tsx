import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const MobileSplash: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/mobile/home', { replace: true });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.2),transparent_60%),linear-gradient(135deg,#f8fafc,#ecfdf5)] px-6 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="w-full max-w-sm rounded-4xl border border-emerald-100 bg-white/90 p-8 text-center shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/40">
          <img src="/logo.png" alt="HadiPharma logo" className="h-16 w-16 rounded-full object-cover" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">HadiPharma</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Votre pharmacie en ligne, pensée pour mobile.</p>
        <div className="mt-6 flex justify-center gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:0.15s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:0.3s]" />
        </div>
      </div>
    </div>
  );
};
