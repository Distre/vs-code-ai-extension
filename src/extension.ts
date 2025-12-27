import * as vscode from "vscode";
import { AIAdapter, AIExplainer } from "./ai/provider";
import { AIAdapterRegistry } from "./ai/registry";

/* =========================================================
   TIMEOUT / FAIL-SAFE HELPER
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
   ========================================================= */

export function activate(context: vscode.ExtensionContext) {
  const logger = new LocalLogger();
  const status = new StatusIndicator();

  const registry = new AIAdapterRegistry();
  const adapter: AIAdapter = registry.getActiveAdapter();
  const explainer: AIExplainer = adapter.getExplainer();

  logger.info(`Extension activated. Using adapter: ${adapter.id}`);
  status.set("Ready");

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

  const explainSelectionDisposable = vscode.commands.registerCommand(
    "vsCodeAI.explainSelection",
    async () => {
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

      const selectedText = getSelectedText(logger);
      if (!selectedText) {
        status.set("Cancelled");
        return;
      }

      const consent = await vscode.window.showInformationMessage(
        "Do you want to explain the selected code?",
        { modal: true },
        "Yes",
        "No"
      );

      if (consent !== "Yes") {
        status.set("Cancelled");
        return;
      }

      status.set("Explaining");

      const editor = vscode.window.activeTextEditor!;
      const language = editor.document.languageId;

      try {
        const result = await withTimeout(
          explainer.explain(selectedText, { language }),
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
        status.set("Completed");
      } catch {
        status.set("Cancelled");
      }
    }
  );

  // =====================================================
  // NEW COMMAND – EXPLAIN ACTIVE FILE
  // =====================================================

  const explainActiveFileDisposable = vscode.commands.registerCommand(
    "vsCodeAI.explainActiveFile",
    async () => {
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

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        logger.warn("No active editor.");
        status.set("Cancelled");
        vscode.window.showWarningMessage("No active editor.");
        return;
      }

      const consent = await vscode.window.showInformationMessage(
        "Do you want to explain the active file?",
        { modal: true },
        "Yes",
        "No"
      );

      if (consent !== "Yes") {
        status.set("Cancelled");
        return;
      }

      status.set("Explaining");

      const document = editor.document;
      const text = document.getText();
      const language = document.languageId;

      try {
        const result = await withTimeout(
          explainer.explain(text, { language }),
          2000,
          () => {
            logger.warn("Explanation timed out.");
            status.set("Cancelled");
            vscode.window.showWarningMessage(
              "Explanation took too long and was stopped."
            );
          }
        );

        presentExplanation(text, result);
        status.set("Completed");
      } catch {
        status.set("Cancelled");
      }
    }
  );

  context.subscriptions.push(
    startDisposable,
    explainSelectionDisposable,
    explainActiveFileDisposable,
    status
  );
}

/* =========================================================
   HELPERS
   ========================================================= */

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

function presentExplanation(code: string, result: string): void {
  const output = vscode.window.createOutputChannel("VS Code AI – Explanation");
  output.clear();
  output.appendLine("=== Explanation ===");
  output.appendLine(result);
  output.appendLine("");
  output.appendLine("=== Code ===");
  output.appendLine("");
  output.appendLine(code);
  output.show(true);
}

/* =========================================================
   DEACTIVATION
   ========================================================= */

export function deactivate() {}
