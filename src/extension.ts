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

      presentText(selectedText);
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

function presentText(text: string): void {
  const output = vscode.window.createOutputChannel("VS Code AI – Forklaring");
  output.clear();
  output.appendLine("=== Valgt kode ===");
  output.appendLine("");
  output.appendLine(text);
  output.appendLine("");
  output.appendLine(`(${text.length} tegn)`);
  output.show(true);
}

export function deactivate() {}
