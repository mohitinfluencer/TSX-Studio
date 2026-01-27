import { Queue, ConnectionOptions } from "bullmq";
import Redis from "ioredis";

const connection: ConnectionOptions = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
};

export const renderQueue = new Queue("render-jobs", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: true,
    },
});

export const redisConnection = new Redis(connection.port!, connection.host!, {
    maxRetriesPerRequest: null,
});
