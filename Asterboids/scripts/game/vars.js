﻿window.g58 = window.g58 || {};

g58.vars = {
    defaultOptions: {
        cameraSplitMode: "viewCentreAimCentre",
        flipCamera: "false",
        ship: true,
        move: true,
        sound: false
    },
    
    enablePauseDelayMs: 500,
    
    cubeSpinSpeed: 0.1,
    
    invulnerableMs: 1000,
    
    ship: {
        initialSpeed: 30,
        acceleration: 0.005
    },
    
    webcam: {
        moveSpeed: 1,
        rotateSpeed: 0.001,
        viewCoordConstant: 10000,
        aimCoordConstant: 10000,
        viewBuffer: { limit: 0.01, constant: 0.5 }
    }
};
