window.g58 = window.g58 || {};

g58.logic = {};

g58.logic.updateLogic = function (controlParams) {
    var i;
    
    g58.g.cameraBlock.velocityInOwnFrame.z -= 0.002 * controlParams.msSinceLastLogic;
    
    g58.g.bricks.forEach(function (cube) {
        e58.frame.rotateInOwnFrameX(cube.frame, cube.randomSpins.x * g58.vars.cubeSpinSpeed * controlParams.msSinceLastLogic);
        e58.frame.rotateInOwnFrameY(cube.frame, cube.randomSpins.y * g58.vars.cubeSpinSpeed * controlParams.msSinceLastLogic);
        e58.frame.rotateInOwnFrameZ(cube.frame, cube.randomSpins.z * g58.vars.cubeSpinSpeed * controlParams.msSinceLastLogic);
    });
    
    if (g58.g.cameraBlock.frame.origin.z < g58.g.bricks[g58.g.bricks.length - 1].frame.origin.z - 10000) {
        g58.g.cameraBlock.frame = e58.frame.getNew([0, 0, 0], 0, 0, 0);
        g58.g.ship.frame = e58.frame.getNew([0, 0, -10000], 0, 0, 0);
        g58.misc.setBrickWave();
    }
    
    g58.g.totalElapsedMs = controlParams.totalElapsedMs;
    g58.g.msSinceLastResumed = controlParams.msSinceLastResumed;

    g58.logic.updateShipState();
    
    g58.logic.detectCollision();
    g58.control.handleControls(controlParams);
    g58.g.universe.updateLogic(controlParams);
};

g58.logic.detectCollision = function () {
    if (g58.g.ship.invulnerable) {
        return false;
    }
    
    g58.g.bricks.forEach(function (cube, i) {
        if (e58.collision.areBlocksInContact(g58.g.ship, cube)) {
            g58.logic.handleCollision(cube);
        }
    });
};

g58.logic.handleCollision = function (cube) {    
    g58.g.ship.invulnerable = true;
    g58.g.ship.invulnerableUntilMs = g58.g.totalElapsedMs + g58.vars.invulnerableMs;
    
    g58.g.ship.planes.forEach(function (plane) {
        plane.lineColour = g58.colours.invulnerableShip.line;
        plane.fillColour = (plane.name == "back") ?
            g58.colours.invulnerableShip.back :
            g58.colours.invulnerableShip.plane;
    });
    
    e58.control.queueSound(e58.audio.sounds.crash);
};

g58.logic.updateShipState = function () {    
    if (g58.g.ship.invulnerable && g58.g.totalElapsedMs >= g58.g.ship.invulnerableUntilMs) {
        g58.g.ship.invulnerable = false;
                
        g58.g.ship.planes.forEach(function (plane) {
            plane.lineColour = g58.colours.ship.line;
            plane.fillColour = (plane.name == "back") ?
                g58.colours.ship.back :
                g58.colours.ship.plane;
        });
    }
};
