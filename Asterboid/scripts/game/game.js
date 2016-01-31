window.g58 = window.g58 || {};

g58.game = {};

window.addEventListener("load", function() {
    var i, propName;
    var game = g58.game;
    
    var queryOptions = s58.parseQueryString();
    g58.vars.options = queryOptions;
    // queryOptions.autoReloads = null;
    document.getElementById("backToMenu").href = "Menu.htm?" + s58.constructQueryStringParams(queryOptions);
    document.getElementById("reload").href = "Game.htm?" + s58.constructQueryStringParams(queryOptions);
    
    for (propName in e58.vars.webcam.sectors) {
        e58.vars.webcam.sectors[propName] = false;
    }
    
    switch (queryOptions.cameraSplitMode) {
        case "viewCentreAimCentre":
            e58.vars.webcam.sectors.topCentre = true;
            e58.vars.webcam.sectors.bottomCentre = true;
            break;
        default:
            e58.vars.webcam.sectors.full = true;
            break;
    }
                            
    game.canvas = e58.canvas.getNew("gameCanvas", g58.colours.bg);
    game.universe = e58.universe.getNew();
    game.camera = game.universe.addCamera([0, 0, 0], 0, 0, 0, game.canvas.getStandardZoom());
    game.cameraBlock = game.universe.addBlock([0, 0, 0], 0, 0, 0);
    game.cameraBlock.velocityInOwnFrame.z = -20;
    
    game.ship = g58.misc.addCube(
        0, 0, 0,
        g58.sizes.ship.l,
        g58.sizes.ship.w,
        g58.sizes.ship.d,
        g58.colours.ship.line,
        g58.colours.ship.plane,
        g58.colours.ship.back,
        g58.sizes.ship.xSkew,
        g58.sizes.ship.ySkew);
    
    g58.misc.setBrickWave();
                
    setTimeout(function () {
        game.canvas.updateDimensions();            
        g58.rendering.render();
    }, 500);
    
    
    e58.webcam.initialise(
        document.getElementById("webcamVideo"),
        document.getElementById("webcamCanvas"));
    
    g58.control.setUpControlProps();
    
    g58.control.setUpStartHandlers();
});
