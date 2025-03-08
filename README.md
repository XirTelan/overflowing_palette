# <img style="width:28px;height:28px;" src="./public/assets/textures/icon.png"></img> Overflowing Palette

## [WIP] ETA 8-9 March 2025

- [General](#introduction)
- [Usage](#usage)
  - [Level Selection](#LevelSelection)
    - [Import level](#ImportLevel)
  - [Level Editor](#LevelEditor)
    - [Control](#Control)
    - [Export level](#ExportLevel)
  - [Options](#Options)
- [Customization](#customiztion)
  - [Base](#Base)
  - [Config(Offline)](#Base)
    - [Colors](#Colors)
    - [Add levels ](#AddLevels)
    - [UI ](#Colors)
  - [Code](#Base)
    - [Shader](#Shader)
- [Installation/Building for offline](#Install)

### Live: [WIP]

## General

![screenshot](screenshot.png)

Poject - recreating the puzzle 'Overflowing Palette' from Wuthering Waves as an HTML5 web game with Phaser 3.

Features:
-All levels from the game \
-Level Editor (export/import ) \
-Levels with diffent grid size \
-More available colors \
-Customization

Stack: Vite, Phaser 3

## Usage 

### LevelSelection
![image](https://github.com/user-attachments/assets/f3c3c88a-779a-42f4-9124-2b3c8ee6379e)

#### Default - levels from the game 
![image](https://github.com/user-attachments/assets/a0498864-4c22-4145-859c-7a2a46719691)

Separated by regions 
Green background - cleared stages
! Cleared levels saved in browser localStorage. 

Import levels  

## LevelEditor

![image](https://github.com/user-attachments/assets/f2269afd-b52c-429c-aeeb-8aec8d36e25f)

quite straightforward , choose how big grid do we want. \
despite the fact that the values ​​are limited from 2 to 100 
field more than 25x25 can be hard to use and req some time to load

Fill color - which color will be used to fill the grid 

![image](https://github.com/user-attachments/assets/7a0b2885-4123-4cf6-87ae-a34d93a6b4b9)


You can use  box selection  to select multiple cells at once by clicking and dragging a  selection area over them (calc at cell center).  

# ExportLevel

![image](https://github.com/user-attachments/assets/9db3855f-c4ba-4e56-9a3d-b368ecacdcdd)

Copy STRING - using for in-game import 
Copy JSON - usinng for offline add levels info json file


 





## Install

From Source code

```
pnpm install
```

```
pnpm run dev
```

Build:

```
pnpm run build
```

After building or already downloaded ready-made you will need local server

Here are some of the options

Use Live Server (Extension for VS Code) \
  Right click the index.html file in Visual Studio Code, select Open with Live Server. 

Use http-server module from node (install via npm then run http-server . from your project directory) \
use http.server package from python
use a wamp (or lamp) server \
