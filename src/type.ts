import type { UserConfig } from "vitest";

export type VitestConfig = {
  imports: string[];
  config: UserConfig;
}
