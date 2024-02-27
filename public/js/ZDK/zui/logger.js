define(['underscore', 'backbone'], function(_, Backbone){
    var _theTime = function (){
        var dateObj = new Date(Date.now());
        return '[' + dateObj.getHours() + ':' + dateObj.getMinutes() + ':' + dateObj.getSeconds() + '-' +  dateObj.getMilliseconds()+']';
    };
    
    var zuiEventStream = {};
    _.extend(zuiEventStream, Backbone.Events);

    var zuiTriggerEventStream = {};
    _.extend(zuiTriggerEventStream, Backbone.Events);
    
    var zuiDomStream = {};
    _.extend(zuiDomStream, Backbone.Events);

    var zuiContentStream = {};
    _.extend(zuiContentStream, Backbone.Events);

    var _logPrefix = function(filter){
        var str = '';
        if(Array.isArray(filter)){
            str += filter.join(', ');
        }
        else if(typeof filter === 'string') {
            str += filter;
        }

        return '['+ str +']';
    }

    var routeOutput = function(msg, tags, obj){
        var output =  _theTime() + "-" + _logPrefix(tags) + ': ' + msg;

        if(tags.indexOf('error') > -1) {
            console.error(output);
        } else if(tags.indexOf('warn') > -1) {
            console.warn(output);
        }
        else {
            console.log(output);
        }

        // TODO Re-enable this
        // if(typeof obj === 'object' ){
        //     console.log(obj);
        // }
    };

    // Error Logging Levels:
    // 0 - off (or remove from list)
    // 1 - major
    // 2 - minor
    // 3 - verbose
    var logOutputFilter = {
        'error' : 3,
        'warn' : 3,
        'zui-dom' : 1,
        'zui-http' : 1,
        'zui-component' : 1,
        'zui-page' : 2,
        'zui-trigger' : 1,
        'zui-event' : 2,
        'zui-create' : 2,
        'ZUI': 1,
        'misc' : 1
        //router, html-dom, pageActions
    } ;

        //storing here until we can refactor it across the framework
        // messageDefaults: {
        //     "zui-component-created": {
        //         message: "Component Created",
        //         logLevel: 1,
        //         tags: ["zui-create"]
        //     }
        // }

        //storing here until we can refactor it across the framework
        //These are private methods shared by the entire class
        // function _inform(callee, event, message) {
        //     //var messageDefaults = {}; //TODO bring message defaults in here ?? 
            
        //     var eventObject = {
        //         id: callee.get('id'),
        //         source: callee
        //     };
        //     var logSettings = {
        //         message: message ? message :  _prius.messageDefaults.hasOwnProperty(event) ? _prius.messageDefaults[event].message : '--',
        //         tags: _prius.messageDefaults.hasOwnProperty(event) && _prius.messageDefaults[event].tags ? ["ZUI", "zui-component"].concat(_prius.messageDefaults[event].tags) : ["ZUI", "zui-component"],
        //         eventName: callee,
        //         obj: eventObject,
        //         logLevel: _prius.messageDefaults.hasOwnProperty(event) && _prius.messageDefaults[event].logLevel 
        //                     ? _prius.messageDefaults[event].logLevel 
        //                     : 3,
        //     }
                
        //     Logger.log(callee.get('id') + ' -- ' + logSettings.message, logSettings);
        //     callee.trigger(event, eventObject);
        // };


    // todo make a context return setup for proper scope.
    return {
        log : function(msg, settings) {
            var tags = settings && settings.tags ? settings.tags : 'misc' ;
            var obj = settings && settings.obj ? settings.obj : undefined;
            var logLevel = settings && settings.logLevel ? settings.logLevel : 3;
            var fireEvent = settings && settings.fireEvent ? settings.fireEvent : false;
            
            // TODO - add the event object to include, or ensure that settings.obj meets the needs
            if(Array.isArray(tags)){
                var sendOutputFilter = false;
                for(var key in tags)
                {  
                    if(fireEvent && this.eventChannels.hasOwnProperty(tags[key])) {
                        this.eventChannels[tags[key]].trigger(tags[key], obj);
                    } 

                    if(logOutputFilter.hasOwnProperty(tags[key]) && logOutputFilter[tags[key]] >= logLevel) {
                        sendOutputFilter = true;
                    }
                }

                if(sendOutputFilter){
                    routeOutput(msg, tags, obj);
                }
            }
            else {
                if(fireEvent && this.eventChannels.hasOwnProperty(tags) && settings.eventName) {
                    this.eventChannels[tags].trigger(settings.eventName, obj);
                } 
                if(logOutputFilter.hasOwnProperty(tags) && logOutputFilter[tags] >= logLevel) {
                    routeOutput(msg, tags, obj);
                }
            }
        },
        subscribe : function(channel, eventName, handler) {
            if(this.eventChannels.hasOwnProperty(channel)) {
                this.eventChannels[channel].on(eventName, handler);
            }
        },
        unsubscribe : function(channel, eventName, handler) {
            if(this.eventChannels.hasOwnProperty(channel)) {
                this.eventChannels[channel].off(eventName, handler);
            }
        },

        registerChannel : function(name, channel){
            if(!this.eventChannels.hasOwnProperty(name)) {
                this.eventChannels[name] = _.extend(channel, Backbone.Events);
            }
        },
        eventChannels : {
            'zui-all': zuiEventStream,
            'zui-trigger': zuiTriggerEventStream,
            'zui-dom': zuiDomStream,
            'zui-content' : zuiContentStream
        }
    } 
});