# Code Metrics - VsCode Extension

Computes the complexity of typescript class members.

## Install

[How to install vscode extentions](https://code.visualstudio.com/docs/editor/extension-gallery)

## Customization
In the workspace settings one can override the defaults
(for a complete list check AppConfiguration.ts)

    {
      "codemetrics.ComplexityLevelExtreme" : 15, // highest complexity level will be set when it exeeds 15
      "codemetrics.ComplexityLevelExtremeDescription" : "OMG split this up!", // Description for the highest complexity level
      "codemetrics.AnyKeyword": 100 // someone uses 'any', it must be punished
    }

### Change Log

- 0.0.1
  - Initial project setup

### License

Licensed under MIT
