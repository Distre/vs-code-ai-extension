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
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showWarningMessage("Ingen aktiv editor.");
        return;
      }

      const selection = editor.selection;

      if (selection.isEmpty) {
        vscode.window.showWarningMessage("Ingen kode er valgt.");
        return;
      }

      const selectedText = editor.document.getText(selection);

      const output = vscode.window.createOutputChannel("VS Code AI – Forklaring");
      output.clear();
      output.appendLine("=== Valgt kode ===");
      output.appendLine("");
      output.appendLine(selectedText);
      output.appendLine("");
      output.appendLine(`(${selectedText.length} tegn)`);
      output.show(true);
    }
  );

  context.subscriptions.push(startDisposable);
  context.subscriptions.push(explainDisposable);
}

export function deactivate() {}
