# PEEQ
 
**Focus on the content that matters, hide everything else with glob based file explorer filtering.**


## Features
- Enable/disable workspace file filtering based on glob patterns
- Define multiple sets (zones) of glob patterns to easily switch between
- Save and restore the default file exclusion rules in the workspace

<br />
<hr />

## Usage

### **1. Create a config file**  
Create a `peeq.json` file in your workspace root. This file defines the glob pattern sets (zones) for file filtering.


```json
{
    "dev": [ "src/**" ],
    "devops":[
        "package.json",
        "package-lock.json",
        "tsconfig.json",
        "CHANGELOG.md",
        ".gitignore",
        "node_modules/**",
    ]
}
```
<br />

### **2. Enable PEEQ**  
Enable file filtering by calling `peeq.enable` or `peeq.setZone` and select a zone
to activate. 

![command palette enable](/command_pallete.png)

<br />

### **3. Cycle through zones**  
PEEQ will show the currently active zone on the status bar, which can be clicked to cycle through zones:

![active zone 'disabled'](/active_zone_disabled.png)
![active zone 'devops](/active_zone_devops.png)

<br />
<hr />

## Methods


> Any methods that change the state of the extension (`enable`, `zone`, `nextZone`) will refresh and apply the new exclusion rules according to the current config. 

<br />

### `peeq.enable` 
"PEEQ: Enable File Explorer Filtering"  
Enable file explorer filtering for the current workspace. The `peeq.json` config file will be loaded and parsed if available for user defined zones containing glob patterns.

<br />

### `peeq.disable` 
"PEEQ: Disable File Explorer Filtering"  
Disable file explorer filtering for the current workspace. The config and exclusion rules will not be reloaded.

<br />

### `peeq.defaults` 
"PEEQ: Save Default File Exclusion Rules"  
Save the current exclusion rules as the default, to be used as the `disabled` state of PEEQ.

<br />

### `peeq.zone` 
"PEEQ: Set Active Zone"  
List zones and select a zone to activate. Config file and exclusion rules will be reloaded.

<br />

### `peeq.nextZone` 
"PEEQ: Cycle To Next Zone"  
Cycle to the next zone, or disable PEEQ if the end of zones is reached. Config file and exclusion rules will be reloaded.





<br />
<hr />

## Limitations

- The glob patterns only match files and directories in the workspace root. Nested directories are not supported.
- The extension does not watch the config file for changes. Use `enable` to refresh.

<br />
<hr />

## Feedback

If you have suggestions or issues, please open an issue on the [GitHub repository](https://github.com/pratiqdev/peeq).

<br />
<hr />

## License

[MIT](/LICENSE)