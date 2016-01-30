window.e58 = window.e58 || {};
e58.point = {};

(function () {
	function _createPoint (options) {
		var _instance = { className: "e58.point" };
		
		_instance.x = options.x;
		_instance.y = options.y;
		_instance.z = options.z;
		_instance.r = options.r;
		_instance.theta = options.theta;
		_instance.phi = options.phi;
				
		if (options.cartesian) {
			_instance.r = Math.sqrt(_instance.x * _instance.x + _instance.y * _instance.y + _instance.z * _instance.z);
			_instance.theta = Math.atan2(_instance.y, _instance.x);
			_instance.phi = Math.atan2(Math.sqrt(_instance.x * _instance.x + _instance.y * _instance.y), _instance.z);
		}
		else if (options.polar) {
			_instance.x = _instance.r * Math.cos(_instance.theta) * Math.sin(_instance.phi);
			_instance.y = _instance.r * Math.sin(_instance.theta) * Math.sin(_instance.phi);;
			_instance.z = _instance.r * Math.cos(_instance.phi);
		}
        
		return _instance;
	}
	
	e58.point.getNewPolar = function (r, theta, phi) {
		return _createPoint({ polar: true, r: r, theta: theta, phi: phi });
	};
		
	e58.point.getNewXYZ = function (x, y, z) {
		return _createPoint({ cartesian: true, x: x, y: y, z: z });
	};
	
	function _getNewSafe(arrayFunction, pointParam, defaultPoint) {
		if (pointParam && pointParam.className == "e58.point") {
			return pointParam;
		}		
		if (pointParam && pointParam.length == 3) {
			return arrayFunction(pointParam[0], pointParam[1], pointParam[2]);
		}
		return _getNewSafe(arrayFunction, defaultPoint, e58.point.getOrigin());
	};
	
	// Returns a point; either the instance passed in, or a new instance if an array of three coords is passed.
	e58.point.getXYZSafe = function (pointParam, defaultPoint) {
		return _getNewSafe(e58.point.getNewXYZ, pointParam, defaultPoint);
	};
	
	// Returns a point; either the instance passed in, or a new instance if an array of three coords is passed.	
	e58.point.getPolarSafe = function (pointParam, defaultPoint) {
		return _getNewSafe(e58.point.getNewPolar, pointParam, defaultPoint);
	};
	
	e58.point.getOrigin = function () { return e58.point.getNewXYZ(0, 0, 0); };
	e58.point.getUnitX = function () { return e58.point.getNewXYZ(1, 0, 0); };
	e58.point.getUnitY = function () { return e58.point.getNewXYZ(0, 1, 0); };
	e58.point.getUnitZ = function () { return e58.point.getNewXYZ(0, 0, 1); };
    
    e58.point.getUnitVector = function (point) {
        if (!point.r) {
            return e58.point.getUnitZ();
        }
        return e58.point.getNewPolar(1, point.theta, point.phi);
    };
        
    e58.point.getRotatedInToFrame = function (point, frame, sign) {
        sign = (sign && sign > 0) ? 1 : -1;
        if (sign > 0) {
            point = e58.point.getRotated(point, frame.phiXY * sign, frame.phiXyAxis);
        }
        point = e58.point.getRotated(point, frame.thetaZ * sign, frame.zAxis);
        if (sign < 0) {
            point = e58.point.getRotated(point, frame.phiXY * sign, frame.phiXyAxis);
        }
        return point;
    }
    
    e58.point.getPointInFrame = function (point, frame, sign) {
        sign = (sign && sign > 0) ? 1 : -1;
        var pointInFrame = point;
        if (sign < 0) {
            pointInFrame = e58.point.getTranslated(pointInFrame, frame.origin, sign);
        }
        pointInFrame = e58.point.getRotatedInToFrame(pointInFrame, frame, sign);
        if (sign > 0) {
            pointInFrame = e58.point.getTranslated(pointInFrame, frame.origin, sign);
        }
        return pointInFrame;			
    };

    e58.point.getRotated = function (point, angle, axis) {
        var axisUnit = e58.point.getUnitVector(axis);
        var axUX = axisUnit.x;
        var axUY = axisUnit.y;
        var axUZ = axisUnit.z;
        var cosA = Math.cos(angle);
        var sinA = Math.sin(angle);
        var oneMinusCosA = 1 - cosA;
        
        var rotatedX = (cosA + axUX * axUX * oneMinusCosA) * point.x
            + (axUX * axUY * oneMinusCosA - axUZ * sinA) * point.y
            + (axUX * axUZ * oneMinusCosA + axUY * sinA) * point.z;
        var rotatedY = (axUY * axUX * oneMinusCosA + axUZ * sinA) * point.x
            + (cosA + axUY * axUY * oneMinusCosA) * point.y
            + (axUY * axUZ * oneMinusCosA - axUX * sinA) * point.z;
        var rotatedZ = (axUZ * axUX * oneMinusCosA - axUY * sinA) * point.x
            + (axUZ * axUY * oneMinusCosA + axUX * sinA) * point.y
            + (cosA + axUZ * axUZ * oneMinusCosA) * point.z;
        
        return e58.point.getNewXYZ(rotatedX, rotatedY, rotatedZ);
    };
        
    e58.point.getDistance = function (fromPoint, toPoint) {
        return Math.sqrt(((fromPoint.x - toPoint.x) * (fromPoint.x - toPoint.x))
            + ((fromPoint.y - toPoint.y) * (fromPoint.y - toPoint.y))
            + ((fromPoint.z - toPoint.z) * (fromPoint.z - toPoint.z)));
    };
    
    e58.point.getTranslated = function (point, translationPoint, sign) {
        translationPoint = e58.point.getXYZSafe(translationPoint);
        sign = (sign && sign < 0) ? -1 : 1;
        return e58.point.getNewXYZ(
            point.x + translationPoint.x * sign,
            point.y + translationPoint.y * sign,
            point.z + translationPoint.z * sign
        );
    };
    
    e58.point.getUniversePoint = function (point, frame) {
        return e58.point.getPointInFrame(point, frame, 1);
    };
    
    e58.point.clone = function (point) {
        return e58.point.getNewXYZ(point.x, point.y, point.z);
    };
})();
