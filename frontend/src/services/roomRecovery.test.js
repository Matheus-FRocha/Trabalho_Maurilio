import { afterEach, it, expect, vi } from "vitest";
import { createRoomRecovery } from "./roomRecovery";
afterEach(() => vi.useRealTimers());

it("retries missing snapshots and stops after a matching reply", () => {
  vi.useFakeTimers();
  const sent = [];
  const recovery = createRoomRecovery({
    send: (room) => sent.push(room),
    onTimeout: () => {
      throw new Error("unexpected timeout");
    },
  });
  recovery.start("ABC123");
  expect(sent).toEqual(["ABC123"]);
  vi.advanceTimersByTime(1500);
  expect(sent).toEqual(["ABC123", "ABC123"]);
  recovery.ack("OTHER");
  vi.advanceTimersByTime(1500);
  expect(sent).toHaveLength(3);
  recovery.ack("ABC123");
  vi.advanceTimersByTime(10000);
  expect(sent).toHaveLength(3);
});
it("bounds retries and reports failure instead of waiting forever", () => {
  vi.useFakeTimers();
  let attempts = 0,
    timeouts = 0;
  const recovery = createRoomRecovery({
    send: () => attempts++,
    onTimeout: () => timeouts++,
  });
  recovery.start("ABC123");
  vi.advanceTimersByTime(20000);
  expect(attempts).toBe(3);
  expect(timeouts).toBe(1);
});
it("cancels retry timers when leaving or disconnecting", () => {
  vi.useFakeTimers();
  let attempts = 0,
    timeouts = 0;
  const recovery = createRoomRecovery({
    send: () => attempts++,
    onTimeout: () => timeouts++,
  });
  recovery.start("ABC123");
  recovery.stop();
  vi.advanceTimersByTime(20000);
  expect(attempts).toBe(1);
  expect(timeouts).toBe(0);
});
