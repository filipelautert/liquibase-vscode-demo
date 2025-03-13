// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { checkLicenseKey, licenseValidated, prerequisites } from './settings';

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {

	prerequisites(context).then(configured => {
		if (!configured) {
			return;
		}
		checkLicenseKey(context);

	});

	// The command has been defined in the package.json file
	const disposable = vscode.commands.registerCommand('liquibase-vscode-demo.update', () => {
		if (licenseValidated) {
			vscode.window.showInformationMessage('Running liquibase update command...');
		} else {
			vscode.window.showErrorMessage('Liquibase license validation failed!');
		}

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

