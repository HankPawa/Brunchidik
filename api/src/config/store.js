import Redis from "ioredis";
import { env } from "./env.js";
import { ApiError } from "../lib/errors.js";

class MemoryStore {
  counters = new Map();
  values = new Map();

  constructor() {
    this.sweeper = setInterval(() => this.sweep(), 60_000);
    this.sweeper.unref();
  }

  sweep() {
    const now = Date.now();
    for (const map of [this.counters, this.values]) {
      for (const [key, entry] of map) if (entry.expiresAt <= now) map.delete(key);
    }
  }

  async hit(key, windowSec) {
    const now = Date.now();
    const entry = this.counters.get(key);
    if (!entry || entry.expiresAt <= now) {
      this.counters.set(key, { value: 1, expiresAt: now + windowSec * 1000 });
      return 1;
    }
    entry.value += 1;
    return entry.value;
  }

  async set(key, value, ttlSec) {
    this.values.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
  }

  async get(key) {
    const entry = this.values.get(key);
    if (!entry || entry.expiresAt <= Date.now()) return null;
    return entry.value;
  }

  async del(key) {
    this.values.delete(key);
    this.counters.delete(key);
  }

  async close() {
    clearInterval(this.sweeper);
  }
}

class RedisStore {
  constructor(url) {
    this.warned = false;
    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => Math.min(times * 1000, 10_000),
    });
    this.client.on("ready", () => {
      console.log("✔ Redis conectado");
      this.warned = false;
    });
    this.client.on("error", (err) => {
      if (this.warned) return;
      this.warned = true;
      console.warn(`⚠ Redis no disponible (${err.message || err.code}). Rate limiting en memoria hasta que vuelva.`);
    });
    this.client.connect().catch(() => {});
  }

  get ready() {
    return this.client.status === "ready";
  }

  async hit(key, windowSec) {
    const count = await this.client.incr(key);
    if (count === 1) await this.client.expire(key, windowSec);
    return count;
  }

  async set(key, value, ttlSec) {
    await this.client.set(key, value, "EX", ttlSec);
  }

  async get(key) {
    return this.client.get(key);
  }

  async del(key) {
    await this.client.del(key);
  }

  async close() {
    this.client.disconnect();
  }
}

const memory = new MemoryStore();
const redis = env.redisUrl ? new RedisStore(env.redisUrl) : null;
if (!redis) console.log("ℹ REDIS_URL vacía: rate limiting y códigos 2FA en memoria");

// Los datos de seguridad (códigos 2FA) fallan cerrado: si Redis está configurado
// pero caído, no se degradan en silencio a una memoria que otra instancia no ve.
function secureStore() {
  if (!redis) return memory;
  if (!redis.ready) {
    throw new ApiError(503, "Servicio temporalmente no disponible. Intenta de nuevo en unos segundos.");
  }
  return redis;
}

export const store = {
  // Rate limiting: falla abierto hacia memoria para no tumbar la app.
  async hit(key, windowSec) {
    if (redis?.ready) {
      try {
        return await redis.hit(key, windowSec);
      } catch {
        // cae a memoria
      }
    }
    return memory.hit(key, windowSec);
  },

  secure: {
    hit: (key, windowSec) => secureStore().hit(key, windowSec),
    set: (key, value, ttlSec) => secureStore().set(key, value, ttlSec),
    get: (key) => secureStore().get(key),
    del: (key) => secureStore().del(key),
  },

  async close() {
    await memory.close();
    await redis?.close();
  },
};
