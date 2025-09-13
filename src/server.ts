import express from "express";
import { serverConfig } from "./config";
import v1Router from "./routers/v1/index.router";
import v2Router from "./routers/v2/index.router";
import {
  appErrorHandler,
  genericErrorHandler,
} from "./middlewares/error.middleware";
import logger from "./config/logger.config";
import { attachCorrelationIdMiddleware } from "./middlewares/correlation.middleware";
import { startWorkers } from "./workers/evaluation.worker";
//import { runPythonCode } from "./utils/containers/pythonRunner.utils";
//import { pullAllImages } from './utils/containers/pullImage.utils';
const app = express();

app.use(express.json());

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);
app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);

/**
 * Add the error handler middleware
 */

app.use(appErrorHandler);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, async () => {
  logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
  logger.info(`Press Ctrl+C to stop the server.`);
  await startWorkers();
  logger.info("Workers started successfully");
  //await pullAllImages();
  //await testPythonCode()
});

// async function testCppCode() {
//   const cppCode = `
//   #include <iostream>
//   using namespace std;
//   int main(){
//     int n;
//     cin>>n;
//     for(int i=1;i<=n;i++){
//       cout<<i<<" ";
//     }
//     return 0;
//   }
//   `
// }

// await runCode({
//   code: cppCode,
//   language: "cpp",
//   timeout: 1000,
//   imageName: CPP_IMAGE,
//   input: "5"
// });

// async function testPythonCode() {
//   const pythonCode = `print("bye")`;
//   await runCode(
//   {
//     code: pythonCode,
//     language: "python",
//     timeout: 1000,
//     imageName: PYTHON_IMAGE,
//     input: "5"
//   }
//
//);
// }
