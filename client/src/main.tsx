import React from "react";
import ReactDOM from "react-dom/client";
import { AppRouter } from "./router.tsx";
import { DarkModeProvider } from "./providers/DarkModeProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DarkModeProvider>
      <AppRouter />
    </DarkModeProvider>
  </React.StrictMode>,
);
