# <img style="width:25px;height:25px;" src="./public/favicon.png"></img> Overflowing Palette

### Live ![Itch.io](https://img.shields.io/badge/itch.io-%23FF0B34.svg?logo=Itch.io&logoColor=white) :  https://xirtelan.itch.io/overflowing-palette 
### Live ![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-121013?logo=github&logoColor=white): https://xirtelan.github.io/overflowing_palette/
showcase: https://youtu.be/9FPFLpCEiQI

> [!Note]
> [28.04.25] Update 2.0 Work in progress \
> <s>[14.04.25] ON HOLD \
> I am trying to participate in [GameDev.js Jam](https://itch.io/jam/gamedevjs-2025) April 13th 2025  to April 26th 2025.  So the work on the update is on hold until then </s>

> [!Note]
> Work on update 2.0 is in progress, but slowly due to a lack of free time. Plans: a new mechanic (from patch 2.2 + a new one), new levels ofc, performance mode (for big grid or weak devices), some UI improvements, and possibly a desktop version?

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
  - [Base](#base)
  - [Config (Offline)](#config-offline)
    - [Colors](#colors)
    - [Add Levels](#add-levels)
    - [UI](#ui)
  - [Code](#code)
    - [Shader](#shader)
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

## Usage 

### Level Selection
![image](https://github.com/user-attachments/assets/e9c641ff-0b9d-459f-b254-b8caa26f98b8)


#### Default - Levels from the Game 
![image](https://github.com/user-attachments/assets/ab81da30-b86f-4be4-aefd-e407506edd61)


Levels are separated by regions.  
**Green background** - Cleared stages  
**Note:** Cleared levels are saved in the browser's localStorage.

### Import Levels  

![image](https://github.com/user-attachments/assets/164a4706-2872-4383-ab69-69c82631e306)

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
