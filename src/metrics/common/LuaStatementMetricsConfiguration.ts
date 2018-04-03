const LuaStatementMetricsConfiguration = {
    LabelStatement: 1,
    BreakStatement: 1,
    GotoStatement: 1,
    ReturnStatement: 1,
    IfStatement: 1,
    IfClause: 1,
    ElseifClause: 1,
    ElseClause: 1,
    WhileStatement: 1,
    DoStatement: 1,
    RepeatStatement: 1,
    LocalStatement: 0,
    AssignmentStatement: 0,
    CallStatement: 0,
    FunctionDeclaration: 1,
    ForNumericStatement: 1,
    ForGenericStatement: 1,
    Chunk: 0,
    Identifier: 0,
    StringLiteral: 0,
    NumericLiteral: 0,
    BooleanLiteral: 0,
    NilLiteral: 0,
    VarargLiteral: 0,
    TableKey: 0,
    TableKeyString: 0,
    TableValue: 0,
    TableConstructorExpression: 0,
    LogicalExpression: 1,
    BinaryExpression: 1,
    UnaryExpression: 0,
    MemberExpression: 1,
    IndexExpression: 0,
    CallExpression: 0,
    TableCallExpression: 0,
    StringCallExpression: 0,
    Comment: 0
};

export type ILuaStatementMetricsConfiguration = Partial<typeof LuaStatementMetricsConfiguration>;
export const getInitialLuaStatementMetricsConfiguration = () => {
    return { ...LuaStatementMetricsConfiguration };
};
