window.e58 = window.e58 || {};
e58.buffer = {};

(function () {
	function _createBuffer (options) {
		var _instance = { className: "e58.buffer" };
        _instance.defaultValueAccessor = "value";
		_instance.limit = options.limit;
        _instance.constant = options.constant;
        
        _instance.values =
            typeof options.initialValues == "number" ?
            { value: options.initialValues } :
            options.initialValues || {};
                
        _instance.applyValue = function(value, valueAccessorOrAction, action) {
            var valueAccessor = _instance.defaultValueAccessor;
            if (typeof valueAccessorOrAction == "function") {
                action = valueAccessorOrAction;
            }
            else {
                valueAccessor = valueAccessorOrAction;
            }
            
            _instance.values[valueAccessor] = _instance.values[valueAccessor] || 0;
            
            var delta = value - _instance.values[valueAccessor];
            
            if (Math.abs(delta) > Math.abs(_instance.limit)) {
                var appliedDelta = _instance.constant * delta - s58.utils.getSign(delta) * _instance.limit;
                _instance.values[valueAccessor] += appliedDelta;
                action && action(appliedDelta);
            }
        };
        
        _instance.apply = function(delta, valueAccessorOrAction, action) {
            var valueAccessor = _instance.defaultValueAccessor;
            if (typeof valueAccessorOrAction == "function") {
                action = valueAccessorOrAction;
            }
            else {
                valueAccessor = valueAccessorOrAction;
            }
            
            _instance.values[valueAccessor] = _instance.values[valueAccessor] || 0;
            _instance.values[valueAccessor] += delta;
            if (Math.abs(_instance.values[valueAccessor]) > Math.abs(_instance.limit)) {
                var appliedDelta = _instance.constant * (_instance.values[valueAccessor] - s58.utils.getSign(_instance.values[valueAccessor]) * _instance.limit);
                _instance.values[valueAccessor] -= appliedDelta;
                action && action(appliedDelta);
            }
        }
        
        _instance.reset = function() {
            _instance.values = {};
        };
        
		return _instance;
	}
	
	e58.buffer.getNew = function (
		limit,
        constant,
        initialValues) {
		return _createBuffer({
            limit: limit,
            constant: constant,
            initialValues: initialValues
		});
	};
})();
