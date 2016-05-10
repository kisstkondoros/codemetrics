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

  // Description for the highest complexity level
  "codemetrics.basics.ComplexityLevelExtremeDescription" : "OMG split this up!",

  // someone uses 'any', it must be punished
  "codemetrics.nodeconfiguration.AnyKeyword": 100
}
```

## Commands
- Toggle code lenses for arrow functions - default key binding F4
- Toggle code metrics - default key binding F5

They can be overriden in the keybindings.json (File -> Preferences -> Keyboard Shortcuts)
```javascript
{ "key": "f4",                    "command": "codemetrics.toggleCodeMetricsForArrowFunctions",
                                     "when": "editorTextFocus" },
{ "key": "f5",                    "command": "codemetrics.toggleCodeMetricsDisplayed",
                                     "when": "editorTextFocus" }
```

### Change Log
- 1.0.0
  - Configuration properties has been renamed and listed in extension manifest
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
