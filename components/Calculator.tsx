import React, { useState, useEffect } from 'react';
import { AnnualRate, CalculationResult, Summary } from '../types';
import { calculateInterests, formatDateDisplay } from '../utils/calculator';
import { Calculator as CalcIcon, Calendar, Coins, Euro, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface CalculatorProps {
  rates: AnnualRate[];
}

export const Calculator: React.FC<CalculatorProps> = ({ rates }) => {
  // Initialize state from localStorage if available, otherwise default to empty string
  const [startDate, setStartDate] = useState(() => localStorage.getItem('demora_startDate') || '');
  const [endDate, setEndDate] = useState(() => localStorage.getItem('demora_endDate') || '');
  const [principal, setPrincipal] = useState<string>(() => localStorage.getItem('demora_principal') || '');
  
  const [data, setData] = useState<{ results: CalculationResult[]; summary: Summary } | null>(null);

  // Effect to save inputs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('demora_startDate', startDate);
    localStorage.setItem('demora_endDate', endDate);
    localStorage.setItem('demora_principal', principal);
  }, [startDate, endDate, principal]);

  // Effect to perform calculation
  useEffect(() => {
    const numPrincipal = parseFloat(principal);
    if (startDate && endDate && !isNaN(numPrincipal)) {
      const calculation = calculateInterests(startDate, endDate, numPrincipal, rates);
      setData(calculation);
    } else {
      setData(null);
    }
  }, [startDate, endDate, principal, rates]);

  const handleExportExcel = () => {
    if (!data) return;

    // Build data array for the sheet
    const ws_data = [];

    // Title and Parameters
    ws_data.push(["CÁLCULO DE INTERESES DE DEMORA"]);
    ws_data.push([]);
    ws_data.push(["PARÁMETROS"]);
    ws_data.push(["Fecha de pago del anticipo", formatDateDisplay(startDate)]);
    ws_data.push(["Fecha de la resolución", formatDateDisplay(endDate)]);
    ws_data.push(["Principal a reintegrar", parseFloat(principal) || 0]);
    ws_data.push([]);

    // Table Data
    // Headers
    const years = data.results.map(r => r.year);
    ws_data.push(["DESGLOSE ANUAL"]);
    ws_data.push(["Concepto", ...years]);

    // Rows matching the UI table
    ws_data.push(["Fecha Inicio", ...data.results.map(r => formatDateDisplay(r.startDate))]);
    ws_data.push(["Fecha Final", ...data.results.map(r => formatDateDisplay(r.endDate))]);
    ws_data.push(["Días a aplicar", ...data.results.map(r => r.days)]);
    ws_data.push(["Principal", ...data.results.map(r => r.principal)]);
    ws_data.push(["Tipo de interés (%)", ...data.results.map(r => r.rate)]);
    ws_data.push(["Intereses de cada año", ...data.results.map(r => r.interest)]);

    ws_data.push([]);

    // Summary
    ws_data.push(["RESUMEN DE LIQUIDACIÓN"]);
    ws_data.push(["Suma total intereses", data.summary.totalInterest]);
    ws_data.push(["Total a ingresar", data.summary.totalAmount]);
    ws_data.push(["Total días adeudados", data.summary.totalDays]);

    // Create workbook and sheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Styling helpers (width)
    const wscols = [
      { wch: 25 }, // First column width
      ...years.map(() => ({ wch: 15 })) // Year columns width
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Liquidación");

    // Generate file
    XLSX.writeFile(wb, "calculo_intereses_demora.xlsx");
  };

  // Determine columns for the table (The Years)
  const columns = data ? data.results.map(r => r.year) : [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Parameters Section (Upper) */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <CalcIcon className="text-blue-600" /> Parámetros de Cálculo
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Start Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Fecha de pago del anticipo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 border p-2.5 focus:border-blue-500 focus:ring-blue-500 shadow-sm sm:text-sm"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Fecha de la resolución
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 border p-2.5 focus:border-blue-500 focus:ring-blue-500 shadow-sm sm:text-sm"
              />
            </div>
          </div>

          {/* Principal */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Principal a reintegrar (€)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Euro className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="0.00"
                className="pl-10 block w-full rounded-md border-gray-300 border p-2.5 focus:border-blue-500 focus:ring-blue-500 shadow-sm sm:text-sm font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">* Solo números, formato euros.</p>
          </div>
        </div>
      </div>

      {/* Results Section (Lower) */}
      {data && data.results.length > 0 && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
             <div className="p-6 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
               <h3 className="text-lg font-bold text-gray-800">
                 Desglose Anual de Intereses
               </h3>
               <button
                 onClick={handleExportExcel}
                 className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors shadow-sm"
               >
                 <FileSpreadsheet size={18} />
                 Exportar a Excel
               </button>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-100">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-r bg-gray-200 w-48">
                       Concepto
                     </th>
                     {columns.map(year => (
                       <th key={year} className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-r min-w-[120px]">
                         {year}
                       </th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                    {/* Fecha Inicio */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r bg-gray-50">Fecha Inicio</td>
                      {data.results.map((r, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center border-r">
                          {formatDateDisplay(r.startDate)}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Fecha Final */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r bg-gray-50">Fecha Final</td>
                      {data.results.map((r, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center border-r">
                          {formatDateDisplay(r.endDate)}
                        </td>
                      ))}
                    </tr>

                    {/* Días a aplicar */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r bg-gray-50">Días a aplicar</td>
                      {data.results.map((r, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center border-r">
                          {r.days}
                        </td>
                      ))}
                    </tr>

                    {/* Principal */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r bg-gray-50">Principal</td>
                      {data.results.map((r, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center border-r">
                          {r.principal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </td>
                      ))}
                    </tr>

                    {/* Tipo de Interés */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r bg-gray-50">Tipo de interés (%)</td>
                      {data.results.map((r, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center border-r">
                          {r.rate.toFixed(4)} %
                        </td>
                      ))}
                    </tr>

                    {/* Intereses calc */}
                    <tr className="bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border-r bg-blue-100">Intereses de cada año</td>
                      {data.results.map((r, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-800 text-center border-r">
                          {r.interest.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </td>
                      ))}
                    </tr>
                 </tbody>
               </table>
             </div>
          </div>

          {/* Totals Section (Footer) */}
          <div className="bg-slate-800 text-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Coins className="text-yellow-400" /> Resumen de Liquidación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-700 rounded p-4 border-l-4 border-yellow-500">
                <p className="text-sm text-slate-300 uppercase tracking-wide">Suma total intereses</p>
                <p className="text-2xl font-bold mt-1">
                  {data.summary.totalInterest.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              
              <div className="bg-slate-700 rounded p-4 border-l-4 border-green-500">
                <p className="text-sm text-slate-300 uppercase tracking-wide">Total a ingresar</p>
                <p className="text-2xl font-bold mt-1">
                  {data.summary.totalAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-xs text-slate-400 mt-1">(Principal + Intereses)</p>
              </div>

              <div className="bg-slate-700 rounded p-4 border-l-4 border-blue-500">
                <p className="text-sm text-slate-300 uppercase tracking-wide">Total días adeudados</p>
                <p className="text-2xl font-bold mt-1">
                  {data.summary.totalDays} días
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {(!startDate || !endDate || !principal) && (
        <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Introduce los parámetros arriba para ver el cálculo.</p>
        </div>
      )}
    </div>
  );
};