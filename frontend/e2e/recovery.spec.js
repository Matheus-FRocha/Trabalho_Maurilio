import { test, expect } from "@playwright/test";

function stompBody(message, command) {
  const frame = String(message).trimStart();
  if (!frame.startsWith(`${command}\n`) && !frame.startsWith(`${command}\r\n`))
    return null;
  const body = frame.split(/\r?\n\r?\n/, 2)[1]?.split("\0", 1)[0];
  return body ? JSON.parse(body) : null;
}

test("accepts a delayed room creation after the action timeout", async ({
  page,
}) => {
  let release;
  await page.routeWebSocket("**/ws", (socket) => {
    const server = socket.connectToServer();
    server.onMessage((message) => {
      if (String(message).includes('"type":"GAME_STATE_UPDATED"')) {
        release = () => socket.send(message);
        return;
      }
      socket.send(message);
    });
  });
  await page.goto("/");
  await expect(page.getByTestId("connection")).toHaveText("Conectado");
  await page.getByLabel("Seu nome").fill("Ana");
  await page.getByRole("button", { name: "Criar uma mesa" }).click();
  await expect(page.getByRole("alert")).toContainText("Sem resposta", {
    timeout: 12000,
  });
  expect(release).toBeDefined();
  release();
  await expect(page.getByTestId("room-code")).toBeVisible();
});

test("recovers a saved room when its first synchronization response is lost", async ({
  page,
}) => {
  let reloading = false,
    droppedSyncId = null,
    recoveredSyncId = null,
    allowRetryResponse = false,
    releaseRetryResponse;
  await page.routeWebSocket("**/ws", (socket) => {
    const server = socket.connectToServer();
    const syncRequests = new Set();
    socket.onMessage((message) => {
      const command = stompBody(message, "SEND");
      if (command?.type === "SYNC_ROOM") syncRequests.add(command.messageId);
      server.send(message);
    });
    server.onMessage((message) => {
      const event = stompBody(message, "MESSAGE");
      if (
        reloading &&
        !recoveredSyncId &&
        event?.type === "GAME_STATE_UPDATED"
      ) {
        // Isolate recovery by SYNC from unsolicited presence updates.
        if (!syncRequests.has(event.messageId)) return;
        droppedSyncId ??= event.messageId;
        if (event.messageId === droppedSyncId) return;
        const forward = () => {
          recoveredSyncId = event.messageId;
          socket.send(message);
        };
        if (allowRetryResponse) forward();
        else releaseRetryResponse ??= forward;
        return;
      }
      socket.send(message);
    });
  });
  await page.goto("/");
  await expect(page.getByTestId("connection")).toHaveText("Conectado");
  await page.getByLabel("Seu nome").fill("Ana");
  await page.getByRole("button", { name: "Criar uma mesa" }).click();
  const code = await page.getByTestId("room-code").innerText();
  reloading = true;
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Recuperando sua mesa…" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Criar uma mesa" }),
  ).toHaveCount(0);
  allowRetryResponse = true;
  releaseRetryResponse?.();
  await expect(page.getByTestId("room-code")).toHaveText(code, {
    timeout: 12000,
  });
  expect(droppedSyncId).toBeTruthy();
  expect(recoveredSyncId).toBeTruthy();
  expect(recoveredSyncId).not.toBe(droppedSyncId);
});
