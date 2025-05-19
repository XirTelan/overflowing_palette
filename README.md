# <img style="width:25px;height:25px;" src="./public/favicon.png"></img> Overflowing Palette

### Live ![Itch.io](https://img.shields.io/badge/itch.io-%23FF0B34.svg?logo=Itch.io&logoColor=white) :  https://xirtelan.itch.io/overflowing-palette 
### Live ![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-121013?logo=github&logoColor=white): https://xirtelan.github.io/overflowing_palette/
showcase: https://youtu.be/9FPFLpCEiQI


- [General](#introduction)
- [Usage](#usage)
  - [Level Selection](#level-selection)
    - [Import Level](#import-level)
  - [Endless Zen](#endless-zen)
  - [Level Editor](#level-editor)
    - [Controls](#controls)
    - [Export Level](#export-level)
  - [Options](#options)
- [Customization](#customization)
- [Installation/Building for Offline](#installation)


## General

![screenshot](screenshot.png)

Project: Recreating the puzzle *Overflowing Palette* from *Wuthering Waves* as an HTML5 web game using Phaser 3.

### Features:
- All levels from the game  
- Level Editor (export/import)  
- Levels with different grid sizes  
- More available colors  
- Customization  

### Stack:
Vite, Phaser 3


## Level Selection / Structure

![image](https://github.com/user-attachments/assets/721fe3ed-a3d1-44a8-9615-f0b6ce291dd8)

- **Default**: Levels that were in the "Wuthering Waves."

Levels are separated by regions.  
**Yellow background**: Cleared stages.  
**Note:** Cleared levels are saved in the browser's localStorage.

![image](https://github.com/user-attachments/assets/3bae4438-179c-46e1-9414-5a4468245d6a)


- **Custom**: Levels that don't use any mechanics besides what the original puzzle has (e.g., portals).
- **Tools**: Levels that use the "Tools" mechanic.
- **Portals**: Levels that use the "Portal" mechanic.
- **Timers**: Levels that use the "Timers" mechanic.
- **Advanced**: Levels that use several different mechanics at once.





### Import Levels  

![image](https://github.com/user-attachments/assets/f85947ab-b8d0-4326-860f-0eb7de65eac5)


Shoud paste level in base64 format (or simply "string"):
After "Load" you will see preview for that level if its correct "string". 

## Endless Zen

![image](https://github.com/user-attachments/assets/78e36cf8-292f-4c5a-907d-e02563e25a25)


Auto-generated levels without a move counter.

Choose board size, number of colors, and difficulty (which affects how shuffled the board starts).

Option to skip a level if you don’t like the generated result.

After completing a level, you can start another with the same settings.

You can share completed levels with others. (Your number of moves will be set as a goal for others to beat.)



## Level Editor

![image](https://github.com/user-attachments/assets/919f8640-4756-412d-a509-e49164c89a34)


The editor is quite straightforward. Choose the grid size you want.  
Although the values are limited from **2 to 100**, fields larger than **25x25** can be hard to use and may take some time to load.

- **Fill Color** - Determines the color used to fill the grid.

![image](https://github.com/user-attachments/assets/d3881ec8-6bb7-439e-92fb-a80ecaa3f288)


You can use **box selection** to select multiple cells at once by clicking and dragging a selection area over them (calculated at the cell center).

## Export Level

![image](https://github.com/user-attachments/assets/e5b49faa-29cd-4176-8171-111371c486b3)


- **Copy STRING** - Used for in-game import.
- **Copy JSON** - Used for offline addition to the levels info JSON file.

### Options
![image](https://github.com/user-attachments/assets/ac11775e-f2f6-4411-989d-e37645832952)


General – Change language and backgroun settings. Added 4 new backgrounds, toggle overlay and distortion effect.

Colors – Now 8 colors; you can also rename them.

Gameplay – Options to disable dynamic tile backgrounds and adjust highlight intensity.

  Simple colors - remove any animation/shades etc on cells. 
  Stronger higlight - cell on mouse over will be more visible. 


## Customization
[WIP]
For desktop app.
All files 
resources\app\dist\assets

### Descriptions:
- **fonts**: All font files for the app.
- **shaders**: Files related to shaders used in the app.
- **sound**: Sound files
- **data**: Configuration files, localization configurations, and level data.
  - **assets**: file loading config for phaser 
  - **config**: Configuration files for app setup.
  - **lang**: Paths and configurations for available localizations.
  - **levels**: Data for levels.
- **localizations**: Localization files separated by language.
- **textures**: All textures used in the app.
  - **background**: Available background images.
  - **shaders**: Textures used in shaders.
  - **tutorials**: Images for the tutorial tab.
  - **levelBg**: Backgrounds for the levels category in the level selection tab.



  




## Installation

### From Source Code

```sh
pnpm install
```

```sh
pnpm run dev
```

### Build

```sh
pnpm run build
```

After building (or if using a prebuilt version), you will need a local server.

### Options for Running a Local Server:

- **Use Live Server (VS Code Extension)**  
  - Right-click the `index.html` file in Visual Studio Code and select **Open with Live Server**.  
- **Use `http-server` module from Node.js**  
  - Install via npm, then run:  
    ```sh
    http-server .
    ```
- **Use `http.server` from Python**
- **Use a WAMP (or LAMP) server**
