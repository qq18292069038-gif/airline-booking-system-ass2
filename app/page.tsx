import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      <div>
        <h1>Regional jet bookings from Dairy Flat Airport</h1>
        <p>
          Search scheduled services to Sydney, Rotorua, Great Barrier Island, the Chatham Islands, and Lake Tekapo. Book a seat, receive a booking reference, cancel a booking, or view all flights for a passenger.
        </p>
        <div className="actions">
          <Link className="button" href="/search">
            Search flights
          </Link>
          <Link className="button secondary" href="/passenger">
            Find my bookings
          </Link>
        </div>
      </div>
      <div className="panel">
        <h2>Popular routes</h2>
        <p>NZNE to YSSY every Friday. NZNE to NZRO twice each weekday. Infrequent island flights are searchable by date range.</p>
        <p className="small">This project supports real calendar dates, aircraft capacity checks, booking references, invoices, and cancellation.</p>
      </div>
    </section>
  );
}
