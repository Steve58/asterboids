window.g58 = window.g58 || {};

g58.control = {};

g58.control.setUpStartHandlers = function () {    
    g58.game.canvas.requestPointerLockOnClick(
        /*lockedHandler:*/ g58.control.start,
        /*unlockedHandler:*/ g58.control.stop);
    
    g58.game.canvas.startOnTouch(
        /*startHandler:*/ g58.control.touchStart,
        /* touchStopControlHandler: */ g58.control.stop);
};

g58.control.touchStart = function (event) {
    g58.control.start(event, g58.game58.g.canvas)
};

g58.control.start = function (event, touchCanvas) {
    g58.game.paused = false;
    g58.game.camera.zoom = g58.game.canvas.getStandardZoom();
    
    e58.control.start(
        g58.logic.updateLogic,
        g58.rendering.render,
        touchCanvas);
        
    e58.control.queueSound(e58.audio.sounds.space, { loop: true });
};

g58.control.stop = function (event) {
    g58.game.paused = true;
    e58.control.stopAllSounds();
    e58.control.stop();
    g58.game.camera.zoom = g58.game.canvas.getStandardZoom();
    g58.rendering.render();
};

g58.control.setUpControlProps = function () {    
    g58.game.controlProps = {
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
                        < 0.33 * s58.getOrientCoordX(g58.game.canvas.width, g58.game.canvas.height);
        var isRight = s58.getOrientCoordX(touch.clientX, touch.clientY)
                        > 0.67 * s58.getOrientCoordX(g58.game.canvas.width, g58.game.canvas.height);
        var isTop = s58.getOrientCoordY(touch.clientY, touch.clientX)
                        < 0.5 * s58.getOrientCoordY(g58.game.canvas.height, g58.game.canvas.width);
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
    // s58.pageConsoleWrite(
        // touchParts.top + ", " + touchParts.bottom + "<br/>" + touchParts.left + ", " + touchParts.right + "<br/>"
        // + touchParts.topLeft + ", " + touchParts.topRight + "<br/>" + touchParts.bottomLeft + ", " + touchParts.bottomRight);
        
    
    
    
    
    if (controlParams.keys.isDown("w")) {
        g58.game.cameraBlock.frame.translateInOwnFrame(0, +g58.vars.webcam.moveSpeed * controlParams.msSinceLastLogic, 0);
    }    
    if (controlParams.keys.isDown("s")) {
        g58.game.cameraBlock.frame.translateInOwnFrame(0, -g58.vars.webcam.moveSpeed * controlParams.msSinceLastLogic, 0);
    }
    if (controlParams.keys.isDown("a")) {
        g58.game.cameraBlock.frame.translateInOwnFrame(-g58.vars.webcam.moveSpeed * controlParams.msSinceLastLogic, 0, 0);
    }    
    if (controlParams.keys.isDown("d")) {
        g58.game.cameraBlock.frame.translateInOwnFrame(+g58.vars.webcam.moveSpeed * controlParams.msSinceLastLogic, 0, 0);
    }
    
        
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
        g58.game.controlProps.webcamViewBuffer.applyValue(viewWebcamMaximum.x, "x");
        g58.game.controlProps.webcamViewBuffer.applyValue(viewWebcamMaximum.y, "y");
    }
    if (aimWebcamMaximum) {
        g58.game.controlProps.webcamWandBuffer.applyValue(aimWebcamMaximum.x, "x");
        g58.game.controlProps.webcamWandBuffer.applyValue(aimWebcamMaximum.y, "y");        
    }
    
    if (g58.vars.options.cameraSplitMode == "edgeTracking" && e58.webcam.edgeTrackingMean) {
        g58.game.controlProps.webcamViewBuffer.applyValue(e58.webcam.edgeTrackingMean.x, "x");
        g58.game.controlProps.webcamViewBuffer.applyValue(e58.webcam.edgeTrackingMean.y, "y");
    }
    
    if (controlParams.msSinceLastResumed > g58.vars.enablePauseDelayMs && touchParts.mid) {
        g58.game.canvas.touchStopControl();
    }
};
