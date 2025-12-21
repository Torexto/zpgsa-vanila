import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { filterBusForDay } from '../filterStopDetails.ts';
import type { StopDetailsBus } from '../types.ts';

const defaultBus: StopDetailsBus = {
   time: '12:00',
   operating_days: 'mon_fri',
   school_restriction: 'normal',
   line: '1',
   destination: 'Test'
};

const bus = (overrides: Partial<StopDetailsBus> = {}): StopDetailsBus => ({
   ...defaultBus,
   ...overrides
});

describe('filterBusForDay', () => {
   it('filters out past buses when today=true', () => {
      const now = DateTime.local(2025, 3, 10, 12, 0);

      const buses = [
         bus({ time: '11:00' }),
         bus({ time: '12:30' })
      ];

      const result = filterBusForDay(now, buses, true);

      expect(result).toHaveLength(1);
      expect(result[0].time).toBe('12:30');
   });

   it('keeps all buses for future day', () => {
      const date = DateTime.local(2025, 3, 11);

      const buses = [
         bus({ time: '08:00' }),
         bus({ time: '06:00' })
      ];

      const result = filterBusForDay(date, buses);

      expect(result).toHaveLength(2);
   });
});

it('matches operating days correctly', () => {
   const sunday = DateTime.local(2025, 3, 9); // niedziela

   const buses = [
      bus({ operating_days: 'sunday' }),
      bus({ operating_days: 'mon_fri' })
   ];

   const result = filterBusForDay(sunday, buses);

   expect(result).toHaveLength(1);
   expect(result[0].operating_days).toBe('sunday');
});

it('respects school_only restriction', () => {
   const schoolDay = DateTime.local(2025, 3, 12); // zwykły dzień

   const buses = [
      bus({ school_restriction: 'school_only' }),
      bus({ school_restriction: 'free_day_only' })
   ];

   const result = filterBusForDay(schoolDay, buses);

   expect(result).toHaveLength(1);
   expect(result[0].school_restriction).toBe('school_only');
});
