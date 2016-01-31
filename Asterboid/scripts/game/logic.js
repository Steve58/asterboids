window.g58 = window.g58 || {};

g58.logic = {};

g58.logic.updateLogic = function (controlParams) {
    var i;
    
    g58.game.cameraBlock.velocityInOwnFrame.z -= 0.002 * controlParams.msSinceLastLogic;
    
    g58.game.bricks.forEach(function (cube) {
        cube.frame.rotateInOwnFrameX(cube.randomSpins.x * g58.vars.cubeSpinSpeed * controlParams.msSinceLastLogic);
        cube.frame.rotateInOwnFrameY(cube.randomSpins.y * g58.vars.cubeSpinSpeed * controlParams.msSinceLastLogic);
        cube.frame.rotateInOwnFrameZ(cube.randomSpins.z * g58.vars.cubeSpinSpeed * controlParams.msSinceLastLogic);
    });
    
    if (g58.game.cameraBlock.frame.origin.z < g58.game.bricks[g58.game.bricks.length - 1].frame.origin.z - 10000) {
        g58.game.cameraBlock.frame = e58.frame.getNew([0, 0, 0], 0, 0, 0);
        g58.game.ship.frame = e58.frame.getNew([0, 0, -10000], 0, 0, 0);
        g58.misc.setBrickWave();
    }
    
    g58.game.totalElapsedMs = controlParams.totalElapsedMs;
    g58.game.msSinceLastResumed = controlParams.msSinceLastResumed;

    g58.logic.updateShipState();
    
    g58.logic.detectCollision();
    g58.control.handleControls(controlParams);
    g58.game.universe.updateLogic(controlParams);
};

g58.logic.detectCollision = function () {
    if (g58.game.ship.invulnerable) {
        return false;
    }
    
    g58.game.bricks.forEach(function (cube, i) {
        if (e58.collision.areBlocksInContact(g58.game.ship, cube)) {
            g58.logic.handleCollision(cube);
        }
    });
};

g58.logic.handleCollision = function (cube) {    
    g58.game.ship.invulnerable = true;
    g58.game.ship.invulnerableUntilMs = g58.game.totalElapsedMs + g58.vars.invulnerableMs;
    
    g58.game.ship.polygons.forEach(function (polygon) {
        polygon.lineColour = g58.colours.invulnerableShip.line;
        polygon.fillColour = (polygon.name == "back") ?
            g58.colours.invulnerableShip.back :
            g58.colours.invulnerableShip.polygon;
    });
    
    e58.control.queueSound(e58.audio.sounds.crash);
};

g58.logic.updateShipState = function () {    
    if (g58.game.ship.invulnerable && g58.game.totalElapsedMs >= g58.game.ship.invulnerableUntilMs) {
        g58.game.ship.invulnerable = false;
                
        g58.game.ship.polygons.forEach(function (polygon) {
            polygon.lineColour = g58.colours.ship.line;
            polygon.fillColour = (polygon.name == "back") ?
                g58.colours.ship.back :
                g58.colours.ship.polygon;
        });
    }
};
