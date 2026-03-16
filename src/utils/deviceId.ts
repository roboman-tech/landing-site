const DEVICE_ID_STORAGE_KEY = "culturemindDeviceId";

function randomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

function createDeviceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `cm-${crypto.randomUUID()}`;
  }
  return `cm-${Date.now().toString(36)}-${randomHex(16)}`;
}

export default function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "cm-server";
  }

  const current = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (current && current.length >= 8) {
    return current;
  }

  const next = createDeviceId();
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, next);
  return next;
}
