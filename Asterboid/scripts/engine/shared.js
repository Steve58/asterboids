window.e58 = window.e58 || {};
e58.shared = {};

e58.px = function (value) {
    return e58.vars.integerPixels ?
        Math.floor(value) :
        value;
};

window.addEventListener("load", function() {
	document.getElementsByTagName("body")[0].className = e58.vars.inactiveBodyClassName;
});
