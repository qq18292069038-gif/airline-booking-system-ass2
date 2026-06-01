import Link from "next/link";
import { airportName, formatDateTime } from "../../../lib/airline";
import { getScheduleByBooking } from "../../../lib/store";

export default async function InvoicePage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const schedule = await getScheduleByBooking(ref);
  const booking = schedule?.bookings.find((item) => item.ref === ref);

  if (!schedule || !booking) {
    return (
      <section className="panel">
        <h1>Booking not found</h1>
        <p>No booking was found for reference {ref}.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h1>Invoice</h1>
      <div className="notice">Booking reference: {booking.ref}</div>
      <table>
        <tbody>
          <tr>
            <th>Passenger</th>
            <td>{booking.passengerName}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{booking.email}</td>
          </tr>
          <tr>
            <th>Flight</th>
            <td>
              {schedule.flightNo}, {airportName(schedule.origin)} to {airportName(schedule.destination)}
            </td>
          </tr>
          <tr>
            <th>Aircraft</th>
            <td>{schedule.aircraft}</td>
          </tr>
          <tr>
            <th>Departure</th>
            <td>{formatDateTime(schedule.departureLocal)}</td>
          </tr>
          <tr>
            <th>Arrival</th>
            <td>{formatDateTime(schedule.arrivalLocal)}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td>{booking.status}</td>
          </tr>
          <tr>
            <th>Total</th>
            <td className="price">${schedule.price}</td>
          </tr>
        </tbody>
      </table>
      <div className="actions">
        <Link className="button" href="/search">
          Search more flights
        </Link>
      </div>
    </section>
  );
}
