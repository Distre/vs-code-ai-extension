import * as vscode from "vscode";

/**
 * AI-kontrakt
 */
interface AIExplainer {
  explain(input: ExplainInput): Promise<ExplainOutput>;
}

type ExplainInput = {
  code: string;
  languageId: string;
};

type ExplainOutput = {
  summary: string;
  details: string;
};

/**
 * Adapter-kontrakt
 */
interface AIAdapter {
  getExplainer(): AIExplainer;
}

/**
 * Lokal adapter (ingen nett)
 */
class LocalAIAdapter implements AIAdapter {
  getExplainer(): AIExplainer {
    return new LocalExplainerStub();
  }
}

/**
 * Lokal, deterministisk stub
 */
class LocalExplainerStub implements AIExplainer {
  async explain(input: ExplainInput): Promise<ExplainOutput> {
    const lines = input.code.split(/\r?\n/).length;
    const chars = input.code.length;

    return {
      summary: "Foreløpig lokal forklaring (ingen AI).",
      details: [
        `Språk: ${input.languageId}`,
        `Linjer: ${lines}`,
        `Tegn: ${chars}`
      ].join("\n")
    };
  }
}

/**
 * Timeout-hjelper (fail-safe)
 */
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

/**
 * Lokal logg (Output Channel)
 */
class LocalLogger {
  private channel = vscode.window.createOutputChannel("VS Code AI – Logg");

  info(message: string) {
    this.channel.appendLine(`[INFO] ${new Date().toISOString()} ${message}`);
  }

  warn(message: string) {
    this.channel.appendLine(`[WARN] ${new Date().toISOString()} ${message}`);
  }

  show() {
    this.channel.show(true);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const logger = new LocalLogger();
  const adapter: AIAdapter = new LocalAIAdapter();
  const explainer: AIExplainer = adapter.getExplainer();

  logger.info("Utvidelsen aktivert.");

  const startDisposable = vscode.commands.registerCommand(
    "vsCodeAI.start",
    () => {
      logger.info("Start-kommando kjørt.");
      vscode.window.showInformationMessage(
        "VS Code AI er aktivert (ingen handling utført)."
      );
    }
  );

  const explainDisposable = vscode.commands.registerCommand(
    "vsCodeAI.explainSelection",
    async () => {
      logger.info("Forklar valgt kode: kommando startet.");

      const selectedText = getSelectedText(logger);
      if (!selectedText) return;

      const consent = await vscode.window.showInformationMessage(
        "Vil du lage en forklaring av valgt kode?",
        { modal: true },
        "Ja",
        "Nei"
      );

      if (consent !== "Ja") {
        logger.info("Bruker avbrøt forklaring.");
        return;
      }

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
            logger.warn("Forklaring stoppet pga. timeout.");
            vscode.window.showWarningMessage(
              "Forklaringen tok for lang tid og ble stoppet."
            );
          }
        );

        logger.info("Forklaring fullført.");
        presentExplanation(selectedText, result);
      } catch {
        logger.warn("Forklaring avbrutt.");
        return;
      }
    }
  );

  context.subscriptions.push(startDisposable, explainDisposable);
}

function getSelectedText(logger: LocalLogger): string | null {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    logger.warn("Ingen aktiv editor.");
    vscode.window.showWarningMessage("Ingen aktiv editor.");
    return null;
  }

  if (editor.selection.isEmpty) {
    logger.warn("Ingen kode valgt.");
    vscode.window.showWarningMessage("Ingen kode er valgt.");
    return null;
  }

  return editor.document.getText(editor.selection);
}

function presentExplanation(code: string, result: ExplainOutput): void {
  const output = vscode.window.createOutputChannel("VS Code AI – Forklaring");
  output.clear();
  output.appendLine("=== Forklaring ===");
  output.appendLine(result.summary);
  output.appendLine("");
  output.appendLine(result.details);
  output.appendLine("");
  output.appendLine("=== Valgt kode ===");
  output.appendLine("");
  output.appendLine(code);
  output.show(true);
}

export function deactivate() {}
