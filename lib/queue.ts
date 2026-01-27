import { Queue, ConnectionOptions } from "bullmq";
import Redis from "ioredis";

const connection: ConnectionOptions = process.env.REDIS_URL
    ? { url: process.env.REDIS_URL }
    : {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
    };

export const renderQueue = new Queue("render-jobs", {
    connection: process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) : connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: true,
    },
});

export const transcribeQueue = new Queue("transcription-jobs", {
    connection: process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) : connection,
    defaultJobOptions: {
        attempts: 2,
        removeOnComplete: true,
    },
});

export const redisConnection = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
    : new Redis(connection.port as number, connection.host as string, {
        maxRetriesPerRequest: null,
    });
