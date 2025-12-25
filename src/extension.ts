import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "vsCodeAI.start",
    () => {
      vscode.window.showInformationMessage(
        "VS Code AI er aktivert (ingen handling utført)."
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
