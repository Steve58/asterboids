window.g58 = window.g58 || {};

g58.game = {};

window.addEventListener("load", function() {
    var i, propName;
    var game = g58.game;
    
    var queryOptions = s58.parseQueryString();
    g58.vars.options = queryOptions;
    // queryOptions.autoReloads = null;
    document.getElementById("back").href =
            (queryOptions.menu ? "Menu.htm?" : "Home.htm?") + s58.constructQueryStringParams(queryOptions);
    document.getElementById("reload").href = "Game.htm?" + s58.constructQueryStringParams(queryOptions);
    
    e58.vars.sound.enable = queryOptions.sound;
    e58.vars.integerPixels = !queryOptions.antiAliasing;
    
    for (propName in e58.vars.webcam.sectors) {
        e58.vars.webcam.sectors[propName] = false;
    }

    e58.vars.webcam.maximaEnabled = false;
    e58.vars.webcam.edgeTrackingEnabled = false;
    switch (queryOptions.cameraSplitMode) {
        case "edgeTracking":
            e58.vars.webcam.edgeTrackingEnabled = true;
        case "viewCentreAimCentre":
            e58.vars.webcam.maximaEnabled = true;
            e58.vars.webcam.sectors.topCentre = true;
            e58.vars.webcam.sectors.bottomCentre = true;
            break;
        default:
            e58.vars.webcam.maximaEnabled = true;
            e58.vars.webcam.sectors.full = true;
            break;
    }
                            
    game.canvas = e58.canvas.getNew("gameCanvas", g58.colours.bg);
    game.universe = e58.universe.getNew();
    game.camera = game.universe.addCamera([0, 0, 0], 0, 0, 0, game.canvas.getStandardZoom());
    game.cameraBlock = game.universe.addBlock([0, 0, 0], 0, 0, 0);
    game.cameraBlock.velocityInOwnFrame.z = -g58.vars.ship.initialSpeed;
    
    
    game.ship = g58.misc.addCube(
        0, 0, 0,
        g58.sizes.ship.l,
        g58.sizes.ship.w,
        g58.sizes.ship.d,
        g58.vars.options.ship ? g58.colours.ship.line : "transparent",
        g58.vars.options.ship ? g58.colours.ship.polygon : "transparent",
        g58.vars.options.ship ? g58.colours.ship.back : "transparent",
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
