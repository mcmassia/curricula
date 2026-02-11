

import React, { useState, useRef, useEffect } from 'react';
// Fix: Updated Firebase import path to use the scoped package '@firebase/auth'.
import type { User } from '@firebase/auth';
import { DatabaseIcon } from './icons';
import { signOut } from '../services/firebase';

interface HeaderProps {
    user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-gray-950 border-b border-gray-800 sticky top-0 z-20 h-16 flex-shrink-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
             <DatabaseIcon className="h-7 w-7 text-gray-400" />
            <h1 className="text-xl font-bold text-gray-100 tracking-tight">
              CurrículoSQL
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
                >
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'U')}&background=random&color=fff`} 
                    alt="User avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-30">
                    <div className="p-3 border-b border-gray-700">
                        <p className="text-sm font-medium text-gray-200 truncate">{user.displayName || 'Usuario'}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                        <button 
                        onClick={() => { signOut(); setMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
                        >
                        Cerrar Sesión
                        </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};