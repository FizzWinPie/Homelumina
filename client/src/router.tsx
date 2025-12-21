import { RouterProvider } from "react-router-dom";
import { createUniversalRouter } from "./config/routing";

// Create router based on platform
const router = createUniversalRouter();

export function AppRouter() {
  return <RouterProvider router={router} />;
}
