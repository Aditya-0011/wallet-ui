import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.tsx";
import { ConfigError } from "@/components/ConfigError";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { verifySession } from "@/lib/auth";
import { ENV_ERRORS } from "@/lib/env";
import { registerPreloadRecovery } from "@/lib/preload-recovery";

registerPreloadRecovery();

const root = createRoot(document.getElementById("root")!);

if (ENV_ERRORS.length > 0) {
  root.render(<ConfigError errors={ENV_ERRORS} />);
} else {
  void verifySession();
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
