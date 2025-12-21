import {expect, test} from "vitest";
import {easterSunday, getChristmasBrakeStart} from "./filterStopDetails.ts";

test("easter", () => {
   const year = 2025

   let date = getChristmasBrakeStart(year)
   let {day, month} = date;
   expect(day).toBe(22);
   expect(month).toBe(12);
});