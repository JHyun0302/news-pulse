import { describe, expect, it } from "vitest";
import { CLIENT_ID_STORAGE_KEY, getOrCreateClientId } from "./clientId";

function createStorage(initialValue?: string) {
  const values = new Map<string, string>();
  if (initialValue) {
    values.set(CLIENT_ID_STORAGE_KEY, initialValue);
  }

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values
  };
}

describe("getOrCreateClientId", () => {
  it("저장된 client id를 재사용한다", () => {
    const storage = createStorage("saved-client");

    const clientId = getOrCreateClientId(storage, () => "new-client");

    expect(clientId).toBe("saved-client");
  });

  it("저장된 값이 없으면 생성 후 저장한다", () => {
    const storage = createStorage();

    const clientId = getOrCreateClientId(storage, () => "created-client");

    expect(clientId).toBe("created-client");
    expect(storage.values.get(CLIENT_ID_STORAGE_KEY)).toBe("created-client");
  });
});
