window.e58 = window.e58 || {};
e58.webcam = {};

e58.webcam.initialise = function (videoElement, canvasElement) {
    e58.webcam.videoElement = videoElement;
    e58.webcam.canvasElement = canvasElement;
    e58.webcam.canvasContext = canvasElement.getContext('2d');
    e58.webcam.maxima = [];
    e58.webcam.initialised = true;
    
    videoElement.width = videoElement.clientWidth = videoElement.height = videoElement.clientHeight = e58.vars.webcam.width;
    canvasElement.width = canvasElement.clientWidth = canvasElement.height = canvasElement.clientHeight = e58.vars.webcam.width;
};

e58.webcam.start = function () {
    e58.webcam.starting = true;
    e58.webcam.maxima = [];
    
    var videoElement = e58.webcam.videoElement;
    var canvasElement = e58.webcam.canvasElement;
    
    var constraints = { audio: false, video: true };
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // console.log("navigator.mediaDevices.getUserMedia (promise syntax)");
        navigator.mediaDevices.getUserMedia(constraints)
            .then(onSuccess)
            .catch(function (error) {
                onError(error);
                e58.webcam.starting = true;
                // console.log("navigator.mediaDevices.getUserMedia");
                navigator.mediaDevices.getUserMedia(constraints, onSuccess, onError);
            });
    }
    else if (navigator.mozGetUserMedia) {
        // console.log("navigator.mozGetUserMedia");
        navigator.mozGetUserMedia(constraints, onSuccess, onError);
    }
    else if (navigator.webkitGetUserMedia) {
        // console.log("navigator.webkitGetUserMedia");
        navigator.webkitGetUserMedia(constraints, onSuccess, onError);
    }

    var runningPollIntervalId;
    
    function onSuccess (stream) {
        videoElement.src = window.URL.createObjectURL(stream);
        videoElement.play();
        
        // No luck listening for data loaded so far, so poll instead
        runningPollIntervalId = setInterval(runningPoll, e58.vars.webcam.runningPollMs);
    }
    
    function onError(error) {
        console.error(error);
        e58.webcam.starting = false;
    }
    
    function runningPoll() {
        if (videoElement.videoWidth && videoElement.videoHeight) {
            clearInterval(runningPollIntervalId);
            
            var ratio = videoElement.videoWidth / videoElement.videoHeight;
            videoElement.height = Math.ceil(videoElement.clientHeight = videoElement.clientWidth / ratio);
            canvasElement.height = Math.ceil(canvasElement.clientHeight = canvasElement.clientWidth / ratio);
            
            e58.webcam.sectorLimits = {
                xIn: 0.5 * e58.vars.webcam.gap,
                xOut: 0.5 - 0.25 * e58.vars.webcam.gap,
                yIn: 0.5 * e58.vars.webcam.gap / ratio,
                yOut: 1 / ratio
            };
            
            e58.webcam.running = true;
            e58.webcam.starting = false;
        }
    }
};

