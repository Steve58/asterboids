window.s58 = window.s58 || {};
s58.shared = {};

s58.HALFPI  = 0.5 * Math.PI;
s58.PI      = 1.0 * Math.PI;
s58.PIHALF  = 1.5 * Math.PI;
s58.TWOPI   = 2.0 * Math.PI;
s58.THREEPI = 3.0 * Math.PI;
s58.FOURPI  = 4.0 * Math.PI;

window.addEventListener("error", function (event) {
    if (s58.vars && s58.vars.alertOnError) {
        alert("error: " + event.message);
    }
});

s58.getOrientDimension = function (standard, rotated) {
    switch (s58.vars.orient) {
        case 90:
        case 270:
            return rotated;
        case 180:
        default:
            return standard;
    }
};

s58.getOrientCoordX = function (standard, rotated) {
    switch (s58.vars.orient) {
        case 90:
            return rotated;
        case 180:
            return -standard;
        case 270:
            return -rotated;
        default:
            return standard;
    }
};

s58.getOrientCoordY = function (standard, rotated) {
    switch (s58.vars.orient) {
        case 90:
            return -rotated;
        case 180:
            return -standard;
        case 270:
            return rotated;
        default:
            return standard;
    }
};

s58.isChrome = (function () {
    return window.navigator.userAgent.search("Chrome") >= 0;
})();

s58.isFirefox = (function () {
    return window.navigator.userAgent.search("Firefox") >= 0;
})();
