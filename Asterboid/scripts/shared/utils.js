window.s58 = window.s58 || {};

s58.utils = {};

s58.utils.closeTo = function (value, compareValue) {
	return Math.abs(value - compareValue) <= 0.001;
};

s58.utils.getSign = function (value) {
	return value && value > 0 ? 1 : -1;
};

s58.utils.getSorted = function () {
    var i;
    var values = arguments.length > 1 ? arguments : arguments[0];
    var valuesCopy = [];
    for (i = 0; i < values.length; i++) {
        valuesCopy.push(values[i]);
    }
    return valuesCopy.sort(function (a, b) {
        return a > b;
    });    
};

s58.utils.min = function () {
    var values = arguments.length > 1 ? arguments : arguments[0];
    return s58.utils.getSorted(values)[0];
};

s58.utils.max = function () {
    var values = arguments.length > 1 ? arguments : arguments[0];
    return s58.utils.getSorted(values).reverse()[0];
};

s58.utils.degToRad = function (degrees) {
	return (degrees || 0) / 180 * s58.PI;
};

s58.utils.radToDeg = function (radians) {
	return (radians || 0) / s58.PI * 180;
};

// Returns an equivalent angle in the range -PI to +PI
s58.utils.radPiToPi = function (radians) {
	radians = radians || 0;
	while (radians < s58.PI) {
		radians += s58.TWOPI;
	}
	while (radians > s58.PI) {
		radians -= s58.TWOPI;
	}
	return radians;
};

(function () {
    var lastWriteMs = new Date().valueOf();
    s58.utils.pageConsoleWrite = function (text) {
        var utcNowMs = new Date().valueOf();
        if (utcNowMs >= lastWriteMs + s58.vars.pageConsoleIntervalMs) {
            document.getElementById("pageConsole").innerHTML = text;
            lastWriteMs = utcNowMs;
        }
    };
})();

s58.utils.rgba = function () {
    var r = 0, g = 0, b = 0, a = 1.0;
    switch (arguments.length) {
        case 4:
            a = arguments[3];
        case 3:
            r = arguments[0];
            g = arguments[1];
            b = arguments[2];
            break;
        case 2:
            a = arguments[1];
        case 1:
            if (arguments[0].length == 4) {
                a = arguments[0][1];
            }
            if (arguments[0].length >= 3) {
                r = arguments[0][0];
                g = arguments[0][1];
                b = arguments[0][2];
            }
            else if (arguments[0].length == 1) {
                r = g = b = arguments[0][0];
            }
            else {
                r = g = b = arguments[0];
            }
            break;
        default:
            break;
    }
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
};

s58.utils.rgbDarken = function (rgb, shade) {
    return s58.utils.rgbBlend([0, 0, 0], rgb, (1 - shade));
};

s58.utils.rgbLighten = function (rgb, shade) {
    return s58.utils.rgbBlend(rgb, [255, 255, 255], shade);
};

s58.utils.rgbBlend = function (minRgb, maxRgb, shade) {
    return s58.utils.rgba(
        Math.ceil(minRgb[0] + shade * (maxRgb[0] - minRgb[0])),
        Math.ceil(minRgb[1] + shade * (maxRgb[1] - minRgb[1])),
        Math.ceil(minRgb[2] + shade * (maxRgb[2] - minRgb[2])));
};

s58.utils.constructQueryStringParams = function (paramsObject) {
    var paramName, ampersand;
    var stringParams = "";
    for (paramName in paramsObject) {
        if (paramsObject[paramName] != null) {
            ampersand = stringParams ? "&" : "";
            stringParams += ampersand + encodeURIComponent(paramName) + "=" + encodeURIComponent(paramsObject[paramName]);
        }
    }
    return stringParams;
};

s58.utils.getCurrentUrlWithReplacedQueryString = function (paramsObject) {
    var newQueryStringParams = s58.utils.constructQueryStringParams(paramsObject);
    var newQueryString = newQueryStringParams ? "?" + newQueryStringParams : "";
    return location.search ?
        location.href.replace(location.search, newQueryString) :
        location.href + "?" + newQueryStringParams;
};

s58.utils.parseQueryString = function () {
    var qs = window.location.search;
    var parsed = {};
    
    if (!qs.length) {
        return parsed;
    }
    
    qs.substring(1).split("&").forEach(function (stringParam, i) {
        var param = stringParam.split("=");
        var paramName = decodeURIComponent(param[0]);
        var paramValue = decodeURIComponent(param[1]);
        
        if (s58.utils.parseFloat(paramValue) != null) {
            paramValue = s58.utils.parseFloat(paramValue);
        }
        else if (paramValue == true.toString()) {
            paramValue = true;
        }
        else if (paramValue == false.toString()) {
            paramValue = false;
        }
        
        parsed[paramName] = paramValue;
    });
    
    return parsed;
};

s58.utils.parseFloat = function (stringValue) {
    var floatValue = parseFloat(stringValue);
    return (floatValue || floatValue == 0) ? floatValue : null;
};

s58.utils.floor = function (value, dp) {
    var factor = Math.pow(10, dp);
    return Math.floor(value * factor) / factor;
};

s58.utils.padLeft = function (value, minLength, padCharacter) {
    padCharacter = padCharacter || " ";
    var stringValue = value.toString();
    while (stringValue.length < minLength) {
        stringValue = padCharacter + stringValue;
    }
    return stringValue;
};

s58.utils.formatOrdinal = function (intValue) {
    switch (intValue % 100) {
        case 11:
        case 12:
        case 13:
            return intValue + "th";
        default:
            switch (intValue % 10) {
                case 1:
                    return intValue + "st";
                case 2:
                    return intValue + "nd";
                case 3:
                    return intValue + "rd";
                default:
                    return intValue + "th";
            }
    }
};

s58.utils.getFlash = function (min, max, referenceMs, periodMs) {
    var value = min + (referenceMs % periodMs) * 2 * (max - min) / periodMs;
    return (value <= max) ? value : 2 * max - value;
};
