import { useMemo } from "react";
import { getOrCreateClientId } from "../utils/clientId";

export function useClientId(): string {
  return useMemo(() => getOrCreateClientId(), []);
}
