window.e58 = window.e58 || {};
e58.camera = {};

(function () {
	function _createCamera (options) {
		var _instance = { className: "e58.camera" };		
		_instance.frame = e58.frame.getNew(options.origin, options.theta1Deg, options.phiYDeg, options.theta2Deg);
		_instance.velocityInUniverse = e58.point.getNewXYZ(0, 0, 0);
		_instance.zoom = options.zoom || 1;
		
		_instance.updateLogic = function (control) {
			var translation = e58.point.getNewXYZ(
				_instance.velocityInUniverse.x * control.msSinceLastLogic,
				_instance.velocityInUniverse.y * control.msSinceLastLogic,
				_instance.velocityInUniverse.z * control.msSinceLastLogic);
			e58.frame.translateInUniverse(_instance.frame, translation.x, translation.y, translation.z, 1);
		};
		
		return _instance;
	}
	
	e58.camera.getNew = function (origin, theta1Deg, phiYDeg, theta2Deg, zoom) {
		return _createCamera({
			origin: origin,
			theta1Deg: theta1Deg,
			phiYDeg: phiYDeg,
			theta2Deg: theta2Deg,
			zoom: zoom
		});
	};
})();
