define(['backbone', 'underscore'], function(Backbone, _){   
//mouse-move, button-click, create, destroy, http, router, renderer, 
var _externalComponentTypes = {};
var _loadingCount = 0;
var _externalComponentSrc = [
    //'js/zui/components/menu_horizontal.js' // TODO move this component over to RequireJS pattern
];

// PUBLIC     
    var common = {
        getCount: function(){ return _counter; },
        incCount: function(){ _counter = _counter + 1; },
        colors : {
            'status_nominal' : '#00FF00',
            'status_caution' : '#FFFF00',
            'status_danger' : '#FF0000',
        
            'chrome_active' : '',
            'chrome_inactive' : '',
            'chrome_disabled' : '',
            'chrome_selected' : '',
        
            'font_light' : '#99999',
            'font_dark' : '#333333',
            'font_highlight' : '#008080',
            'font_lowlight' : 'rgba(0,0,0,0.6)',
        
        
            'theme' : ['#413A21', '#8C826C', '#E5C79F', '#FF974F', '#F54F29'], //['#405952', '#9C9B7A', '#FFD393', '#FF974F', '#F54F29'],
            'bw':['#000000', '#222222', '#333333', '#666666', '#999999', '#AAAAAA', '#BBBBBB', '#CCCCCC', '#DDDDDD', '#EEEEEE', '#FFFFFF'],
            'opacity':['0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'],
        
            hexToRGBA: function(hex, alpha) {
                var r = parseInt(hex.slice(1, 3), 16),
                    g = parseInt(hex.slice(3, 5), 16),
                    b = parseInt(hex.slice(5, 7), 16);
        
                if (alpha) {
                    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
                } else {
                    return "rgb(" + r + ", " + g + ", " + b + ")";
                }
            }
        },
        genId : function() { return ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6); },
        objIsOfType : function(obj, type) { return true; },
        objInstanceOfType : function(obj, type) { return true; },
        //returnTypeFromString : function(name) { return  }
        registeredTypes: {},

        //ANIMATOR
        animator: {
            //hide : function() {}
            //reveal
            //animate
            //transition
        },

        //LOCATER - finding ZUI objects at runtime
        locator: {
            //locate: function(){}
        },

        // AUDIO - a shared resource for playing sounds
        audio:{

        },
        QuerablePromise: function(generator){
            if(generator.handle)
            {
                return generator;
            }

            // Set initial state
            var handle = {};
            var isPending = true;
            var isRejected = false;
            var isFulfilled = false;
            var promise = generator.call(this, handle).then(
                function(fufliment) {
                    isFulfilled = true;
                    isPending = false;
                    return fufliment; 
                }, 
                function(rejection) {
                    isRejected = true;
                    isPending = false;
                    throw rejection; 
                }
            );
            promise.handle =  handle;
            promise.isFulfilled = function() { return isFulfilled; };
            promise.isPending = function() { return isPending; };
            promise.isRejected = function() { return isRejected; };

            return promise;
        },
        DelayPromise: function(delay, rejectAfter){
            return new Promise(function(resolve, reject){
                setTimeout(function(){
                    if(rejectAfter) {
                        reject();
                    } else {
                        resolve();
                    }
                }, delay);
            });
        },
        // objectExists: does a specific JS object exist in memory?
        // DOMObjectExists: same as above but for DOM selectors
        LoadExternalComponents(callback)
        {
            for(let z = 0; z < _externalComponentSrc.length; z++)
            {
                let capture = _externalComponentSrc[z];
               _loadingCount++;
                $.getScript( capture, function()
                {
                    Logger.log(capture + ' loaded.', { tags:'zui-http', logeLevel:1 });
                    --_loadingCount >= 0 ? _loadingCount : 0;
                    
                    if(_loadingCount === 0)
                    {
                        //done loading
                        if(callback && typeof callback === 'function')
                        {
                            callback();
                        }
                    }
                });
            }
        }

    };
    
    return common;
});