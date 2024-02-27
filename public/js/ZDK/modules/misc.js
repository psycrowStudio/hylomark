define([],
    function () {
        var MODULE_NAME = "misc";
        
        var DEFAULT_TIMEOUT = 10000; // time in milliseconds 
        var LONGCALL_TIMEOUT = 360000; // time in milliseconds 
        function defaultErrorCallback(obj, reject) {
            var errorMessage = '[' + obj.status + '] - ' + obj.statusText || '';

            var apiResponse;
            try {
                apiResponse = obj.response ? JSON.parse(obj.response) : errorMessage;
            }
            catch (ex) { }

            reject(obj);
        }

        var _misc = {
            http: function (url, verb, payload, customHeaders) {
                return new Promise(function (resolve, reject) {
                    var xhr = new XMLHttpRequest();
                    xhr.open(verb, url, true);
                    xhr.timeout = DEFAULT_TIMEOUT;

                    if (!customHeaders && verb === "POST") {
                        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
                        payload = Object.keys(payload).map(function (key) {
                            return key + '=' + payload[key];
                        }).join('&');
                    }
                    else {
                        for (var key in customHeaders) {
                            if (customHeaders.hasOwnProperty(key)) {
                                xhr.setRequestHeader(key, customHeaders[key]);
                            }
                        }
                    }

                    xhr.ontimeout = function (event) {
                        reject("Client Timedout after " + DEFAULT_TIMEOUT + "(ms).");
                    };

                    xhr.onload = function (event) {
                        if (this.status < 400) {
                            resolve(this.response);
                        }
                        else {
                            defaultErrorCallback(this, reject);
                        }
                    };

                    xhr.send(payload);
                }).then(function (rawResult) {
                    var result;
                    try {
                        result = JSON.parse(rawResult);
                    }
                    catch (ex) {
                        result = rawResult;
                    }

                    return result;
                });
            },
            httpLongCall: function (url, verb, payload, customHeaders) {
                return new Promise(function (resolve, reject) {
                    var xhr = new XMLHttpRequest();
                    xhr.open(verb, url, true);
                    xhr.timeout = LONGCALL_TIMEOUT;

                    if (!customHeaders && verb === "POST") {
                        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
                        payload = Object.keys(payload).map(function (key) {
                            return key + '=' + payload[key];
                        }).join('&');
                    }
                    else {
                        for (var key in customHeaders) {
                            if (customHeaders.hasOwnProperty(key)) {
                                xhr.setRequestHeader(key, customHeaders[key]);
                            }
                        }
                    }

                    xhr.ontimeout = function (event) {
                        reject("Client Timedout after " + LONGCALL_TIMEOUT + "(ms).");
                    };

                    xhr.onload = function (event) {
                        if (this.status < 400) {
                            resolve(this.response);
                        }
                        else {
                            defaultErrorCallback(this, reject);
                        }
                    };

                    xhr.send(payload);
                }).then(function (rawResult) {
                    var result;
                    try {
                        result = JSON.parse(rawResult);
                    }
                    catch (ex) {
                        result = rawResult;
                    }

                    return result;
                });
            },
            isObjectEmpty: function (o) { return Object.keys(o).length === 0 && o.constructor === Object; },
            sizeOf: function (object, pretty) {
                //https://github.com/lyroyce/sizeof/blob/master/lib/sizeof.js
                var _format = function (bytes) {
                    if (bytes < 1024) return bytes + "B";
                    else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + "K";
                    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + "M";
                    else return (bytes / 1073741824).toFixed(3) + "G";
                };

                var objectList = [];
                var stack = [object];
                var bytes = 0;

                while (stack.length) {
                    var value = stack.pop();

                    if (typeof value === 'boolean') {
                        bytes += 4;
                    } else if (typeof value === 'string') {
                        bytes += value.length * 2;
                    } else if (typeof value === 'number') {
                        bytes += 8;
                    } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
                        objectList.push(value);
                        // if the object is not an array, add the sizes of the keys
                        if (Object.prototype.toString.call(value) !== '[object Array]') {
                            for (var key in value) bytes += 2 * key.length;
                        }
                        for (var key in value) stack.push(value[key]);
                    }
                }
                return pretty ? _format(bytes) : bytes;
            },
            getDefaultValueForType: function (t) {
                var obj = null;

                switch (t.toLowerCase()) {
                    case "boolean":
                        obj = false;
                        break;
                    case "number":
                        obj = 0;
                        break;
                    case "string":
                        obj = "";
                        break;
                    case "object":
                        obj = {};
                        break;
                    case "array":
                        obj = [];
                        break;
                }

                return obj;
            },
            simpleClone: function (obj) {
                // simple clone
                return JSON.parse(JSON.stringify(obj));
            },
            deepClone: function (obj) {
                var c = null;
                if(Array.isArray(obj)){
                    c = [];
                    obj.forEach(function(el){
                        c.push(_misc.deepClone(el));
                    });
                }
                else if(typeof obj === "object"){
                    c = {};
                    for(var key in obj) {
                        c[key] = _misc.deepClone(obj[key]);
                    };
                }
                else {
                    c = obj;
                }
                return c;
            }
        };

        return _misc;
    }
);