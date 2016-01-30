﻿window.g58 = window.g58 || {};

g58.control = {};

g58.control.setUpStartHandlers = function () {    
    g58.g.canvas.requestPointerLockOnClick(
        /*lockedHandler:*/ g58.control.start,
        /*unlockedHandler:*/ g58.control.stop);
    
    g58.g.canvas.startOnTouch(
        /*startHandler:*/ g58.control.touchStart,
        /* touchStopControlHandler: */ g58.control.stop);
};

g58.control.touchStart = function (event) {
    g58.control.start(event, g58.g58.g.canvas)
};

g58.control.start = function (event, touchCanvas) {
    g58.g.paused = false;
    g58.g.camera.zoom = g58.g.canvas.getStandardZoom();
    
    e58.control.start(
        g58.logic.updateLogic,
        g58.rendering.render,
        touchCanvas);
        
    e58.control.queueSound(e58.audio.sounds.engine, { loop: true });
};

g58.control.stop = function (event) {
    g58.g.paused = true;
    e58.control.stopAllSounds();
    e58.control.stop();
    g58.g.camera.zoom = g58.g.canvas.getStandardZoom();
    g58.rendering.render();
};

g58.control.setUpControlProps = function () {    
    g58.g.controlProps = {
        webcamViewBuffer: e58.buffer.getNew(
            g58.vars.webcam.viewBuffer.limit,
            g58.vars.webcam.viewBuffer.constant,
            { x: 0, y: 0 }),
        webcamWandBuffer: e58.buffer.getNew(
            g58.vars.webcam.viewBuffer.limit,
            g58.vars.webcam.viewBuffer.constant,
            { x: 0, y: 0 })
    };
};

g58.control.handleControls = function (controlParams) {    
    var touchParts = { topLeft: false, topMid: false, topRight: false, bottomLeft: false, bottomMid: false, bottomRight: false };
    controlParams.touches.forEach(function (touch, i) {
        var isLeft = s58.getOrientCoordX(touch.clientX, touch.clientY)
                        < 0.33 * s58.getOrientCoordX(g58.g.canvas.width, g58.g.canvas.height);
        var isRight = s58.getOrientCoordX(touch.clientX, touch.clientY)
                        > 0.67 * s58.getOrientCoordX(g58.g.canvas.width, g58.g.canvas.height);
        var isTop = s58.getOrientCoordY(touch.clientY, touch.clientX)
                        < 0.5 * s58.getOrientCoordY(g58.g.canvas.height, g58.g.canvas.width);
        touchParts.topLeft = touchParts.topLeft || (isLeft && isTop);
        touchParts.topMid = touchParts.topMid || (!isLeft && !isRight && isTop);
        touchParts.topRight = touchParts.topRight || (isRight && isTop);
        touchParts.bottomLeft = touchParts.bottomLeft || (isLeft && !isTop);
        touchParts.bottomMid = touchParts.bottomMid || (!isLeft && !isRight && !isTop);
        touchParts.bottomRight = touchParts.bottomRight || (isRight && !isTop);
    });    
    touchParts.top = touchParts.topLeft || touchParts.topRight;
    touchParts.bottom = touchParts.bottomLeft || touchParts.bottomRight;
    touchParts.left = touchParts.topLeft || touchParts.bottomLeft;
    touchParts.mid = touchParts.topMid || touchParts.bottomMid;
    touchParts.right = touchParts.topRight || touchParts.bottomRight;
    // s58.utils.pageConsoleWrite(
        // touchParts.top + ", " + touchParts.bottom + "<br/>" + touchParts.left + ", " + touchParts.right + "<br/>"
        // + touchParts.topLeft + ", " + touchParts.topRight + "<br/>" + touchParts.bottomLeft + ", " + touchParts.bottomRight);
    
    // if (controlParams.move.x || controlParams.move.y) {
        // e58.frame.rotateInUniverseX(g58.g.camera.frame, controlParams.move.y * g58.vars.webcam.rotateSpeed);
        // e58.frame.rotateInUniverseY(g58.g.camera.frame, controlParams.move.x * g58.vars.webcam.rotateSpeed);
    // }
    
    
    
    
    
    
    if (controlParams.keys.isDown("w")) {
        e58.frame.translateInOwnFrame(g58.g.cameraBlock.frame, 0, +g58.vars.webcam.moveSpeed * controlParams.msSinceLastLogic, 0);
    }    
    if (controlParams.keys.isDown("s")) {
        e58.frame.translateInOwnFrame(g58.g.cameraBlock.frame, 0, -g58.vars.webcam.moveSpeed * controlParams.msSinceLastLogic, 0);
    }
    if (controlParams.keys.isDown("a")) {
        e58.frame.translateInOwnFrame(g58.g.cameraBlock.frame, -g58.vars.webcam.moveSpeed * controlParams.msSinceLastLogic, 0, 0);
    }    
    if (controlParams.keys.isDown("d")) {
        e58.frame.translateInOwnFrame(g58.g.cameraBlock.frame, +g58.vars.webcam.moveSpeed * controlParams.msSinceLastLogic, 0, 0);
    }
    
    
    // if (controlParams.move.x || controlParams.move.y) {
        // e58.frame.rotateInOwnFrameX(g58.g.ship.frame, +controlParams.move.y * g58.vars.ship.rotateSpeed * controlParams.msSinceLastLogic);
        // e58.frame.rotateInOwnFrameY(g58.g.ship.frame, -controlParams.move.x * g58.vars.ship.rotateSpeed * controlParams.msSinceLastLogic);
    // }
    
    var viewWebcamMaximum, aimWebcamMaximum;
    if (g58.vars.options.cameraSplitMode == "fullView" && e58.webcam.maxima.full) {
        viewWebcamMaximum = e58.webcam.maxima.full;        
    }
    if (g58.vars.options.cameraSplitMode == "fullAim" && e58.webcam.maxima.full) {
        aimWebcamMaximum = e58.webcam.maxima.full;
    }   
    if (g58.vars.options.cameraSplitMode == "viewCentreAimCentre" && e58.webcam.maxima.topCentre) {
        viewWebcamMaximum = e58.webcam.maxima.topCentre;
    }   
    if (g58.vars.options.cameraSplitMode == "viewCentreAimCentre" && e58.webcam.maxima.bottomCentre) {
        aimWebcamMaximum = e58.webcam.maxima.bottomCentre;
    }
    if (viewWebcamMaximum) {
        g58.g.controlProps.webcamViewBuffer.applyValue(viewWebcamMaximum.x, "x");
        g58.g.controlProps.webcamViewBuffer.applyValue(viewWebcamMaximum.y, "y");
    }
    if (aimWebcamMaximum) {
        g58.g.controlProps.webcamWandBuffer.applyValue(aimWebcamMaximum.x, "x");
        g58.g.controlProps.webcamWandBuffer.applyValue(aimWebcamMaximum.y, "y");        
    }
    
    if (controlParams.msSinceLastResumed > g58.vars.enablePauseDelayMs && touchParts.mid) {
        g58.g.canvas.touchStopControl();
    }
};