window.e58 = window.e58 || {};
e58.plane = {};

(function () {
	function _createPlane (options) {
		var _instance = { className: "e58.plane" };
		_instance.block = options.block;
        _instance.name = options.name;
		_instance.lineColour = options.lineColour;
		_instance.fillColour = options.fillColour;
        _instance.detailLevel = options.detailLevel || 0;
		
		_instance.points = (function () {
			var i;
			var points = options.points || [];
			for (i = 0; i < points.length; i++) {
				points[i] = e58.point.getXYZSafe(points[i]);
			}
			return points;
		})();
		
		_instance.getUniversePoints = function () {
			var i;
			var universePoints = [];
			for (i = 0; i < _instance.points.length; i++) {
				universePoints.push(e58.point.getUniversePoint(_instance.points[i], _instance.block.frame));
			}
			return universePoints;
		};
		
		_instance.getCanvasPlane = function (camera, canvas) {
			return e58.canvasPlane.getNew(
				_instance,
				camera,
				canvas);
		};
		
		return _instance;
	}
	
	e58.plane.getNew = function (
		block,
        name,
		lineColour,
		fillColour,
		points,
        detailLevel) {
		return _createPlane({
			block: block,
            name: name,
			lineColour: lineColour,
			fillColour: fillColour,
			points: points,
            detailLevel: detailLevel
		});
	};
})();
