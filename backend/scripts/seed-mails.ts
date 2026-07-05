import { seedMails } from "./seed/mails";
import { closeSeedDb, createSeedDb, DB_PATH } from "./seed/shared";

const db = createSeedDb();

try {
  const total = seedMails(db);
  closeSeedDb(db);
  console.log(`Seeded ${total} email logs.`);
  console.log(`Database: ${DB_PATH}`);
} catch (error) {
  db.close();
  console.error(error);
  process.exit(1);
}
