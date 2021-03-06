﻿window.g58 = window.g58 || {};

g58.misc = {};

g58.misc.setBrickWave = function (waveSettings) {
    waveSettings = waveSettings || g58.brick.waves[g58.brick.waveIndex++ % g58.brick.waves.length];
    
    var i;
    
    function defaultGetZ(i) {
        return i * (waveSettings.Z || 20000);
    }
        
    (g58.game.bricks || []).forEach(function () {
        g58.game.universe.blocks.pop();
    });
    g58.game.bricks = [];
    
    var W = 1500;
    var H = 1000;
    var D = 20000;
    for (i = 0; i < waveSettings.length; i++) {
        g58.game.bricks.push(g58.misc.addCube(
            waveSettings.getX(i),
            waveSettings.getY(i),
            -(waveSettings.O || 1000000) - (waveSettings.getZ || defaultGetZ)(i),
            waveSettings.H,
            waveSettings.W,
            waveSettings.D,
            waveSettings.lineColour || s58.rgba(50, 50, 50),
            waveSettings.fillColour || s58.rgba(100, 100, 150)));
        g58.game.bricks[g58.game.bricks.length - 1].randomSpins = {
            x: waveSettings.getRotX ? waveSettings.getRotX(i) : 0,
            y: waveSettings.getRotY ? waveSettings.getRotY(i) : 0,
            z: waveSettings.getRotZ ? waveSettings.getRotZ(i) : 0
        };
    }
};

g58.misc.addCube = function (x, y, z, L, W, D, lineColour, polygonColour, backColour, xSkew, ySkew) {    
    L = L || g58.sizes.cube.l;
    W = W || g58.sizes.cube.w;
    D = D || g58.sizes.cube.d;
    lineColour = lineColour || g58.colours.line;
    polygonColour = polygonColour || g58.colours.polygon;
    backColour = backColour || polygonColour;
    xSkew = xSkew || 1;
    ySkew = ySkew || 1;
    
    L *= 2;
    W *= 2;
    D *= 2;
    
    var FL = L * ySkew;
    var FW = W * xSkew;
    
    var cube = g58.game.universe.addBlock([x, y, z], 0, 0, 0);
    function addPolygon(points, lineCol, polygonCol, name) {
        cube.addPolygon(
            name || "",
            lineCol || lineColour,
            polygonCol || polygonColour,
            points);
    }
    
    addPolygon([[ -FW, -FL, -D], [ +FW, -FL, -D], [ +FW, +FL, -D], [ -FW, +FL, -D]]);
    addPolygon([[ -W,  -L,  +D], [ +W,  -L,  +D], [ +W,  +L,  +D], [ -W,  +L,  +D]], lineColour, backColour, "back");
    addPolygon([[ -FW, -FL, -D], [ +FW, -FL, -D], [ +W,  -L,  +D], [ -W,  -L,  +D]]);
    addPolygon([[ -FW, +FL, -D], [ +FW, +FL, -D], [ +W,  +L,  +D], [ -W,  +L,  +D]]);
    addPolygon([[ -FW, -FL, -D], [ -W,  -L,  +D], [ -W,  +L,  +D], [ -FW, +FL, -D]]);
    addPolygon([[ +FW, -FL, -D], [ +W,  -L,  +D], [ +W,  +L,  +D], [ +FW, +FL, -D]]);
    
    
    return cube;
};
