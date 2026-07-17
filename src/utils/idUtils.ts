const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ULID_TIME_LENGTH = 10;
const ULID_RANDOM_LENGTH = 16;

export type EntityIdPrefix =
  | 'routine'
  | 'workout'
  | 'exercise'
  | 'set_template'
  | 'session'
  | 'exercise_log'
  | 'set_log';

let lastTimestamp = -1;
let lastRandomPart: number[] = [];

const encodeTime = (timestamp: number) => {
  let remaining = timestamp;
  const encoded = Array<string>(ULID_TIME_LENGTH);

  for (let index = ULID_TIME_LENGTH - 1; index >= 0; index -= 1) {
    encoded[index] = CROCKFORD_BASE32[remaining % 32];
    remaining = Math.floor(remaining / 32);
  }

  return encoded.join('');
};

const createRandomPart = () => Array.from(
  { length: ULID_RANDOM_LENGTH },
  () => Math.floor(Math.random() * 32)
);

const incrementRandomPart = (value: number[]) => {
  const next = [...value];

  for (let index = next.length - 1; index >= 0; index -= 1) {
    if (next[index] < 31) {
      next[index] += 1;
      return next;
    }
    next[index] = 0;
  }

  return createRandomPart();
};

const createUlid = (timestamp: number) => {
  const normalizedTimestamp = Math.max(timestamp, lastTimestamp);

  if (normalizedTimestamp === lastTimestamp && lastRandomPart.length > 0) {
    lastRandomPart = incrementRandomPart(lastRandomPart);
  } else {
    lastTimestamp = normalizedTimestamp;
    lastRandomPart = createRandomPart();
  }

  const random = lastRandomPart.map(value => CROCKFORD_BASE32[value]).join('');
  return `${encodeTime(normalizedTimestamp)}${random}`;
};

export const createEntityId = (
  prefix: EntityIdPrefix,
  timestamp = Date.now()
) => `${prefix}_${createUlid(timestamp)}`;
