# Code Metrics - VsCode Extension

Computes the complexity of typescript class members.

## It looks like this

![First sample, demonstrating a constructor with overall complexity of 21](https://raw.githubusercontent.com/kisstkondoros/codemetrics/master/images/Sample1.png)

![Second sample, demonstrating a constructor with overall complexity of 1](https://raw.githubusercontent.com/kisstkondoros/codemetrics/master/images/Sample2.png)

![Third sample, demonstrating a method with overall complexity of 5](https://raw.githubusercontent.com/kisstkondoros/codemetrics/master/images/Sample3.png)

## Install

[How to install vscode extentions](https://code.visualstudio.com/docs/editor/extension-gallery)

## Customization
In the workspace settings one can override the defaults
(for a complete list check AppConfiguration.ts)
```javascript
{
  // highest complexity level will be set when it exeeds 15
  "codemetrics.ComplexityLevelExtreme" : 15,

  // Description for the highest complexity level
  "codemetrics.ComplexityLevelExtremeDescription" : "OMG split this up!",

  // someone uses 'any', it must be punished
  "codemetrics.AnyKeyword": 100
}
  ```

### Change Log
- 0.3.1
  - Fixed NPE in navigation command
- 0.3.0
  - Use script target defined in tsconfig
- 0.2.0
  - Code Metrics info command changed to display a QuickPick menu
- 0.1.0
  - Added command to be able to show code lens details
- 0.0.2
  - Typescript added as real dependency
- 0.0.1
  - Initial project setup

### License

Licensed under MIT
