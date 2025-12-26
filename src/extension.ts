import * as vscode from "vscode";

/* =========================================================
   AI CONTRACT
   ---------------------------------------------------------
   Defines how an AI explainer must behave.
   No implementation details here.
   ========================================================= */

interface AIExplainer {
  explain(input: ExplainInput): Promise<ExplainOutput>;
}

/* =========================================================
   DATA TYPES
   ---------------------------------------------------------
   Input and output structures for explanations.
   ========================================================= */

type ExplainInput = {
  code: string;        // Selected source code
  languageId: string;  // VS Code language identifier
};

type ExplainOutput = {
  summary: string;     // Short explanation summary
  details: string;     // Detailed explanation text
};

/* =========================================================
   AI ADAPTER CONTRACT
   ---------------------------------------------------------
   Decouples "where AI comes from" from "how it is used".
   ========================================================= */

interface AIAdapter {
  getExplainer(): AIExplainer;
}

/* =========================================================
   LOCAL AI ADAPTER
   ---------------------------------------------------------
   Returns a local stub instead of real AI.
   No network access.
   ========================================================= */

class LocalAIAdapter implements AIAdapter {
  getExplainer(): AIExplainer {
    return new LocalExplainerStub();
  }
}

/* =========================================================
   LOCAL EXPLAINER STUB
   ---------------------------------------------------------
   Deterministic, offline placeholder.
   Used until real AI is connected.
   ========================================================= */

class LocalExplainerStub implements AIExplainer {
  async explain(input: ExplainInput): Promise<ExplainOutput> {
    const lines = input.code.split(/\r?\n/).length;
    const chars = input.code.length;

    return {
      summary: "Local placeholder explanation (no AI used).",
      details: [
        `Language: ${input.languageId}`,
        `Lines: ${lines}`,
        `Characters: ${chars}`
      ].join("\n")
    };
  }
}

/* =========================================================
   TIMEOUT / FAIL-SAFE HELPER
   ---------------------------------------------------------
   Ensures explanation calls can never hang.
   ========================================================= */

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  onTimeout: () => void
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      onTimeout();
      reject(new Error("TIMEOUT"));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/* =========================================================
   LOCAL LOGGER
   ---------------------------------------------------------
   Logs events to a VS Code Output Channel.
   No file or network logging.
   ========================================================= */

class LocalLogger {
  private channel = vscode.window.createOutputChannel("VS Code AI – Log");

  info(message: string) {
    this.channel.appendLine(`[INFO] ${new Date().toISOString()} ${message}`);
  }

  warn(message: string) {
    this.channel.appendLine(`[WARN] ${new Date().toISOString()} ${message}`);
  }
}

/* =========================================================
   STATUS BAR INDICATOR
   ---------------------------------------------------------
   Gives the user clear feedback about current state.
   ========================================================= */

class StatusIndicator {
  private item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );

  constructor() {
    this.item.text = "VS Code AI: Ready";
    this.item.show();
  }

  set(text: string) {
    this.item.text = `VS Code AI: ${text}`;
  }

  dispose() {
    this.item.dispose();
  }
}

/* =========================================================
   EXTENSION ACTIVATION
   ---------------------------------------------------------
   Entry point for the VS Code extension.
   ========================================================= */

export function activate(context: vscode.ExtensionContext) {
  const logger = new LocalLogger();
  const status = new StatusIndicator();

  const adapter: AIAdapter = new LocalAIAdapter();
  const explainer: AIExplainer = adapter.getExplainer();

  logger.info("Extension activated.");
  status.set("Ready");

  /* -------------------------
     Start command
     ------------------------- */
  const startDisposable = vscode.commands.registerCommand(
    "vsCodeAI.start",
    () => {
      logger.info("Start command executed.");
      status.set("Ready");
      vscode.window.showInformationMessage(
        "VS Code AI is active (no action performed)."
      );
    }
  );

  /* -------------------------
     Explain selected code
     ------------------------- */
  const explainDisposable = vscode.commands.registerCommand(
    "vsCodeAI.explainSelection",
    async () => {

      // Global ON/OFF switch from settings
      const enabled = vscode.workspace
        .getConfiguration("vsCodeAI")
        .get<boolean>("enableAI", false);

      if (!enabled) {
        logger.warn("AI is disabled in settings.");
        status.set("Cancelled");
        vscode.window.showWarningMessage(
          "AI is disabled. Enable it in VS Code AI settings."
        );
        return;
      }

      logger.info("Explanation started.");
      status.set("Waiting for consent");

      const selectedText = getSelectedText(logger);
      if (!selectedText) {
        status.set("Cancelled");
        return;
      }

      // Explicit user consent
      const consent = await vscode.window.showInformationMessage(
        "Do you want to explain the selected code?",
        { modal: true },
        "Yes",
        "No"
      );

      if (consent !== "Yes") {
        logger.info("User cancelled explanation.");
        status.set("Cancelled");
        return;
      }

      status.set("Explaining");

      const editor = vscode.window.activeTextEditor!;
      const input: ExplainInput = {
        code: selectedText,
        languageId: editor.document.languageId
      };

      try {
        const result = await withTimeout(
          explainer.explain(input),
          2000,
          () => {
            logger.warn("Explanation timed out.");
            status.set("Cancelled");
            vscode.window.showWarningMessage(
              "Explanation took too long and was stopped."
            );
          }
        );

        presentExplanation(selectedText, result);
        logger.info("Explanation completed.");
        status.set("Completed");
      } catch {
        logger.warn("Explanation aborted.");
        status.set("Cancelled");
      }
    }
  );

  context.subscriptions.push(startDisposable, explainDisposable, status);
}

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * Reads the currently selected text from the active editor.
 */
function getSelectedText(logger: LocalLogger): string | null {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    logger.warn("No active editor.");
    vscode.window.showWarningMessage("No active editor.");
    return null;
  }

  if (editor.selection.isEmpty) {
    logger.warn("No code selected.");
    vscode.window.showWarningMessage("No code selected.");
    return null;
  }

  return editor.document.getText(editor.selection);
}

/**
 * Presents the explanation in a dedicated Output Channel.
 */
function presentExplanation(code: string, result: ExplainOutput): void {
  const output = vscode.window.createOutputChannel("VS Code AI – Explanation");
  output.clear();
  output.appendLine("=== Explanation ===");
  output.appendLine(result.summary);
  output.appendLine("");
  output.appendLine(result.details);
  output.appendLine("");
  output.appendLine("=== Selected Code ===");
  output.appendLine("");
  output.appendLine(code);
  output.show(true);
}

/* =========================================================
   DEACTIVATION
   ========================================================= */

export function deactivate() {}
