import { AIAdapter } from "./provider";
import { LocalAIAdapter } from "./localProvider";

/* =========================================================
   AI ADAPTER REGISTRY
   ---------------------------------------------------------
   Central, explicit registration of available adapters.
   No logic outside selection.
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
   * Returns the first available adapter.
   * Deterministic selection order.
   */
  getActiveAdapter(): AIAdapter {
    const adapter = this.adapters.find(a => a.isAvailable());

    if (!adapter) {
      throw new Error("No available AI adapter found.");
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
