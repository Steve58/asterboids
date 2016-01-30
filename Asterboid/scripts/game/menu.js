window.addEventListener("load", function() {
    var options = {
        cameraSplitMode: null,
        flipCamera: null
    };
        
    function refreshOptions() {
        var optionName;
        for (optionName in options) {
            options[optionName] = document.getElementById(optionName).value;
        }
        document.getElementById("go").href = "Game.htm?" + s58.utils.constructQueryStringParams(options);
        
        if (document.origin != "null") {
            // condition avoids Chrome error when using file protocol
            window.history.replaceState(null, "", "Menu.htm?" + s58.utils.constructQueryStringParams(options));
        }
    }
    
    (function () {
        var i;
        var queryOptions = s58.utils.parseQueryString();
                
        var optionName;
        for (optionName in options) {
            document.getElementById(optionName).addEventListener("change", refreshOptions);
                        
            if (queryOptions[optionName]
                    || queryOptions[optionName] == 0
                    || queryOptions[optionName] == false) {
                document.getElementById(optionName).value = queryOptions[optionName].toString();
            }
            else {
                document.getElementById(optionName).value = g58.vars.defaultOptions[optionName].toString();
            }
        }
        
        refreshOptions();
    })();
});
