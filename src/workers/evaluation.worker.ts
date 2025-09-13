import { Job, Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constants";
import logger from "../config/logger.config";
import { createNewRedisConnection } from "../config/redis.config";
import { EvaluationJob } from "../interfaces/evaluation.interface";
import { runCode } from "../utils/containers/codeRunner.utils";
import { LANGUAGE_CONFIG } from "../config/language.config";

async function setupEvaluationWorker() {
  const worker = new Worker(
    SUBMISSION_QUEUE,
    async (job: Job) => {
      logger.info(`Processing job ${job.id}`);
      const data: EvaluationJob = job.data;
      console.log("Data", data);
      try {
        const testCasesRunnerPromise = data.problem.testcases.map(
          (testcase) => {
            return runCode({
              code: data.code,
              language: data.language,
              timeout: LANGUAGE_CONFIG[data.language].timeout,
              imageName: LANGUAGE_CONFIG[data.language].imageName,
              input: testcase.input,
            });
          }
        );
        const testCasesRunnerResults = await Promise.all(
          testCasesRunnerPromise
        );
        console.log("testCasesRunnerResults", testCasesRunnerResults);
      } catch (error) {
        logger.info(`Evaluation job failed: ${job}`, error);
        return;
      }
    },
    {
      connection: createNewRedisConnection(),
    }
  );

  worker.on("error", (error) => {
    logger.error("Evaluation Worker error", error);
  });
  worker.on("completed", (job) => {
    logger.info(`Evaluation job completed ${job}`);
  });
  worker.on("failed", (job, error) => {
    logger.error(`Evaluation job failed ${job}`, error);
  });
}

export async function startWorkers() {
  await setupEvaluationWorker();
}
