window.e58 = window.e58 || {};
e58.toggle = {};

(function () {
	function _createToggle (options) {
		var _instance = { className: "e58.toggle" };
        _instance.value = options.value || false;
        _instance.lastToggleMs = (new Date()).valueOf();
        
        _instance.toggle = function (newValue) {
            var nowUtcMs = (new Date()).valueOf();
            if (_instance.lastToggleMs <= nowUtcMs - e58.vars.control.toggleMs) {
                _instance.value = (newValue == null) ? !_instance.value : newValue;
                _instance.lastToggleMs = nowUtcMs;
            }
        };
        
        _instance.set = function (newValue) {
            _instance.toggle(newValue || false);
        };
        
		return _instance;
	}
	
	e58.toggle.getNew = function (
		value) {
		return _createToggle({
            value: value
		});
	};
})();
