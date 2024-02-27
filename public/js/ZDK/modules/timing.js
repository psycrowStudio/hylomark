define([],
    function (
    ) {
        var MODULE_NAME = "timing";

        var _timing = {
            delay: function (duration) {
                return new Promise(function (resolve) {
                    setTimeout(resolve, duration);
                });
            }
        };

        return _timing;
    }
);