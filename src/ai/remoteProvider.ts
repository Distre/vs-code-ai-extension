// src/ai/remoteProvider.ts

import { AIAdapter, AIExplainer } from "./provider";

/* =========================================================
   REMOTE / EXTERNAL AI ADAPTER (SKELETON)
   ---------------------------------------------------------
   This adapter documents where and how a real AI provider
   will be integrated in the future.

   IMPORTANT:
   - This adapter is intentionally NOT usable.
   - No network access.
   - No configuration.
   - Any attempt to use it must fail loudly.
   ========================================================= */

export class RemoteAIAdapter implements AIAdapter {
  readonly id = "remote";

  isAvailable(): boolean {
    // Explicitly unavailable by design
    return false;
  }

  getExplainer(): AIExplainer {
    throw new Error(
      "RemoteAIAdapter is not configured. This is an architectural skeleton only."
    );
  }
}
