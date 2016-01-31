// Block: a Frame and a set of Planes
"use strict"

window.e58 = window.e58 || {};

e58.block = {};

(function () {	
	function _Block (options) {
		var _instance = this;
        _instance.className = "e58.block";
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
	}

	e58.block.getNew = function (
		universe,
		frame,
        options) {
		return new _Block({
			universe: universe,
			frame: frame,
            extendedOptions: options || {}
		});
	};

    _Block.prototype.getPlane = function (name) {
        var i;
        for (i = 0; i < this.planes.length; i++) {
            if (this.planes[i].name == name) {
                return this.planes[i];
            }
        }
        return null;
    };

    _Block.prototype.getVelocityInUniverse = function () {
        return this.velocityInOwnFrame.getRotatedInToFrame(this.frame, 1);
    };

    _Block.prototype.setVelocityInUniverse = function (velocityInUniverse) {
        this.velocityInOwnFrame = velocityInUniverse.getRotatedInToFrame(this.frame, -1);
    };

    _Block.prototype.addPlane = function (name, lineColour, fillColour, points, detailLevel) {
        var i, j;
        var plane = e58.plane.getNew(this, name, lineColour, fillColour, points, detailLevel);
        this.planes.push(plane);
        for (i = 0; i < this.planes.length; i++) {
            for (j = 0; j < this.planes[i].points.length; j++) {
                (this.xMax >= Math.abs(this.planes[i].points[j].x))
                        || (this.xMax = Math.abs(this.planes[i].points[j].x));
                (this.yMax >= Math.abs(this.planes[i].points[j].y))
                        || (this.yMax = Math.abs(this.planes[i].points[j].y));
                (this.zMax >= Math.abs(this.planes[i].points[j].z))
                        || (this.zMax = Math.abs(this.planes[i].points[j].z));
                (this.rMax >= this.planes[i].points[j].r)
                        || (this.rMax = this.planes[i].points[j].r);
            }
        }
        return plane;
    };

    _Block.prototype.getCanvasPlanes = function (camera, canvas) {
        var i;
        if (!this.alwaysDraw) {
            if (this.frame.origin.getDistance(camera.frame.origin)
                        + this.rMax > e58.vars.drawDistance) {
                // console.log("block beyond draw distance");
                return [];
            }
            var originInCameraFrame = this.frame.origin.getPointInFrame(camera.frame);
            if (originInCameraFrame.z > this.rMax) {
                // console.log("block behind camera");
                return [];
            }
            if (originInCameraFrame.z < 0
                    && originInCameraFrame.r > this.rMax
                    && s58.utils.radToDeg(originInCameraFrame.phi) < 180 - e58.vars.drawYaw) {
                // console.log("block beyond draw yaw angle");
                // return [];
            }
        }

        var canvasPlanes = [];
        for (i = 0; i < this.planes.length; i++) {
            if (this.detailLevel >= this.planes[i].detailLevel) {
                canvasPlanes.push(this.planes[i].getCanvasPlane(camera, canvas));
            }
        }
        return canvasPlanes;
    };

    _Block.prototype.updateLogic = function (control) {
        var translation = e58.point.getNewXYZ(
            this.velocityInOwnFrame.x * control.msSinceLastLogic,
            this.velocityInOwnFrame.y * control.msSinceLastLogic,
            this.velocityInOwnFrame.z * control.msSinceLastLogic);
        this.frame.translateInOwnFrame(translation.x, translation.y, translation.z, 1);
    };
})();
