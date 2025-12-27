import { AIAdapter, AIExplainer } from "./provider";

/* =========================================================
   LOCAL AI ADAPTER
   ---------------------------------------------------------
   Deterministic, offline implementation.
   No network access.
   ========================================================= */

export class LocalAIAdapter implements AIAdapter {
  readonly id = "local";

  isAvailable(): boolean {
    return true;
  }

  getExplainer(): AIExplainer {
    return new LocalExplainerStub();
  }
}

/* =========================================================
   LOCAL EXPLAINER STUB
   ---------------------------------------------------------
   Placeholder explainer.
   ========================================================= */

class LocalExplainerStub implements AIExplainer {
  async explain(
    input: string,
    options?: { maxLength?: number; language?: string }
  ): Promise<string> {
    const lines = input.split(/\r?\n/).length;
    const chars = input.length;

    return [
      "Local placeholder explanation (no AI used).",
      options?.language ? `Language: ${options.language}` : undefined,
      `Lines: ${lines}`,
      `Characters: ${chars}`
    ]
      .filter(Boolean)
      .join("\n");
  }
}
