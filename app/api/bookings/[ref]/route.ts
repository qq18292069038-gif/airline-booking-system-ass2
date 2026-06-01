import { NextResponse } from "next/server";
import { cancelBooking } from "../../../../lib/store";

export async function DELETE(_request: Request, context: { params: Promise<{ ref: string }> }) {
  const { ref } = await context.params;
  const result = await cancelBooking(ref);

  if (!result) {
    return NextResponse.json({ error: "Booking reference not found." }, { status: 404 });
  }

  return NextResponse.json(result);
}
