import { it, expect, vi } from "vitest";
import { messageId } from "./messageId";
it("generates distinct IDs when randomUUID is unavailable on HTTP LAN", () => {
  const original = globalThis.crypto;
  vi.stubGlobal("crypto", {
    getRandomValues: original.getRandomValues.bind(original),
  });
  try {
    const a = messageId(),
      b = messageId();
    expect(a).toMatch(/^[a-f0-9]{32}$/);
    expect(b).not.toBe(a);
  } finally {
    vi.unstubAllGlobals();
  }
});
