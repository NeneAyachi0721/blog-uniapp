import { API_BASE_URL } from "@/config";

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

function joinQuery(query?: Record<string, unknown>) {
  if (!query) return "";
  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );
  return params.length ? `?${params.join("&")}` : "";
}

export function request<T>(
  path: string,
  options: {
    method?: Method;
    data?: unknown;
    query?: Record<string, unknown>;
  } = {},
) {
  const url = `${API_BASE_URL}${path}${joinQuery(options.query)}`;

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url,
      method: options.method ?? "GET",
      data: options.data as string | ArrayBuffer | UniApp.RequestOptions["data"],
      header: {
        "Content-Type": "application/json",
      },
      success: (res) => {
        const body = res.data as ApiEnvelope<T> | T | undefined;
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const message =
            typeof body === "object" &&
            body &&
            "data" in body &&
            typeof (body as { data?: { message?: string } }).data?.message ===
              "string"
              ? (body as { data: { message: string } }).data.message
              : "请求失败，请稍后重试";
          reject(new Error(message));
          return;
        }

        if (body && typeof body === "object" && "success" in body) {
          const envelope = body as ApiEnvelope<T>;
          if (envelope.success) {
            resolve(envelope.data);
          } else {
            reject(new Error("请求失败，请稍后重试"));
          }
          return;
        }

        resolve(body as T);
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
}
