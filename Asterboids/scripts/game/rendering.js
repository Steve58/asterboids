window.g58 = window.g58 || {};

g58.rendering = {};

g58.rendering.render = function () {    
    g58.game.camera.frame = g58.game.cameraBlock.frame.clone();
    g58.game.camera.frame.translateInOwnFrame(
        g58.game.controlProps.webcamViewBuffer.values.x * g58.vars.webcam.viewCoordConstant,
        (g58.game.controlProps.webcamViewBuffer.values.y) * g58.vars.webcam.viewCoordConstant,
        0);
        
    g58.game.ship.frame = g58.game.cameraBlock.frame.clone();
    g58.game.ship.frame.translateInOwnFrame(
        g58.game.controlProps.webcamWandBuffer.values.x * g58.vars.webcam.aimCoordConstant,
        (g58.game.controlProps.webcamWandBuffer.values.y) * g58.vars.webcam.aimCoordConstant,
        -30000);
        
    g58.game.universe.render(g58.game.camera, g58.game.canvas);
};
