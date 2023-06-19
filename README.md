# PEEQ
**Glob based file explorer filtering**

## Features

- Enable/disable workspace file filtering based on glob patterns
- Define multiple sets (zones) of glob patterns to easily switch between
- Save and restore the default file exclusion rules in the workspace

## Usage

Create a `peeq.json` file in your workspace root. This file defines the glob pattern sets (zones) for file filtering.


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
   

## Methods

Use the provided methods and commands to control PEEQ.

---
### `peeq.enable` "PEEQ: Enable File Explorer Filtering"
Enable file explorer filtering for the current workspace. The `peeq.json` config file will be loaded and parsed if available for user defined zones containing glob patterns.

---
### `peeq.disable` ""PEEQ: Disable File Explorer Filtering"
---
### `peeq.defaults` ""PEEQ: Save Default File Exclusion Rules"
---
### `peeq.zone` ""PEEQ: Set Active Zone"
---
### `peeq.nextZone` ""PEEQ: Cycle To Next Zone"
---

## Limitations

- The glob patterns only match files and directories in the workspace root. Nested directories are not supported.

## Feedback

If you have suggestions or issues, please open an issue on the GitHub repository.

## Release Notes

View release notes and changes in [changelog.md](/CHANGELOG.md)

## License

[MIT](/LICENSE)