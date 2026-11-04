import { test, expect } from "@playwright/test";

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
  let dropNext = false,
    dropped = 0,
    syncs = 0;
  await page.routeWebSocket("**/ws", (socket) => {
    const server = socket.connectToServer();
    socket.onMessage((message) => {
      if (
        String(message).startsWith("SEND") &&
        String(message).includes('"type":"SYNC_ROOM"')
      )
        syncs++;
      server.send(message);
    });
    server.onMessage((message) => {
      if (
        dropNext &&
        String(message).startsWith("MESSAGE") &&
        String(message).includes('"type":"GAME_STATE_UPDATED"')
      ) {
        dropNext = false;
        dropped++;
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
  dropNext = true;
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Recuperando sua mesa…" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Criar uma mesa" }),
  ).toHaveCount(0);
  await expect(page.getByTestId("room-code")).toHaveText(code, {
    timeout: 12000,
  });
  expect(dropped).toBe(1);
  expect(syncs).toBeGreaterThanOrEqual(2);
});
