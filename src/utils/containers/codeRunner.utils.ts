import { InternalServerError } from "../errors/app.error";
import { commands } from "./commands.utils";
import { createNewDockerContainer } from "./createContainer.utils";

const allowedListedLanguages = ["python", "cpp"];

export interface RunCodeOptions {
  code: string;
  language: "python" | "cpp";
  timeout: number;
  imageName: string;
  input: string;
}
export async function runCode(options: RunCodeOptions) {
  // Take the python code and dump in a file and run the python file in the container
  const { code, language, timeout, imageName, input } = options;

  if (!allowedListedLanguages.includes(language)) {
    throw new InternalServerError("Language not allowed");
  }
  const container = await createNewDockerContainer({
    imageName: imageName,
    cmdExecutable: commands[language](code, input),
    memoryLimit: 1024 * 1024 * 1024,
  });

  let isTimeLimitExceeded = false;
  const timeLimitExcededTimeout = setTimeout(() => {
    console.log("Time limit exceeded");
    isTimeLimitExceeded = true;
    container?.kill();
  }, timeout);

  await container?.start();

  const status = await container?.wait();
  if (isTimeLimitExceeded) {
    container?.remove();
    return {
      status: "error",
      output: "Time limit exceeded",
    };
  }
  const logs = await container?.logs({
    stdout: true,
    stderr: true,
  });

  const containerLogs = processLogs(logs);

  await container?.remove();
  clearTimeout(timeLimitExcededTimeout);
  if (status.StatusCode === 0) {
    return {
      status: "success",
      output: containerLogs,
    };
  } else {
    clearTimeout("Container exited with error");
    return {
      status: "error",
      output: containerLogs,
    };
  }
}

function processLogs(logs: Buffer | undefined) {
  return logs
    ?.toString("utf8")
    .replace(/\x00/g, "")
    .replace(/[\x00-\x09\x08-\x1F\x7F-\x9F]/g, "")
    .trim();
}
