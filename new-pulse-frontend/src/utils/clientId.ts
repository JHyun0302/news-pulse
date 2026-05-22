export const CLIENT_ID_STORAGE_KEY = "news-pulse-client-id";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function createClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `client-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateClientId(
  storage: StorageLike = window.localStorage,
  idFactory: () => string = createClientId
): string {
  const existing = storage.getItem(CLIENT_ID_STORAGE_KEY);
  if (existing && existing.trim().length > 0) {
    return existing;
  }

  const nextId = idFactory();
  storage.setItem(CLIENT_ID_STORAGE_KEY, nextId);
  return nextId;
}
