import {DateTime} from 'luxon';
import type {StopDetailsBus} from './types';

interface DayMonth {
   day: number;
   month: number;
}

const daysFreeFromSchool: DayMonth[] = [
   {day: 26, month: 12}, {day: 27, month: 12}, {day: 30, month: 12},
   {day: 31, month: 12}, {day: 2, month: 1}, {day: 3, month: 1}, {day: 3, month: 2},
   {day: 4, month: 2}, {day: 5, month: 2}, {day: 6, month: 2}, {day: 7, month: 2},
   {day: 10, month: 2}, {day: 11, month: 2}, {day: 12, month: 2}, {day: 13, month: 2},
   {day: 14, month: 2}, {day: 22, month: 4},
   {day: 30, month: 6}, {day: 1, month: 7}, {day: 2, month: 7}, {day: 3, month: 7}, {day: 4, month: 7},
   {day: 7, month: 7}, {day: 8, month: 7}, {day: 9, month: 7}, {day: 10, month: 7}, {day: 11, month: 7},
   {day: 14, month: 7}, {day: 15, month: 7}, {day: 16, month: 7}, {day: 17, month: 7}, {day: 18, month: 7},
   {day: 21, month: 7}, {day: 22, month: 7}, {day: 23, month: 7}, {day: 24, month: 7}, {day: 25, month: 7},
   {day: 28, month: 7}, {day: 29, month: 7}, {day: 30, month: 7}, {day: 31, month: 7}, {day: 1, month: 8},
   {day: 4, month: 8}, {day: 5, month: 8}, {day: 6, month: 8}, {day: 7, month: 8}, {day: 8, month: 8},
   {day: 11, month: 8}, {day: 12, month: 8}, {day: 13, month: 8}, {day: 14, month: 8},
   {day: 18, month: 8}, {day: 19, month: 8}, {day: 20, month: 8}, {day: 21, month: 8}, {day: 22, month: 8},
   {day: 25, month: 8}, {day: 26, month: 8}, {day: 27, month: 8}, {day: 28, month: 8}, {day: 29, month: 8},
];

const holidays: DayMonth[] = [
   {day: 6, month: 1}, {day: 19, month: 6}, {day: 1, month: 11}, {day: 1, month: 1}, {day: 6, month: 1}, {
      day: 23,
      month: 12
   },
   {day: 24, month: 12}, {day: 25, month: 12}, {day: 17, month: 4}, {day: 18, month: 4}, {day: 19, month: 4}, {
      day: 20,
      month: 4
   },
   {day: 21, month: 4}, {day: 1, month: 5}, {day: 3, month: 5}, {day: 15, month: 8}
];

const isHoliday = (date: DateTime): boolean => {
   return holidays.some(
      d => d.day === date.day && d.month === date.month
   );
};

const isFreeFromSchool = (date: DateTime): boolean => {
   return daysFreeFromSchool.some(
      d => d.day === date.day && d.month === date.month
   );
};

const matchesOperatingDay = (
   bus: StopDetailsBus,
   date: DateTime
): boolean => {
   if (isHoliday(date)) {
      return bus.operating_days === 'sunday';
   }

   if (date.weekday === 7) {
      return bus.operating_days === 'sunday';
   }

   if (date.weekday === 6) {
      return bus.operating_days === 'saturday';
   }

   return bus.operating_days === 'mon_fri';
};

const matchesSchoolRestriction = (
   bus: StopDetailsBus,
   date: DateTime
): boolean => {
   const schoolDay = !isFreeFromSchool(date);

   if (bus.school_restriction === 'school_only') return schoolDay;
   if (bus.school_restriction === 'free_day_only') return !schoolDay;

   return true;
};

const busDateTime = (
   bus: StopDetailsBus,
   date: DateTime
): DateTime | null => {
   const t = DateTime.fromFormat(bus.time.trim(), 'HH:mm', {
      zone: date.zone
   });

   if (!t.isValid) return null;

   return t.set({
      year: date.year,
      month: date.month,
      day: date.day
   });
};

export default function filterStopDetails(
   buses: StopDetailsBus[],
   limit = 15
): StopDetailsBus[] {
   const now = DateTime.now();

   const today = buses
      .filter(bus => matchesOperatingDay(bus, now))
      .filter(bus => matchesSchoolRestriction(bus, now))
      .map(bus => ({bus, dt: busDateTime(bus, now)}))
      .filter(e => e.dt && e.dt >= now)
      .sort((a, b) => a.dt!.toMillis() - b.dt!.toMillis())
      .map(e => e.bus);

   if (today.length >= limit) {
      return today.slice(0, limit);
   }

   const tomorrowDate = now.plus({days: 1});

   const tomorrow = buses
      .filter(bus => matchesOperatingDay(bus, tomorrowDate))
      .filter(bus => matchesSchoolRestriction(bus, tomorrowDate))
      .map(bus => ({bus, dt: busDateTime(bus, tomorrowDate)}))
      .filter(e => e.dt)
      .sort((a, b) => a.dt!.toMillis() - b.dt!.toMillis())
      .map(e => e.bus);

   return [...today, ...tomorrow].slice(0, limit);
}