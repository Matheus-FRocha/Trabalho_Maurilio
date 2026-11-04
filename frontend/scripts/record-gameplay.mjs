import { chromium } from "playwright";
import { mkdir, rename } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("../output/videos");
const baseURL = process.env.PIFE_BASE_URL || "http://localhost:8080";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const host = await browser.newContext({
  viewport: { width: 1440, height: 1080 },
  recordVideo: { dir: output, size: { width: 1440, height: 1080 } },
});
const guest = await browser.newContext();
const a = await host.newPage(),
  b = await guest.newPage();
const started = Date.now();
const hold = (ms) => a.waitForTimeout(ms);
try {
  await a.goto(baseURL);
  await a.getByTestId("connection").filter({ hasText: "Conectado" }).waitFor();
  await hold(4000);
  await a.getByLabel("Seu nome").fill("Jogador 1");
  await a.getByRole("button", { name: "Criar uma mesa" }).click();
  const code = await a.getByTestId("room-code").innerText();
  await hold(4000);
  await b.goto(baseURL);
  await b.getByRole("button", { name: "Entrar com código" }).click();
  await b.getByLabel("Seu nome").fill("Jogador 2");
  await b.getByLabel("Código da sala").fill(code);
  await b.getByRole("button", { name: "Entrar na mesa", exact: true }).click();
  await a.getByText("Jogador 2", { exact: true }).first().waitFor();
  await hold(3500);
  await a.getByRole("button", { name: "Começar partida" }).click();
  await a.getByTestId("hand-card").first().waitFor();
  await hold(4000);
  for (let turn = 0; turn < 4; turn++) {
    const page = turn % 2 === 0 ? a : b;
    await page.getByRole("button", { name: "Comprar do monte" }).click();
    await page.getByTestId("hand-card").nth(9).waitFor();
    await hold(3000);
    await page.getByTestId("hand-card").last().click();
    await hold(1500);
    await page.getByRole("button", { name: "Descartar selecionada" }).click();
    await hold(2500);
  }
  await a.reload();
  await a.getByTestId("hand-card").first().waitFor();
  await hold(4500);
  await b.getByRole("button", { name: "Sair da partida" }).click();
  await a.getByRole("heading", { name: "Você venceu!" }).waitFor();
  const remaining = 61000 - (Date.now() - started);
  if (remaining > 0) await hold(remaining);
  const video = a.video();
  await host.close();
  await rename(await video.path(), resolve(output, "gameplay.webm"));
  console.log("Gameplay real gravado em output/videos/gameplay.webm");
} finally {
  await guest.close();
  await browser.close();
}
