import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function main() {
  const { seedSchedules } = await import("../lib/store");
  const count = await seedSchedules();
  console.log(`Seeded ${count} scheduled flights.`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
