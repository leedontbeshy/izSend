import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { env, MAX_FILE_BYTES } from "./env.js";
import { filesRoutes } from "./routes/files.js";
import { startCleanupJob } from "./jobs/cleanupExpired.js";

const fastify = Fastify({
  logger: true,
  trustProxy: true
});

await fastify.register(cors, {
  origin: env.webOrigin,
  credentials: true
});

await fastify.register(multipart, {
  limits: {
    fileSize: MAX_FILE_BYTES
  }
});

await fastify.register(rateLimit, {
  global: false
});

await fastify.register(filesRoutes);

startCleanupJob(fastify.log, env.cleanupIntervalMinutes);

await fastify.listen({ port: env.apiPort, host: "0.0.0.0" });
