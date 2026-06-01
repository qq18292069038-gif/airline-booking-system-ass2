import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Dairy Flat Air",
  description: "Online booking system for a fictitious airline"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="shell">
          <nav className="nav">
            <Link className="brand" href="/">
              Dairy Flat Air
            </Link>
            <div className="links">
              <Link href="/search">Search flights</Link>
              <Link href="/manage">Cancel booking</Link>
              <Link href="/passenger">Passenger bookings</Link>
            </div>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
