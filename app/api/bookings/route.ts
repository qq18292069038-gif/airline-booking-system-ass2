import { NextRequest, NextResponse } from "next/server";
import { getPassengerBookings, getScheduleByBooking, makeBooking } from "../../../lib/store";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const email = params.get("email");
  const ref = params.get("ref");

  if (ref) {
    const schedule = await getScheduleByBooking(ref);
    const booking = schedule?.bookings.find((item) => item.ref === ref);
    return NextResponse.json({ schedule, booking });
  }

  if (!email) {
    return NextResponse.json({ error: "email or ref is required." }, { status: 400 });
  }

  const schedules = await getPassengerBookings(email);
  return NextResponse.json({ schedules });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const scheduleId = String(body.scheduleId || "");
  const passengerName = String(body.passengerName || "");
  const email = String(body.email || "");

  if (!scheduleId || !passengerName.trim() || !email.trim()) {
    return NextResponse.json({ error: "Flight, passenger name and email are required." }, { status: 400 });
  }

  try {
    const result = await makeBooking(scheduleId, passengerName, email);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Booking failed." }, { status: 400 });
  }
}
