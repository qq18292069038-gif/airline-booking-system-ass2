import { seedSchedules } from "../lib/store";

seedSchedules()
  .then((count) => {
    console.log(`Seeded ${count} scheduled flights.`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
