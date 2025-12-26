import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
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
    () => {
      const selectedText = getSelectedText();
      if (!selectedText) {
        return;
      }

      const explanation = explainText(selectedText);
      presentExplanation(selectedText, explanation);
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

/**
 * Placeholder for forklaringslogikk.
 * Ingen AI. Ingen nett. Deterministisk.
 */
function explainText(text: string): string {
  const lines = text.split(/\r?\n/).length;
  const chars = text.length;

  return [
    "Dette er en foreløpig, lokal forklaring.",
    "Ingen AI er brukt.",
    `Antall linjer: ${lines}`,
    `Antall tegn: ${chars}`
  ].join("\n");
}

function presentExplanation(code: string, explanation: string): void {
  const output = vscode.window.createOutputChannel("VS Code AI – Forklaring");
  output.clear();
  output.appendLine("=== Forklaring ===");
  output.appendLine(explanation);
  output.appendLine("");
  output.appendLine("=== Valgt kode ===");
  output.appendLine("");
  output.appendLine(code);
  output.show(true);
}

export function deactivate() {}
