import { request } from "./request";

export async function getConfig<T>(configKey: string) {
  const result = await request<{ config: { configValue: T } }>(
    `/api/config/${encodeURIComponent(configKey)}`,
  );
  return result.config.configValue;
}
