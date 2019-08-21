import {
    InitializeResult,
    IPCMessageReader,
    IPCMessageWriter,
    IConnection,
    createConnection,
    TextDocuments,
} from "vscode-languageserver";
import { MetricsRequestType } from "../common/protocol";
import { MetricsParserUtil } from "./MetricsParserUtil";

let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

let documents: TextDocuments = new TextDocuments();
documents.listen(connection);

connection.onInitialize((): InitializeResult => {
    return {
        capabilities: {
            textDocumentSync: documents.syncKind
        }
    };
});

connection.onRequest(MetricsRequestType, RequestData => {
    let document = documents.get(RequestData.uri);
    return new MetricsParserUtil(RequestData.configuration, connection).getMetrics(document)
});

connection.listen();
