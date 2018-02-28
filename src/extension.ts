'use strict';
import * as vscode from 'vscode';
import { connect } from 'net';

export function activate(context: vscode.ExtensionContext) {

    console.log('extension "spaces-inside-braces" is now active');

    let spacer = new Spacer();
    let controller = new SpacerController(spacer);

    context.subscriptions.push(controller);
    context.subscriptions.push(spacer);
}

export function deactivate() {}

// don't use this for large a and b
function zip(a: any[], b: any[]) {
    let result = [];
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        result.push([a[i], b[i]]);
    }
    return result;
}

class Spacer {

    public shouldSpace(openers: String[], closers: String[], position: vscode.Position): boolean {
        const line = vscode.window.activeTextEditor.document.lineAt(position.line).text;
        // two characters before cursor
        const textBefore = line.slice(Math.max(position.character - 1, 0), position.character + 1);
        // one chrarcter after cursor
        const textAfter = line.slice(position.character + 1, position.character + 2);
        for (let [open, close] of zip(openers, closers)) {
            if (textBefore === `${open} ` && textAfter === close) {
                return true;
            }
        }
        return false;
    }

    public space() {
        const editor = vscode.window.activeTextEditor;
        editor.edit(edit => {
            editor.selections.forEach(selection => {
                const position = selection.active;
                // add the space
                edit.replace(new vscode.Range(position.line, position.character + 1, position.line, position.character + 1), " ");
            });
        }, {undoStopBefore: false, undoStopAfter: false});
        // move cursors
        editor.selections = editor.selections.map(selection => {
            const position = selection.active;
            const newPosition = new vscode.Position(position.line, position.character + 1);
            const newSelection = new vscode.Selection(newPosition, newPosition);
            return newSelection;
        });
    }

    public shouldUnspace(openers: String[], closers: String[], position: vscode.Position): boolean {
        const line = vscode.window.activeTextEditor.document.lineAt(position.line).text;
        // one character before cursor
        const textBefore = line.slice(Math.max(position.character - 2, 0), Math.max(position.character - 1, 0));
        // two characters after cursor
        const textAfter = line.slice(Math.max(position.character - 1, 0), position.character + 1);
        for (let [open, close] of zip(openers, closers)) {
            if (textBefore === open && textAfter === ` ${close}`) {
                return true;
            }
        }
        return false;
    }

    public unspace() {
        const editor = vscode.window.activeTextEditor;
        // remove the extra space
        editor.edit(edit => {
            editor.selections.forEach(selection => {
                const position = selection.active;
                edit.replace(new vscode.Range(position.line, position.character - 1, position.line, position.character), "");
            });
        }, {undoStopBefore: false, undoStopAfter: false});

        // move the cursors
        editor.selections = editor.selections.map(selection => {
            const position = selection.active;
            const newPosition = new vscode.Position(position.line, position.character - 1);
            const newSelection = new vscode.Selection(newPosition, newPosition);
            return newSelection;
        })
    }

    dispose() {}
}

class SpacerController {

    private _spacer: Spacer;
    private _disposable: vscode.Disposable;
    private _config: vscode.WorkspaceConfiguration;
    private _openers: String[];
    private _closers: String[];

    constructor(spacer: Spacer) {
        this._spacer = spacer;

        let subscriptions: vscode.Disposable[] = [];
        vscode.workspace.onDidChangeTextDocument(this._onDidChangeTextDocument, this, subscriptions);
        vscode.workspace.onDidChangeConfiguration(this._onDidChangeConfiguration, this, subscriptions);
        this._onDidChangeConfiguration();

        this._disposable = vscode.Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _considerSpacing() {
        const editor = vscode.window.activeTextEditor;
        if (editor.selections.every(selection => { return this._spacer.shouldSpace(this._openers, this._closers, selection.active); })) {
            this._spacer.space();
        } else if (editor.selections.every(selection => { return this._spacer.shouldUnspace(this._openers, this._closers, selection.active); })) {
            this._spacer.unspace();
        }
    }

    private _onDidChangeTextDocument() {
        if (this._config.get("enable", true) && vscode.window.activeTextEditor) {
            this._considerSpacing();
        }
    }

    private _onDidChangeConfiguration() {
        this._config = vscode.workspace.getConfiguration("spaces-inside-braces");
        this._openers = [];
        this._closers = [];
        if (this._config.get("enableForBraces", true)) {
            this._openers.push("{");
            this._closers.push("}");
        }
        if (this._config.get("enableForParens", true)) {
            this._openers.push("(");
            this._closers.push(")");
        }
        if (this._config.get("enableForBrackets", true)) {
            this._openers.push("[");
            this._closers.push("]");
        }
        if (this._config.get("enableForAngle", true)) {
            this._openers.push("<");
            this._closers.push(">");
        }
    }
}
