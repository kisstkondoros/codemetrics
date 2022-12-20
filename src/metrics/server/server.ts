import {
    InitializeResult,
    createConnection,
    TextDocuments,
    TextDocumentSyncKind,
    ProposedFeatures,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { MetricsRequestType } from "../common/protocol";
import { MetricsParserUtil } from "./MetricsParserUtil";

let connection = createConnection(ProposedFeatures.all);

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
documents.listen(connection);

connection.onInitialize((): InitializeResult => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
        },
    };
});

connection.onRequest(MetricsRequestType, (RequestData) => {
    let document = documents.get(RequestData.uri);
    if (!document) {
        return [];
    }
    return new MetricsParserUtil(RequestData.configuration, connection).getMetrics(document);
});

connection.listen();
