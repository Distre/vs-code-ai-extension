import * as vscode from "vscode";
import { AIAdapter } from "./provider";
import { LocalAIAdapter } from "./localProvider";

/* =========================================================
   AI ADAPTER REGISTRY
   ---------------------------------------------------------
   Central, explicit registration of available adapters.
   Selection is controlled via user settings.
   No fallback. Invalid selection fails explicitly.
   ========================================================= */

// NOTE:
// RemoteAIAdapter exists as an architectural skeleton,
// but is intentionally not registered or selectable.

export class AIAdapterRegistry {
  private readonly adapters: AIAdapter[];

  constructor() {
    this.adapters = [
      new LocalAIAdapter()
    ];
  }

  /**
   * Returns adapter selected via settings.
   * Fails explicitly if adapter is invalid or unavailable.
   */
  getActiveAdapter(): AIAdapter {
    const config = vscode.workspace.getConfiguration("vsCodeAI");
    const selectedId = config.get<string>("adapter", "local");

    const adapter = this.adapters.find(a => a.id === selectedId);

    if (!adapter) {
      throw new Error(
        `Selected AI adapter '${selectedId}' is not registered.`
      );
    }

    if (!adapter.isAvailable()) {
      throw new Error(
        `Selected AI adapter '${selectedId}' is not available.`
      );
    }

    return adapter;
  }

  /**
   * Exposed for future diagnostics / listing.
   */
  listAdapters(): readonly AIAdapter[] {
    return this.adapters;
  }
}
