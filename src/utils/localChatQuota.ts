const QUOTA_STORAGE_KEY = "culturemindLocalDailyQuota";
export const LOCAL_DAILY_CHAT_LIMIT = 4;

type LocalQuotaRecord = {
  deviceId: string;
  date: string;
  used: number;
};

export type LocalQuotaSnapshot = {
  date: string;
  used: number;
  remaining: number;
};

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createEmptyRecord(deviceId: string): LocalQuotaRecord {
  return {
    deviceId,
    date: getLocalDateString(),
    used: 0,
  };
}

function readRecord(deviceId: string): LocalQuotaRecord {
  if (typeof window === "undefined") {
    return createEmptyRecord(deviceId);
  }

  const raw = window.localStorage.getItem(QUOTA_STORAGE_KEY);
  if (!raw) {
    return createEmptyRecord(deviceId);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LocalQuotaRecord>;
    const today = getLocalDateString();
    const usedValue = Number(parsed.used);
    const sameDevice = parsed.deviceId === deviceId;
    const sameDay = parsed.date === today;
    const validUsed =
      Number.isFinite(usedValue) &&
      usedValue >= 0;

    if (!sameDevice || !sameDay || !validUsed) {
      return createEmptyRecord(deviceId);
    }

    return {
      deviceId,
      date: today,
      used: Math.floor(usedValue),
    };
  } catch {
    return createEmptyRecord(deviceId);
  }
}

function writeRecord(record: LocalQuotaRecord): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(record));
}

function toSnapshot(record: LocalQuotaRecord, limit: number): LocalQuotaSnapshot {
  const used = Math.min(Math.max(record.used, 0), limit);
  return {
    date: record.date,
    used,
    remaining: Math.max(limit - used, 0),
  };
}

export function getDailyQuotaSnapshot(
  deviceId: string,
  limit = LOCAL_DAILY_CHAT_LIMIT,
): LocalQuotaSnapshot {
  return toSnapshot(readRecord(deviceId), limit);
}

export function incrementDailyQuotaUsage(
  deviceId: string,
  limit = LOCAL_DAILY_CHAT_LIMIT,
): LocalQuotaSnapshot {
  const record = readRecord(deviceId);
  record.used = Math.min(record.used + 1, limit);
  writeRecord(record);
  return toSnapshot(record, limit);
}

export function lockDailyQuota(
  deviceId: string,
  limit = LOCAL_DAILY_CHAT_LIMIT,
): LocalQuotaSnapshot {
  const record = readRecord(deviceId);
  record.used = limit;
  writeRecord(record);
  return toSnapshot(record, limit);
}
