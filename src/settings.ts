import { log } from 'console';
import * as vscode from 'vscode';

export let licenseValidated = false;


export async function prerequisites(context: vscode.ExtensionContext): Promise<boolean> {

	const config = vscode.workspace.getConfiguration();
	return (findAndCheckSetting(config, "liquibase.home", "LIQUIBASE_HOME")
			&& 
			findAndCheckSetting(config, "liquibase.javahome", "JAVA_HOME")
			&& 
			findAndCheckSetting(config, "liquibase.licensekey", "LIQUIBASE_LICENSE_KEY"));
}

export function findAndCheckSetting(config:vscode.WorkspaceConfiguration, key:string, env:string):boolean {
	let property: string | undefined = config.get(key);

	if (!property || property === "") {
		property = process.env[env];
		if (property) {
			config.update(key, property, true);
		}
	}

	if (property && property !== "") {
		return true;
	} else {
		vscode.window.showErrorMessage("You need to define `" + key + "` in VSCode settings.");
		vscode.commands.executeCommand( 'workbench.action.openSettings', key);
		return false;
	}
}

export function checkLicenseKey(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration();
		const liquibaseHome = config.get("liquibase.home");
		const javaHome = config.get("liquibase.javahome");
		const license =  config.get("liquibase.licensekey");

		vscode.window.showInformationMessage("Using liquibase " + liquibaseHome + " with java " + javaHome);
		
		const command = javaHome + "/bin/java -Dliquibase.home=" + liquibaseHome + 
				" -jar " + liquibaseHome + "/internal/lib/liquibase-core.jar --classpath=" + context.extensionPath 
                + "/liquibase-license-checker-1.0.0-SNAPSHOT.jar " +
				"--license-key=" + license + " licenseCheck";

		const cp = require('child_process');
		cp.exec(command, (err:any, stdout:string, stderr:string) => {
			if (err && err.code !== 0) {
                log(err.message);
				if (err.message.indexOf("requires a valid Liquibase Pro") !== -1) {
					vscode.window.showErrorMessage("Please provide a valid license and restart the extension. ");
					vscode.commands.executeCommand('workbench.action.openSettings', "liquibase.licensekey");
					return;
				} else {
					vscode.window.showErrorMessage("Unknown error executing Liquibase. Please check log outputs and fix it.");
				}
			}

			const idx = stderr.indexOf("Liquibase licensed to");
			if (idx !== -1) {
				vscode.window.showInformationMessage(stderr.substring(idx, stderr.indexOf("Liquibase command")));
                licenseValidated = true;
			}
		});
}
  
