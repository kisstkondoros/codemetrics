import { MetricsModel, IMetricsModel } from "tsmetrics-core/lib/MetricsModel";
import { ILuaStatementMetricsConfiguration } from "../common/LuaStatementMetricsConfiguration";
import * as parser from "luaparse";

export class LuaMetrics {
    public getMetricsFromLuaSource(settings: ILuaStatementMetricsConfiguration, source: string): IMetricsModel {
        const root = new MetricsModel(0, 0, "root", 0, 0, 0, "root", false, false, "SUM");
        try {
            const ast = parser.parse(source, { locations: true, ranges: true });
            if (Array.isArray(ast.body)) {
                ast.body.forEach((child) => this.appendNode(settings, child, root));
            } else {
                this.appendNode(settings, ast, root);
            }
        } catch (error) {
            console.log("Failed to parse file" + error);
        }
        return root;
    }
    private appendNode(settings: ILuaStatementMetricsConfiguration, node, parent: IMetricsModel) {
        if (Array.isArray(node)) {
            node.forEach((child) => this.appendNode(settings, child, parent));
            return;
        }

        const content = node.value || node.name || node.raw || node.type || "";

        const complexity = settings[node.type];
        const isNodeVisible = node.type == "FunctionDeclaration";

        if (node.range) {
            const model = new MetricsModel(
                node.range[0],
                node.range[1],
                content,
                node.loc.start.line,
                node.loc.start.column,
                complexity,
                this.camelToSpaced(node.type),
                true,
                isNodeVisible,
                "SUM"
            );
            parent.children.push(model);

            if (node.body) {
                this.appendNode(settings, node.body, model);
            } else if (node.clauses) {
                node.clauses.forEach((subNode) => {
                    this.appendNode(settings, node.clauses, model);
                });
            }
        } else {
            console.log("no range: " + JSON.stringify(node));
        }
    }
    private camelToSpaced(input: string): string {
        return input.replace(/^[a-z]|[A-Z]/g, function (v, i) {
            return i === 0 ? v.toUpperCase() : " " + v.toLowerCase();
        });
    }
}
