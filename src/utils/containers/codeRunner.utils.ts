import { InternalServerError } from "../errors/app.error";
import { commands } from "./commands.utils";
import { createNewDockerContainer } from "./createContainer.utils";

const allowedListedLanguages = ["python", "cpp"];

export interface RunCodeOptions {
  code: string;
  language: "python" | "cpp";
  timeout: number;
  imageName: string;
}
export async function runCode(options: RunCodeOptions) {
  // Take the python code and dump in a file and run the python file in the container
  const { code, language, timeout, imageName } = options;

  if (!allowedListedLanguages.includes(language)) {
    throw new InternalServerError("Language not allowed");
  }
  const container = await createNewDockerContainer({
    imageName: imageName,
    cmdExecutable: commands[language](code, "6"),
    memoryLimit: 1024 * 1024 * 1024,
  });

  const timeLimitExcededTimeout = setTimeout(() => {
    console.log("Time limit exceeded");
    container?.kill();
  }, timeout);

  console.log("Container created successfully", container?.id);
  await container?.start();

  const status = await container?.wait();
  console.log("Container status", status);
  const logs = await container?.logs({
    stdout: true,
    stderr: true,
  });

  const containerLogs = processLogs(logs);

  console.log("Container logs", containerLogs);

  await container?.remove();

  clearTimeout(timeLimitExcededTimeout);
  if (status.StatusCode === 0) {
    console.log("Container exited successfully");
  } else {
    clearTimeout("Container exited with error");
  }
}

function processLogs(logs: Buffer | undefined) {
  return logs
    ?.toString("utf8")
    .replace(/\x00/g, "")
    .replace(/[\x00-\x09\x08-\x1F\x7F-\x9F]/g, "")
    .trim();
}
