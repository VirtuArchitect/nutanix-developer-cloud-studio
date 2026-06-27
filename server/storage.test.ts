import { copyFile, mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { createDefaultState, JsonFileStore } from "./storage";

describe("JsonFileStore", () => {
  it("can restore prototype state from a JSON backup file", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ndc-store-"));
    const stateFile = join(directory, "ndc-studio.json");
    const backupFile = join(directory, "ndc-studio.backup.json");
    const store = new JsonFileStore(stateFile);
    const state = createDefaultState();
    state.environments = [
      {
        name: "backup-restore-dev",
        template: "Linux VM App Sandbox",
        owner: "platform.admin",
        region: "Berlin Lab",
        status: "Ready",
        cost: 920,
        createdAt: "2026-06-27",
      },
      ...state.environments,
    ];

    await store.save(state);
    await copyFile(stateFile, backupFile);

    const restoredStore = new JsonFileStore(stateFile);
    await restoredStore.save(JSON.parse(await readFile(backupFile, "utf8")));

    await expect(restoredStore.load()).resolves.toMatchObject({
      environments: expect.arrayContaining([expect.objectContaining({ name: "backup-restore-dev" })]),
    });
  });
});
