window.g58 = window.g58 || {};

g58.brick = {};

g58.brick.waves = [];

(function () {
    function getRandomFunction(absMax) {
        return function () {
            return 2 * absMax * (Math.random() - 0.5);
        }
    }
    
    function getSinFunction(period, amplitudeStart, amplitudeEnd, amplitudePeriod) {
        amplitudeEnd = (amplitudeEnd == null) ? amplitudeStart : amplitudeEnd;
        amplitudePeriod = amplitudePeriod || 1;
        return function (i) {
            return (amplitudeStart + (i % amplitudePeriod) * (amplitudeEnd - amplitudeStart) / amplitudePeriod) * Math.sin(i * s58.TWOPI / period);
        }
    }
    
    function getCosFunction(period, amplitudeStart, amplitudeEnd, amplitudePeriod) {
        amplitudeEnd = (amplitudeEnd == null) ? amplitudeStart : amplitudeEnd;
        amplitudePeriod = amplitudePeriod || 1;
        return function (i) {
            return (amplitudeStart + (i % amplitudePeriod) * (amplitudeEnd - amplitudeStart) / amplitudePeriod) * Math.cos(i * s58.TWOPI / period);
        }
    }
    
    g58.brick.waveIndex = 0;
    
    g58.brick.waves.push({
        length: 52,
        W: 1200,
        H: 800,
        D: 8000,
        getX: function (i) {
            return 8000 * [-1, -1, +1, +1][i % 4];
        },
        getY: function (i) {
            return 6000 * [-1, +1, -1, +1][i % 4];
        },
        getZ: function (i) {
            return 100000 * Math.floor(i / 4);
        }
    });
    
    
    g58.brick.waves.push({
        length: 50,
        W: 800,
        H: 600,
        D: 8000,
        getX: getSinFunction(20, 10000),
        getY: getCosFunction(20, 10000)
    });
    
    g58.brick.waves.push({
        length: 100,
        W: 500,
        H: 500,
        D: 8000,
        getX: getRandomFunction(30000),
        getY: getRandomFunction(20000)
    });
    
    g58.brick.waves.push({
        length: 200,
        W: 500,
        H: 500,
        D: 5000,
        Z: 40000,
        getX: getSinFunction(50, 10000, 0, 200),
        getY: getCosFunction(50, 10000, 0, 200)
    });
    
    g58.brick.waves.push({
        length: 100,
        W: 500,
        H: 500,
        D: 500,
        getX: getRandomFunction(30000),
        getY: getRandomFunction(20000),
        getRotZ: function (i) { return [-1, +1][i % 2]; }
    });
    
    g58.brick.waves.push({
        length: 100,
        W: 500,
        H: 500,
        D: 500,
        getX: getRandomFunction(30000),
        getY: getRandomFunction(20000),
        getRotX: getRandomFunction(2),
        getRotY: getRandomFunction(2),
        getRotZ: getRandomFunction(2)
    });
    
    g58.brick.waves.push({
        length: 200,
        W: 800,
        H: 600,
        D: 8000,
        Z: 40000,
        getX: getSinFunction(50, 10000),
        getY: getCosFunction(50, 75000)
    });
    
    g58.brick.waves.push({
        length: 100,
        W: 800,
        H: 600,
        D: 2000,
        getX: getRandomFunction(30000),
        getY: getRandomFunction(20000)
    });
    
    g58.brick.waves.push({
        length: 200,
        W: 500,
        H: 500,
        D: 2000,
        getX: getSinFunction(30, 10000, 0, 200),
        getY: getCosFunction(30, 0, 10000, 200)
    });
    
    g58.brick.waves.push({
        length: 100,
        W: 500,
        H: 500,
        D: 2000,
        Z: 50000,
        getX: getRandomFunction(30000),
        getY: getRandomFunction(20000),
        getRotX: getRandomFunction(2)
    });
    
    g58.brick.waves.push({
        length: 100,
        W: 500,
        H: 500,
        D: 2000,
        Z: 50000,
        getX: getRandomFunction(30000),
        getY: getRandomFunction(20000),
        getRotY: getRandomFunction(2)
    });
    
    g58.brick.waves.push({
        length: 100,
        W: 2000,
        H: 500,
        D: 500,
        Z: 50000,
        getX: getRandomFunction(30000),
        getY: getRandomFunction(20000),
        getRotZ: getRandomFunction(2)
    });
})();