// home
// Home page script

"use strict";

window.addEventListener("load", function() {
    var options = {
        cameraSplitMode: "viewCentreAimCentre",
        flipCamera: false,
        antiAliasing: true,
        sound: null
    };
        
    function refreshOptions() {
        var optionName, dropdown;
        for (optionName in options) {
            dropdown = document.getElementById(optionName);
            if (dropdown) {
                options[optionName] = dropdown.value;
            }
        }
        document.getElementById("go").href = "Game.htm?" + s58.constructQueryStringParams(options);
        document.getElementById("home").href = "Home.htm?" + s58.constructQueryStringParams(options);
        document.getElementById("info").href = "Info.htm?" + s58.constructQueryStringParams(options);
        document.getElementById("menu").href = "Menu.htm?" + s58.constructQueryStringParams(options);
        
        if (document.origin != "null") {
            // condition avoids Chrome error when using file protocol
            window.history.replaceState(null, "", "Menu.htm?" + s58.constructQueryStringParams(options));
        }
    }
    
    (function () {
        var queryOptions = s58.parseQueryString();
        
        var optionName, dropdown;
        for (optionName in options) {
            dropdown = document.getElementById(optionName);
            if (dropdown) {
                dropdown.addEventListener("change", refreshOptions);
                if (queryOptions[optionName]
                        || queryOptions[optionName] === 0
                        || queryOptions[optionName] === false) {
                    document.getElementById(optionName).value = queryOptions[optionName].toString();
                }
                else if (g58.vars.defaultOptions[optionName]
                        || g58.vars.defaultOptions[optionName] === 0
                        || g58.vars.defaultOptions[optionName] === false) {
                    document.getElementById(optionName).value = g58.vars.defaultOptions[optionName].toString();
                }
            }
        }
        
        refreshOptions();
    })();
});