e58.webcam.refreshMaxima = function () {
    if (!e58.webcam.running || e58.webcam.processing) {
        return;
    }
    e58.webcam.processing = true;
    
    var propName;
    
    var videoElement = e58.webcam.videoElement;
    var canvasElement = e58.webcam.canvasElement;
    var canvasContext = e58.webcam.canvasContext;
    
    canvasContext.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);
    
    var rgbaData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height).data;
    
    var rawMaxima = [];
    // { x: 0, y: 0, rgbTotal: 0, pixelCount: 0 };
    var i, j, rgbTotal, x, y, handled;
    for (i = rgbaData.length - 4; i >= 0; i = i - 4) {
        rgbTotal = rgbaData[i + 0] + rgbaData[i + 1] + rgbaData[i + 2];
        if (rgbTotal == 765) {
            x = (i / 4) % canvasElement.width;
            y = Math.floor((i / 4) / canvasElement.width);
            
            handled = false;
            for (j = rawMaxima.length - 1; j >= 0; j--) {
                if (Math.sqrt((x - rawMaxima[j].x) * (x - rawMaxima[j].x) + (y - rawMaxima[j].y) * (y - rawMaxima[j].y)) < e58.vars.webcam.maximaResolution) {
                    rawMaxima[j].x = (x + rawMaxima[j].x * rawMaxima[j].pixelCount) / (rawMaxima[j].pixelCount + 1);
                    rawMaxima[j].y = (y + rawMaxima[j].y * rawMaxima[j].pixelCount) / (rawMaxima[j].pixelCount + 1);
                    rawMaxima[j].rgbTotal = (rgbTotal + rawMaxima[j].rgbTotal * rawMaxima[j].pixelCount) / (rawMaxima[j].pixelCount + 1);
                    rawMaxima[j].pixelCount++;
                    handled = true;
                    break;
                }
            }
            
            if (!handled) {
                rawMaxima.push({ x: x, y: y, rgbTotal: rgbTotal, pixelCount: 1 });
            }
        }
    }
    
    var allMaxima = [];
    rawMaxima.forEach(function (rawMaximum, i) {
        allMaxima.push({
            x: s58.getOrientCoordX(
                2 * (canvasElement.width / 2 - rawMaximum.x) / canvasElement.width,
                2 * (canvasElement.height / 2 - rawMaximum.y) / canvasElement.width),
            y: s58.getOrientCoordY(
                2 * (canvasElement.height / 2 - rawMaximum.y) / canvasElement.width,
                2 * (canvasElement.width / 2 - rawMaximum.x) / canvasElement.width),
            value: rawMaximum.rgbTotal / 765,
            pixels: rawMaximum.pixelCount
        });
    });
    
    allMaxima.sort(function (a, b) {
        return a.pixels > b.pixels;
    });
    
    // console.log(allMaxima);
    
    var limits = e58.webcam.sectorLimits;
    var sectoredMaxima = {};
    if (e58.vars.webcam.sectors.full) {
        sectoredMaxima.full =         e58.webcam.getSectorMaximum(allMaxima, -1,              +1,                    -limits.yOut,    +limits.yOut);
    }
    // if (e58.vars.webcam.sectors.topLeft) {
        // sectoredMaxima.topLeft =      e58.webcam.getSectorMaximum(allMaxima, -1,              -limits.xIn,           +limits.yIn,     +limits.yOut);
    // }
    if (e58.vars.webcam.sectors.topCentre) {
        sectoredMaxima.topCentre =    e58.webcam.getSectorMaximum(allMaxima, -limits.xOut,    +limits.xOut,          +limits.yIn,     +limits.yOut);
    }
    // if (e58.vars.webcam.sectors.topRight) {
        // sectoredMaxima.topRight =     e58.webcam.getSectorMaximum(allMaxima, +limits.xIn,     +1,                    +limits.yIn,     +limits.yOut);
    // }
    // if (e58.vars.webcam.sectors.bottomLeft) {
        // sectoredMaxima.bottomLeft =   e58.webcam.getSectorMaximum(allMaxima, -1,              -limits.xIn,           -limits.yOut,    -limits.yIn);
    // }
    if (e58.vars.webcam.sectors.bottomCentre) {
        sectoredMaxima.bottomCentre = e58.webcam.getSectorMaximum(allMaxima, -limits.xOut,    +limits.xOut,          -limits.yOut,    -limits.yIn);
    }
    // if (e58.vars.webcam.sectors.bottomRight) {
        // sectoredMaxima.bottomRight =  e58.webcam.getSectorMaximum(allMaxima, +limits.xIn,     +1,                    -limits.yOut,    -limits.yIn);
    // }
    
    e58.webcam.maxima = sectoredMaxima;
    
    // console.log(e58.webcam.maxima);
    
    e58.webcam.processing = false;
};

e58.webcam.getSectorMaximum = function (allMaxima, xMin, xMax, yMin, yMax) {
    var i = 0
    var m;
    do {
        m = allMaxima[i++];
        if (m && m.x >= xMin && m.x <= xMax && m.y >= yMin && m.y <= yMax) {
            return {
                x: (m.x - (xMax + xMin) / 2) * 2 / (xMax - xMin),
                y: (m.y - (yMax + yMin) / 2) * 2 / (xMax - xMin)
            };
        }
    } while (m);
    
    return null;
};
