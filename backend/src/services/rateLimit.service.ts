import redis from "../config/redis";

const MIN_EMAIL_DELAY =
  Number(process.env.MIN_EMAIL_DELAY) || 2000;

const MAX_EMAILS_PER_HOUR_PER_SENDER =
  Number(process.env.MAX_EMAILS_PER_HOUR_PER_SENDER) || 200;

const RATE_LIMIT_WINDOW = 60 * 60;

const getSenderKey = (sender: string) => {
  const currentHour = new Date()
    .toISOString()
    .slice(0, 13);

  return `email-rate:${sender}:${currentHour}`;
};

const getDelayKey = (sender: string) => {
  return `email-delay:${sender}`;
};

export const reserveSendSlot = async (
  sender: string
) => {
  const rateKey = getSenderKey(sender);
  const delayKey = getDelayKey(sender);

  const now = Date.now();

  const script = `
    local rateKey = KEYS[1]
    local delayKey = KEYS[2]

    local maxEmails = tonumber(ARGV[1])
    local minDelay = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])

    local count = tonumber(redis.call("GET", rateKey) or "0")

    if count >= maxEmails then
      return {0, 0}
    end

    local lastSent = tonumber(redis.call("GET", delayKey) or "0")

    local nextAllowed = lastSent + minDelay

    if now < nextAllowed then
      return {0, nextAllowed - now}
    end

    redis.call("INCR", rateKey)
    redis.call("EXPIRE", rateKey, 3600)

    redis.call("SET", delayKey, now)

    return {1, 0}
  `;

  const result = (await redis.eval(
    script,
    2,
    rateKey,
    delayKey,
    MAX_EMAILS_PER_HOUR_PER_SENDER,
    MIN_EMAIL_DELAY,
    now
  )) as [number, number];

  return {
    allowed: result[0] === 1,
    waitMilliseconds: Number(result[1]),
  };
};

export const getMillisecondsUntilNextHour = () => {
  const now = new Date();

  const nextHour = new Date(now);

  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);

  return nextHour.getTime() - now.getTime();
};