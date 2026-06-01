import { MongoClient } from "mongodb";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Booking, Schedule, generateSchedules, makeBookingRef } from "./airline";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "airline_booking";

let clientPromise: Promise<MongoClient> | null = null;
const dataFile = path.join(process.cwd(), ".data", "schedules.json");

function mongoClient() {
  if (!uri) return null;
  clientPromise ??= new MongoClient(uri).connect();
  return clientPromise;
}

async function collection() {
  const client = await mongoClient();
  return client?.db(dbName).collection<Schedule>("schedules");
}

async function readLocalSchedules() {
  if (process.env.VERCEL) {
    return generateSchedules();
  }

  try {
    return JSON.parse(await readFile(dataFile, "utf8")) as Schedule[];
  } catch {
    const schedules = generateSchedules();
    await writeLocalSchedules(schedules);
    return schedules;
  }
}

async function writeLocalSchedules(schedules: Schedule[]) {
  if (process.env.VERCEL) {
    return;
  }

  await mkdir(path.dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(schedules, null, 2));
}

export async function seedSchedules() {
  const schedules = generateSchedules();
  const schedulesCollection = await collection();

  if (!schedulesCollection) {
    await writeLocalSchedules(schedules);
    return schedules.length;
  }

  await schedulesCollection.deleteMany({});
  await schedulesCollection.insertMany(schedules);
  return schedules.length;
}

export async function searchSchedules(orig: string, dest: string, date1: string, date2: string) {
  const start = new Date(`${date1}T00:00:00.000Z`).toISOString();
  const end = new Date(`${date2}T23:59:59.999Z`).toISOString();
  const schedulesCollection = await collection();

  if (!schedulesCollection) {
    const schedules = await readLocalSchedules();
    return schedules.filter((s) => s.origin === orig && s.destination === dest && s.departureUtc >= start && s.departureUtc <= end);
  }

  return schedulesCollection
    .find({ origin: orig, destination: dest, departureUtc: { $gte: start, $lte: end } })
    .sort({ departureUtc: 1 })
    .toArray();
}

export async function getScheduleByBooking(ref: string) {
  const schedulesCollection = await collection();

  if (!schedulesCollection) {
    const schedules = await readLocalSchedules();
    return schedules.find((s) => s.bookings.some((b) => b.ref === ref)) ?? null;
  }

  return schedulesCollection.findOne({ "bookings.ref": ref });
}

export async function getPassengerBookings(email: string) {
  const normalized = email.trim().toLowerCase();
  const schedulesCollection = await collection();

  if (!schedulesCollection) {
    const schedules = await readLocalSchedules();
    return schedules.filter((s) => s.bookings.some((b) => b.email === normalized && b.status === "confirmed"));
  }

  return schedulesCollection
    .find({ bookings: { $elemMatch: { email: normalized, status: "confirmed" } } })
    .sort({ departureUtc: 1 })
    .toArray();
}

export async function makeBooking(scheduleId: string, passengerName: string, email: string) {
  const normalized = email.trim().toLowerCase();
  const ref = makeBookingRef();
  const booking: Booking = {
    ref,
    passengerName: passengerName.trim(),
    email: normalized,
    status: "confirmed",
    bookedAt: new Date().toISOString()
  };
  const schedulesCollection = await collection();

  if (!schedulesCollection) {
    const schedules = await readLocalSchedules();
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) throw new Error("Flight not found.");
    if (schedule.bookings.filter((b) => b.status === "confirmed").length >= schedule.capacity) throw new Error("This flight is full.");
    schedule.bookings.push(booking);
    await writeLocalSchedules(schedules);
    return { schedule, booking };
  }

  const schedule = await schedulesCollection.findOne({ id: scheduleId });
  if (!schedule) throw new Error("Flight not found.");
  if (schedule.bookings.filter((b) => b.status === "confirmed").length >= schedule.capacity) throw new Error("This flight is full.");

  await schedulesCollection.updateOne({ id: scheduleId }, { $push: { bookings: booking } });
  const updated = await schedulesCollection.findOne({ id: scheduleId });
  if (!updated) throw new Error("Flight not found after booking.");
  return { schedule: updated, booking };
}

export async function cancelBooking(ref: string) {
  const schedulesCollection = await collection();

  if (!schedulesCollection) {
    const schedules = await readLocalSchedules();
    const schedule = schedules.find((s) => s.bookings.some((b) => b.ref === ref));
    const booking = schedule?.bookings.find((b) => b.ref === ref);
    if (!schedule || !booking) return null;
    booking.status = "cancelled";
    await writeLocalSchedules(schedules);
    return { schedule, booking };
  }

  const schedule = await schedulesCollection.findOne({ "bookings.ref": ref });
  if (!schedule) return null;

  await schedulesCollection.updateOne({ "bookings.ref": ref }, { $set: { "bookings.$.status": "cancelled" } });
  const updated = await schedulesCollection.findOne({ "bookings.ref": ref });
  const booking = updated?.bookings.find((b) => b.ref === ref);
  return updated && booking ? { schedule: updated, booking } : null;
}
