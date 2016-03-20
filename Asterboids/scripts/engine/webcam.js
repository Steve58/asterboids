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
        
        var showEdges = edges.length;
        if (!true) {
            canvasContext.fillStyle = s58.rgba(0);
            canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
            canvasContext.fillStyle = s58.rgba(0, 0);
            canvasContext.strokeStyle = s58.rgba(255, 1);
            canvasContext.beginPath();
            edges.slice(0, showEdges).forEach(function (edge, i) {
                canvasContext.strokeStyle = s58.rgba(255, edge.diff);
                canvasContext.moveTo(edge.x - 1, edge.y);
                canvasContext.lineTo(edge.x + 1, edge.y);
            });
            canvasContext.stroke();
        }
        
        var maxEdges = showEdges;
        var edgeSumX = 0;
        var edgeSumY = 0;
        edges.slice(0, maxEdges).forEach(function (edge, i) {
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
        
        fitTemplate(edges);
        
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
        var x, y;
        var canvasElement = e58.webcam.canvasElement;
        var canvasContext = e58.webcam.canvasContext;
        var pixels = [];
        for (x = 0; x < canvasElement.width; x++) {
            pixels[x] = [];
            for (y = 0; y < canvasElement.height; y++) {
                pixels[x][y] = (edges
                    .filter(e => e.x == x && e.y == y)
                    .sort((a, b) => a.diff < b.diff)[0] || { diff: 0 }).diff;
            }
        }
        
        if (true) {
            canvasContext.fillStyle = s58.rgba(0);
            canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
            canvasContext.fillStyle = s58.rgba(0, 0);
            canvasContext.strokeStyle = s58.rgba(255, 1);
            canvasContext.beginPath();
            for (x = 0; x < canvasElement.width; x++) {
                for (y = 0; y < canvasElement.height; y++) {
                    if (pixels[x][y] > 0) {
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
        
        var templatePoints = [
            [0.4, 0.6],
            [0.4, 0.4],
            [0.45, 0.35],
            [0.48, 0.32],
            [0.52, 0.32],
            [0.55, 0.35],
            [0.6, 0.4],
            [0.6, 0.6],
        ];
        templatePoints.forEach(p => p[0] = Math.floor(p[0] * w));
        templatePoints.forEach(p => p[1] = Math.floor(p[1] * h));
        
        var templateXs = [-0.5, -0.4, -0.3, -0.2, -0.1, 0.0, 0.1, 0.2, 0.3, 0.4, 0.5];
        
        var optimiumX = optimiseTemplateX(templateXs, templatePoints, pixels);
        templatePoints.forEach(p => Math.floor(p[0] = p[0] + optimiumX * 0.5 * w));
        
        if (true) {
            canvasContext.strokeStyle = s58.rgba(255, 0, 0, 1);
            canvasContext.beginPath();
            canvasContext.moveTo(templatePoints[0][0], templatePoints[0][1]);
            templatePoints.forEach(p => canvasContext.lineTo(p[0], p[1]));
            canvasContext.stroke();
        }
    }
    
    function optimiseTemplateX(templateXs, templatePoints, pixels) {
        var w = e58.webcam.canvasElement.width;
        var h = e58.webcam.canvasElement.height;
        
        var iMaxTotalFitFactor = 0;
        var maxTotalFitFactor = 0;
        templateXs.forEach(function (x, i) {
            var totalFitFactor = 0;
            templatePoints.forEach(p => totalFitFactor += getFitFactor([p[0] + x * 0.5 * w, p[1]], pixels));
            if (totalFitFactor > maxTotalFitFactor) {
                maxTotalFitFactor = totalFitFactor;
                iMaxTotalFitFactor = i;
            }
        });
        
        return templateXs[iMaxTotalFitFactor];
    }
    
    function getFitFactor(templatePoint, pixels) {
        var x, y, d;
        var windowRadius = 10;
        var wr = windowRadius;
        var tp = templatePoint;
        
        var fitFactor = 0;
        for (x = tp[0] - wr; x < tp[0] + wr; x++) {
            for (y = tp[1] - wr; y < tp[1] + wr; y++) {
                d = Math.sqrt((x - tp[0]) * (x - tp[0]) + (y - tp[1]) * (y - tp[1]));
                if (d <= wr) {
                    fitFactor += (pixels[x][y] || 0) / (d || 1);
                }
            }
        }
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
