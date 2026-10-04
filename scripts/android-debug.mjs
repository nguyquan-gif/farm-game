import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const cwd = fileURLToPath(new URL("../android/", import.meta.url));
const windows = process.platform === "win32";
const result = windows
  ? spawnSync(
      process.env.ComSpec || "cmd.exe",
      ["/d", "/s", "/c", "gradlew.bat assembleDebug"],
      { cwd, stdio: "inherit" },
    )
  : spawnSync("sh", ["./gradlew", "assembleDebug"], { cwd, stdio: "inherit" });
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
