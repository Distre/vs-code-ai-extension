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
      vscode.window.showInformationMessage(
        "Forklaring er ikke implementert ennå."
      );
    }
  );

  context.subscriptions.push(startDisposable);
  context.subscriptions.push(explainDisposable);
}

export function deactivate() {}
