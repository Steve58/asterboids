window.e58 = window.e58 || {};
e58.frame = {};

(function () {
    function _rotateAxes(frame, angle, axis) {
        frame.xAxis = e58.point.getRotated(frame.xAxis, angle, axis);
        frame.yAxis = e58.point.getRotated(frame.yAxis, angle, axis);
        frame.zAxis = e58.point.getRotated(frame.zAxis, angle, axis);
    }
    
	function _createFrame (options) {
		var _instance = { className: "e58.frame" };
		_instance.origin = e58.point.getXYZSafe(options.origin, [0, 0, 0]);		
		_instance.xAxis = e58.point.getUnitX();
		_instance.yAxis = e58.point.getUnitY();
		_instance.zAxis = e58.point.getUnitZ();
		_instance.phiXY = null;
		_instance.thetaZ = null;
		_instance.phiXyAxis = null;
		
		_rotateAxes(_instance, options.theta1 || 0, e58.point.getUnitZ());
		_rotateAxes(_instance, options.phiY || 0, e58.point.clone(_instance.yAxis));
		_rotateAxes(_instance, options.theta2 || 0, e58.point.clone(_instance.zAxis));
        
		e58.frame.calculateRotations(_instance);
		return _instance;
	}
	
	e58.frame.getNew = function (origin, theta1Deg, phiYDeg, theta2Deg) {
		return _createFrame({
			origin: origin,
			theta1: s58.utils.degToRad(theta1Deg),
			phiY: s58.utils.degToRad(phiYDeg),
			theta2: s58.utils.degToRad(theta2Deg)
		});
	};
    
    e58.frame.rotate = function (frame, angle, axis) {
        _rotateAxes(frame, angle, axis);
        e58.frame.calculateRotations(frame);
        return frame;
    };
    
    e58.frame.rotateInOwnFrameX = function (frame, angleDeg) {
        e58.frame.rotate(frame, s58.utils.degToRad(angleDeg), frame.xAxis);
        return frame;
    };
    e58.frame.rotateInOwnFrameY = function (frame, angleDeg) {
        e58.frame.rotate(frame, s58.utils.degToRad(angleDeg), frame.yAxis);
        return frame;
    };
    e58.frame.rotateInOwnFrameZ = function (frame, angleDeg) {
        e58.frame.rotate(frame, s58.utils.degToRad(angleDeg), frame.zAxis);
        return frame;
    };
    
    e58.frame.rotateInUniverseX = function (frame, angleDeg) {
        e58.frame.rotate(frame, s58.utils.degToRad(angleDeg), e58.point.getUnitX());
        return frame;
    };
    e58.frame.rotateInUniverseY = function (frame, angleDeg) {
        e58.frame.rotate(frame, s58.utils.degToRad(angleDeg), e58.point.getUnitY());
        return frame;
    };
    e58.frame.rotateInUniverseZ = function (frame, angleDeg) {
        e58.frame.rotate(frame, s58.utils.degToRad(angleDeg), e58.point.getUnitZ());
        return frame;
    };
    
    e58.frame.calculateRotations = function(frame) {
        // rotate from universe z axis onto frame z
        if (frame.zAxis.x == 0 && frame.zAxis.y == 0) {
            frame.phiXyAxis = e58.point.getUnitX();
        }
        else {
            frame.phiXyAxis =  e58.point.getUnitVector(e58.point.getNewXYZ(-frame.zAxis.y, frame.zAxis.x, 0));
        }
        frame.phiXY = Math.atan2(
            Math.sqrt(frame.zAxis.x * frame.zAxis.x + frame.zAxis.y * frame.zAxis.y),
            frame.zAxis.z);

        var reversePhiXYRotatedXAxis = e58.point.getUnitVector(e58.point.getRotated(frame.xAxis, -frame.phiXY, frame.phiXyAxis));
        
        // rotate reverse phi xy rotated universe x axis onto universe x
        frame.thetaZ = Math.atan2(reversePhiXYRotatedXAxis.y, reversePhiXYRotatedXAxis.x);
        
        return frame;
    };
       
    e58.frame.clone = function (frame) {
        var cloneFrame = e58.frame.getNew(frame.origin, 0, 0, 0);
        cloneFrame.xAxis = e58.point.clone(frame.xAxis);
        cloneFrame.yAxis = e58.point.clone(frame.yAxis);
        cloneFrame.zAxis = e58.point.clone(frame.zAxis);
        cloneFrame.phiXY = frame.phiXY;
		cloneFrame.thetaZ = frame.thetaZ;
		cloneFrame.phiXyAxis = e58.point.clone(frame.phiXyAxis);
        return cloneFrame;
    };
    
    e58.frame.translateInOwnFrame = function (frame, x, y, z, sign) {
        frame.origin = e58.point.getTranslated(
            frame.origin,
            e58.point.getRotatedInToFrame(e58.point.getXYZSafe([x, y, z]), frame, 1),
            sign);
        return frame;
    };
    
    e58.frame.translateInUniverse = function (frame, x, y, z, sign) {
        frame.origin = e58.point.getTranslated(frame.origin, [x, y, z], sign);
        return frame;
    };
    
    e58.frame.getUprightAngles = function (frame) {
        var yVertDeg = s58.utils.radToDeg(s58.utils.radPiToPi(Math.atan2(
            Math.sqrt(frame.yAxis.x * frame.yAxis.x + frame.yAxis.z * frame.yAxis.z),
            frame.yAxis.y)));
        var yVertSign = -s58.utils.getSign(frame.xAxis.y);
        
        var zFlatDeg = s58.utils.radToDeg(s58.utils.radPiToPi(Math.atan2(
            Math.sqrt(frame.zAxis.x * frame.zAxis.x + frame.zAxis.z * frame.zAxis.z),
            frame.zAxis.y)));
        zFlatDeg = (zFlatDeg + 360 - 90 + 180) % 360 - 180;
        var zFlatSign = s58.utils.getSign(frame.yAxis.y);
        
        var compassDeg = -s58.utils.radToDeg(s58.utils.radPiToPi(Math.atan2(frame.zAxis.x, frame.zAxis.z)));
        
        
        var xFlatDeg = s58.utils.radToDeg(s58.utils.radPiToPi(Math.atan2(
            Math.sqrt(frame.xAxis.x * frame.xAxis.x + frame.xAxis.z * frame.xAxis.z),
            frame.xAxis.y)));
        xFlatDeg = (xFlatDeg * zFlatSign + 360 - 90 + 180) % 360 - 180;

        
        
        var measuringFrame = e58.frame.getNew();
        e58.frame.rotateInOwnFrameY(measuringFrame, -compassDeg);
        e58.frame.rotateInOwnFrameX(measuringFrame, -zFlatDeg);
        var xAxisInMeasuringFrame = e58.point.getRotatedInToFrame(frame.xAxis, measuringFrame, -1);
        var rollDeg = -s58.utils.radToDeg(s58.utils.radPiToPi(Math.atan2(xAxisInMeasuringFrame.y, xAxisInMeasuringFrame.x)));
        
        
        return {
            zFlatDeg: zFlatSign * zFlatDeg,
            compassDeg: compassDeg,
            yVertDeg: yVertSign * yVertDeg,
            xFlatDeg: xFlatDeg,
            rollDeg: rollDeg
        };
    };
})();
