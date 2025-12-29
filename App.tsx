import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InterestManager } from './components/InterestManager';
import { Calculator } from './components/Calculator';
import { View, AnnualRate } from './types';

// Default initial rates for demonstration if empty
// Updated to include 2025 and precise 4 decimal rates
const DEFAULT_RATES: AnnualRate[] = [
  { year: 2021, rate: 3.7500 },
  { year: 2022, rate: 3.7500 },
  { year: 2023, rate: 4.0625 },
  { year: 2024, rate: 4.0625 },
  { year: 2025, rate: 4.0625 },
];

function App() {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [rates, setRates] = useState<AnnualRate[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    // Changed key to ensure users get the new 2025 defaults
    const savedRates = localStorage.getItem('demora_rates_v2');
    if (savedRates) {
      try {
        setRates(JSON.parse(savedRates));
      } catch (e) {
        console.error("Error loading rates", e);
        setRates(DEFAULT_RATES);
      }
    } else {
      setRates(DEFAULT_RATES);
    }
  }, []);

  // Save to local storage whenever rates change
  useEffect(() => {
    if (rates.length > 0) {
      localStorage.setItem('demora_rates_v2', JSON.stringify(rates));
    }
  }, [rates]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-grow bg-gray-100">
        {currentView === View.HOME ? (
          <Calculator rates={rates} />
        ) : (
          <InterestManager rates={rates} setRates={setRates} />
        )}
      </main>

      <footer className="bg-slate-800 text-slate-400 py-4 text-center text-sm">
        <p>© {new Date().getFullYear()} Calculadora de Intereses de Demora. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;