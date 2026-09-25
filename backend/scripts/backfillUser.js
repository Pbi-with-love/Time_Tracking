/**
 * One-off migration for the single-user -> multi-user transition.
 *
 * Every Task, Tag, Timestamp and TaskOrder created before ownership existed
 * has no `user` field. Because `user` is now required, those documents fail
 * validation on any save/update. This script attaches them to one owner.
 *
 * It assumes all pre-existing data belonged to a single account; pick that
 * account by id or email.
 *
 * Usage:
 *   node scripts/backfillUser.js <userId|email>                 # dry run
 *   node scripts/backfillUser.js <userId|email> --apply         # write
 *   node scripts/backfillUser.js <userId|email> --apply --sync-indexes
 *
 * Only documents with a missing or null `user` are touched, so it is safe to
 * re-run. `--sync-indexes` additionally drops indexes that no longer appear in
 * the schemas (e.g. the old globally-unique TaskOrder index).
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import Task from "../src/models/Task.js";
import Tag from "../src/models/Tag.js";
import Timestamp from "../src/models/Timestamp.js";
import TaskOrder from "../src/models/TaskOrder.js";

dotenv.config();

const MODELS = { Task, Tag, Timestamp, TaskOrder };

// Documents that predate ownership: no `user` key at all, or explicitly null
const ORPHAN_QUERY = {
  $or: [{ user: { $exists: false } }, { user: null }],
};

const resolveUser = async (identifier) => {
  const query = mongoose.Types.ObjectId.isValid(identifier)
    ? { _id: identifier }
    : { email: identifier };

  const user = await User.findOne(query).lean();
  if (!user) {
    throw new Error(`No user found matching "${identifier}"`);
  }
  return user;
};

const main = async () => {
  const identifier = process.argv[2];
  const apply = process.argv.includes("--apply");
  const syncIndexes = process.argv.includes("--sync-indexes");

  if (!identifier) {
    console.error(
      "Usage: node scripts/backfillUser.js <userId|email> [--apply] [--sync-indexes]",
    );
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set (expected in backend/.env)");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await resolveUser(identifier);
  console.log(`Owner: ${user.username} <${user.email}> (${user._id})\n`);

  let totalOrphans = 0;

  for (const [name, Model] of Object.entries(MODELS)) {
    const count = await Model.countDocuments(ORPHAN_QUERY);
    totalOrphans += count;
    console.log(`${name}: ${count} document(s) without an owner`);

    if (apply && count > 0) {
      const res = await Model.updateMany(ORPHAN_QUERY, {
        $set: { user: user._id },
      });
      console.log(`  -> assigned ${res.modifiedCount}`);
    }
  }

  if (syncIndexes) {
    console.log("\nSyncing indexes...");
    for (const [name, Model] of Object.entries(MODELS)) {
      const dropped = await Model.syncIndexes();
      console.log(`${name}: dropped [${dropped.join(", ")}]`);
    }
  }

  console.log(
    apply
      ? `\nDone. ${totalOrphans} document(s) inspected.`
      : "\nDry run — nothing written. Re-run with --apply to persist.",
  );

  await mongoose.disconnect();
};

main().catch(async (err) => {
  console.error("\nBackfill failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
