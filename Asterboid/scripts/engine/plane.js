// Plane
// A flat polygon in 3D space, belonging to a Block

"use strict";

window.e58 = window.e58 || {};

e58.plane = {};

(function () {
	function _Plane (options) {
		var _instance = this;
        _instance.className = "e58.plane";

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
	}

	e58.plane.getNew = function (
		block,
        name,
		lineColour,
		fillColour,
		points,
        detailLevel) {
		return new _Plane({
			block: block,
            name: name,
			lineColour: lineColour,
			fillColour: fillColour,
			points: points,
            detailLevel: detailLevel
		});
	};

    _Plane.prototype.getUniversePoints = function () {
        var i;
        var universePoints = [];
        for (i = 0; i < this.points.length; i++) {
            universePoints.push(this.points[i].getUniversePoint(this.block.frame));
        }
        return universePoints;
    };

    _Plane.prototype.getCanvasPlane = function (camera, canvas) {
        return e58.canvasPlane.getNew(this, camera, canvas);
    };
})();
