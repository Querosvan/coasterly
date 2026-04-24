import { closeDatabase, initializeDatabase } from "../../api/src/db.js";
import { runQueueTimesSnapshotIngestion } from "../../api/src/jobs/queue-times.js";

const logPrefix = "[queue-times-cron]";

const run = async () => {
  const startedAt = new Date().toISOString();
  console.log(`${logPrefix} starting snapshot ingestion at ${startedAt}`);

  try {
    await initializeDatabase();

    const summary = await runQueueTimesSnapshotIngestion();

    console.log(
      `${logPrefix} processed ${summary.processedParks} parks and inserted ${summary.insertedSnapshots} snapshots`
    );

    if (summary.failures.length > 0) {
      for (const failure of summary.failures) {
        console.error(
          `${logPrefix} park ${failure.parkSlug} failed: ${failure.message}`
        );
      }

      console.error(
        `${logPrefix} completed with ${summary.failures.length} failed park runs`
      );

      process.exitCode = 1;

      return;
    }

    console.log(`${logPrefix} completed successfully at ${summary.finishedAt}`);
  } catch (error) {
    console.error(
      `${logPrefix} run failed`,
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  } finally {
    await closeDatabase();
    console.log(`${logPrefix} database connections closed`);
  }
};

await run();
