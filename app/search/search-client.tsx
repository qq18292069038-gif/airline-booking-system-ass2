"use client";

import { useState } from "react";
import { airports, airportName, formatDateTime, Schedule } from "../../lib/airline";

export default function SearchClient() {
  const [orig, setOrig] = useState("NZNE");
  const [dest, setDest] = useState("YSSY");
  const [date1, setDate1] = useState("2026-06-01");
  const [date2, setDate2] = useState("2026-06-30");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [message, setMessage] = useState("");
  const [bookingFor, setBookingFor] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const [email, setEmail] = useState("");

  async function search(event: React.FormEvent) {
    event.preventDefault();
    setMessage("Searching...");
    try {
      const response = await fetch(`/api/schedules?orig=${orig}&dest=${dest}&date1=${date1}&date2=${date2}`);
      const data = await response.json();
      if (!response.ok) {
        setSchedules([]);
        setMessage(data.error || "Search failed.");
        return;
      }
      setSchedules(data.schedules || []);
      setMessage(data.schedules?.length ? "" : "No flights found for this route and date range.");
    } catch {
      setSchedules([]);
      setMessage("Search failed. Please check the deployment settings.");
    }
  }

  async function book(scheduleId: string) {
    setMessage("Booking...");
    let data;
    let response;
    try {
      response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, passengerName, email })
      });
      data = await response.json();
    } catch {
      setMessage("Booking failed. Please check the deployment settings.");
      return;
    }

    if (!response.ok) {
      setMessage(data.error || "Booking failed.");
      return;
    }

    window.location.href = `/invoice/${data.booking.ref}`;
  }

  return (
    <>
      <section className="panel">
        <h1>Search flights</h1>
        <form onSubmit={search}>
          <div className="grid">
            <label>
              From
              <select value={orig} onChange={(event) => setOrig(event.target.value)}>
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.code} - {airport.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              To
              <select value={dest} onChange={(event) => setDest(event.target.value)}>
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.code} - {airport.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Start date
              <input type="date" value={date1} onChange={(event) => setDate1(event.target.value)} />
            </label>
            <label>
              End date
              <input type="date" value={date2} onChange={(event) => setDate2(event.target.value)} />
            </label>
          </div>
          <div className="actions">
            <button type="submit">Search</button>
          </div>
        </form>
        {message && <div className={message.includes("failed") || message.includes("No ") ? "notice error" : "notice"}>{message}</div>}
      </section>

      <section className="cards">
        {schedules.map((schedule) => {
          const confirmed = schedule.bookings.filter((booking) => booking.status === "confirmed").length;
          const seatsLeft = schedule.capacity - confirmed;

          return (
            <article className="card" key={schedule.id}>
              <div>
                <strong>
                  {schedule.flightNo}: {airportName(schedule.origin)} to {airportName(schedule.destination)}
                </strong>
                <div className="meta">
                  <span>{schedule.aircraft}</span>
                  <span>Depart {formatDateTime(schedule.departureLocal)}</span>
                  <span>Arrive {formatDateTime(schedule.arrivalLocal)}</span>
                  <span>{seatsLeft} seats left</span>
                </div>
                {bookingFor === schedule.id && (
                  <div className="grid two" style={{ marginTop: 14 }}>
                    <label>
                      Passenger name
                      <input value={passengerName} onChange={(event) => setPassengerName(event.target.value)} placeholder="Ella Lee" />
                    </label>
                    <label>
                      Email
                      <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ella.lee@example.com" />
                    </label>
                  </div>
                )}
              </div>
              <div>
                <div className="price">${schedule.price}</div>
                {bookingFor === schedule.id ? (
                  <div className="actions">
                    <button type="button" onClick={() => book(schedule.id)} disabled={seatsLeft < 1}>
                      Confirm
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setBookingFor(schedule.id)} disabled={seatsLeft < 1}>
                    Book
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
