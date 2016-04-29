/// <reference path="../../typings/node.d.ts" />

import {CodeLens, TextDocument, Range} from 'vscode';
import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {readFileSync} from "fs";
import * as ts from "typescript";

export class CodeMetricsParserImpl {
    public getMetrics(document: TextDocument): CodeLens[] {

        let fileName = document.fileName;
        let sourceFile: ts.SourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.ES6, true);
        let metricsVisitor: MetricsVisitor = new MetricsVisitor(document, sourceFile);
        new TreeWalker(metricsVisitor).walk(sourceFile);

        return metricsVisitor.getFilteredLens()
    }
}
export let CodeMetricsParser: CodeMetricsParserImpl = new CodeMetricsParserImpl();

interface Visitor {
    visit(parents: CodeLens[], node: ts.Node, complexity: number, visible?: boolean);
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
    visit(parents: CodeMetricsCodeLens[], node: ts.Node, complexity: number, visible?: boolean): CodeLens {
        let { line, character } = this.sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const range = new Range(
            this.document.positionAt(node.getStart()),
            this.document.positionAt(node.getEnd())
        );
        let result: CodeMetricsCodeLens = new CodeMetricsCodeLens(range, line + 1, character + 1, complexity, visible);
        this.resultingCodeLens.push(result);

        parents.forEach(element => {
            element.complexity += complexity;
        });
        return result;
    }
    getFilteredLens(): CodeMetricsCodeLens[] {
        return this.resultingCodeLens.filter(lens => lens.complexity > 0 && lens.visible);
    }
}

export class TreeWalker {

    visitor: Visitor;
    parents: CodeLens[] = [];

    constructor(visitor) {
        this.visitor = visitor;
    }

    protected visitNode(node: ts.Node) {
        let generatedLens: CodeLens;
        switch (node.kind) {
            case ts.SyntaxKind.AnyKeyword:
                generatedLens = this.visitor.visit(this.parents, node, 1);
                break;

            case ts.SyntaxKind.ArrayBindingPattern:
                generatedLens = this.visitor.visit(this.parents, <ts.BindingPattern>node, 0);
                break;

            case ts.SyntaxKind.ArrayLiteralExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.ArrayLiteralExpression>node, 0);
                break;

            case ts.SyntaxKind.ArrowFunction:
                generatedLens = this.visitor.visit(this.parents, <ts.FunctionLikeDeclaration>node, 0);
                break;

            case ts.SyntaxKind.BinaryExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.BinaryExpression>node, 1);
                break;

            case ts.SyntaxKind.BindingElement:
                generatedLens = this.visitor.visit(this.parents, <ts.BindingElement>node, 0);
                break;

            case ts.SyntaxKind.Block:
                generatedLens = this.visitor.visit(this.parents, <ts.Block>node, 0);
                break;

