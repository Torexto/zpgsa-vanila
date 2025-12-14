import {DateTime} from 'luxon';
import type {StopDetailsBus} from './types';

interface DateRange {
   from: DateTime;
   to: DateTime;
}

const easterSunday = (year: number): DateTime => {
   const a = year % 19;
   const b = Math.floor(year / 100);
   const c = year % 100;
   const d = Math.floor(b / 4);
   const e = b % 4;
   const f = Math.floor((b + 8) / 25);
   const g = Math.floor((b - f + 1) / 3);
   const h = (19 * a + b - d - g + 15) % 30;
   const i = Math.floor(c / 4);
   const k = c % 4;
   const l = (32 + 2 * e + 2 * i - h - k) % 7;
   const m = Math.floor((a + 11 * h + 22 * l) / 451);
   const month = Math.floor((h + l - 7 * m + 114) / 31);
   const day = ((h + l - 7 * m + 114) % 31) + 1;

   return DateTime.local(year, month, day);
};

const movableHolidays = (year: number): DateTime[] => {
   const easter = easterSunday(year);

   return [
      easter.minus({days: 2}), // Wielki Piątek
      easter.minus({days: 1}),
      easter,                  // Niedziela Wielkanocna
      easter.plus({days: 1}),  // Poniedziałek Wielkanocny
      easter.plus({days: 49}), // Zielone Świątki
      easter.plus({days: 60})  // Boże Ciało
   ];
};

const fixedHolidays = (year: number): DateTime[] => [
   DateTime.local(year, 1, 1),
   DateTime.local(year, 1, 6),
   DateTime.local(year, 5, 1),
   DateTime.local(year, 5, 3),
   DateTime.local(year, 8, 15),
   DateTime.local(year, 11, 1),
   DateTime.local(year, 12, 25),
   DateTime.local(year, 12, 26)
];

const holidaysForYear = (year: number): DateTime[] => [
   ...fixedHolidays(year),
   ...movableHolidays(year)
];

const holidaysCache: Record<number, DateTime[]> = {};

const holidaysForYearCached = (year: number) => {
   if (!holidaysCache[year]) {
      holidaysCache[year] = holidaysForYear(year);
   }
   return holidaysCache[year];
}

const isHoliday = (date: DateTime): boolean =>
   holidaysForYearCached(date.year).some(h => h.hasSame(date, 'day'));


const getSummerBrakeStart = (year: number): DateTime => {
   let date = DateTime.local(year, 6, 30);
   while (date.weekday !== 5) {
      date = date.minus({days: 1});
   }
   return date.plus({days: 1});
};

const getWinterBrakeStart = (year: number): DateTime => {
   if (year === 2025) {
      return DateTime.local(year, 2, 3);
   }

   if (year === 2026) {
      return DateTime.local(year, 2, 2);
   }

   if (year === 2027) {
      return DateTime.local(year, 1, 18);
   }

   throw new Error('Brak daty dla roku ' + year);
}

const getChristmasBrakeStart = (year: number): DateTime => {
   let date = DateTime.local(year, 12, 24);
   while (date.weekday !== 1) {
      date = date.minus({days: 1});
   }
   return date;
};

const SchoolBreaks = (year: number): DateRange[] => {
   const summerBrakeStart = getSummerBrakeStart(year);

   const summerBrake = {
      from: summerBrakeStart,
      to: DateTime.local(year, 8, 31)
   };

   const winterBrakeStart = getWinterBrakeStart(year);

   const winterBrake = {
      from: winterBrakeStart,
      to: winterBrakeStart.plus({days: 13})
   }

   const christmasBrakeStart = getChristmasBrakeStart(year);

   const christmasBrake = {
      from: christmasBrakeStart,
      to: DateTime.local(year, 12, 31)
   }

   return [
      summerBrake,
      winterBrake,
      christmasBrake
   ];
};

const isFreeFromSchool = (date: DateTime): boolean => {
   const isSchoolBrake = SchoolBreaks(date.year).some(r =>
      date >= r.from.startOf('day') &&
      date <= r.to.endOf('day')
   );

   const localEasterSunday = easterSunday(date.year);

   const daysFreeFromSchool: DateTime[] = [
      localEasterSunday.minus({days: 3}),
      localEasterSunday.plus({days: 2}),
   ];

   const dayFreeFromSchool = daysFreeFromSchool.some(d => {
      return date.day === d.day && date.month === d.month;
   });

   return isSchoolBrake || dayFreeFromSchool;
};

const matchesOperatingDay = (
   bus: StopDetailsBus,
   date: DateTime,
   holiday: boolean
): boolean => {
   if (holiday) {
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
      .filter(bus => matchesOperatingDay(bus, now, isHoliday(now)))
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
      .filter(bus => matchesOperatingDay(bus, tomorrowDate, isHoliday(tomorrowDate)))
      .filter(bus => matchesSchoolRestriction(bus, tomorrowDate))
      .map(bus => ({bus, dt: busDateTime(bus, tomorrowDate)}))
      .filter(e => e.dt)
      .sort((a, b) => a.dt!.toMillis() - b.dt!.toMillis())
      .map(e => e.bus);

   return [...today, ...tomorrow].slice(0, limit);
}