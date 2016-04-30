# Code Metrics - VsCode Extension

Computes the complexity of typescript class members.

## It looks like this

![First sample, demonstrating a constructor with overall complexity of 21](./images/sample1.png)

![Second sample, demonstrating a constructor with overall complexity of 1](./images/sample2.png)

![Third sample, demonstrating a method with overall complexity of 5](./images/sample3.png)

## Install

[How to install vscode extentions](https://code.visualstudio.com/docs/editor/extension-gallery)

## Customization
In the workspace settings one can override the defaults
(for a complete list check AppConfiguration.ts)
```json
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

- 0.0.1
  - Initial project setup

### License

Licensed under MIT
