"use client";

import { useState } from "react";

export default function ManageClient() {
  const [ref, setRef] = useState("");
  const [message, setMessage] = useState("");

  async function cancel(event: React.FormEvent) {
    event.preventDefault();
    setMessage("Cancelling...");
    const response = await fetch(`/api/bookings/${ref.trim()}`, { method: "DELETE" });
    const data = await response.json();
    setMessage(response.ok ? `Booking ${data.booking.ref} has been cancelled.` : data.error || "Cancellation failed.");
  }

  return (
    <section className="panel">
      <h1>Cancel booking</h1>
      <form onSubmit={cancel}>
        <label>
          Booking reference
          <input value={ref} onChange={(event) => setRef(event.target.value)} placeholder="BK-ABC123" />
        </label>
        <div className="actions">
          <button className="danger" type="submit">
            Cancel booking
          </button>
        </div>
      </form>
      {message && <div className={message.includes("failed") || message.includes("not found") ? "notice error" : "notice"}>{message}</div>}
    </section>
  );
}
