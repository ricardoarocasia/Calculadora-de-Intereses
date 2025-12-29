import React from 'react';
import { View } from '../types';
import { Calculator, Settings } from 'lucide-react';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  return (
    <nav className="bg-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl mr-8">Calculadora Demora</span>
            <div className="flex items-baseline space-x-4">
              <button
                onClick={() => setView(View.HOME)}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  currentView === View.HOME
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Calculator size={18} />
                Inicio
              </button>
              <button
                onClick={() => setView(View.SETTINGS)}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  currentView === View.SETTINGS
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Settings size={18} />
                Intereses
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};