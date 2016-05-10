/// <reference path='../../typings/node.d.ts' />

import {CodeLens, TextDocument, Range, CancellationToken} from 'vscode';
import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {CodeMetricsConfiguration, AppConfiguration} from '../models/AppConfiguration';
import {readFileSync} from 'fs';
import * as ts from 'typescript';

export class CodeMetricsParserImpl {
    public getMetrics(config: AppConfiguration, document: TextDocument, target: ts.ScriptTarget, token: CancellationToken): CodeMetricsCodeLens[] {
        let fileName = document.fileName;
        let sourceFile: ts.SourceFile = ts.createSourceFile(fileName, document.getText(), target, true);
        let metricsVisitor: MetricsVisitor = new MetricsVisitor(document, sourceFile);
        new TreeWalker(config.codeMetricsSettings, metricsVisitor, token).walk(sourceFile);

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
        if (visible) {
            this.resultingCodeLens.push(result);
        }
        return result;
    }
    getFilteredLens(): CodeMetricsCodeLens[] {
        return this.resultingCodeLens.filter(item => item.visible);
    }
}

export class TreeWalker {

    visitor: Visitor;
    parents: CodeMetricsCodeLens[] = [];
    token: CancellationToken;
    configuration: CodeMetricsConfiguration;
    constructor(configuration: CodeMetricsConfiguration, visitor: Visitor, token: CancellationToken) {
        this.visitor = visitor;
        this.token = token;
        this.configuration = configuration;
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
                generatedLens = this.visitor.visit(node, this.configuration.AnyKeyword, this.configuration.AnyKeywordDescription);
                break;

            case ts.SyntaxKind.ArrayBindingPattern:
                generatedLens = this.visitor.visit(<ts.BindingPattern>node, this.configuration.ArrayBindingPattern, this.configuration.ArrayBindingPatternDescription);
                break;

            case ts.SyntaxKind.ArrayLiteralExpression:
                generatedLens = this.visitor.visit(<ts.ArrayLiteralExpression>node, this.configuration.ArrayLiteralExpression, this.configuration.ArrayLiteralExpressionDescription);
                break;

            case ts.SyntaxKind.ArrowFunction:
                generatedLens = this.visitor.visit(<ts.FunctionLikeDeclaration>node, this.configuration.ArrowFunction, this.configuration.ArrowFunctionDescription, true);
                break;

            case ts.SyntaxKind.BinaryExpression:
                let binaryExpression = <ts.BinaryExpression>node;
                if (binaryExpression.operatorToken.kind == ts.SyntaxKind.AmpersandAmpersandToken ||
                    binaryExpression.operatorToken.kind == ts.SyntaxKind.AmpersandToken ||
                    binaryExpression.operatorToken.kind == ts.SyntaxKind.BarBarToken ||
                    binaryExpression.operatorToken.kind == ts.SyntaxKind.BarToken) {
                    generatedLens = this.visitor.visit(node, this.configuration.BinaryExpression, this.configuration.BinaryExpressionDescription);
                }
                break;

            case ts.SyntaxKind.BindingElement:
                generatedLens = this.visitor.visit(<ts.BindingElement>node, this.configuration.BindingElement, this.configuration.BindingElementDescription);
                break;

            case ts.SyntaxKind.Block:
                generatedLens = this.visitor.visit(<ts.Block>node, this.configuration.Block, this.configuration.BlockDescription);
                break;

            case ts.SyntaxKind.BreakStatement:
                generatedLens = this.visitor.visit(<ts.BreakOrContinueStatement>node, this.configuration.BreakStatement, this.configuration.BreakStatementDescription);
                break;

            case ts.SyntaxKind.CallExpression:
                generatedLens = this.visitor.visit(<ts.CallExpression>node, this.configuration.CallExpression, this.configuration.CallExpressionDescription);
                break;

            case ts.SyntaxKind.CallSignature:
                generatedLens = this.visitor.visit(<ts.SignatureDeclaration>node, this.configuration.CallSignature, this.configuration.CallSignatureDescription);
                break;

            case ts.SyntaxKind.CaseClause:
                generatedLens = this.visitor.visit(<ts.CaseClause>node, this.configuration.CaseClause, this.configuration.CaseClauseDescription);
                break;

            case ts.SyntaxKind.ClassDeclaration:
                generatedLens = this.visitor.visit(<ts.ClassDeclaration>node, this.configuration.ClassDeclaration, this.configuration.ClassDeclarationDescription);
                break;

            case ts.SyntaxKind.CatchClause:
                generatedLens = this.visitor.visit(<ts.CatchClause>node, this.configuration.CatchClause, this.configuration.CatchClauseDescription);
                break;

            case ts.SyntaxKind.ConditionalExpression:
                generatedLens = this.visitor.visit(<ts.ConditionalExpression>node, this.configuration.ConditionalExpression, this.configuration.ConditionalExpressionDescription);
                break;

            case ts.SyntaxKind.Constructor:
                generatedLens = this.visitor.visit(<ts.ConstructorDeclaration>node, this.configuration.Constructor, this.configuration.ConstructorDescription, true);
                break;

            case ts.SyntaxKind.ConstructorType:
                generatedLens = this.visitor.visit(<ts.FunctionOrConstructorTypeNode>node, this.configuration.ConstructorType, this.configuration.ConstructorTypeDescription);
                break;

            case ts.SyntaxKind.ContinueStatement:
                generatedLens = this.visitor.visit(<ts.BreakOrContinueStatement>node, this.configuration.ContinueStatement, this.configuration.ContinueStatementDescription);
                break;

            case ts.SyntaxKind.DebuggerStatement:
                generatedLens = this.visitor.visit(<ts.Statement>node, this.configuration.DebuggerStatement, this.configuration.DebuggerStatementDescription);
                break;

            case ts.SyntaxKind.DefaultClause:
                generatedLens = this.visitor.visit(<ts.DefaultClause>node, this.configuration.DefaultClause, this.configuration.DefaultClauseDescription);
                break;

            case ts.SyntaxKind.DoStatement:
                generatedLens = this.visitor.visit(<ts.DoStatement>node, this.configuration.DoStatement, this.configuration.DoStatementDescription);
                break;

            case ts.SyntaxKind.ElementAccessExpression:
                generatedLens = this.visitor.visit(<ts.ElementAccessExpression>node, this.configuration.ElementAccessExpression, this.configuration.ElementAccessExpressionDescription);
                break;

            case ts.SyntaxKind.EnumDeclaration:
                generatedLens = this.visitor.visit(<ts.EnumDeclaration>node, this.configuration.EnumDeclaration, this.configuration.EnumDeclarationDescription, true);
                break;

            case ts.SyntaxKind.ExportAssignment:
                generatedLens = this.visitor.visit(<ts.ExportAssignment>node, this.configuration.ExportAssignment, this.configuration.ExportAssignmentDescription);
                break;

            case ts.SyntaxKind.ExpressionStatement:
                generatedLens = this.visitor.visit(<ts.ExpressionStatement>node, this.configuration.ExpressionStatement, this.configuration.ExportAssignmentDescription);
                break;

            case ts.SyntaxKind.ForStatement:
                generatedLens = this.visitor.visit(<ts.ForStatement>node, this.configuration.ForStatement, this.configuration.ForStatementDescription);
                break;

            case ts.SyntaxKind.ForInStatement:
                generatedLens = this.visitor.visit(<ts.ForInStatement>node, this.configuration.ForInStatement, this.configuration.ForInStatementDescription);
                break;

            case ts.SyntaxKind.ForOfStatement:
                generatedLens = this.visitor.visit(<ts.ForOfStatement>node, this.configuration.ForOfStatement, this.configuration.ForOfStatementDescription);
                break;

            case ts.SyntaxKind.FunctionDeclaration:
                generatedLens = this.visitor.visit(<ts.FunctionDeclaration>node, this.configuration.FunctionDeclaration, this.configuration.FunctionDeclarationDescription, true);
                break;

            case ts.SyntaxKind.FunctionExpression:
                generatedLens = this.visitor.visit(<ts.FunctionExpression>node, this.configuration.FunctionExpression, this.configuration.FunctionExpressionDescription, true);
                break;

            case ts.SyntaxKind.FunctionType:
                generatedLens = this.visitor.visit(<ts.FunctionOrConstructorTypeNode>node, this.configuration.FunctionType, this.configuration.FunctionTypeDescription);
                break;

            case ts.SyntaxKind.GetAccessor:
                generatedLens = this.visitor.visit(<ts.AccessorDeclaration>node, this.configuration.GetAccessor, this.configuration.GetAccessorDescription);
                break;

            case ts.SyntaxKind.Identifier:
                generatedLens = this.visitor.visit(<ts.Identifier>node, this.configuration.Identifier, this.configuration.IdentifierDescription);
                break;

            case ts.SyntaxKind.IfStatement:
                let ifNode = <ts.IfStatement>node;
                if (ifNode.elseStatement) {
                    generatedLens = this.visitor.visit(ifNode, this.configuration.IfWithElseStatement, this.configuration.IfWithElseStatementDescription);
                } else {
                    generatedLens = this.visitor.visit(ifNode, this.configuration.IfStatement, this.configuration.IfStatementDescription);
                }
                break;

            case ts.SyntaxKind.ImportDeclaration:
                generatedLens = this.visitor.visit(<ts.ImportDeclaration>node, this.configuration.ImportDeclaration, this.configuration.ImportDeclarationDescription);
                break;

            case ts.SyntaxKind.ImportEqualsDeclaration:
                generatedLens = this.visitor.visit(<ts.ImportEqualsDeclaration>node, this.configuration.ImportEqualsDeclaration, this.configuration.ImportEqualsDeclarationDescription);
                break;

            case ts.SyntaxKind.IndexSignature:
                generatedLens = this.visitor.visit(<ts.IndexSignatureDeclaration>node, this.configuration.IndexSignature, this.configuration.IndexSignatureDescription);
                break;

            case ts.SyntaxKind.InterfaceDeclaration:
                generatedLens = this.visitor.visit(<ts.InterfaceDeclaration>node, this.configuration.InterfaceDeclaration, this.configuration.InterfaceDeclarationDescription);
                break;

            case ts.SyntaxKind.JsxElement:
                generatedLens = this.visitor.visit(<ts.JsxElement>node, this.configuration.JsxElement, this.configuration.JsxElementDescription);
                break;

            case ts.SyntaxKind.JsxSelfClosingElement:
                generatedLens = this.visitor.visit(<ts.JsxSelfClosingElement>node, this.configuration.JsxSelfClosingElement, this.configuration.JsxSelfClosingElementDescription);
                break;

            case ts.SyntaxKind.LabeledStatement:
                generatedLens = this.visitor.visit(<ts.LabeledStatement>node, this.configuration.LabeledStatement, this.configuration.LabeledStatementDescription);
                break;

            case ts.SyntaxKind.MethodDeclaration:
                generatedLens = this.visitor.visit(<ts.MethodDeclaration>node, this.configuration.MethodDeclaration, this.configuration.MethodDeclarationDescription, true);
                break;

            case ts.SyntaxKind.MethodSignature:
                generatedLens = this.visitor.visit(<ts.SignatureDeclaration>node, this.configuration.MethodSignature, this.configuration.MethodSignatureDescription);
                break;

            case ts.SyntaxKind.ModuleDeclaration:
                generatedLens = this.visitor.visit(<ts.ModuleDeclaration>node, this.configuration.ModuleDeclaration, this.configuration.ModuleDeclarationDescription);
                break;

            case ts.SyntaxKind.NamedImports:
                generatedLens = this.visitor.visit(<ts.NamedImports>node, this.configuration.NamedImports, this.configuration.NamedImportsDescription);
                break;

            case ts.SyntaxKind.NamespaceImport:
                generatedLens = this.visitor.visit(<ts.NamespaceImport>node, this.configuration.NamespaceImport, this.configuration.NamespaceImportDescription);
                break;

            case ts.SyntaxKind.NewExpression:
                generatedLens = this.visitor.visit(<ts.NewExpression>node, this.configuration.NewExpression, this.configuration.NewExpressionDescription);
                break;

            case ts.SyntaxKind.ObjectBindingPattern:
                generatedLens = this.visitor.visit(<ts.BindingPattern>node, this.configuration.ObjectBindingPattern, this.configuration.ObjectBindingPatternDescription);
                break;

            case ts.SyntaxKind.ObjectLiteralExpression:
                generatedLens = this.visitor.visit(<ts.ObjectLiteralExpression>node, this.configuration.ObjectLiteralExpression, this.configuration.ObjectLiteralExpressionDescription);
                break;

            case ts.SyntaxKind.Parameter:
                generatedLens = this.visitor.visit(<ts.ParameterDeclaration>node, this.configuration.Parameter, this.configuration.ParameterDescription);
                break;

            case ts.SyntaxKind.PostfixUnaryExpression:
                generatedLens = this.visitor.visit(<ts.PostfixUnaryExpression>node, this.configuration.PostfixUnaryExpression, this.configuration.PostfixUnaryExpressionDescription);
                break;

            case ts.SyntaxKind.PrefixUnaryExpression:
                generatedLens = this.visitor.visit(<ts.PrefixUnaryExpression>node, this.configuration.PrefixUnaryExpression, this.configuration.PrefixUnaryExpressionDescription);
                break;

            case ts.SyntaxKind.PropertyAccessExpression:
                generatedLens = this.visitor.visit(<ts.PropertyAccessExpression>node, this.configuration.PropertyAccessExpression, this.configuration.PropertyAccessExpressionDescription);
                break;

            case ts.SyntaxKind.PropertyAssignment:
                generatedLens = this.visitor.visit(<ts.PropertyAssignment>node, this.configuration.PropertyAssignment, this.configuration.PropertyAssignmentDescription);
                break;

            case ts.SyntaxKind.PropertyDeclaration:
                generatedLens = this.visitor.visit(<ts.PropertyDeclaration>node, this.configuration.PropertyDeclaration, this.configuration.PropertyDeclarationDescription);
                break;

            case ts.SyntaxKind.PropertySignature:
                generatedLens = this.visitor.visit(node, this.configuration.PropertySignature, this.configuration.PropertySignatureDescription);
                break;

            case ts.SyntaxKind.RegularExpressionLiteral:
                generatedLens = this.visitor.visit(node, this.configuration.RegularExpressionLiteral, this.configuration.RegularExpressionLiteralDescription);
                break;

            case ts.SyntaxKind.ReturnStatement:
                generatedLens = this.visitor.visit(<ts.ReturnStatement>node, this.configuration.ReturnStatement, this.configuration.ReturnStatementDescription);
                break;

            case ts.SyntaxKind.SetAccessor:
                generatedLens = this.visitor.visit(<ts.AccessorDeclaration>node, this.configuration.SetAccessor, this.configuration.SetAccessorDescription);
                break;

            case ts.SyntaxKind.SourceFile:
                generatedLens = this.visitor.visit(<ts.SourceFile>node, this.configuration.SourceFile, this.configuration.SourceFileDescription);
                break;

            case ts.SyntaxKind.StringLiteral:
                generatedLens = this.visitor.visit(<ts.StringLiteral>node, this.configuration.StringLiteral, this.configuration.StringLiteralDescription);
                break;

            case ts.SyntaxKind.SwitchStatement:
                generatedLens = this.visitor.visit(<ts.SwitchStatement>node, this.configuration.SwitchStatement, this.configuration.SwitchStatementDescription);
                break;

            case ts.SyntaxKind.TemplateExpression:
                generatedLens = this.visitor.visit(<ts.TemplateExpression>node, this.configuration.TemplateExpression, this.configuration.TemplateExpressionDescription);
                break;

            case ts.SyntaxKind.ThrowStatement:
                generatedLens = this.visitor.visit(<ts.ThrowStatement>node, this.configuration.ThrowStatement, this.configuration.ThrowStatementDescription);
                break;

            case ts.SyntaxKind.TryStatement:
                generatedLens = this.visitor.visit(<ts.TryStatement>node, this.configuration.TryStatement, this.configuration.TryStatementDescription);
                break;

            case ts.SyntaxKind.TypeAssertionExpression:
                generatedLens = this.visitor.visit(<ts.TypeAssertion>node, this.configuration.TypeAssertionExpression, this.configuration.TypeAssertionExpressionDescription);
                break;

            case ts.SyntaxKind.TypeLiteral:
                generatedLens = this.visitor.visit(<ts.TypeLiteralNode>node, this.configuration.TypeLiteral, this.configuration.TypeLiteralDescription);
                break;

            case ts.SyntaxKind.TypeReference:
                generatedLens = this.visitor.visit(<ts.TypeReferenceNode>node, this.configuration.TypeReference, this.configuration.TypeReferenceDescription);
                break;

            case ts.SyntaxKind.VariableDeclaration:
                generatedLens = this.visitor.visit(<ts.VariableDeclaration>node, this.configuration.VariableDeclaration, this.configuration.VariableDeclarationDescription);
                break;

            case ts.SyntaxKind.VariableStatement:
                generatedLens = this.visitor.visit(<ts.VariableStatement>node, this.configuration.VariableStatement, this.configuration.VariableStatementDescription);
                break;

            case ts.SyntaxKind.WhileStatement:
                generatedLens = this.visitor.visit(<ts.WhileStatement>node, this.configuration.WhileStatement, this.configuration.WhileStatementDescription);
                break;

            case ts.SyntaxKind.WithStatement:
                generatedLens = this.visitor.visit(<ts.WithStatement>node, this.configuration.WithStatement, this.configuration.WithStatementDescription);
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