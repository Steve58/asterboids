window.e58 = window.e58 || {};
e58.universe = {};

(function () {
	function _createUniverse () {
		var _instance = { className: "e58.universe" };
		
		_instance.frame = e58.frame.getNew();
		_instance.blocks = [];
		_instance.cameras = [];
		
		_instance.addBlock = function (origin, theta1Deg, phiYDeg, theta2Deg, options) {
			var blockFrame = e58.frame.getNew(origin, theta1Deg, phiYDeg, theta2Deg);
			var block = e58.block.getNew(this, blockFrame, options);
			_instance.blocks.push(block);
			return block;
		};
		
		_instance.addCamera = function (origin, theta1Deg, phiYDeg, theta2Deg, zoom) {
			var camera = e58.camera.getNew(origin, theta1Deg, phiYDeg, theta2Deg, zoom);
			_instance.cameras.push(camera);
			return camera;
		};
		
		function _renderPlanes(camera, canvas) {
			var i, j, swapPlane;
			var canvasPlanes = [];
			for (i = 0; i < _instance.blocks.length; i++) {
				canvasPlanes = canvasPlanes.concat(_instance.blocks[i].getCanvasPlanes(camera, canvas));
			}			
			for (i = 0; i < canvasPlanes.length; i++) {
				for (j = i + 1; j < canvasPlanes.length; j++) {
					if (canvasPlanes[i].distanceToCamera < canvasPlanes[j].distanceToCamera) {
						swapPlane = canvasPlanes[i];
						canvasPlanes[i] = canvasPlanes[j];
						canvasPlanes[j] = swapPlane;
					}
				}
			}			
			for (i = 0; i < canvasPlanes.length; i++) {
				canvasPlanes[i].render();
			}
		}
		
		_instance.render = function (camera, canvas) {
			canvas.clear();
			_renderPlanes(camera, canvas);
            if (e58.vars.shading.enable) {
                canvas.renderShade(camera.frame.getUprightAngles());
            }
		};
        		
		_instance.updateLogic = function (control) {
			var i;
			for (i = 0; i < _instance.blocks.length; i++) {
				_instance.blocks[i].updateLogic(control);
			}
			for (i = 0; i < _instance.cameras.length; i++) {
				_instance.cameras[i].updateLogic(control);
			}
		};
				
		return _instance;
	}
	
	e58.universe.getNew = function () {
		return _createUniverse();
	};
})();
