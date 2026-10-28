export default function handler(_req: any, res: any) {
  const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const isRedisConfigured = Boolean(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  );

  return res.status(200).json({
    configured: hasToken,
    redisConfigured: isRedisConfigured
  });
}
