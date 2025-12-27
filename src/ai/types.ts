/* =========================================================
   AI SHARED TYPES
   ---------------------------------------------------------
   Pure data structures shared between AI providers
   and the extension.
   No logic. No side effects.
   ========================================================= */

export type ExplainInput = {
  code: string;        // Selected source code
  languageId: string;  // VS Code language identifier
};

export type ExplainOutput = {
  summary: string;     // Short explanation summary
  details: string;     // Detailed explanation text
};
