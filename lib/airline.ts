import { DateTime } from "luxon";

export type Booking = {
  ref: string;
  passengerName: string;
  email: string;
  status: "confirmed" | "cancelled";
  bookedAt: string;
};

export type Schedule = {
  id: string;
  flightNo: string;
  origin: string;
  destination: string;
  aircraft: string;
  capacity: number;
  price: number;
  departureLocal: string;
  arrivalLocal: string;
  departureZone: string;
  arrivalZone: string;
  departureUtc: string;
  arrivalUtc: string;
  bookings: Booking[];
};

export const airports = [
  { code: "NZNE", name: "Dairy Flat" },
  { code: "YSSY", name: "Sydney" },
  { code: "NZRO", name: "Rotorua" },
  { code: "NZGB", name: "Claris, Great Barrier" },
  { code: "NZCI", name: "Tuuta, Chatham Islands" },
  { code: "NZTL", name: "Lake Tekapo" }
];

type Template = {
  flightNo: string;
  origin: string;
  destination: string;
  aircraft: string;
  capacity: number;
  price: number;
  day: number;
  depart: string;
  durationMinutes: number;
  departureZone: string;
  arrivalZone: string;
};

const NZ = "Pacific/Auckland";
const SYDNEY = "Australia/Sydney";
const CHATHAM = "Pacific/Chatham";

const templates: Template[] = [
  { flightNo: "DF101", origin: "NZNE", destination: "YSSY", aircraft: "SyberJet SJ30i", capacity: 6, price: 850, day: 5, depart: "10:30", durationMinutes: 225, departureZone: NZ, arrivalZone: SYDNEY },
  { flightNo: "DF102", origin: "YSSY", destination: "NZNE", aircraft: "SyberJet SJ30i", capacity: 6, price: 850, day: 7, depart: "15:00", durationMinutes: 240, departureZone: SYDNEY, arrivalZone: NZ },
  { flightNo: "DF201", origin: "NZNE", destination: "NZRO", aircraft: "Cirrus SF50", capacity: 4, price: 180, day: 1, depart: "07:00", durationMinutes: 45, departureZone: NZ, arrivalZone: NZ },
  { flightNo: "DF202", origin: "NZRO", destination: "NZNE", aircraft: "Cirrus SF50", capacity: 4, price: 180, day: 1, depart: "08:20", durationMinutes: 50, departureZone: NZ, arrivalZone: NZ },
  { flightNo: "DF203", origin: "NZNE", destination: "NZRO", aircraft: "Cirrus SF50", capacity: 4, price: 180, day: 1, depart: "16:30", durationMinutes: 45, departureZone: NZ, arrivalZone: NZ },
  { flightNo: "DF204", origin: "NZRO", destination: "NZNE", aircraft: "Cirrus SF50", capacity: 4, price: 180, day: 1, depart: "18:00", durationMinutes: 50, departureZone: NZ, arrivalZone: NZ },
  { flightNo: "DF301", origin: "NZNE", destination: "NZGB", aircraft: "Cirrus SF50", capacity: 4, price: 260, day: 1, depart: "09:00", durationMinutes: 35, departureZone: NZ, arrivalZone: NZ },
  { flightNo: "DF302", origin: "NZGB", destination: "NZNE", aircraft: "Cirrus SF50", capacity: 4, price: 260, day: 2, depart: "09:30", durationMinutes: 40, departureZone: NZ, arrivalZone: NZ },
  { flightNo: "DF401", origin: "NZNE", destination: "NZCI", aircraft: "HondaJet Elite", capacity: 5, price: 620, day: 2, depart: "08:00", durationMinutes: 125, departureZone: NZ, arrivalZone: CHATHAM },
  { flightNo: "DF402", origin: "NZCI", destination: "NZNE", aircraft: "HondaJet Elite", capacity: 5, price: 620, day: 3, depart: "10:00", durationMinutes: 135, departureZone: CHATHAM, arrivalZone: NZ },
  { flightNo: "DF501", origin: "NZNE", destination: "NZTL", aircraft: "HondaJet Elite", capacity: 5, price: 520, day: 1, depart: "11:00", durationMinutes: 90, departureZone: NZ, arrivalZone: NZ },
  { flightNo: "DF502", origin: "NZTL", destination: "NZNE", aircraft: "HondaJet Elite", capacity: 5, price: 520, day: 2, depart: "13:00", durationMinutes: 100, departureZone: NZ, arrivalZone: NZ }
];

const weekdayCopies = [2, 3, 4, 5].flatMap((day) => [
  { ...templates[2], day },
  { ...templates[3], day },
  { ...templates[4], day },
  { ...templates[5], day }
]);

const extraGreatBarrier = [
  { ...templates[6], day: 3 },
  { ...templates[6], day: 5 },
  { ...templates[7], day: 4 },
  { ...templates[7], day: 6 }
];

const extraChatham = [
  { ...templates[8], day: 5 },
  { ...templates[9], day: 6 }
];

const weeklyTemplates = [...templates, ...weekdayCopies, ...extraGreatBarrier, ...extraChatham];

export function airportName(code: string) {
  return airports.find((airport) => airport.code === code)?.name ?? code;
}

export function makeBookingRef() {
  return `BK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function generateSchedules(start = "2026-05-25", weeks = 12): Schedule[] {
  const monday = DateTime.fromISO(start, { zone: NZ }).startOf("day");
  const schedules: Schedule[] = [];

  for (let week = 0; week < weeks; week += 1) {
    for (const template of weeklyTemplates) {
      const [hour, minute] = template.depart.split(":").map(Number);
      const departure = monday.plus({ weeks: week, days: template.day - 1 }).setZone(template.departureZone).set({ hour, minute });
      const arrival = departure.plus({ minutes: template.durationMinutes }).setZone(template.arrivalZone);
      const datePart = departure.toFormat("yyyyLLdd-HHmm");

      schedules.push({
        id: `${template.flightNo}-${datePart}`,
        flightNo: template.flightNo,
        origin: template.origin,
        destination: template.destination,
        aircraft: template.aircraft,
        capacity: template.capacity,
        price: template.price,
        departureLocal: departure.toISO({ suppressMilliseconds: true }) ?? "",
        arrivalLocal: arrival.toISO({ suppressMilliseconds: true }) ?? "",
        departureZone: template.departureZone,
        arrivalZone: template.arrivalZone,
        departureUtc: departure.toUTC().toISO() ?? "",
        arrivalUtc: arrival.toUTC().toISO() ?? "",
        bookings: []
      });
    }
  }

  return schedules.sort((a, b) => a.departureUtc.localeCompare(b.departureUtc));
}

export function formatDateTime(value: string) {
  return DateTime.fromISO(value, { setZone: true }).toFormat("ccc dd LLL yyyy, HH:mm ZZZZ");
}
