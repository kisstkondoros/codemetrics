# Code Metrics - Visual Studio Code Extension

Computes complexity in TypeScript / JavaScript files.

## It looks like this

![First sample, demonstrating a constructor with overall complexity of 21](https://raw.githubusercontent.com/kisstkondoros/codemetrics/master/images/Sample1.png)

![Second sample, demonstrating a constructor with overall complexity of 1](https://raw.githubusercontent.com/kisstkondoros/codemetrics/master/images/Sample2.png)

![Third sample, demonstrating a method with overall complexity of 5](https://raw.githubusercontent.com/kisstkondoros/codemetrics/master/images/Sample3.png)

## Install

[How to install Visual Studio Code extensions](https://code.visualstudio.com/docs/editor/extension-gallery)

[Direct link to Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=kisstkondoros.vscode-codemetrics)

## Customization
In the workspace settings one can override the defaults
(for a complete list check AppConfiguration.ts)
```javascript
{
  // highest complexity level will be set when it exeeds 15
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
- Toggle code lenses for arrow functions
- Toggle code metrics

They can be bound in the keybindings.json (File -> Preferences -> Keyboard Shortcuts)
```javascript
{ "key": "f4",                    "command": "codemetrics.toggleCodeMetricsForArrowFunctions",
                                     "when": "editorTextFocus" },
{ "key": "f5",                    "command": "codemetrics.toggleCodeMetricsDisplayed",
                                     "when": "editorTextFocus" }
```

### Change Log
- 1.4.1
  - Update changelog
- 1.4.0
  - Expose code lens location related configuration properties
    - "codemetrics.basics.MetricsForClassDeclarationsToggled"
    - "codemetrics.basics.MetricsForConstructorsToggled"
    - "codemetrics.basics.MetricsForEnumDeclarationsToggled"
    - "codemetrics.basics.MetricsForFunctionDeclarationsToggled"
    - "codemetrics.basics.MetricsForFunctionExpressionsToggled"
    - "codemetrics.basics.MetricsForMethodDeclarationsToggled"
    - "codemetrics.basics.MetricsForArrowFunctionsToggled"
- 1.3.0
  - Add new properties to selectively disable codemetrics for different languages
    - "codemetrics.basics.EnabledForTSX"
    - "codemetrics.basics.EnabledForJSX"
    - "codemetrics.basics.EnabledForTS"
    - "codemetrics.basics.EnabledForJS"
  - Introduce file size limit
    - "codemetrics.basics.FileSizeLimitMB" default is 0.5 MB
- 1.2.2
  - Fix behaviour of CodeLensHiddenUnder
- 1.2.1
  - Change type of IfWithElseStatement property to number
- 1.2.0
  - Add JSX and TSX support, special thanks to [Aron Adler](https://github.com/Arrow7000)
- 1.1.6
  - Fix possible NPE in 'triggerCodeLensComputation'
  - Remove language restriction from 'activationEvents'
- 1.1.5
  - Udpate logo
- 1.1.4
  - Change textual representation in quick pick
- 1.1.3
  - Fix typo in codemetrics.basics.ComplexityLevelNormalDescription
- 1.1.2
  - Fix dependency issue with 'fs'
- 1.1.1
  - Fix issue with non up to date source file processing
- 1.1.0
  - Parse logic refactored to be a separate npm module [tsmetrics-core](https://www.npmjs.com/package/tsmetrics-core) allowing to create a gulp plugin as well [gulp-tsmetrics](https://www.npmjs.com/package/gulp-tsmetrics)
  - QuickPick now works with a simplified and more meaningful list, which shows only one level of the hierarchy at once
- 1.0.1
  - Default keyboard bindings removed
  - CodeLens cache invalidation side effect eliminated (dirty file)
  - Path concatenation replaced with path.join
- 1.0.0
  - Configuration properties has been renamed and listed in extension manifest
  - New property CodeLensHiddenUnder introduced to be able to hide uninteresting code lenses
- 0.5.0
  - Commands to alter code metrics behaviour added (toggle code metrics and toggle code lenses for arrow functions)
- 0.4.1
  - Showing complexity for arrow functions as well
- 0.4.0
  - Added JavaScript support
  - Removed module declaration from the complexity calculation
  - Function related complexity calculation revised
- 0.3.1
  - Fixed NPE in navigation command
- 0.3.0
  - Use script target defined in tsconfig
- 0.2.0
  - Code Metrics info command changed to display a QuickPick menu
- 0.1.0
  - Added command to be able to show code lens details
- 0.0.2
  - TypeScript added as real dependency
- 0.0.1
  - Initial project setup

### License

Licensed under MIT
