
import React, { useState } from 'react';
import { auth, signInWithGoogle } from '../services/firebase';
// Fix: Updated Firebase import path to use the scoped package '@firebase/auth'.
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from '@firebase/auth';
import { DatabaseIcon, GoogleIcon } from './icons';
import { Loader } from './Loader';

export const Login: React.FC = () => {
  const [view, setView] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (view === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (view === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else if (view === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
        setIsLoading(false);
        return; // Stop here for reset view
      }
    } catch (err) {
      const authError = err as { code: string };
      switch (authError.code) {
        case 'auth/invalid-email':
          setError('El formato del email no es válido.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('El email o la contraseña son incorrectos.');
          break;
        case 'auth/email-already-in-use':
          setError('Este email ya está registrado. Por favor, inicie sesión.');
          break;
        case 'auth/weak-password':
          setError('La contraseña debe tener al menos 6 caracteres.');
          break;
        case 'auth/missing-email':
          setError('Por favor, introduzca su email.');
          break;
        default:
          setError('Ocurrió un error. Por favor, inténtelo de nuevo.');
          console.error("Authentication error:", authError);
      }
    } finally {
      if (view !== 'reset') setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const authError = err as { code: string };
       switch (authError.code) {
            case 'auth/popup-closed-by-user':
                setError('El proceso de inicio de sesión fue cancelado.');
                break;
            case 'auth/cancelled-popup-request':
                // Do nothing, another popup is already open.
                break;
            default:
                setError('No se pudo iniciar sesión con Google.');
                console.error("Google sign-in error:", authError);
       }
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
      switch(view) {
          case 'login': return 'Iniciar Sesión';
          case 'register': return 'Crear una Cuenta';
          case 'reset': return 'Recuperar Contraseña';
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <DatabaseIcon className="h-10 w-10 text-gray-400" />
          <h1 className="text-4xl font-bold text-gray-100 tracking-tight">
            CurrículoSQL
          </h1>
        </div>
        <p className="text-lg text-gray-400 mb-8">
          Transforme currículos educativos en bases de datos PostgreSQL con el poder de la IA.
        </p>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-white mb-4">{getTitle()}</h2>
          
          {view !== 'reset' && (
            <>
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full mb-4 flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 border border-gray-300"
                    >
                    <GoogleIcon className="w-5 h-5" />
                    {view === 'login' ? 'Iniciar Sesión con Google' : 'Registrarse con Google'}
                </button>

                <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-600 before:mt-0.5 after:flex-1 after:border-t after:border-gray-600 after:mt-0.5">
                    <p className="text-center text-sm text-gray-500 mx-4">o</p>
                </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 text-gray-200"
              />
            </div>
            
            {view !== 'reset' && (
                <div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 text-gray-200"
                />
                </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {successMessage && <p className="text-green-400 text-sm">{successMessage}</p>}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-500 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
            >
              {isLoading ? <Loader /> : (view === 'login' ? 'Iniciar Sesión' : view === 'register' ? 'Crear Cuenta' : 'Enviar Enlace')}
            </button>
          </form>

          <div className="mt-6 flex flex-col space-y-2 text-sm text-gray-500">
            {view === 'login' && (
                <>
                    <p>
                        ¿No tiene una cuenta?
                        <button onClick={() => { setView('register'); setError(null); }} className="font-semibold text-gray-300 hover:text-white underline ml-1">
                            Regístrese aquí
                        </button>
                    </p>
                    <button onClick={() => { setView('reset'); setError(null); setSuccessMessage(null); }} className="text-gray-400 hover:text-white underline">
                        ¿Olvidó su contraseña?
                    </button>
                </>
            )}
            
            {view === 'register' && (
                <p>
                    ¿Ya tiene una cuenta?
                    <button onClick={() => { setView('login'); setError(null); }} className="font-semibold text-gray-300 hover:text-white underline ml-1">
                        Inicie sesión
                    </button>
                </p>
            )}

            {view === 'reset' && (
                <button onClick={() => { setView('login'); setError(null); setSuccessMessage(null); }} className="font-semibold text-gray-300 hover:text-white underline">
                    Volver a Iniciar Sesión
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
