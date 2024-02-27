define(['underscore', 
    'backbone',
    'mod/dom_helper',
    'zuiRoot/common',
    'zuiRoot/models/ComponentModel',
    'zuiRoot/logger'], function(_, Backbone, mod_dom, Common, Component, Logger){
        var _prius;

        var generateScope = function(settings){
            return new (function(settings){
                settings = typeof settings === 'undefined' ? {} : settings; 

                return { 
                    defaults : {
                        'id': Common.genId(),
                        'title': (settings && settings.title) ? settings.title : 'New Page',
                        'state': 'solo',
                        'echo': false,
                        'isActive': (settings && settings.isActive) ? settings.isActive : false,
                        'isLoading': false,
                        'bodyClasses': settings && Array.isArray(settings.bodyClasses) ? settings.bodyClasses : []
                    },
        
                    initialize : function(){   
                        _inform(this, "zui-component-created");
                        this.view = new (Backbone.View.extend({ 
                            model: this,
                            el: 'body',
                            classes: ['zui-page'],
                            attributes: {
                                'id' : Common.genId(),
                                'disabled': false
                            },
                            render: function() {
                                if(!this.model || this.model.get('disabled') || !this.model.get('isActive'))
                                    return;
        
                                $('head title').html(this.model.get('title'));

                                document.body.className = this.model.get('bodyClasses').join(' ');

                                //this.model.output('rendering page: ' + this.model.get('title'));
                                for(var view in this.model.childViews) {
                                    this.model.childViews[view].render();
                                }

                                /// start to iron out the logger, make modules etc0
                                this.trigger('render', { "hello": true } );
                            }
                        }))();
                    },
                    childViews : [],
                    state: function() {	return this.get('state') },

                    addView: function(v) {
                        if(this.childViews)
                        {
                            if(!this.childViews.find(function(el){ return el.id === v.id; }))
                            {
                                Logger.log('adding sub-view', { tags: 'ZUI' });
                                v.parentView = this;
                                this.childViews.push(v)
                                this.childViews.sort(function(elA, elB){ return elA.sortOrder - elB.sortOrder; });
                                return this.childViews.length;
                            }      
                        }
                    },
                    findChildView: function(v) {
                        var matchId = typeof v === "string" ? v : v.id;
                        var found = this.childViews.find(function(el){ return el.id === matchId; });

                        if(!found)
                        {
                            this.childViews.forEach(function(view, index, list){
                                if(!found){
                                    found = view.findChildView(v);
                                }
                            });
                            return found || null;
                        }
                        return found;  
                    },
                    removeView: function(v){
                        if(this.childViews )
                        {
                            var ndx = this.childViews.findIndex(function(el){ return el.id === v.id; });
                            if(ndx > -1)
                            {
                                Logger.log('removing sub-view', { tags: 'ZUI' });
                                v.parentView = null;
                                return this.childViews.splice(ndx, 1);
                            }       
                        }
                    },
                    activate: function() {
                        this.set('isActive', true);
                    },
                    redraw: function() {
                        this.view.render();
                    },
                    clearExistingBody: function(){
                        mod_dom.clearChildren(document.body);
                    },
                    // output: function(message, messageType){
                    //     if(this.get('echo')) {
                    //         if(!messageType || messageType === 'log') {
                    //             //zui.log(message, settings);
                    //         } else if(messageType === 'warn') {
        
                    //         }
                    //         else if(messageType === 'error') {
        
                    //         }
                    //         //zui.log(format, settings);
                    //     }
                    // }

                };
            })(settings);
        };
        
        //These are the static methods that this type will inherit
        var staticMethods = (function() {
            return {
                fab: function(objValues,  options){   
                    var trigger = new (_prius.extend(generateScope(objValues)))();
                    
                    options = options ? options : {};

                    // handling template & template settings
                    // switch(options.template) {
                    //     case "timer-basic":
                    //         var timerAssembly = TriggerAssembly.fab({
                    //             target: trigger,
                    //             sticky: options.templateVars.sticky
                    //         },{
                    //             template: "timer-basic",
                    //             templateVars: {
                    //                 template:  options.template,
                    //                 duration: options.templateVars.duration
                    //             }
                    //         });

                    //         trigger.addAssembly(timerAssembly);
                    //     break;
                    // }

                    return trigger;

                    // var nuevo = new Types.Page({
                    //     title : (settings && settings.title) ? settings.title : 'New Page',
                    //     isActive : (settings && settings.isActive) ? settings.isActive : false,
                    //     events : settings.events
                    // });
                    // return nuevo;
                },
                fabFromJson: function(json) {
                    var trigger = new (_prius.extend(generateScope(JSON.parse(json))))();
                    return trigger;
                },

                messageDefaults: {
                    "zui-trigger-created": {
                        message: "Trigger Created",
                        logLevel: 1,
                        tags: ["zui-create"]
                    },
                    "zui-trigger-primed": {
                        message: "Trigger Primed",
                    },
                    "zui-trigger-fired": {
                        message: "Trigger Fired",
                        logLevel: 1
                    },
                    "zui-trigger-evaluation-error": {
                        message: "Trigger Evaluation Rejected",
                        logLevel: 1,
                        tags: ["error"]
                    },
                    "zui-trigger-consumed": {
                        message: "Trigger Consumed",
                        logLevel: 1
                    },
                    "zui-trigger-reset": {
                        message: "Trigger Reset",
                        logLevel: 1
                    }
                }
            }
        })();

        //These are private methods shared by the entire class
        function _inform(callee, event, message) {
            //var messageDefaults = {}; //TODO bring message defaults in here ?? 
            
            var eventObject = {
                id: callee.get('id'),
                sourceTriggerAssembly: callee
            };
            var logSettings = {
                message: message ? message :  _prius.messageDefaults.hasOwnProperty(event) ? _prius.messageDefaults[event].message : '--',
                tags: _prius.messageDefaults.hasOwnProperty(event) && _prius.messageDefaults[event].tags ? ["ZUI", "zui-trigger"].concat(_prius.messageDefaults[event].tags) : ["ZUI", "zui-trigger"],
                eventName: event,
                obj: eventObject,
                logLevel: _prius.messageDefaults.hasOwnProperty(event) && _prius.messageDefaults[event].logLevel 
                            ? _prius.messageDefaults[event].logLevel 
                            : 3,
            }
                
            Logger.log(callee.get('id') + ' -- ' + logSettings.message, logSettings);
            callee.trigger(event, eventObject);
        };
   
        _prius = Backbone.Model.extend({}, staticMethods);
        return _prius;
});