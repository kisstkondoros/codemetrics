/// <reference path="../../typings/node.d.ts" />

import {CodeLens, TextDocument, Range, CancellationToken} from 'vscode';
import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {readFileSync} from "fs";
import * as ts from "typescript";

export class CodeMetricsParserImpl {
    public getMetrics(document: TextDocument, token: CancellationToken): CodeMetricsCodeLens[] {

        let fileName = document.fileName;
        let sourceFile: ts.SourceFile = ts.createSourceFile(fileName, document.getText(), ts.ScriptTarget.ES6, true);
        let metricsVisitor: MetricsVisitor = new MetricsVisitor(document, sourceFile);
        new TreeWalker(metricsVisitor, token).walk(sourceFile);

        return metricsVisitor.getFilteredLens()
    }
}
export let CodeMetricsParser: CodeMetricsParserImpl = new CodeMetricsParserImpl();

interface Visitor {
    visit(node: ts.Node, complexity: number, description: string, visible?: boolean): CodeMetricsCodeLens;
}

class MetricsVisitor implements Visitor {
    sourceFile: ts.SourceFile;
    document: TextDocument;
    resultingCodeLens: CodeMetricsCodeLens[];
    constructor(document: TextDocument, sourceFile: ts.SourceFile) {
        this.sourceFile = sourceFile;
        this.document = document;
        this.resultingCodeLens = [];
    }
    visit(node: ts.Node, complexity: number, description: string, visible?: boolean): CodeMetricsCodeLens {
        let { line, character } = this.sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const range = new Range(
            this.document.positionAt(node.getStart()),
            this.document.positionAt(node.getEnd())
        );
        let result: CodeMetricsCodeLens = new CodeMetricsCodeLens(range, line + 1, character + 1, complexity, description, visible);
        if (visible){
            this.resultingCodeLens.push(result);
        }
        return result;
    }
    getFilteredLens(): CodeMetricsCodeLens[] {
        return this.resultingCodeLens;
    }
}

export class TreeWalker {

    visitor: Visitor;
    parents: CodeMetricsCodeLens[] = [];
    token: CancellationToken;

    constructor(visitor: Visitor, token: CancellationToken) {
        this.visitor = visitor;
        this.token = token;
    }

    protected visitNode(node: ts.Node) {
        let generatedLens: CodeMetricsCodeLens = this.getLens(node);

        let generatedLensCounts = generatedLens && generatedLens.complexity > 0;

        if (generatedLensCounts) {
            this.parents.forEach((parent) => parent.children.push(generatedLens));
            this.parents.push(generatedLens);
        }

        this.walkChildren(node);
        if (generatedLensCounts) {
            this.parents.pop();
        }
    }

