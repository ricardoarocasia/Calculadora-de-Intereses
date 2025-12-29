import { AnnualRate, CalculationResult, Summary } from '../types';

// Helper to check if a year is a leap year
const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Get days in a specific year
const getDaysInYear = (year: number): number => {
  return isLeapYear(year) ? 366 : 365;
};

// Parse YYYY-MM-DD string to Date object (noon to avoid timezone issues)
const parseDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};

// Format Date object to DD/MM/YYYY
export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

export const calculateInterests = (
  startDateStr: string,
  endDateStr: string,
  principal: number,
  rates: AnnualRate[]
): { results: CalculationResult[]; summary: Summary } => {
  const results: CalculationResult[] = [];
  
  if (!startDateStr || !endDateStr || !principal) {
    return {
      results: [],
      summary: { totalInterest: 0, totalAmount: 0, totalDays: 0 }
    };
  }

  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);

  // Requirement: Interest starts counting from the day AFTER the payment.
  // We shift start date by +1 day.
  start.setDate(start.getDate() + 1);

  // Requirement: Calculation usually includes the resolution date (end date).
  // We shift end date by +1 day to make it an exclusive upper bound for the loop logic,
  // effectively including the original end date in the day count.
  end.setDate(end.getDate() + 1);

  // Validation: Start must be before end (after adjustments)
  if (start >= end) {
    return {
        results: [],
        summary: { totalInterest: 0, totalAmount: 0, totalDays: 0 }
    };
  }

  let currentLoopDate = new Date(start);

  while (currentLoopDate < end) {
    const year = currentLoopDate.getFullYear();
    // Determine the boundary for the current year: Jan 1st of the next year.
    const nextYearStart = new Date(year + 1, 0, 1, 12, 0, 0);
    
    // The segment ends at the earlier of: the calculation end date OR the start of next year
    let loopEndDate = new Date(Math.min(end.getTime(), nextYearStart.getTime()));
    
    // Calculate days: subtraction of dates (standard 24h periods)
    // loopEndDate is exclusive boundary, currentLoopDate is inclusive start.
    // This correctly counts the days in the interval [current, loopEnd).
    const diffTime = loopEndDate.getTime() - currentLoopDate.getTime();
    const days = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (days > 0) {
      // Find rate
      const rateObj = rates.find(r => r.year === year);
      const rate = rateObj ? rateObj.rate : 0; // Default to 0 if not found
      
      const daysInYear = getDaysInYear(year);
      
      // Interest = Principal * (Rate/100) * (Days / DaysInYear)
      const interest = (principal * (rate / 100) * days) / daysInYear;

      // Determine display end date
      // loopEndDate is the exclusive upper bound. The inclusive end date for display is the previous day.
      const inclusiveSegmentEnd = new Date(loopEndDate);
      inclusiveSegmentEnd.setDate(inclusiveSegmentEnd.getDate() - 1);
      const displayEndDateStr = inclusiveSegmentEnd.toISOString().split('T')[0];

      results.push({
        year,
        startDate: currentLoopDate.toISOString().split('T')[0],
        endDate: displayEndDateStr,
        days,
        daysInYear,
        rate,
        principal,
        interest
      });
    }

    // Advance loop
    currentLoopDate = loopEndDate;
  }

  const totalInterest = results.reduce((acc, curr) => acc + curr.interest, 0);
  const totalDays = results.reduce((acc, curr) => acc + curr.days, 0);

  return {
    results,
    summary: {
      totalInterest,
      totalAmount: principal + totalInterest,
      totalDays
    }
  };
};