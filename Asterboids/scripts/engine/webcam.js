// webcam
// Webcam features

"use strict";

window.e58 = window.e58 || {};

e58.webcam = {};

e58.webcam.initialise = function (videoElement, canvasElement) {
    e58.webcam.videoElement = videoElement;
    e58.webcam.canvasElement = canvasElement;
    e58.webcam.canvasContext = canvasElement.getContext('2d');
    
    e58.webcam.canvasContext.lineWidth = e58.vars.integerPixels ? 1: 0.5;
    e58.webcam.canvasContext.strokeStyle = s58.rgba(255);
    e58.webcam.canvasContext.fillStyle = s58.rgba(0, 0);
    e58.webcam.canvasContext.lineCap = "round";
    e58.webcam.canvasContext.lineJoin = "round";
        
    e58.webcam.maxima = [];
    e58.webcam.initialised = true;

    videoElement.width = videoElement.height = e58.vars.webcam.width;
    canvasElement.width = canvasElement.height = e58.vars.webcam.width;
};

e58.webcam.start = function () {
    e58.webcam.starting = true;
    
    // Detected webcam maxima, by sector according to settings
    e58.webcam.maxima = {};

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

    var pollWhetherRunningIntervalId;

    function onSuccess (stream) {
        videoElement.src = window.URL.createObjectURL(stream);
        videoElement.play();

        // Listening for data loaded is not working so far, so poll instead
        pollWhetherRunningIntervalId = setInterval(pollWhetherRunning, e58.vars.webcam.pollWhetherRunningMs);
    }

    function onError(error) {
        console.error(error);
        e58.webcam.starting = false;
    }

    function pollWhetherRunning() {
        if (videoElement.videoWidth && videoElement.videoHeight) {
            clearInterval(pollWhetherRunningIntervalId);

            // Adjust aspect ratio of elements to match video resolution now it is available
            var ratio = videoElement.videoWidth / videoElement.videoHeight;
            videoElement.height = Math.ceil(videoElement.width / ratio);
            canvasElement.height = Math.ceil(canvasElement.width / ratio);

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

(function () {
    // Attempt more advanced tracking
    e58.webcam.refreshEdgeTracking = function () {
        if (!e58.webcam.running || e58.webcam.processing) {
            return;
        }
        e58.webcam.processing = true;

        var videoElement = e58.webcam.videoElement;
        var canvasElement = e58.webcam.canvasElement;
        var canvasContext = e58.webcam.canvasContext;

        canvasContext.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);

        var rgbaData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height).data;

        var i, x, y;
        var pixels = [];
        
        for (i = 0; i <= rgbaData.length - 4; i += 4) {
            x = (i / 4) % canvasElement.width;
            y = Math.floor((i / 4) / canvasElement.width);

            pixels[x] = pixels[x] || [];
            
            pixels[x][y] = {
                r: rgbaData[i + 0],
                b: rgbaData[i + 1],
                g: rgbaData[i + 2],
                a: rgbaData[i + 3],
                t: (rgbaData[i + 0] + rgbaData[i + 1] + rgbaData[i + 2]) / 3 / 255
            };
        }
        
        var edgeThreshold = 0.1;
        var edgeHalfWidth = 2;
                
        var buffer, sumTemp, sumLeft, sumRight, diff;
        var edges = [];
        for (x = 0; x < canvasElement.width; x++) {
            buffer = [];
            for (y = 0; y < canvasElement.height; y++) {
                buffer.push(pixels[x][y]);
                detectEdge(x, y - edgeHalfWidth, buffer, edges, edgeHalfWidth, edgeThreshold);
            }
        }
        for (y = 0; y < canvasElement.height; y++) {
            buffer = [];
            for (x = 0; x < canvasElement.width; x++) {
                buffer.push(pixels[x][y]);
                detectEdge(x - edgeHalfWidth, y, buffer, edges, edgeHalfWidth, edgeThreshold);
            }
        }
        
        edges.sort(function (a, b) {
            return a.diff < b.diff;
        });
        
        // console.log(edges.length);
        
        var showEdges = 1000; // edges.length;
        if (true) {
            canvasContext.fillStyle = s58.rgba(0);
            canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
            canvasContext.fillStyle = s58.rgba(0, 0);
            canvasContext.strokeStyle = s58.rgba(0, 255, 0, 1);
            canvasContext.beginPath();
            edges.slice(0, showEdges).forEach(function (edge, i) {
                canvasContext.strokeStyle = s58.rgba(255, 255, 255, edge.diff);
                canvasContext.moveTo(edge.x - 1, edge.y);
                canvasContext.lineTo(edge.x + 1, edge.y);
            });
            canvasContext.stroke();
        }
        
        var maxEdges = showEdges;
        var edgeSumX = 0;
        var edgeSumY = 0;
        edges = edges.slice(0, maxEdges)
        edges.forEach(function (edge, i) {
            edgeSumX += edge.x;
            edgeSumY += edge.y;
        });
        
        var rawEdgeMean = {
            x: Math.floor(edgeSumX / maxEdges),
            y: Math.floor(edgeSumY / maxEdges)
        };
        
        e58.webcam.edgeTrackingMean = {
            x: s58.getOrientCoordX(
                2 * (canvasElement.width / 2 - rawEdgeMean.x) / canvasElement.width,
                2 * (canvasElement.height / 2 - rawEdgeMean.y) / canvasElement.width),
            y: s58.getOrientCoordY(
                2 * (canvasElement.height / 2 - rawEdgeMean.y) / canvasElement.width,
                2 * (canvasElement.width / 2 - rawEdgeMean.x) / canvasElement.width),
        };
        
        e58.webcam.edgeTrackingShapeFit = fitTemplate(edges);
        
        e58.webcam.processing = false;
    };    
    
    function detectEdge(x, y, buffer, edges, edgeHalfWidth, edgeThreshold) {
        var i;
        if (buffer.length > edgeHalfWidth * 2) {
            buffer.shift(1);
        }
        if (buffer.length == edgeHalfWidth * 2) {
            var sumLeft = { r: 0, g: 0, b: 0};
            var sumRight = { r: 0, g: 0, b: 0};
            var sumTemp;
            for (i = 0; i < buffer.length; i++) {
                sumTemp = (i < edgeHalfWidth) ? sumLeft : sumRight;
                sumTemp.r += buffer[i].r;
                sumTemp.g += buffer[i].g;
                sumTemp.b += buffer[i].b;
                sumTemp.t += buffer[i].t;
            }
            var diff = (Math.abs(sumLeft.r - sumRight.r) + Math.abs(sumLeft.g - sumRight.g) + Math.abs(sumLeft.b - sumRight.b)) / edgeHalfWidth / 3 / 255;
            if (diff > edgeThreshold) {
                edges.push({
                    x: x,
                    y: y,
                    diff: diff
                });
            }
        }
    }
    
    function fitTemplate(edges) {
        var x, y, i,s ;
        var canvasElement = e58.webcam.canvasElement;
        var canvasContext = e58.webcam.canvasContext;
        var pixels = [];
        // for (x = 0; x < canvasElement.width; x++) {
            // pixels[x] = [];
            // for (y = 0; y < canvasElement.height; y++) {
                // pixels[x][y] = (edges
                    // .filter(e => e.x == x && e.y == y)
                    // .sort((a, b) => a.diff < b.diff)[0] || { diff: 0 }).diff;
            // }
        // }
        
        edges.forEach(function (edge) {
            pixels[edge.x] = pixels[edge.x] || [];
            pixels[edge.x][edge.y] = [(pixels[edge.x][edge.y] || 0), edge.diff].sort((a, b) => a < b)[0];
        });
        
        for (x = 0; x < canvasElement.width; x++) {
            pixels[x] = [];
            for (y = 0; y < canvasElement.height; y++) {
                pixels[x][y] = (edges
                    .filter(e => e.x == x && e.y == y)
                    .sort((a, b) => a.diff < b.diff)[0] || { diff: 0 }).diff;
            }
        }
        
        if (!true) {
            canvasContext.fillStyle = s58.rgba(0);
            canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
            canvasContext.fillStyle = s58.rgba(0, 0);
            canvasContext.strokeStyle = s58.rgba(255, 1);
            canvasContext.beginPath();
            for (x = 0; x < canvasElement.width; x++) {
                for (y = 0; y < canvasElement.height; y++) {
                    if (pixels[x][y]) {
                        canvasContext.strokeStyle = s58.rgba(255, pixels[x][y]);
                        canvasContext.moveTo(x - 1, y);
                        canvasContext.lineTo(x + 1, y);
                    }
                }
            }
            canvasContext.stroke();
        }
        
        var w = canvasElement.width;
        var h = canvasElement.height;
        
        
        var armX = 0.6;
        var armY = 0.9;
        var armL = 0.1;
        var armG = 2.0;
        var armN = 3;
        var shoulderX = 0.5;
        var shoulderY = 0.6;
        var shoulderL = 0.25;
        var shoulderG = 0.45;
        var shoulderN = 5;
        var headR = 0.2;
        var headHalfN = 20;
        
        var templatePoints = [];
        for (i = 0; i <= armN; i++) {
            templatePoints.push({
                x: -armX + (i * armL / armN),
                y: +armY - (i * armG * armL / armN)
            });
        }
        for (i = 0; i <= shoulderN; i++) {
            templatePoints.push({
                x: -shoulderX + (i * shoulderL / shoulderN),
                y: +shoulderY - (i * shoulderG * shoulderL / shoulderN)
            });
        }
        for (i = -headHalfN; i <= headHalfN; i++) {
            templatePoints.push({
                x: +headR * Math.sin(i * s58.HALFPI / headHalfN),
                y: -headR * Math.cos(i * s58.HALFPI / headHalfN)
            });
        }
        for (i = shoulderN; i >= 0; i--) {
            templatePoints.push({
                x: +shoulderX - (i * shoulderL / shoulderN),
                y: +shoulderY - (i * shoulderG * shoulderL / shoulderN)
            });
        }
        for (i = armN; i >= 0; i--) {
            templatePoints.push({
                x: +armX - (i * armL / armN),
                y: +armY - (i * armG * armL / armN)
            });
        }
                
        var templateShiftMax = 0.5;
        var templateShiftHalfN = 10;
        var templateXs = [];
        var templateYs = [];
        for (i = 0; i < templateShiftHalfN * 2 + 1; i++) {
            templateXs.push(templateShiftMax * (i - templateShiftHalfN) / templateShiftHalfN);
            templateYs.push(templateShiftMax * (i - templateShiftHalfN) / templateShiftHalfN);
        }
        
        var templateScaleMin = 0.5;
        var templateScaleMax = 0.5;
        var templateScaleStep = 0.1;
        var templateScales = [];
        for (s = templateScaleMin; s <= templateScaleMax; s += templateScaleStep) {
            templateScales.push(s);
        }
        
        var optimum = optimiseTemplate(templateScales, templateXs, templateYs, templatePoints, pixels, edges);
        templatePoints.forEach(p => p.x = p.x * optimum.s + optimum.x);
        templatePoints.forEach(p => p.y = p.y * optimum.s + optimum.y);
        
        if (true) {
            canvasContext.strokeStyle = s58.rgba(255, 0, 0);
            canvasContext.beginPath();
            canvasContext.moveTo(
                templatePoints.x * w + 0.5 * w,
                templatePoints.y * w + 0.5 * h);
            templatePoints.forEach(p => canvasContext.lineTo(
                p.x * w + 0.5 * w,
                p.y * w + 0.5 * h));
            canvasContext.stroke();
        }
        
        return { x: -optimum.x, y: -optimum.y };
    }
    
    function optimiseTemplate(templateScales, templateXs, templateYs, templatePoints, pixels, edges) {
        var sMax = 0;
        var xMax = 0;
        var yMax = 0;
        var maxTotalFitFactor = 0;
        templateScales.forEach(function (s) {
            templateXs.forEach(function (x) {
                templateYs.forEach(function (y) {
                    var meanFitFactor = getMeanFitFactor(s, x, y, templatePoints, pixels, edges);
                    if (meanFitFactor > maxTotalFitFactor) {
                        maxTotalFitFactor = meanFitFactor;
                        sMax = s;
                        xMax = x;
                        yMax = y;
                    }
                });
            });
        });
        return { s: sMax, x: xMax, y: yMax };
    }
        
    function getMeanFitFactor(templateScale, templateX, templateY, templatePoints, pixels, edges) {
        var w = e58.webcam.canvasElement.width;
        var h = e58.webcam.canvasElement.height;
        var s = templateScale;
        var x = templateX;
        var y = templateY;
        
        var totalFitFactor = 0;
        templatePoints.forEach(function (p) {
            totalFitFactor += getFitFactor(
                { x: p.x * s + x, y: p.y * s + y },
                pixels,
                edges);
        });
        return totalFitFactor / templatePoints.length;
    }
    
    function getFitFactor(templatePoint, pixels, edges) {
        var x, y, d;
        var w = e58.webcam.canvasElement.width;
        var h = e58.webcam.canvasElement.height;
        var windowRadius = 10;
        var wr = windowRadius;
        var tp = {
            x:  Math.floor(templatePoint.x * w + 0.5 * w),
            y:  Math.floor(templatePoint.y * w + 0.5 * h)
        };
        
        var fitFactor = 0;
        edges
            .filter(e => Math.abs(e.x - tp.x) <= wr && Math.abs(e.y - tp.y) <= wr)
            .forEach(function (edge) {
                d = Math.sqrt((edge.x - tp.x) * (edge.x - tp.x) + (edge.y - tp.y) * (edge.y - tp.y));
                if (d <= wr) {
                    fitFactor += ( /* edge.diff || */ 1) / (d || 1);
                }
            });
        
        return fitFactor;
    }
    
    
    // Original maxima tracking routine for torches
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

        
        // TODO: unfinished sector cases
        var limits = e58.webcam.sectorLimits;
        var sectoredMaxima = {};
        if (e58.vars.webcam.sectors.full) {
            sectoredMaxima.full =         getSectorMaximum(allMaxima, -1,              +1,                    -limits.yOut,    +limits.yOut);
        }
        // if (e58.vars.webcam.sectors.topLeft) {
            // sectoredMaxima.topLeft =      getSectorMaximum(allMaxima, -1,              -limits.xIn,           +limits.yIn,     +limits.yOut);
        // }
        if (e58.vars.webcam.sectors.topCentre) {
            sectoredMaxima.topCentre =    getSectorMaximum(allMaxima, -limits.xOut,    +limits.xOut,          +limits.yIn,     +limits.yOut);
        }
        // if (e58.vars.webcam.sectors.topRight) {
            // sectoredMaxima.topRight =     getSectorMaximum(allMaxima, +limits.xIn,     +1,                    +limits.yIn,     +limits.yOut);
        // }
        // if (e58.vars.webcam.sectors.bottomLeft) {
            // sectoredMaxima.bottomLeft =   getSectorMaximum(allMaxima, -1,              -limits.xIn,           -limits.yOut,    -limits.yIn);
        // }
        if (e58.vars.webcam.sectors.bottomCentre) {
            sectoredMaxima.bottomCentre = getSectorMaximum(allMaxima, -limits.xOut,    +limits.xOut,          -limits.yOut,    -limits.yIn);
        }
        // if (e58.vars.webcam.sectors.bottomRight) {
            // sectoredMaxima.bottomRight =  getSectorMaximum(allMaxima, +limits.xIn,     +1,                    -limits.yOut,    -limits.yIn);
        // }

        e58.webcam.maxima = sectoredMaxima;

        // console.log(e58.webcam.maxima);

        e58.webcam.processing = false;
    };

    function getSectorMaximum(allMaxima, xMin, xMax, yMin, yMax) {
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
    }
})();
