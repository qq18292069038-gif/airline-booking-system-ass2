import { NextRequest, NextResponse } from "next/server";
import { searchSchedules } from "../../../lib/store";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const orig = params.get("orig");
  const dest = params.get("dest");
  const date1 = params.get("date1");
  const date2 = params.get("date2");

  if (!orig || !dest || !date1 || !date2) {
    return NextResponse.json({ error: "orig, dest, date1 and date2 are required." }, { status: 400 });
  }

  const schedules = await searchSchedules(orig, dest, date1, date2);
  return NextResponse.json({ schedules });
}