            case ts.SyntaxKind.BreakStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.BreakOrContinueStatement>node, 1);
                break;

            case ts.SyntaxKind.CallExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.CallExpression>node, 0);
                break;

            case ts.SyntaxKind.CallSignature:
                generatedLens = this.visitor.visit(this.parents, <ts.SignatureDeclaration>node, 0);
                break;

            case ts.SyntaxKind.CaseClause:
                generatedLens = this.visitor.visit(this.parents, <ts.CaseClause>node, 1);
                break;

            case ts.SyntaxKind.ClassDeclaration:
                generatedLens = this.visitor.visit(this.parents, <ts.ClassDeclaration>node, 1, true);
                break;

            case ts.SyntaxKind.CatchClause:
                generatedLens = this.visitor.visit(this.parents, <ts.CatchClause>node, 1);
                break;

            case ts.SyntaxKind.ConditionalExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.ConditionalExpression>node, 1);
                break;

            case ts.SyntaxKind.Constructor:
                generatedLens = this.visitor.visit(this.parents, <ts.ConstructorDeclaration>node, 1, true);
                break;

            case ts.SyntaxKind.ConstructorType:
                generatedLens = this.visitor.visit(this.parents, <ts.FunctionOrConstructorTypeNode>node, 0);
                break;

            case ts.SyntaxKind.ContinueStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.BreakOrContinueStatement>node, 1);
                break;

            case ts.SyntaxKind.DebuggerStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.Statement>node, 0);
                break;

            case ts.SyntaxKind.DefaultClause:
                generatedLens = this.visitor.visit(this.parents, <ts.DefaultClause>node, 1);
                break;

            case ts.SyntaxKind.DoStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.DoStatement>node, 1);
                break;

            case ts.SyntaxKind.ElementAccessExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.ElementAccessExpression>node, 0);
                break;

            case ts.SyntaxKind.EnumDeclaration:
                generatedLens = this.visitor.visit(this.parents, <ts.EnumDeclaration>node, 1, true);
                break;

            case ts.SyntaxKind.ExportAssignment:
                generatedLens = this.visitor.visit(this.parents, <ts.ExportAssignment>node, 1);
                break;

            case ts.SyntaxKind.ExpressionStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.ExpressionStatement>node, 0);
                break;

            case ts.SyntaxKind.ForStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.ForStatement>node, 1);
                break;

            case ts.SyntaxKind.ForInStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.ForInStatement>node, 1);
                break;

            case ts.SyntaxKind.ForOfStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.ForOfStatement>node, 1);
                break;

            case ts.SyntaxKind.FunctionDeclaration:
                generatedLens = this.visitor.visit(this.parents, <ts.FunctionDeclaration>node, 1, true);
                break;

            case ts.SyntaxKind.FunctionExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.FunctionExpression>node, 0);
                break;

            case ts.SyntaxKind.FunctionType:
                generatedLens = this.visitor.visit(this.parents, <ts.FunctionOrConstructorTypeNode>node, 0);
                break;

            case ts.SyntaxKind.GetAccessor:
                generatedLens = this.visitor.visit(this.parents, <ts.AccessorDeclaration>node, 0);
                break;

            case ts.SyntaxKind.Identifier:
                generatedLens = this.visitor.visit(this.parents, <ts.Identifier>node, 0);
                break;

            case ts.SyntaxKind.IfStatement:
                let ifNode = <ts.IfStatement>node;
                generatedLens = this.visitor.visit(this.parents, ifNode, 1 + (ifNode.elseStatement ? 1 : 0));
                break;

            case ts.SyntaxKind.ImportDeclaration:
                generatedLens = this.visitor.visit(this.parents, <ts.ImportDeclaration>node, 0);
                break;

            case ts.SyntaxKind.ImportEqualsDeclaration:
                generatedLens = this.visitor.visit(this.parents, <ts.ImportEqualsDeclaration>node, 0);
                break;

            case ts.SyntaxKind.IndexSignature:
                generatedLens = this.visitor.visit(this.parents, <ts.IndexSignatureDeclaration>node, 0);
                break;

            case ts.SyntaxKind.InterfaceDeclaration:
                generatedLens = this.visitor.visit(this.parents, <ts.InterfaceDeclaration>node, 1, true);
                break;

            case ts.SyntaxKind.JsxElement:
                generatedLens = this.visitor.visit(this.parents, <ts.JsxElement>node, 1);
                break;

            case ts.SyntaxKind.JsxSelfClosingElement:
                generatedLens = this.visitor.visit(this.parents, <ts.JsxSelfClosingElement>node, 1);
                break;

            case ts.SyntaxKind.LabeledStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.LabeledStatement>node, 1);
                break;

            case ts.SyntaxKind.MethodDeclaration:
                generatedLens = this.visitor.visit(this.parents, <ts.MethodDeclaration>node, 1, true);
                break;

            case ts.SyntaxKind.MethodSignature:
                generatedLens = this.visitor.visit(this.parents, <ts.SignatureDeclaration>node, 1);
                break;

            case ts.SyntaxKind.ModuleDeclaration:
                generatedLens = this.visitor.visit(this.parents, <ts.ModuleDeclaration>node, 1, true);
                break;

            case ts.SyntaxKind.NamedImports:
                generatedLens = this.visitor.visit(this.parents, <ts.NamedImports>node, 0);
                break;

            case ts.SyntaxKind.NamespaceImport:
                generatedLens = this.visitor.visit(this.parents, <ts.NamespaceImport>node, 0);
                break;

            case ts.SyntaxKind.NewExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.NewExpression>node, 0);
                break;

            case ts.SyntaxKind.ObjectBindingPattern:
                generatedLens = this.visitor.visit(this.parents, <ts.BindingPattern>node, 0);
                break;

            case ts.SyntaxKind.ObjectLiteralExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.ObjectLiteralExpression>node, 1);
                break;

            case ts.SyntaxKind.Parameter:
                generatedLens = this.visitor.visit(this.parents, <ts.ParameterDeclaration>node, 0);
                break;

            case ts.SyntaxKind.PostfixUnaryExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.PostfixUnaryExpression>node, 0);
                break;

            case ts.SyntaxKind.PrefixUnaryExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.PrefixUnaryExpression>node, 0);
                break;

            case ts.SyntaxKind.PropertyAccessExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.PropertyAccessExpression>node, 0);
                break;

            case ts.SyntaxKind.PropertyAssignment:
                generatedLens = this.visitor.visit(this.parents, <ts.PropertyAssignment>node, 0);
                break;

            case ts.SyntaxKind.PropertyDeclaration:
                generatedLens = this.visitor.visit(this.parents, <ts.PropertyDeclaration>node, 0);
                break;

            case ts.SyntaxKind.PropertySignature:
                generatedLens = this.visitor.visit(this.parents, node, 0);
                break;

            case ts.SyntaxKind.RegularExpressionLiteral:
                generatedLens = this.visitor.visit(this.parents, node, 0);
                break;

            case ts.SyntaxKind.ReturnStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.ReturnStatement>node, 1);
                break;

            case ts.SyntaxKind.SetAccessor:
                generatedLens = this.visitor.visit(this.parents, <ts.AccessorDeclaration>node, 0);
                break;

            case ts.SyntaxKind.SourceFile:
                generatedLens = this.visitor.visit(this.parents, <ts.SourceFile>node, 0);
                break;

            case ts.SyntaxKind.StringLiteral:
                generatedLens = this.visitor.visit(this.parents, <ts.StringLiteral>node, 0);
                break;

            case ts.SyntaxKind.SwitchStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.SwitchStatement>node, 1);
                break;

            case ts.SyntaxKind.TemplateExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.TemplateExpression>node, 0);
                break;

            case ts.SyntaxKind.ThrowStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.ThrowStatement>node, 1);
                break;

            case ts.SyntaxKind.TryStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.TryStatement>node, 1);
                break;

            case ts.SyntaxKind.TypeAssertionExpression:
                generatedLens = this.visitor.visit(this.parents, <ts.TypeAssertion>node, 0);
                break;

            case ts.SyntaxKind.TypeLiteral:
                generatedLens = this.visitor.visit(this.parents, <ts.TypeLiteralNode>node, 0);
                break;

            case ts.SyntaxKind.TypeReference:
                generatedLens = this.visitor.visit(this.parents, <ts.TypeReferenceNode>node, 0);
                break;

            case ts.SyntaxKind.VariableDeclaration:
                generatedLens = this.visitor.visit(this.parents, <ts.VariableDeclaration>node, 0);
                break;

            case ts.SyntaxKind.VariableStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.VariableStatement>node, 0);
                break;

            case ts.SyntaxKind.WhileStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.WhileStatement>node, 1);
                break;

            case ts.SyntaxKind.WithStatement:
                generatedLens = this.visitor.visit(this.parents, <ts.WithStatement>node, 1);
                break;

            default:
                break;
        }
        if (generatedLens) {
            this.parents.push(generatedLens);
        }
        this.walkChildren(node);
        if (generatedLens) {
            this.parents.pop();
        }
    }

    public walk(node: ts.Node) {
        this.visitNode(node);
    }

    protected walkChildren(node: ts.Node) {
        ts.forEachChild(node, (child) => this.visitNode(child));
    }
}