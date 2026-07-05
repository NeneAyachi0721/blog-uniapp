import { ensureAdmin, seedConfigs } from "./seed/config";
import { seedFriends } from "./seed/friends";
import { seedMails } from "./seed/mails";
import { seedPosts } from "./seed/posts";
import { closeSeedDb, createSeedDb, DB_PATH } from "./seed/shared";

const db = createSeedDb();

try {
  const admin = await ensureAdmin(db);
  seedConfigs(db);
  const postCount = seedPosts(db);
  const friendCount = seedFriends(db);
  const mailCount = seedMails(db);

  closeSeedDb(db);

  console.log("Database initialized.");
  console.log(`Database: ${DB_PATH}`);
  console.log(`Admin: ${admin.username} / ${admin.password}`);
  console.log(`Posts: ${postCount}`);
  console.log(`Friend links: ${friendCount}`);
  console.log(`Email logs: ${mailCount}`);
} catch (error) {
  db.close();
  console.error(error);
  process.exit(1);
}
