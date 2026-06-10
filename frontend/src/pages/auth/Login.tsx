import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../features/auth';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn, isLoading, error, clearError } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();

     try {
       await signIn(formData);
       navigate(from, { replace: true });
     } catch {
       // L'erreur est déjà gérée par le hook
     }
   };

  return (
    <div className="min-h-screen w-full flex flex-col font-sans antialiased">
      <div className="flex-1 bg-[#053229] bg-[url('/images/bg1.jpg')] bg-cover bg-blend-soft-light relative overflow-hidden z-10 flex flex-col items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 rounded-full scale-[1.3] z-0"></div>
        <div
          className="absolute inset-0 z-0 opacity-10 bg-center bg-cover"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/1036371/pexels-photo-1036371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}
        />
        <div className="relative z-10 flex flex-col items-center text-center p-8">
          <div className="w-16 h-16 backdrop-blur-2xl rounded-full flex items-center justify-center mb-4 shadow-xl">
             <span className="text-2xl font-bold italic text-yellow-400">H</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Connexion</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 dark:text-white rounded-t-[50px] px-8 pt-16 pb-12 -mt-16 relative z-20 shadow-2xl">
        <div className="max-w-md mx-auto space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-[#FFC107]">
            <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Adresse email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full text-base font-medium text-gray-900 dark:text-white outline-none"
              placeholder="votre.email@gmail.com"
            />
          </div>

          <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-[#FFC107]">
            <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mot de passe</label>
            <div className="flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="grow text-base font-medium text-gray-900 dark:text-white outline-none"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 ml-2 hover:text-gray-600 transition-colors"
              >
                <EyeIcon />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2.5 h-4 w-4 rounded border-gray-300 text-[#053229] focus:ring-[#FFC107]"
              />
              <span className="font-medium">Se souvenir de moi</span>
            </label>
            <a href="#" className="text-gray-900 font-semibold hover:text-[#053229]">Mot de passe oublié ?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-900 text-white py-4.5 rounded-2xl font-extrabold uppercase tracking-widest text-sm hover:bg-[#6b8a6b] transition-all duration-150 transform active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p className="text-center mt-10 text-xs text-gray-500 font-semibold">
            Pas encore de compte ?{' '}
            <Link to="/auth/register" className="text-black font-extrabold cursor-pointer hover:underline">S'INSCRIRE</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
