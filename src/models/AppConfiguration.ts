import {workspace} from 'vscode';

export class AppConfiguration {
  constructor() { }
  get extensionName() {
    return "codemetrics";
  }

  get codeMetricsSettings(): CodeMetricsConfigurtion {
    var settings = workspace.getConfiguration(this.extensionName);
    var config = new CodeMetricsConfigurtion();
    for (var property in config) {
      if (settings.has(property)) {
        config[property] = settings.get(property);
      }
    }
    return config;
  }

}

export class CodeMetricsConfigurtion {
  AnyKeyword = 1;
  AnyKeywordDescription = 'Any keyword';
  ArrayBindingPattern = 0;
  ArrayBindingPatternDescription = 'Array binding pattern';
  ArrayLiteralExpression = 0;
  ArrayLiteralExpressionDescription = 'Array literal expression';
  ArrowFunction = 1;
  ArrowFunctionDescription = 'Arrow function';
  BinaryExpression = 1;
  BinaryExpressionDescription = 'Binary expression';
  BindingElement = 0;
  BindingElementDescription = 'Binding element';
  Block = 0;
  BlockDescription = 'Block';
  BreakStatement = 1;
  BreakStatementDescription = 'Break statement';
  CallExpression = 0;
  CallExpressionDescription = 'Call expression';
  CallSignature = 0;
  CallSignatureDescription = 'Call signature';
  CaseClause = 1;
  CaseClauseDescription = 'Case clause';
  ClassDeclaration = 0;
  ClassDeclarationDescription = 'Class declaration';
  CatchClause = 1;
  CatchClauseDescription = 'Catch clause';
  ConditionalExpression = 1;
  ConditionalExpressionDescription = 'Conditional expression';
  Constructor = 1;
  ConstructorDescription = 'Constructor';
  ConstructorType = 0;
  ConstructorTypeDescription = 'Constructor type';
  ContinueStatement = 1;
  ContinueStatementDescription = 'Continue statement';
  DebuggerStatement = 0;
  DebuggerStatementDescription = 'Debugger statement';
  DefaultClause = 1;
  DefaultClauseDescription = 'Default case';
  DoStatement = 1;
  DoStatementDescription = 'Do statement';
  ElementAccessExpression = 0;
  ElementAccessExpressionDescription = 'Element access expression';
  EnumDeclaration = 1;
  EnumDeclarationDescription = 'Enum declaration';
  ExportAssignment = 1;
  ExportAssignmentDescription = 'Export assignment';
  ExpressionStatement = 0;
  ExpressionStatementDescription = 'Expression statement';
  ForStatement = 1;
  ForStatementDescription = 'For statement';
  ForInStatement = 1;
  ForInStatementDescription = 'For in statement';
  ForOfStatement = 1;
  ForOfStatementDescription = 'For of statement';
  FunctionDeclaration = 1;
  FunctionDeclarationDescription = 'Function declaration';
  FunctionExpression = 1;
  FunctionExpressionDescription = 'Function expression';
  FunctionType = 0;
  FunctionTypeDescription = 'Function type';
  GetAccessor = 0;
  GetAccessorDescription = 'Get accessor';
  Identifier = 0;
  IdentifierDescription = 'Identifier';
  IfWithElseStatement = 2
  IfWithElseStatementDescription = 'If with else statement';
  IfStatement = 1;
  IfStatementDescription = 'If statement';
  ImportDeclaration = 0;
  ImportDeclarationDescription = 'Import declaration';
  ImportEqualsDeclaration = 0;
  ImportEqualsDeclarationDescription = 'Import equals declaration';
  IndexSignature = 0;
  IndexSignatureDescription = 'Index signature';
  InterfaceDeclaration = 0;
  InterfaceDeclarationDescription = 'Interface declaration';
  JsxElement = 1;
  JsxElementDescription = 'Jsx element';
  JsxSelfClosingElement = 1;
  JsxSelfClosingElementDescription = 'Jsx self closingElement';
  LabeledStatement = 1;
  LabeledStatementDescription = 'Labeled statement';
  MethodDeclaration = 1;
  MethodDeclarationDescription = 'Method declaration';
  MethodSignature = 0;
  MethodSignatureDescription = 'Method signature';
  ModuleDeclaration = 1;
  ModuleDeclarationDescription = 'Module declaration';
  NamedImports = 0;
  NamedImportsDescription = 'Named imports';
  NamespaceImport = 0;
  NamespaceImportDescription = 'Namespace import';
  NewExpression = 0;
  NewExpressionDescription = 'New expression';
  ObjectBindingPattern = 0;
  ObjectBindingPatternDescription = '';
  ObjectLiteralExpression = 1;
  ObjectLiteralExpressionDescription = 'Object literal expression';
  Parameter = 0;
  ParameterDescription = 'Parameter';
  PostfixUnaryExpression = 0;
  PostfixUnaryExpressionDescription = 'Postfix unary expression';
  PrefixUnaryExpression = 0;
  PrefixUnaryExpressionDescription = 'Prefix unary expression';
  PropertyAccessExpression = 0;
  PropertyAccessExpressionDescription = 'Property access expression';
  PropertyAssignment = 0;
  PropertyAssignmentDescription = 'Property assignment';
  PropertyDeclaration = 0;
  PropertyDeclarationDescription = 'Property declaration';
  PropertySignature = 0;
  PropertySignatureDescription = 'Property signature';
  RegularExpressionLiteral = 0;
  RegularExpressionLiteralDescription = 'Regular expression literal';
  ReturnStatement = 1;
  ReturnStatementDescription = 'Return statement';
  SetAccessor = 0;
  SetAccessorDescription = 'Set accessor';
  SourceFile = 0;
  SourceFileDescription = 'Source file';
  StringLiteral = 0;
  StringLiteralDescription = 'String literal';
  SwitchStatement = 1;
  SwitchStatementDescription = 'Switch statement';
  TemplateExpression = 0;
  TemplateExpressionDescription = 'Template expression';
  ThrowStatement = 1;
  ThrowStatementDescription = 'Throw statement';
  TryStatement = 1;
  TryStatementDescription = 'Try statement';
  TypeAssertionExpression = 0;
  TypeAssertionExpressionDescription = 'Type assertion expression';
  TypeLiteral = 0;
  TypeLiteralDescription = 'Type literal';
  TypeReference = 0;
  TypeReferenceDescription = 'Type reference';
  VariableDeclaration = 0;
  VariableDeclarationDescription = 'Variable declaration';
  VariableStatement = 0;
  VariableStatementDescription = 'Variable statement';
  WhileStatement = 1;
  WhileStatementDescription = 'While statement';
  WithStatement = 1;
  WithStatementDescription = 'With statement';
}