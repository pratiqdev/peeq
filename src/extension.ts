/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { minimatch } from 'minimatch';

const namespace = 'peeq';
const CONFIG_FILE_PATH = `${namespace}.json`;
let cwd = null;
let startBracket = `__________________________________________________ ${namespace} START`;
let endBracket =   `__________________________________________________ ${namespace} END`;

const log = console.log;

type State = {
	rootPath: string | null;
	zones: Record<string, string[]>;
	zone: null | string;
	index: number;
	enabled: boolean;
	defaults: Record<string, any>;
	hasDefaults: boolean;
};

const state:State = {
	zones: {},
	zone: null,
	index: 0,
	enabled: false,
	defaults: {},
	hasDefaults: false,
	rootPath: null
};

//&																														
const popup = (str:string = '', err:boolean = false) => {
	const options = { modal: false };
	err 
		? vscode.window.showErrorMessage(`${namespace}: ` + str, options)
		: vscode.window.showInformationMessage(`${namespace}: ` + str, options);
};

//&																														
const resetExclusionRules = () => {
	try{
	let { get, update } = vscode.workspace.getConfiguration();
	let currentRules:Record<string, boolean> = { ...get("files.exclude")} ?? {};

	if(currentRules && startBracket in currentRules && endBracket in currentRules){
		let keys = Object.keys(currentRules);
		let startIndex = keys.indexOf(startBracket);
		let endIndex = keys.indexOf(endBracket);
		
		// If both startBracket and endBracket are found, remove the keys between them
		if (startIndex !== -1 && endIndex !== -1) {
			for (let i = startIndex + 1; i < endIndex; i++) {
				delete currentRules[keys[i]];
			}
			delete currentRules[startBracket];
			delete currentRules[endBracket];
		}
		// Update configuration with modified currentRules
		update("files.exclude", currentRules, vscode.ConfigurationTarget.Workspace);
		state.defaults = currentRules;
		state.hasDefaults = true;
		return;
	}
	state.defaults = currentRules ?? {};
	state.hasDefaults = true;
	}catch(err){
		log("Error resetting exclusion rules:");
		log(err);
		popup("Error resetting exclusion rules:" + err);
	}

};

//&																														
const setExclusionRules = (rules?:Record<string, boolean>) => {
	try{

		if(rules){
			vscode.workspace.getConfiguration().update('files.exclude', {
				...state.defaults,
				[startBracket]: true,
				...rules,
				"peeq.json":true,
				[endBracket]: true,
				
			});
		}else{
			vscode.workspace.getConfiguration().update('files.exclude', state.defaults);
		}
		
	}catch(err){
		log("Error setting exclusion rules:");
		log(err);
		popup("Error setting exclusion rules:" + err);
	}
};

//&																														
function generateAndSetExcludeRules(): void {
	try{

		if(!state.zone || !state.hasDefaults || !Object.keys(state.zones).length){
			log("Cannot generate exclude rules:", state);
			return;
		}

		// Get the glob patterns for the specified zone
		let globPatterns: string[] = state.zones[state.zone];
		// Initialize exclude rules
		let excludeRules: Record<string, boolean> = {};

		// Get a list of all files and directories in workspace
		let allFilesAndDirs = glob.sync('**', { 
			cwd: state.rootPath!, 
			dot: true,
			mark: true // add a trailing / to directories
		});

		// Function to check if a rule for a file or directory already exists
		function ruleExists(fileOrDir: string): boolean {
			if (fileOrDir.endsWith('/')) {
				let dir = fileOrDir.slice(0, -1);
				while (dir) {
					if (excludeRules[dir + '/**']) {
						return true;
					}
					let index = dir.lastIndexOf('/');
					dir = index >= 0 ? dir.slice(0, index) : '';
				}
			} else {
				let dir = path.dirname(fileOrDir);
				while (dir && dir !== '.') {
					if (excludeRules[dir + '/**']) {
						return true;
					}
					let index = dir.lastIndexOf('/');
					dir = index >= 0 ? dir.slice(0, index) : '';
				}
			}
			return false;
		}


		// Exclude files/directories that do not match any glob pattern in the specified zone
		allFilesAndDirs.forEach((fileOrDir:string) => {
			let isExcluded = !globPatterns.some(pattern => minimatch(fileOrDir, pattern));
			if (isExcluded) {
				if (ruleExists(fileOrDir)) {
					return;
				}
				if (fileOrDir.endsWith('/')) {
					excludeRules[fileOrDir + '**'] = isExcluded;
				} else {
					excludeRules[fileOrDir] = isExcluded;
				}
			}
		});

		setExclusionRules(excludeRules);
	}catch(err){
		log("Error generating exclusion rules:");
		log(err);
		popup(err as string ?? 'Error generating exclusion rules');
	}

}

