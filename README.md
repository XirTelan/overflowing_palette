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
