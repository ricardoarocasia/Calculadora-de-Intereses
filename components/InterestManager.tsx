import React, { useState } from 'react';
import { AnnualRate } from '../types';
import { Plus, AlertCircle, Edit2 } from 'lucide-react';

interface InterestManagerProps {
  rates: AnnualRate[];
  setRates: (rates: AnnualRate[]) => void;
}

export const InterestManager: React.FC<InterestManagerProps> = ({ rates, setRates }) => {
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newRate, setNewRate] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Sort rates descending for display
  const sortedRates = [...rates].sort((a, b) => b.year - a.year);

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const rateValue = parseFloat(newRate);
    if (isNaN(rateValue) || rateValue < 0) {
      setError('Por favor, introduce un tipo de interés válido.');
      return;
    }

    // Check if updating existing
    const existingIndex = rates.findIndex(r => r.year === newYear);
    let updatedRates = [...rates];

    if (existingIndex !== -1) {
      // Update existing
      updatedRates[existingIndex] = { year: newYear, rate: rateValue };
      // Sort to keep order consistent
      updatedRates.sort((a, b) => b.year - a.year);
    } else {
      // Add new
      updatedRates.push({ year: newYear, rate: rateValue });
      updatedRates.sort((a, b) => b.year - a.year);

      // Limit to 5 recent years logic
      if (updatedRates.length > 5) {
        updatedRates.pop();
      }
    }

    setRates(updatedRates);
    setNewRate('');
    
    // If we updated an existing year, we might want to keep the year in the input 
    // or clear it. If adding new, usually increment.
    // Let's increment if it was a new addition, otherwise leave it (or maybe clear input rate only).
    if (existingIndex === -1) {
       setNewYear(newYear + 1);
    }
  };

  const handleEdit = (rate: AnnualRate) => {
    setNewYear(rate.year);
    setNewRate(rate.rate.toString());
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <SettingsIcon /> Configuración de Intereses
        </h2>
        
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          <p>
            Aquí puede gestionar los intereses de demora. 
            Introduzca un año y un tipo de interés. Si el año ya existe, se actualizará el valor.
            El sistema mantiene automáticamente los 5 años más recientes.
          </p>
        </div>

        {/* Form to add new */}
        <form onSubmit={handleAddOrUpdate} className="flex flex-wrap gap-4 items-end mb-8 border-b pb-8 border-gray-200">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Año</label>
            <input
              type="number"
              min="2000"
              max="2100"
              value={newYear}
              onChange={(e) => setNewYear(parseInt(e.target.value))}
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none w-32"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Interés (%)</label>
            <input
              type="number"
              step="0.0001"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              placeholder="Ej: 3.7500"
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none w-40"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Guardar
          </button>
        </form>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Año
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Interés (%)
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRates.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">
                    No hay intereses registrados.
                  </td>
                </tr>
              ) : (
                sortedRates.map((item) => (
                  <tr key={item.year} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.rate.toFixed(4)} %
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                        title="Editar este registro"
                      >
                        <Edit2 size={16} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings-2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
);