//&																														
let statusBarItem:vscode.StatusBarItem | null = null;
const toggleColor = () => {
	if(!statusBarItem){ return; }
	statusBarItem.text = state.enabled ? `$(eye) ${state.zone}` : `$(eye-closed) disabled`;
	statusBarItem.tooltip = state.enabled ? "Cycle Next Zone" : `Enable ${namespace} filtering`;
	statusBarItem.command = `${namespace}.nextZone`;
	statusBarItem.color = "yellow";
	statusBarItem.name = `${namespace} Explorer Filter`;
};

//&																														
const refresh = () => {
	try{

		// get the root path
		if(!vscode?.workspace?.workspaceFolders || !vscode.workspace.workspaceFolders[0]?.uri?.fsPath){
			log('No open workspaces or directories...');
			return;
		}
		state.rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		log("Found root path:", state.rootPath);

		let configPath = path.join(state.rootPath, CONFIG_FILE_PATH);
		
		// refresh the config file
		log("Loading config file:", configPath);
		let configFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
		log("config file loaded.");

		if(!configFile || !Object.keys(configFile).length){
			log("No config file found...");
			return;
		}else{
			state.zones = configFile;
			log("Loaded config file");
		}

		if(!state.hasDefaults){
			log(`No defaults set. Set defaults with '${namespace}.defaults' to save the current exclusion rules`);
			return;
		}

		if(!Object.entries(state.zones).length){
			log("No zones defined. Check your 'peeq.json' config file.");
			return;
		}

		if(!state.zone){
			let keys = Object.keys(state.zones);
			if(keys.length){
				log("Setting active zone to first provided zone:", keys[0]);
				state.zone = keys[0];
			}else{
				log("No active zone and no zones available... Check you 'peeq.json' config.");
				return;
			}
		}

		if(state.enabled){
			generateAndSetExcludeRules();
		}else{
			setExclusionRules();
		}
		toggleColor();
		log("------------------------------");
		log(state);
		log("------------------------------");

	}catch(err){
		log("Error refreshing peeq:");
		state.enabled = false;
		toggleColor();
		log(err);
	}

};

//&																																											
export const activate = (context: vscode.ExtensionContext) => {
	try{
	log('Activating...');
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	statusBarItem.show();
	resetExclusionRules();
	
	

	const commands: Record<string, (...args:any[]) => any> = {

		'peeq.enable': () => { 
			log('Enabling...');
			state.enabled = true;
			refresh();


		},
		
		'peeq.disable': () => { 
			log('Disabling...');
			state.enabled = false;
			refresh();
		},

		'peeq.defaults': () => { 
			log('Setting defaults...');
			state.defaults = vscode.workspace.getConfiguration().get('files.exclude') ?? {};
			state.hasDefaults = true;
			refresh();
		},

		'peeq.nextZone': () => { 
			let { index, zones } = state;
		
			let keys = Object.keys(zones);
			log('--- NEXT ZONE --------------------------------');
			log('>> Idx:', index, keys[index]);
		
			if(index === keys.length - 1){
				state.index = -1;
				state.enabled = false;
				refresh();
				log('>> Idx reached end of zones - turning off peeq');
			}else{
				index++;
				state.enabled = true;
				state.zone = keys[index];
				state.index = index;
				refresh();
				log('>> new Idx:', index, keys[index]);
		
			}
		
		},

		'peeq.zone': () => {
			// load the zones again if the peeq fille has changed
			let zoneKeys = Object.keys(state.zones);
		
			vscode.window.showQuickPick(zoneKeys).then(selected => {
				log(selected);
				state.zone = selected ?? null;
				state.index = Object.keys(state.zones).indexOf(selected as string) || 0;
				state.enabled = true;
				refresh();
			});
		},

	};



	let registered:string[] = [];

	Object.entries(commands).forEach(([name, cb]) => {
		let disposable = vscode.commands.registerCommand(name, cb);
		context.subscriptions.push(disposable);
		registered.push(name);
	});
	popup(`Registered commands:` + registered.join(', '));

	popup("peeq activated.");
	}catch(err){
		log('Error activating extension:');
		log(err);
		popup('Error activating peeq:' + err);
	}

};

// This method is called when your extension is deactivated
export const deactivate = () => {
	log('Deactivating...');
	state.enabled = false;
};