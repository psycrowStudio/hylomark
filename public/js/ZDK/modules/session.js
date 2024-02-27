define([
    'api-3p/locstor/dist/js/locstor'],
    function (
        Locstor
    ) {
        // CREDITS / DEPENDENCY: https://github.com/justindeguzman/locstor
        var _SESSION_KEY = 'user_session_info';
        var _EXPIRATION_KEY = "session_expiration";
        var _SESSION_LENGTH = 0;
        var _model = undefined;
        var _current = {};

        var _session = {
            fetch: function (refetchSession) {
                if (!_model || refetchSession === true) {
                    _model = Locstor.get(_SESSION_KEY) || {};
                    _current = _model;
                }
                return _current;
            },
            push: function (key, value, category) {
                if (category) {
                    if (!_current.hasOwnProperty(category)) {
                        _current[category] = {};
                    }
                    _current[category][key] = value;
                }
                else {
                    _current[key] = value;
                }
            },
            save: function () {
                _session.clear();
                //TODO fix this, does not work in IE11
                var values = !_model ? _current : Object.assign(_model, _current);
                //values[_EXPIRATION_KEY] = (new Date(Date.now()).setMilliseconds(_SESSION_LENGTH)).toISOString();
                Locstor.set(_SESSION_KEY, values);
            },
            clear: function () {
                Locstor.remove(_SESSION_KEY);
            },
            resume: function () {
                _model = Locstor.get(_SESSION_KEY);
                _current = _model || {};
                return true;
            }
        };

        return _session;
    }
);