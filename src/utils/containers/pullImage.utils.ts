import Docker from "dockerode";
import { CPP_IMAGE, PYTHON_IMAGE } from "../constants";
import logger from "../../config/logger.config";

export async function pullImage(image: string) {
  const docker = new Docker();

  return new Promise((resolve, reject) => {
    docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) {
        return reject(err);
      }

      docker.modem.followProgress(
        stream,
        function onFinished(finalErr: Error | null, output: any) {
          if (finalErr) {
            return reject(finalErr);
          }
          resolve(output);
        },
        function onProgress(event) {
          console.log(event.status);
        }
      );
    });
  });
}

export async function pullAllImages() {
  const images = [PYTHON_IMAGE, CPP_IMAGE];

  // Parllely start pull both these images
  const promises = images.map((image) => pullImage(image));
  try {
    await Promise.all(promises);
    logger.info("All images pulled successfully");
  } catch (err) {
    logger.error("Error while pulling images", err);
  }
}
