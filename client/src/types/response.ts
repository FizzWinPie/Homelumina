import type { paths } from "./server";

export type GetSuccessResponse<T extends keyof paths> =
  paths[T]["get"]["responses"][200]["content"]["application/json"];
