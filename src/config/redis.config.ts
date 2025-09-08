import Redis from "ioredis";
import logger from "./logger.config";
import { serverConfig } from ".";

const redisConfig ={
    host: serverConfig.REDIS_HOST || '',
    port: serverConfig.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
}

export const redis = new Redis(redisConfig);

redis.on("connect", ()=>{
    logger.info("Connected to redis successfully");
})

redis.on("error", (error)=>{
    logger.error("Redis connection error", error);
})

export const createNewRedisConnection = ()=>{
    return new Redis(redisConfig);
}