
<p align="center"><img src="peeq.png" alt="Image" width="100" height="100"></p>

<p align="center"><b>File filtering extension for Visual Studio Code.</b></p>
<p align="center">Don't get lost in a massive codebase - show only relevant files in the explorer.</p>

## Features

- Enable/disable workspace file filtering based on glob patterns
- Define multiple sets (zones) of glob patterns to easily switch between
- Save and restore the default file exclusion rules in the workspace

## Usage

### 1. Create a `peeq.json` file in your workspace root.  
This file defines the glob pattern sets (zones) for file filtering.

```json
{
    "docs":[ "**/**.md*(x)" ],
    "dev": [
        "src/**",
        "**/**.ts*(x)",
        ".eslintrc.json"
    ],
    "devops":[
        "package.json",
        "package-lock.json",
        "tsconfig.json",
        "webpack.config.json",
        "CHANGELOG.md",
        ".vscodeignore",
        ".gitignore",
        "node_modules/**",
    ]
}
```
### 2. Create a `peeq.json` file in your workspace root.  
   


## Methods

### `peeq.enable` "peeq: Enable"
Enable file filtering. The `peeq.json` config file will be loaded and parsed if available for user defined zones
containing glob patterns.
  - `peeq.disable`: Disable the file filtering.
  - `peeq.defaults`: Save the current file exclusion rules as the default. This is useful if you have existing file exclusion rules that you want to restore when the filtering is disabled.
  - `peeq.nextZone`: Switch to the next zone defined in the `peeq.json` file.
  - `peeq.zone`: Select a specific zone from the `peeq.json` file.

## Limitations

- The glob patterns only match files and directories in the workspace root. Nested directories are not supported.

## Feedback

If you have suggestions or issues, please open an issue on the GitHub repository.

## Release Notes

View release notes and changes in [changelog.md](/CHANGELOG.md)

## License

[MIT](/LICENSE)