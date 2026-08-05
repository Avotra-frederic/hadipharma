import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { checkEmailAvailability } from '../../features/auth/api/auth';
import { useAuthContext } from '../../features/auth/hooks/useAuthContext';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailTimer = useRef<number | null>(null);

  const { signUp, isLoading, error, clearError } = useAuthContext();
  const navigate = useNavigate();

  const validateEmailFormat = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      clearError();
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: '',
    }));
  };

  useEffect(() => {
    if (emailTimer.current) {
      window.clearTimeout(emailTimer.current);
    }

    if (!formData.email) {
      setEmailAvailable(null);
      setCheckingEmail(false);
      setFieldErrors(prev => ({ ...prev, email: 'L’email est requis.' }));
      return;
    }

    if (!validateEmailFormat(formData.email)) {
      setEmailAvailable(null);
      setCheckingEmail(false);
      setFieldErrors(prev => ({ ...prev, email: 'Entrez une adresse email valide.' }));
      return;
    }

    setFieldErrors(prev => ({ ...prev, email: '' }));
    setCheckingEmail(true);
    setEmailAvailable(null);

    emailTimer.current = window.setTimeout(async () => {
      try {
        const { available } = await checkEmailAvailability(formData.email);
        setEmailAvailable(available);
        setFieldErrors(prev => ({
          ...prev,
          email: available ? '' : 'Cet email est déjà pris.',
        }));
      } catch {
        setFieldErrors(prev => ({
          ...prev,
          email: 'Impossible de vérifier l’email pour l’instant.',
        }));
      } finally {
        setCheckingEmail(false);
      }
    }, 650);

    return () => {
      if (emailTimer.current) {
        window.clearTimeout(emailTimer.current);
      }
    };
  }, [formData.email]);

  const validateFields = () => {
    const errors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!formData.email) {
      errors.email = 'L’email est requis.';
    } else if (!validateEmailFormat(formData.email)) {
      errors.email = 'Entrez une adresse email valide.';
    } else if (emailAvailable === false) {
      errors.email = 'Cet email est déjà pris.';
    }

    if (!formData.password) {
      errors.password = 'Le mot de passe est requis.';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer le mot de passe.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    setFieldErrors({
      email: errors.email || '',
      password: errors.password || '',
      confirmPassword: errors.confirmPassword || '',
    });

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    try {
      await signUp(formData);
      navigate('/', { replace: true });
    } catch {
      // L'erreur est déjà gérée par le hook
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-sans antialiased">
      <div className="flex-1 bg-[#053229] bg-[url('/images/bg1.jpg')] bg-blend-soft-light bg-cover relative overflow-hidden z-10 flex flex-col items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 rounded-full scale-[1.3] z-0"></div>
        <div
          className="absolute inset-0 z-0 opacity-10 bg-center bg-cover"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/1036371/pexels-photo-1036371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}
        />
        <div className="relative z-10 flex flex-col items-center text-center p-8">
          <div className="w-full h-16 backdrop-blur-2xl rounded-full flex items-center justify-center mb-4 px-5 shadow-xl">
            <img src="/logo.png" alt="HadiPharma logo" className="h-9 w-full rounded-full object-cover " />
            
          </div>
          {/* <h1 className="text-xl font-bold text-white tracking-wide">Créer votre compte</h1> */}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 dark:text-white  rounded-t-[50px] px-8 pt-6 pb-6 -mt-10 relative z-20 shadow-2xl">
        <div className="max-w-md mx-auto space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-[#FFC107]">
            <label htmlFor="name" className="block text-xs font-bold text-gray-400 dark:text-white  uppercase tracking-wider mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="name"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full text-base font-medium text-gray-900 dark:text-white  outline-none"
              placeholder="votre nom"
            />
          </div>

          <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-[#FFC107]">
            <label htmlFor="email" className="block text-xs font-bold text-gray-400 dark:text-white  uppercase tracking-wider mb-2">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full text-base font-medium text-gray-900 dark:text-white  outline-none"
              placeholder="votre.email@gmail.com"
            />
            {checkingEmail && !fieldErrors.email && (
              <p className="mt-2 text-xs text-sky-600">Vérification de l’email...</p>
            )}
            {fieldErrors.email && (
              <p className="mt-2 text-xs text-red-600">{fieldErrors.email}</p>
            )}
            {emailAvailable && !fieldErrors.email && (
              <p className="mt-2 text-xs text-green-600">Email disponible !</p>
            )}
          </div>

          <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-[#FFC107]">
            <label htmlFor="password" className="block text-xs font-bold text-gray-400 dark:text-white  uppercase tracking-wider mb-2">
              Mot de passe
            </label>
            <div className="flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="grow text-base font-medium text-gray-900 dark:text-white  outline-none"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 dark:text-white  ml-2 hover:text-gray-600 transition-colors"
              >
                <EyeIcon />
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-2 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-[#FFC107]">
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-400 dark:text-white  uppercase tracking-wider mb-2">
              Confirmer le mot de passe
            </label>
            <div className="flex items-center">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="grow text-base font-medium text-gray-900 dark:text-white  outline-none"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 dark:text-white  ml-2 hover:text-gray-600 transition-colors"
              >
                <EyeIcon />
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-2 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                className="mr-2.5 h-4 w-4 rounded border-gray-300 text-[#053229] focus:ring-[#FFC107]"
              />
              <span className="font-medium">Remember Me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-900 text-white py-4.5 rounded-2xl font-extrabold uppercase tracking-widest text-sm hover:bg-[#6b8a6b] transition-all duration-150 transform active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>

          <p className="text-center mt-3 text-xs text-gray-500 font-semibold">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-black font-extrabold cursor-pointer hover:underline">
              SIGN IN
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;