import {describe, it, expect} from 'vitest';
import {DateTime} from 'luxon';
import {
   easterSunday,
   isHoliday,
   getSummerBreakStart,
   getWinterBreakStart,
   getChristmasBreakStart
} from '../filterStopDetails.ts'; // dostosuj ścieżkę


describe('easterSunday', () => {
   it('calculates correct Easter Sunday for known years', () => {
      expect(easterSunday(2024).toISODate()).toBe('2024-03-31');
      expect(easterSunday(2025).toISODate()).toBe('2025-04-20');
      expect(easterSunday(2026).toISODate()).toBe('2026-04-05');
   });
});

describe('isHoliday', () => {
   it('detects fixed holidays', () => {
      const date = DateTime.local(2025, 1, 1);
      expect(isHoliday(date)).toBe(true);
   });

   it('detects movable holidays', () => {
      const easter = easterSunday(2025);
      expect(isHoliday(easter)).toBe(true);
      expect(isHoliday(easter.plus({days: 1}))).toBe(true);
   });

   it('returns false for normal working day', () => {
      const date = DateTime.local(2025, 1, 2);
      expect(isHoliday(date)).toBe(false);
   });
});

describe('school breaks', () => {
   it('calculates summer break start as Saturday after last Friday of June', () => {
      const start = getSummerBreakStart(2025);
      expect(start.weekday).toBe(6); // sobota
   });

   it('returns correct winter break start', () => {
      expect(getWinterBreakStart(2025).toISODate()).toBe('2025-02-03');
   });

   it('throws for unsupported winter break year', () => {
      expect(() => getWinterBreakStart(2030)).toThrow();
   });

   it('christmas break starts on Monday of week with Dec 24', () => {
      const start = getChristmasBreakStart(2025);
      expect(start.weekday).toBe(1);
   });
});


