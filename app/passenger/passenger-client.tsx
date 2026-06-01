"use client";

import { useState } from "react";
import { airportName, formatDateTime, Schedule } from "../../lib/airline";

export default function PassengerClient() {
  const [email, setEmail] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [message, setMessage] = useState("");

  async function search(event: React.FormEvent) {
    event.preventDefault();
    setMessage("Searching...");
    const response = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    setSchedules(data.schedules || []);
    setMessage(data.schedules?.length ? "" : "No confirmed bookings found for this email.");
  }

  return (
    <>
      <section className="panel">
        <h1>Passenger bookings</h1>
        <form onSubmit={search}>
          <label>
            Passenger email
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ella.lee@example.com" />
          </label>
          <div className="actions">
            <button type="submit">Find bookings</button>
          </div>
        </form>
        {message && <div className={message.includes("No ") ? "notice error" : "notice"}>{message}</div>}
      </section>

      <section className="cards">
        {schedules.map((schedule) => {
          const booking = schedule.bookings.find((item) => item.email === email.trim().toLowerCase() && item.status === "confirmed");
          return (
            <article className="card" key={schedule.id}>
              <div>
                <strong>
                  {schedule.flightNo}: {airportName(schedule.origin)} to {airportName(schedule.destination)}
                </strong>
                <div className="meta">
                  <span>Ref {booking?.ref}</span>
                  <span>Depart {formatDateTime(schedule.departureLocal)}</span>
                  <span>Arrive {formatDateTime(schedule.arrivalLocal)}</span>
                  <span>${schedule.price}</span>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
