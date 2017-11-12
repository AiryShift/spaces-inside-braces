'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('extension "spaces-inside-braces" is now active');

    let braceSpacer = new BraceSpacer();
    let controller = new BraceSpacerController(braceSpacer);

    context.subscriptions.push(controller);
    context.subscriptions.push(braceSpacer);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class BraceSpacer {

    public shouldSpace(): boolean {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.selection.isEmpty) {
            return;
        }

        const position = editor.selection.active;

        const positionBeforeStart = new vscode.Position(position.line, position.character - 1);
        const positionBeforeEnd = new vscode.Position(position.line, position.character + 1);
        const positionAfterStart = new vscode.Position(position.line, position.character + 1);
        const positionAfterEnd = new vscode.Position(position.line, position.character + 2);

        // two characters before the cursor's position after inserting the new character
        const textBefore = editor.document.getText(new vscode.Range(positionBeforeStart, positionBeforeEnd));
        // one chrarcter after the cursor's position after inserting the new character
        const textAfter = editor.document.getText(new vscode.Range(positionAfterStart, positionAfterEnd));

        return textBefore === "{ " && textAfter === "}";
    }

    public spaceBraces() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.selection.isEmpty) {
            return;
        }

        const position = editor.selection.active;

        // add the space
        const workspaceEdit = new vscode.WorkspaceEdit();
        const edit = new vscode.TextEdit(new vscode.Range(position.line, position.character + 1, position.line, position.character + 2), " }");
        workspaceEdit.set(editor.document.uri, [edit]);
        vscode.workspace.applyEdit(workspaceEdit);

        // move the cursor to the center
        const newPosition = new vscode.Position(position.line, position.character + 1);
        const newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection;
    }

    public shouldUnspace(): boolean {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.selection.isEmpty) {
            return;
        }

        const position = editor.selection.active;

        const positionBeforeStart = new vscode.Position(position.line, position.character - 2);
        const positionBeforeEnd = new vscode.Position(position.line, position.character - 1);
        const positionAfterStart = new vscode.Position(position.line, position.character - 1);
        const positionAfterEnd = new vscode.Position(position.line, position.character + 1);

        const textBefore = editor.document.getText(new vscode.Range(positionBeforeStart, positionBeforeEnd));
        const textAfter = editor.document.getText(new vscode.Range(positionAfterStart, positionAfterEnd));

        return textBefore == "{" && textAfter == " }";
    }

    public unspaceBraces() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.selection.isEmpty) {
            return;
        }

        const position = editor.selection.active;

        // remove the extra space
        const workspaceEdit = new vscode.WorkspaceEdit();
        const edit = new vscode.TextEdit(new vscode.Range(position.line, position.character - 1, position.line, position.character + 1), "}");
        workspaceEdit.set(editor.document.uri, [edit]);
        vscode.workspace.applyEdit(workspaceEdit);

        // move the cursor to the center
        const newPosition = new vscode.Position(position.line, position.character - 1);
        const newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection
    }

    dispose() {

    }
}

class BraceSpacerController {

    private _braceSpacer: BraceSpacer;
    private _disposable: vscode.Disposable;
    private _config: vscode.WorkspaceConfiguration;

    constructor(braceSpacer: BraceSpacer) {
        this._braceSpacer = braceSpacer;

        let subscriptions: vscode.Disposable[] = [];
        vscode.workspace.onDidChangeTextDocument(this._onDidChangeTextDocument, this, subscriptions);
        vscode.workspace.onDidChangeConfiguration(this._onDidChangeConfiguration, this, subscriptions);
        this._config = vscode.workspace.getConfiguration();

        this._disposable = vscode.Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onDidChangeTextDocument() {
        if (this._config.get("spaces-inside-braces.enable", true)) {
            if (this._braceSpacer.shouldSpace()) {
                this._braceSpacer.spaceBraces();
            } else if (this._braceSpacer.shouldUnspace()) {
                this._braceSpacer.unspaceBraces();
            }
        }
    }

    private _onDidChangeConfiguration() {
        this._config = vscode.workspace.getConfiguration();
    }
}
