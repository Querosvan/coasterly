import { ingestAllQueueTimesSnapshots } from "../services/wait-times.js";

export const runQueueTimesSnapshotIngestion = async () =>
  ingestAllQueueTimesSnapshots();
