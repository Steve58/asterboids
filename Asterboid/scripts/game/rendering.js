window.g58 = window.g58 || {};

g58.rendering = {};

g58.rendering.render = function () {    
    g58.g.camera.frame = e58.frame.clone(g58.g.cameraBlock.frame);
    e58.frame.translateInOwnFrame(
        g58.g.camera.frame,
        g58.g.controlProps.webcamViewBuffer.values.x * g58.vars.webcam.viewCoordConstant,
        (g58.g.controlProps.webcamViewBuffer.values.y) * g58.vars.webcam.viewCoordConstant,
        0);
        
    g58.g.ship.frame = e58.frame.clone(g58.g.cameraBlock.frame);
    e58.frame.translateInOwnFrame(
        g58.g.ship.frame,
        g58.g.controlProps.webcamWandBuffer.values.x * g58.vars.webcam.aimCoordConstant,
        (g58.g.controlProps.webcamWandBuffer.values.y) * g58.vars.webcam.aimCoordConstant,
        -30000);
    
    g58.g.universe.render(g58.g.camera, g58.g.canvas);
    g58.g.canvas.renderFromBuffer();
};
