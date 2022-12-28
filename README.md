# Code Metrics - Visual Studio Code Extension

Computes complexity in TypeScript / JavaScript / Lua files.

# Complexity calculation

The steps of the calculation:

-   create an AST from the input source file
-   walk through each and every node of it
-   depending on the type of the node and the configuration associated with it create a new entry about the node.
    This entry contains everything necessary for further use
    (e.g. a textual representation for the node, complexity increment, child nodes etc.)
-   show the sum of complexity of child nodes for methods and the maximum of child nodes for classes

Please note that it is not a standard metric, but it is a close approximation
of [Cyclomatic complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity).

Please also note that it is possible to balance the complexity calculation for the
project / team / personal taste by adjusting the relevant configuration entries
(content assist is provided for all of them for easier configuration).

For example if one prefers [guard clauses](https://refactoring.com/catalog/replaceNestedConditionalWithGuardClauses.html),
and is ok with all the branches in switch statements then the following could be applied:

```json
"codemetrics.nodeconfiguration.ReturnStatement": 0,
"codemetrics.nodeconfiguration.CaseClause": 0,
"codemetrics.nodeconfiguration.DefaultClause": 0
```

If You want to know the causes You can click on the code lens to list all the entries for a given method or class. (This also allows You to quickly navigate to the corresponding code)

![Metric details example, showing how one might check the overall complexity for a method by clicking on the codelens](https://raw.githubusercontent.com/kisstkondoros/codemetrics/master/images/metric_details.png)

## It looks like this

![First sample, demonstrating a constructor with overall complexity of 21](https://raw.githubusercontent.com/kisstkondoros/codemetrics/master/images/Sample1.png)

![Second sample, demonstrating a constructor with overall complexity of 1](https://raw.githubusercontent.com/kisstkondoros/codemetrics/master/images/Sample2.png)

![Third sample, demonstrating a method with overall complexity of 5](https://raw.githubusercontent.com/kisstkondoros/codemetrics/master/images/Sample3.png)

## Install

[How to install Visual Studio Code extensions](https://code.visualstudio.com/docs/editor/extension-gallery)

[Direct link to Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=kisstkondoros.vscode-codemetrics)

## Customization

In the workspace settings one can override the defaults.
For a complete list please check the configuration section in the package.json.
For the most commonly used ones, one should do a search for `codemetrics.basics`
in the settings ui.

```javascript
{
  // highest complexity level will be set when it exceeds 15
  "codemetrics.basics.ComplexityLevelExtreme" : 15,

  // Hides code lenses with complexity lesser than the given value
  "codemetrics.basics.CodeLensHiddenUnder" : 5,

  // Description for the highest complexity level
  "codemetrics.basics.ComplexityLevelExtremeDescription" : "OMG split this up!",

  // someone uses 'any', it must be punished
  "codemetrics.nodeconfiguration.AnyKeyword": 100
}
```

## Commands

-   Toggle code lenses for arrow functions
-   Toggle code metrics

They can be bound in the keybindings.json (File -> Preferences -> Keyboard Shortcuts)

```javascript
{ "key": "f4",                    "command": "codemetrics.toggleCodeMetricsForArrowFunctions",
                                     "when": "editorTextFocus" },
{ "key": "f5",                    "command": "codemetrics.toggleCodeMetricsDisplayed",
                                     "when": "editorTextFocus" }
```

### Change Log

-   1.26.1
    -   Update tsmetrics-core to 1.4.1 (fixes default for `IfWithElseStatement` )
-   1.26.0
    -   Update tsmetrics-core to 1.4.0 (comes with a new config `IgnoredFunctionNames`)
-   1.25.2
    -   Update tsmetrics-core to 1.3.1
-   1.25.1
    -   Update tsmetrics-core to 1.3.0
-   1.25.0
    -   Update dependencies
    -   Make it work for vue setup scripts
-   1.24.0
    -   Jump to selection from the quick pick menu
-   1.23.1
    -   Update dependencies
-   1.23.0
    -   Use QuickPickItems instead of plain strings
    -   Update tsmetrics-core to 1.2.1
-   1.22.1
    -   Update change log
-   1.22.0
    -   Update the activationEvents property (contribution from [@igorskyflyer](https://github.com/igorskyflyer) )
    -   Add "onLanguage:vue" to the list of activation events
-   1.21.0
    -   Show all items in the quick pick menu
-   1.20.0
    -   Migrate to webpack
    -   Adjust section about configuration options
    -   Update tsmetrics-core
-   1.19.1
    -   Update dependencies
-   1.19.0
    -   Add support for ts based vue components
-   1.18.1
    -   Update dependencies
    -   Fix rounding issues
-   1.18.0
    -   Add DecorationTemplate configuration (contribution from [@luchsamapparat](https://github.com/luchsamapparat) )
-   1.17.4
    -   Update dependencies
-   1.17.3
    -   Update dependencies
-   1.17.2
    -   Fix invalid default color definition
-   1.17.1
    -   Add file and untitled scheme explicitly
-   1.17.0
    -   Adjust codebase to new API standards of VSCode
    -   Adjust filter boundaries which are used for color decorators
-   1.16.0
    -   Update dev dependency for vscode to avoid vulnerability warning
    -   Add description about complexity calculation and configuration
-   1.15.0
    -   Update tsmetrics-core to v1.0.0
-   1.14.0
    -   Make decoration colors configurable
        -   The following properties were introduced:
            -   codemetrics.basics.ComplexityColorLow
            -   codemetrics.basics.ComplexityColorNormal
            -   codemetrics.basics.ComplexityColorHigh
            -   codemetrics.basics.ComplexityColorExtreme
-   1.13.0
    -   Update vscode version to 1.1.10
    -   Avoid indentation distortion by moving decorations to the end of the line
    -   Debounce EditorDecoration update requests properly
-   1.12.0
    -   Add support for Visual Studio Live Share
-   1.11.2
    -   Improve decorator lifecycle management
-   1.11.1
    -   Only create new decorations if the settings has changed
-   1.11.0
    -   Add new mode OverviewRuler
    -   Update tsmetrics-core and typescript dependencies
-   1.10.0
    -   Add support for embedded scripts in vue and html files
-   1.9.6
    -   Disable diagnostic report for code metrics
-   1.9.5
    -   Add .vscode-test to .vscodeignore
-   1.9.4
    -   Replace new line characters in quick pick menu with spaces
-   1.9.3
    -   Update readme
-   1.9.2
    -   Fix behavior of command 'codemetrics.toggleCodeMetricsForArrowFunctions'
-   1.9.1
    -   Set default of ObjectLiteralExpression to 0
-   1.9.0
    -   Implement file exclusion by glob pattern
-   1.8.0
    -   Upgrade to tsmetrics-core@0.4.0
    -   Use new collector types from tsmetrics-core (show complexity maximum on class level)
-   1.7.2
    -   Make it possible to enable / disable diagnostics
-   1.7.1
    -   Always use activeTextEditor in change callbacks
-   1.7.0
    -   Add experimental diagnostics support
    -   Add experimental support for Lua
-   1.6.1
    -   Fix spelling error of 'threshold' in configuration
-   1.6.0
    -   Execute code metrics computation in language server
-   1.5.0
    -   Upgrade vsdcode and typescript dependency
    -   Remove unused typings
    -   Extract code metrics related util class
    -   Move CodeMetricsCodeLensProvider to codelensprovider folder
    -   Add text decoration based on code metrics
        -   Appearance can be configured with the following properties:
            -   "codemetrics.basics.DecorationModeEnabled"
            -   "codemetrics.basics.CodeLensEnabled"
-   1.4.1
    -   Update changelog
-   1.4.0
    -   Expose code lens location related configuration properties
        -   "codemetrics.basics.MetricsForClassDeclarationsToggled"
        -   "codemetrics.basics.MetricsForConstructorsToggled"
        -   "codemetrics.basics.MetricsForEnumDeclarationsToggled"
        -   "codemetrics.basics.MetricsForFunctionDeclarationsToggled"
        -   "codemetrics.basics.MetricsForFunctionExpressionsToggled"
        -   "codemetrics.basics.MetricsForMethodDeclarationsToggled"
        -   "codemetrics.basics.MetricsForArrowFunctionsToggled"
-   1.3.0
    -   Add new properties to selectively disable codemetrics for different languages
        -   "codemetrics.basics.EnabledForTSX"
        -   "codemetrics.basics.EnabledForJSX"
        -   "codemetrics.basics.EnabledForTS"
        -   "codemetrics.basics.EnabledForJS"
    -   Introduce file size limit
        -   "codemetrics.basics.FileSizeLimitMB" default is 0.5 MB
-   1.2.2
    -   Fix behaviour of CodeLensHiddenUnder
-   1.2.1
    -   Change type of IfWithElseStatement property to number
-   1.2.0
    -   Add JSX and TSX support, special thanks to [Aron Adler](https://github.com/Arrow7000)
-   1.1.6
    -   Fix possible NPE in 'triggerCodeLensComputation'
    -   Remove language restriction from 'activationEvents'
-   1.1.5
    -   Udpate logo
-   1.1.4
    -   Change textual representation in quick pick
-   1.1.3
    -   Fix typo in codemetrics.basics.ComplexityLevelNormalDescription
-   1.1.2
    -   Fix dependency issue with 'fs'
-   1.1.1
    -   Fix issue with non up to date source file processing
-   1.1.0
    -   Parse logic refactored to be a separate npm module [tsmetrics-core](https://www.npmjs.com/package/tsmetrics-core) allowing to create a gulp plugin as well [gulp-tsmetrics](https://www.npmjs.com/package/gulp-tsmetrics)
    -   QuickPick now works with a simplified and more meaningful list, which shows only one level of the hierarchy at once
-   1.0.1
    -   Default keyboard bindings removed
    -   CodeLens cache invalidation side effect eliminated (dirty file)
    -   Path concatenation replaced with path.join
-   1.0.0
    -   Configuration properties has been renamed and listed in extension manifest
    -   New property CodeLensHiddenUnder introduced to be able to hide uninteresting code lenses
-   0.5.0
    -   Commands to alter code metrics behaviour added (toggle code metrics and toggle code lenses for arrow functions)
-   0.4.1
    -   Showing complexity for arrow functions as well
-   0.4.0
    -   Added JavaScript support
    -   Removed module declaration from the complexity calculation
    -   Function related complexity calculation revised
-   0.3.1
    -   Fixed NPE in navigation command
-   0.3.0
    -   Use script target defined in tsconfig
-   0.2.0
    -   Code Metrics info command changed to display a QuickPick menu
-   0.1.0
    -   Added command to be able to show code lens details
-   0.0.2
    -   TypeScript added as real dependency
-   0.0.1
    -   Initial project setup

### License

Licensed under MIT
