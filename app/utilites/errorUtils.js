define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.displayError = void 0;
    function displayError(error) {
        document.body.classList.remove("configurable-application--loading");
        document.body.classList.add("app-error");
        document.getElementById("appMain").innerHTML = "<h1>" + error.title + "</h1><p class='app-error-content'>" + error.message + "</p>";
    }
    exports.displayError = displayError;
});
//# sourceMappingURL=errorUtils.js.map