const { test, expect } = require("@playwright/test");

test("registers, creates a task, and logs out against the live backend", async ({
  page,
}) => {
  const uniqueSuffix = Date.now().toString();
  const username = `Smoke ${uniqueSuffix}`;
  const nickname = `smoke-${uniqueSuffix}`;
  const email = `smoke-${uniqueSuffix}@example.com`;
  const password = "Smoke123!";
  const taskTitle = `Tarefa smoke ${uniqueSuffix}`;

  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /clareza para planejar o dia/i,
    })
  ).toBeVisible();

  await page.locator(".site-header").getByRole("link", { name: "Criar conta" }).click();

  await page.getByLabel("Nome").fill(username);
  await page.getByLabel("Nickname").fill(nickname);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByLabel("Confirmacao").fill(password);
  await page.getByRole("button", { name: /criar conta/i }).click();

  await expect(
    page.getByRole("heading", {
      name: new RegExp(`${username}, suas tarefas`, "i"),
    })
  ).toBeVisible();

  await page.getByLabel("Titulo da tarefa").fill(taskTitle);
  await page.getByRole("button", { name: /^Criar tarefa$/i }).click();

  await expect(page.getByText(taskTitle)).toBeVisible();

  await page.getByRole("button", { name: /sair/i }).click();

  await expect(
    page.getByRole("heading", {
      name: /clareza para planejar o dia/i,
    })
  ).toBeVisible();
});
