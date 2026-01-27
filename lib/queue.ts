import { Queue, ConnectionOptions } from "bullmq";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");

const connectionConfig: ConnectionOptions = REDIS_URL
    ? { url: REDIS_URL }
    : {
        host: REDIS_HOST,
        port: REDIS_PORT,
    };

// Shared redis instance for BullMQ if URL is present, otherwise use config
const getRedisClient = () => {
    if (REDIS_URL) {
        return new Redis(REDIS_URL, { maxRetriesPerRequest: null });
    }
    return new Redis(REDIS_PORT, REDIS_HOST, {
        maxRetriesPerRequest: null,
    });
};

export const renderQueue = new Queue("render-jobs", {
    connection: REDIS_URL ? getRedisClient() : connectionConfig,
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
    connection: REDIS_URL ? getRedisClient() : connectionConfig,
    defaultJobOptions: {
        attempts: 2,
        removeOnComplete: true,
    },
});

export const redisConnection = getRedisClient();

