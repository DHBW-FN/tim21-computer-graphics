<p align=center>
    <img src=https://github.com/DHBW-FN/tim21-computer-graphics/assets/26843910/bd4a338e-2ef1-46fb-a5e5-024f83145ce7 alt=Banner>
</p>
# Project Exam


- **Module**: Computer Graphics
- **Professor**: Prof. Dr. Schneider
- **Course**: TIM21
- **Team Members**:
    - [Tobias Goetz](https://github.com/TobiasGoetz)
    - [Noel Kempter](https://github.com/NoelKempter)
    - [Philipp Kuest](https://github.com/philippkuest)

## Description

This project utilizes the [three.js](https://threejs.org/) library to create a 3D scene of the Eiffel Tower and its
surroundings.
The user can explore the scene using various cameras

## Key Features

- Day/Night cycle
- Custom grass shader
- Shadows
- Raycasting collision detection (for player movement) using BVH
- Modular design
- Animations (Cars, Birds)

## Installation

To run the application locally on your device, follow these steps:

1. Clone the repository/Download the code.
2. Install dependencies using `npm install`.
3. Start the application with the command `npm start`.

Afterward, a URL will be output in the console, where the application is accessible.
This URL can be opened in any browser.

## Usage

Fair warning: The application is quite resource-intensive and might not run smoothly on older devices.
It has been tested on a 2021 Macbook Pro (M1 Max, 32GB RAM) and a Windows Desktop PC (i9 9900K, RTX 2080Ti, 64 GB RAM),
where it ran decently smooth.

### Controls
<img width="386" alt="Steuerungspanel" src="https://github.com/DHBW-FN/tim21-computer-graphics/assets/26843910/2fb6a45a-7f53-4081-b1d0-a9af9aff7477">

You can control the player using one of two methods

1. Using the UI in the bottom left corner
2. Using the mouse and keyboard see [Keybinds](#keybinds)

#### Keybinds

- W: Move forward
- S: Move backward
- A: Move left
- D: Move right
- R: Move up
- F: Move down
- Mouse: Look around
- Arrow keys: Look around

### UI
![Buttons](https://github.com/DHBW-FN/tim21-computer-graphics/assets/26843910/ff76ad76-4589-44db-9251-786da84df5ff)

As previously mentioned, you can control the player using the UI in the bottom left corner.
The UI can also be used to trigger the following things:

1. Set the time to day
2. Set the time to night
3. Change the current camera (Drone, Overview, Eiffel Tower)
4. Reset the drone camera to the starting position
