import logger from "../../config/logger.config";
import Docker from "dockerode";

export interface CreateContainerOptions {
  imageName: string;
  cmdExecutable: string[];
  memoryLimit: number;
}
export async function createNewDockerContainer(
  options: CreateContainerOptions
) {
  try {
    const docker = new Docker();
    const container = await docker.createContainer({
      Image: options.imageName, // Name of the image to use
      Cmd: options.cmdExecutable, // Command to run inside the container
      AttachStdin: true, // Enable standard input
      AttachStdout: true, // Enable standard output
      AttachStderr: true, // Enable standard error
      Tty: false, // Disable terminal mode for the container to run in the background
      HostConfig: { // Configuration for the container host settings
        Memory: options.memoryLimit, // Limit the memory usage of the container
        PidsLimit: 10, // Limit the number of processes in the container to 10
        CpuQuota: 50000, // Limit the CPU usage of the container to 0.5%
        CpuPeriod: 100000, // Set the CPU period to 100ms
        SecurityOpt: ["no-new-privileges"], // Disable privilege escalation
        NetworkMode: "none", // Disable network isolation
      },
    });
    logger.info(`Container created successfully with id ${container.id}`);
    return container;
  } catch (error) {
    logger.info("Error while creating container", error);
    return null;
  }
}
