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

export function deactivate() {
}

function getPosition(): vscode.Position {
    return vscode.window.activeTextEditor.selection.active;
}

class Spacer {

    public shouldSpace(open: string, close: string, line: string): boolean {
        const position = getPosition();

        // two characters before cursor
        const textBefore = line.slice(Math.max(position.character - 1, 0), position.character + 1);
        // one chrarcter after cursor
        const textAfter = line.slice(position.character + 1, position.character + 2);

        return textBefore === `${open} ` && textAfter === close;
    }

    public space() {
        const editor = vscode.window.activeTextEditor;
        const position = getPosition();

        // add the space
        editor.edit(function (edit) {
            edit.replace(new vscode.Range(position.line, position.character + 1, position.line, position.character + 1), " ");
        }, {undoStopBefore: false, undoStopAfter: false});

        // move the cursor to the center
        const newPosition = new vscode.Position(position.line, position.character + 1);
        const newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection;
    }

    public shouldUnspace(open: string, close: string, line: string): boolean {
        const editor = vscode.window.activeTextEditor;
        const position = getPosition();

        // one character before cursor
        const textBefore = line.slice(Math.max(position.character - 2, 0), Math.max(position.character - 1, 0));
        // two characters after cursor
        const textAfter = line.slice(Math.max(position.character - 1, 0), position.character + 1);

        return textBefore === open && textAfter === ` ${close}`;
    }

    public unspace() {
        const editor = vscode.window.activeTextEditor;
        const position = getPosition();

        // remove the extra space
        editor.edit(function (edit) {
            edit.replace(new vscode.Range(position.line, position.character - 1, position.line, position.character), "");
        }, {undoStopBefore: false, undoStopAfter: false});

        // move the cursor to the center
        const newPosition = new vscode.Position(position.line, position.character - 1);
        const newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection
    }

    dispose() {

    }
}

class SpacerController {

    private _spacer: Spacer;
    private _disposable: vscode.Disposable;
    private _config: vscode.WorkspaceConfiguration;

    constructor(spacer: Spacer) {
        this._spacer = spacer;

        let subscriptions: vscode.Disposable[] = [];
        vscode.workspace.onDidChangeTextDocument(this._onDidChangeTextDocument, this, subscriptions);
        vscode.workspace.onDidChangeConfiguration(this._onDidChangeConfiguration, this, subscriptions);
        this._config = vscode.workspace.getConfiguration("spaces-inside-braces");

        this._disposable = vscode.Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _considerSpacingFor(open: string, close: string, line: string) {
        if (this._spacer.shouldSpace(open, close, line)) {
            this._spacer.space();
        } else if (this._spacer.shouldUnspace(open, close, line)) {
            this._spacer.unspace();
        }
    }

    private _onDidChangeTextDocument() {
        if (this._config.get("enable", true)) {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !editor.selection.isEmpty) {
                return;
            }

            const position = editor.selection.active;
            const line = editor.document.lineAt(position.line).text;

            if (this._config.get("enableForBraces", true)) {
                this._considerSpacingFor("{", "}", line);
            }
            if (this._config.get("enableForParens", true)) {
                this._considerSpacingFor("(", ")", line);
            }
            if (this._config.get("enableForBrackets", true)) {
                this._considerSpacingFor("[", "]", line);
            }
            if (this._config.get("enableForAngle", true)) {
                this._considerSpacingFor("<", ">", line);
            }
        }
    }

    private _onDidChangeConfiguration() {
        this._config = vscode.workspace.getConfiguration("spaces-inside-braces");
    }
}
