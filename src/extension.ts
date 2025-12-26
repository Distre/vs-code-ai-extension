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

export function activate(context: vscode.ExtensionContext) {
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
      if (!selectedText) return;

      const consent = await vscode.window.showInformationMessage(
        "Vil du lage en forklaring av valgt kode?",
        { modal: true },
        "Ja",
        "Nei"
      );

      if (consent !== "Ja") {
        return; // 🔒 eksplisitt stopp
      }

      const editor = vscode.window.activeTextEditor!;
      const input: ExplainInput = {
        code: selectedText,
        languageId: editor.document.languageId
      };

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
  if (editor.selection.isEmpty) {
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
