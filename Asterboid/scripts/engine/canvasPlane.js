window.e58 = window.e58 || {};
e58.canvasPlane = {};

(function () {
	function _CanvasPlane (options) {
        var _instance = this;
		_instance.className = "e58.canvasPlane";
        
        _instance.plane = options.plane;
        _instance.camera = options.camera;
        _instance.canvas = options.canvas
				
		_instance.canvasPoints = (function () {
			var i, j;
			var anyInFrontOfCamera = false;
			var anyInCanvas = false;
			var anyLeft = false;
			var anyRight = false;
			var anyTop = false;
			var anyBottom = false;
			var anyTopLeft = false;
			var anyTopRight = false;
			var anyBottomLeft = false;
			var anyBottomRight = false;
			var x, y;
			var w = _instance.canvas.width;
			var h = _instance.canvas.height;
			
			var universePoints = _instance.plane.getUniversePoints();
			var canvasPoints = [];
			for (i = 0; i < universePoints.length; i++) {
				canvasPoints[i] = e58.canvasPoint.getNew(_instance.camera, _instance.canvas, universePoints[i]);
				anyInFrontOfCamera = anyInFrontOfCamera || canvasPoints[i].pointInCameraFrame.z <= 0;
				if (!anyInCanvas) {
					x = canvasPoints[i].canvasX;
					y = canvasPoints[i].canvasY;
					anyInCanvas = x > 0 && x <= w && y > 0 && y <= h;
					anyLeft = anyLeft || (x < 0 && y > 0 && y <= h);
					anyRight = anyRight || (x > w && y > 0 && y <= h);
					anyTop = anyTop || (x > 0 && x <= w && y < 0);
					anyBottom = anyBottom || (x > 0 && x <= w && y > h);
					anyTopLeft = anyTopLeft || (x < 0 && y < 0);
					anyTopRight = anyTopRight || (x > w && y < 0);
					anyBottomLeft = anyBottomLeft || (x < 0 && y > h);
					anyBottomRight = anyBottomRight || (x > w && y > h);
				}
			}
			
			if (anyInFrontOfCamera && (
					anyInCanvas || 
					(anyLeft && (anyRight || anyTop || anyBottom || anyTopRight || anyBottomRight)) ||
					(anyRight && (anyLeft || anyTop || anyBottom || anyTopLeft || anyBottomLeft)) ||
					(anyTop && (anyBottom || anyLeft || anyRight || anyBottomLeft || anyBottomRight)) ||
					(anyBottom && (anyTop || anyLeft || anyRight || anyTopLeft || anyTopRight)) ||
					(anyTopLeft && (anyBottomRight || anyRight || anyBottom)) ||
					(anyTopRight && (anyBottomLeft || anyLeft || anyBottom)) ||
					(anyBottomLeft && (anyTopRight || anyRight || anyTop)) ||
					(anyBottomRight && (anyTopLeft || anyLeft || anyTop)))) {
				return canvasPoints;
			}
			return [];			
		})();
				
		_instance.distanceToCamera = (function () {
			var i;
			var n = _instance.canvasPoints.length;
			if (!n) {
				return null;
			}			
			var sum = { x: 0, y: 0, z: 0 };
			for (i = 0; i < n; i++) {
				sum.x += _instance.canvasPoints[i].pointInCameraFrame.x;
				sum.y += _instance.canvasPoints[i].pointInCameraFrame.y;
				sum.z += _instance.canvasPoints[i].pointInCameraFrame.z;
			}
			return e58.point.getNewXYZ(sum.x / n, sum.y / n, sum.z / n).r;
		})();
	}
	
	e58.canvasPlane.getNew = function (
		plane,
		camera,
		canvas) {
		return new _CanvasPlane({
			plane: plane,
			camera: camera,
			canvas: canvas
		});
	};
    
    _CanvasPlane.prototype.render = function () {
        var i;
        if (!this.canvasPoints.length) {
            return;
        }
        
        var context = this.canvas.getContext(this.plane.lineColour, this.plane.fillColour);
        context.beginPath();
        
        context.moveTo(
            e58.px(this.canvasPoints[0].canvasX),
            e58.px(this.canvasPoints[0].canvasY));
        // console.log(this.canvasPoints[0]);
        
        for (i = 1; i < this.canvasPoints.length; i++) {
            context.lineTo(
                e58.px(this.canvasPoints[i].canvasX),
                e58.px(this.canvasPoints[i].canvasY));
            // console.log(this.canvasPoints[i]);
        }
        context.closePath();
        context.stroke();
        context.fill();
    };
})();
