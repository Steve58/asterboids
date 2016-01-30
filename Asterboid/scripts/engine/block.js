window.e58 = window.e58 || {};
e58.block = {};

(function () {	
	function _createBlock (options) {
		var _instance = { className: "e58.block" };		
		_instance.universe = options.universe;
		_instance.frame = options.frame || e58.frame.getNew();
        _instance.alwaysDraw = Boolean(options.extendedOptions.alwaysDraw);
        _instance.detailLevel = 0;
		_instance.planes = [];		
		_instance.velocityInOwnFrame = e58.point.getNewXYZ(0, 0, 0);
		_instance.xMax = 0;
        _instance.yMax = 0;
        _instance.zMax = 0;
        _instance.rMax = 0;
        
        _instance.getPlane = function (name) {
            var i;
            for (i = 0; i < _instance.planes.length; i++) {
                if (_instance.planes[i].name == name) {
                    return _instance.planes[i];
                }
            }
            return null;
        }
        
		_instance.getVelocityInUniverse = function () {
			return _instance.velocityInOwnFrame.getRotatedInToFrame(_instance.frame, 1);
		};
		
		_instance.setVelocityInUniverse = function (velocityInUniverse) {
			_instance.velocityInOwnFrame = velocityInUniverse.getRotatedInToFrame(_instance.frame, -1);
		};
		
		_instance.addPlane = function (name, lineColour, fillColour, points, detailLevel) {
			var i, j;
            var plane = e58.plane.getNew(this, name, lineColour, fillColour, points, detailLevel);
			_instance.planes.push(plane);
            for (i = 0; i < _instance.planes.length; i++) {
                for (j = 0; j < _instance.planes[i].points.length; j++) {
                    (_instance.xMax >= Math.abs(_instance.planes[i].points[j].x)) || (_instance.xMax = Math.abs(_instance.planes[i].points[j].x));
                    (_instance.yMax >= Math.abs(_instance.planes[i].points[j].y)) || (_instance.yMax = Math.abs(_instance.planes[i].points[j].y));
                    (_instance.zMax >= Math.abs(_instance.planes[i].points[j].z)) || (_instance.zMax = Math.abs(_instance.planes[i].points[j].z));
                    (_instance.rMax >= _instance.planes[i].points[j].r) || (_instance.rMax = _instance.planes[i].points[j].r);
                }
            }
			return plane;
		};
						
		_instance.getCanvasPlanes = function (camera, canvas) {
			var i;
            if (!_instance.alwaysDraw) {
                if (_instance.frame.origin.getDistance(camera.frame.origin)
                            + _instance.rMax > e58.vars.drawDistance) {
                    // console.log("block beyond draw distance");
                    return [];
                }
                var originInCameraFrame = _instance.frame.origin.getPointInFrame(camera.frame);
                if (originInCameraFrame.z > _instance.rMax) {
                    // console.log("block behind camera");
                    return [];
                }
                if (originInCameraFrame.z < 0
                        && originInCameraFrame.r > _instance.rMax
                        && s58.utils.radToDeg(originInCameraFrame.phi) < 180 - e58.vars.drawYaw) {
                    // console.log("block beyond draw yaw angle");
                    // return [];
                }
            }
            
			var canvasPlanes = [];
			for (i = 0; i < _instance.planes.length; i++) {
                if (_instance.detailLevel >= _instance.planes[i].detailLevel) {
                    canvasPlanes.push(_instance.planes[i].getCanvasPlane(camera, canvas));
                }
			}
			return canvasPlanes;
		};
		
		_instance.updateLogic = function (control) {
			var translation = e58.point.getNewXYZ(
				_instance.velocityInOwnFrame.x * control.msSinceLastLogic,
				_instance.velocityInOwnFrame.y * control.msSinceLastLogic,
				_instance.velocityInOwnFrame.z * control.msSinceLastLogic);
			e58.frame.translateInOwnFrame(_instance.frame, translation.x, translation.y, translation.z, 1);
		};
                
		return _instance;
	}
	
	e58.block.getNew = function (
		universe,
		frame,
        options) {
		return _createBlock({
			universe: universe,
			frame: frame,
            extendedOptions: options || {}
		});
	};
})();
