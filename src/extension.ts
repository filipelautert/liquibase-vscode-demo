// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { checkLicenseKey, prerequisites } from './settings';

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
	vscode.workspace.getConfiguration().update("liquibase.validated", false);

	prerequisites(context).then(configured => {
		if (!configured) {
			return;
		}
		checkLicenseKey();

	});

	// The command has been defined in the package.json file
	const disposable = vscode.commands.registerCommand('liquibase-license-demo.update', () => {
		if (vscode.workspace.getConfiguration().get("liquibase.validated")) {
			vscode.window.showInformationMessage('Running liquibase update command...');
		} else {
			vscode.window.showErrorMessage('Liquibase license validation failed!');
		}

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