    protected getLens(node: ts.Node): CodeMetricsCodeLens {
        let generatedLens: CodeMetricsCodeLens
        switch (node.kind) {
            case ts.SyntaxKind.AnyKeyword:
                generatedLens = this.visitor.visit(node, 1, 'Any keyword');
                break;

            case ts.SyntaxKind.ArrayBindingPattern:
                generatedLens = this.visitor.visit(<ts.BindingPattern>node, 0, '');
                break;

            case ts.SyntaxKind.ArrayLiteralExpression:
                generatedLens = this.visitor.visit(<ts.ArrayLiteralExpression>node, 0, '');
                break;

            case ts.SyntaxKind.ArrowFunction:
                generatedLens = this.visitor.visit(<ts.FunctionLikeDeclaration>node, 1, 'Arrow function');
                break;

            case ts.SyntaxKind.BinaryExpression:
                generatedLens = this.visitor.visit(<ts.BinaryExpression>node, 1, 'Binary expression');
                break;

            case ts.SyntaxKind.BindingElement:
                generatedLens = this.visitor.visit(<ts.BindingElement>node, 0, '');
                break;

            case ts.SyntaxKind.Block:
                generatedLens = this.visitor.visit(<ts.Block>node, 0, '');
                break;

            case ts.SyntaxKind.BreakStatement:
                generatedLens = this.visitor.visit(<ts.BreakOrContinueStatement>node, 1, 'Break statement');
                break;

            case ts.SyntaxKind.CallExpression:
                generatedLens = this.visitor.visit(<ts.CallExpression>node, 0, '');
                break;

            case ts.SyntaxKind.CallSignature:
                generatedLens = this.visitor.visit(<ts.SignatureDeclaration>node, 0, '');
                break;

            case ts.SyntaxKind.CaseClause:
                generatedLens = this.visitor.visit(<ts.CaseClause>node, 1, 'Case clause');
                break;

            case ts.SyntaxKind.ClassDeclaration:
                generatedLens = this.visitor.visit(<ts.ClassDeclaration>node, 0, '');
                break;

            case ts.SyntaxKind.CatchClause:
                generatedLens = this.visitor.visit(<ts.CatchClause>node, 1, 'Catch clause');
                break;

            case ts.SyntaxKind.ConditionalExpression:
                generatedLens = this.visitor.visit(<ts.ConditionalExpression>node, 1, 'Conditional expression');
                break;

            case ts.SyntaxKind.Constructor:
                generatedLens = this.visitor.visit(<ts.ConstructorDeclaration>node, 1, 'Constructor', true);
                break;

            case ts.SyntaxKind.ConstructorType:
                generatedLens = this.visitor.visit(<ts.FunctionOrConstructorTypeNode>node, 0, '');
                break;

            case ts.SyntaxKind.ContinueStatement:
                generatedLens = this.visitor.visit(<ts.BreakOrContinueStatement>node, 1, 'Continue statement');
                break;

            case ts.SyntaxKind.DebuggerStatement:
                generatedLens = this.visitor.visit(<ts.Statement>node, 0, '');
                break;

            case ts.SyntaxKind.DefaultClause:
                generatedLens = this.visitor.visit(<ts.DefaultClause>node, 1, 'Default case');
                break;

            case ts.SyntaxKind.DoStatement:
                generatedLens = this.visitor.visit(<ts.DoStatement>node, 1, 'Do statement');
                break;

            case ts.SyntaxKind.ElementAccessExpression:
                generatedLens = this.visitor.visit(<ts.ElementAccessExpression>node, 0, '');
                break;

            case ts.SyntaxKind.EnumDeclaration:
                generatedLens = this.visitor.visit(<ts.EnumDeclaration>node, 1, 'Enum declaration', true);
                break;

            case ts.SyntaxKind.ExportAssignment:
                generatedLens = this.visitor.visit(<ts.ExportAssignment>node, 1, 'Export assignment');
                break;

            case ts.SyntaxKind.ExpressionStatement:
                generatedLens = this.visitor.visit(<ts.ExpressionStatement>node, 0, '');
                break;

            case ts.SyntaxKind.ForStatement:
                generatedLens = this.visitor.visit(<ts.ForStatement>node, 1, '');
                break;

            case ts.SyntaxKind.ForInStatement:
                generatedLens = this.visitor.visit(<ts.ForInStatement>node, 1, 'For in statement');
                break;

            case ts.SyntaxKind.ForOfStatement:
                generatedLens = this.visitor.visit(<ts.ForOfStatement>node, 1, 'For of statement');
                break;

            case ts.SyntaxKind.FunctionDeclaration:
                generatedLens = this.visitor.visit(<ts.FunctionDeclaration>node, 1, 'Function declaration', true);
                break;

            case ts.SyntaxKind.FunctionExpression:
                generatedLens = this.visitor.visit(<ts.FunctionExpression>node, 1, 'Function expression');
                break;

            case ts.SyntaxKind.FunctionType:
                generatedLens = this.visitor.visit(<ts.FunctionOrConstructorTypeNode>node, 0, '');
                break;

            case ts.SyntaxKind.GetAccessor:
                generatedLens = this.visitor.visit(<ts.AccessorDeclaration>node, 0, '');
                break;

            case ts.SyntaxKind.Identifier:
                generatedLens = this.visitor.visit(<ts.Identifier>node, 0, '');
                break;

            case ts.SyntaxKind.IfStatement:
                let ifNode = <ts.IfStatement>node;
                if (ifNode.elseStatement) {
                    generatedLens = this.visitor.visit(ifNode, 2, 'If with else statement');
                } else {
                    generatedLens = this.visitor.visit(ifNode, 1, 'If statement');
                }
                break;

            case ts.SyntaxKind.ImportDeclaration:
                generatedLens = this.visitor.visit(<ts.ImportDeclaration>node, 0, '');
                break;

            case ts.SyntaxKind.ImportEqualsDeclaration:
                generatedLens = this.visitor.visit(<ts.ImportEqualsDeclaration>node, 0, '');
                break;

            case ts.SyntaxKind.IndexSignature:
                generatedLens = this.visitor.visit(<ts.IndexSignatureDeclaration>node, 0, '');
                break;

            case ts.SyntaxKind.InterfaceDeclaration:
                generatedLens = this.visitor.visit(<ts.InterfaceDeclaration>node, 0, '');
                break;

            case ts.SyntaxKind.JsxElement:
                generatedLens = this.visitor.visit(<ts.JsxElement>node, 1, 'Jsx element');
                break;

            case ts.SyntaxKind.JsxSelfClosingElement:
                generatedLens = this.visitor.visit(<ts.JsxSelfClosingElement>node, 1, 'Jsx self closingElement');
                break;

            case ts.SyntaxKind.LabeledStatement:
                generatedLens = this.visitor.visit(<ts.LabeledStatement>node, 1, 'Labeled statement');
                break;

            case ts.SyntaxKind.MethodDeclaration:
                generatedLens = this.visitor.visit(<ts.MethodDeclaration>node, 1, 'Method declaration', true);
                break;

            case ts.SyntaxKind.MethodSignature:
                generatedLens = this.visitor.visit(<ts.SignatureDeclaration>node, 0, '');
                break;

            case ts.SyntaxKind.ModuleDeclaration:
                generatedLens = this.visitor.visit(<ts.ModuleDeclaration>node, 1, 'Module declaration', true);
                break;

            case ts.SyntaxKind.NamedImports:
                generatedLens = this.visitor.visit(<ts.NamedImports>node, 0, '');
                break;

            case ts.SyntaxKind.NamespaceImport:
                generatedLens = this.visitor.visit(<ts.NamespaceImport>node, 0, '');
                break;

            case ts.SyntaxKind.NewExpression:
                generatedLens = this.visitor.visit(<ts.NewExpression>node, 0, '');
                break;

            case ts.SyntaxKind.ObjectBindingPattern:
                generatedLens = this.visitor.visit(<ts.BindingPattern>node, 0, '');
                break;

            case ts.SyntaxKind.ObjectLiteralExpression:
                generatedLens = this.visitor.visit(<ts.ObjectLiteralExpression>node, 1, 'Object literal expression');
                break;

            case ts.SyntaxKind.Parameter:
                generatedLens = this.visitor.visit(<ts.ParameterDeclaration>node, 0, '');
                break;

            case ts.SyntaxKind.PostfixUnaryExpression:
                generatedLens = this.visitor.visit(<ts.PostfixUnaryExpression>node, 0, '');
                break;

            case ts.SyntaxKind.PrefixUnaryExpression:
                generatedLens = this.visitor.visit(<ts.PrefixUnaryExpression>node, 0, '');
                break;

            case ts.SyntaxKind.PropertyAccessExpression:
                generatedLens = this.visitor.visit(<ts.PropertyAccessExpression>node, 0, '');
                break;

            case ts.SyntaxKind.PropertyAssignment:
                generatedLens = this.visitor.visit(<ts.PropertyAssignment>node, 0, '');
                break;

            case ts.SyntaxKind.PropertyDeclaration:
                generatedLens = this.visitor.visit(<ts.PropertyDeclaration>node, 0, '');
                break;

            case ts.SyntaxKind.PropertySignature:
                generatedLens = this.visitor.visit(node, 0, '');
                break;

            case ts.SyntaxKind.RegularExpressionLiteral:
                generatedLens = this.visitor.visit(node, 0, '');
                break;

            case ts.SyntaxKind.ReturnStatement:
                generatedLens = this.visitor.visit(<ts.ReturnStatement>node, 1, 'Return statement');
                break;

            case ts.SyntaxKind.SetAccessor:
                generatedLens = this.visitor.visit(<ts.AccessorDeclaration>node, 0, '');
                break;

            case ts.SyntaxKind.SourceFile:
                generatedLens = this.visitor.visit(<ts.SourceFile>node, 0, '');
                break;

            case ts.SyntaxKind.StringLiteral:
                generatedLens = this.visitor.visit(<ts.StringLiteral>node, 0, '');
                break;

            case ts.SyntaxKind.SwitchStatement:
                generatedLens = this.visitor.visit(<ts.SwitchStatement>node, 1, 'Switch statement');
                break;

            case ts.SyntaxKind.TemplateExpression:
                generatedLens = this.visitor.visit(<ts.TemplateExpression>node, 0, '');
                break;

            case ts.SyntaxKind.ThrowStatement:
                generatedLens = this.visitor.visit(<ts.ThrowStatement>node, 1, 'Throw statement');
                break;

            case ts.SyntaxKind.TryStatement:
                generatedLens = this.visitor.visit(<ts.TryStatement>node, 1, 'Try statement');
                break;

            case ts.SyntaxKind.TypeAssertionExpression:
                generatedLens = this.visitor.visit(<ts.TypeAssertion>node, 0, '');
                break;

            case ts.SyntaxKind.TypeLiteral:
                generatedLens = this.visitor.visit(<ts.TypeLiteralNode>node, 0, '');
                break;

            case ts.SyntaxKind.TypeReference:
                generatedLens = this.visitor.visit(<ts.TypeReferenceNode>node, 0, '');
                break;

            case ts.SyntaxKind.VariableDeclaration:
                generatedLens = this.visitor.visit(<ts.VariableDeclaration>node, 0, '');
                break;

            case ts.SyntaxKind.VariableStatement:
                generatedLens = this.visitor.visit(<ts.VariableStatement>node, 0, '');
                break;

            case ts.SyntaxKind.WhileStatement:
                generatedLens = this.visitor.visit(<ts.WhileStatement>node, 1, 'While statement');
                break;

            case ts.SyntaxKind.WithStatement:
                generatedLens = this.visitor.visit(<ts.WithStatement>node, 1, 'With statement');
                break;

            default:
                break;
        }
        return generatedLens;
    }

    public walk(node: ts.Node) {
        this.visitNode(node);
    }

    protected walkChildren(node: ts.Node) {
        ts.forEachChild(node, (child) => {
            if (!this.token.isCancellationRequested) {
                this.visitNode(child);
            }
        });
    }
}