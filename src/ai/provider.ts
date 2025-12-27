// src/ai/provider.ts

/* =========================================================
   AI CONTRACT
   ---------------------------------------------------------
   Defines how an AI explainer must behave.
   ========================================================= */

export interface AIExplainer {
  explain(
    input: string,
    options?: {
      maxLength?: number;
      language?: string;
    }
  ): Promise<string>;
}

/* =========================================================
   AI ADAPTER CONTRACT
   ---------------------------------------------------------
   Decouples "where AI comes from" from "how it is used".
   ========================================================= */

export interface AIAdapter {
  readonly id: string;
  isAvailable(): boolean;
  getExplainer(): AIExplainer;
}
