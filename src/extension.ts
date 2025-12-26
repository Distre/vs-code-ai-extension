import * as vscode from "vscode";

/**
 * AI-kontrakt (uendret)
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
 * Adapter-kontrakt: kapsler hvordan vi får en AIExplainer
 * (lokal stub nå, ekte AI senere).
 */
interface AIAdapter {
  getExplainer(): AIExplainer;
}

/**
 * Lokal adapter (ingen nett, deterministisk).
 */
class LocalAIAdapter implements AIAdapter {
  getExplainer(): AIExplainer {
    return new LocalExplainerStub();
  }
}

/**
 * Lokal, deterministisk stub (samme som før, men bak adapter).
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

export function activate(context: vscode.ExtensionContext) {
  // 🔒 Ett eksplisitt valgpunkt for AI-kilde (kun lokal nå)
  const adapter: AIAdapter = new LocalAIAdapter();
  const explainer: AIExplainer = adapter.getExplainer();

  const startDisposable = vscode.commands.registerCommand(
    "vsCodeAI.start",
    () => {
      vscode.window.showInformationMessage(
        "VS Code AI er aktivert (ingen handling utført)."
      );
    }
  );

  const explainDisposable = vscode.commands.registerCommand(
    "vsCodeAI.explainSelection",
    async () => {
      const selectedText = getSelectedText();
      if (!selectedText) {
        return;
      }

      const editor = vscode.window.activeTextEditor!;
      const input: ExplainInput = {
        code: selectedText,
        languageId: editor.document.languageId
      };

      // Stopp-punkt: kun adapter → kontrakt
      const result = await explainer.explain(input);
      presentExplanation(selectedText, result);
    }
  );

  context.subscriptions.push(startDisposable);
  context.subscriptions.push(explainDisposable);
}

function getSelectedText(): string | null {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showWarningMessage("Ingen aktiv editor.");
    return null;
  }

  const selection = editor.selection;

  if (selection.isEmpty) {
    vscode.window.showWarningMessage("Ingen kode er valgt.");
    return null;
  }

  return editor.document.getText(selection);
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
