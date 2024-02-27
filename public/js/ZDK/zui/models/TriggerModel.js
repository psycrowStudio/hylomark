define(['underscore', 'backbone',
    'zuiRoot/common',
    'zuiRoot/logger',
    'zuiRoot/models/TriggerAssemblyModel'], function(_, Backbone, Common, Logger, TriggerAssembly){
        var _prius;

        var generateScope = function(settings){
            return new (function(settings){
                settings = typeof settings === 'undefined' ? {} : settings;
                var _assembly = TriggerAssembly.fab({});  
                var _isUnderEvaluation = false;

                var _fire = function() {
                    if(this.get('state') === "primed") {
                        this.set({
                            'state' : 'fired',
                            'firedCount': this.get('firedCount') +1,
                            'lastFired': Date.now()
                        });
                        _inform(this, "zui-trigger-fired");
                        if(this.get('resetAfterFire') === true && this.get('firedLimit') > 0 && this.get('firedCount') < this.get('firedLimit')) {
                            _reset.call(this);
                        } else if(!this.get('keepAlive')) {
                            _cleanup.call(this);
                        }
                   }
                };
                
                var _reset = function() {	
                    this.set('state', 'primed');
                    _assembly.reset(); 
                    _inform(this, "zui-trigger-reset");
                    this.prime();
                };
                
               var _cleanup = function() {
                    _inform(this, "zui-trigger-consumed");    
                    _assembly.cleanup();
                    //required interface? add on addAssembly?
                    //this.ownedBy(consumeTrigger)
                    this.ownedBy = null;
                };

                return { 
                    defaults : {
                        'id' : Common.genId(),
                        'state' : 'unprimed', // 'primed', fired', 'consumed'
                        'keepAlive': settings.keepAlive || false,
                        'resetAfterFire': settings.resetAfterFire || false,
                        'lastReset' : 0,
                        'firedLimit' : settings.firedLimit || 0,
                        'firedCount': 0,
                        'lastFired': 0
                    },
        
                    initialize : function(){   
                        _inform(this, "zui-trigger-created");
                    },
        
                    state: function() {	return this.get('state') },
                    ownedBy: settings.target,
                    assemblyPromise: {},

                    addAssembly: function(link){
                        _assembly.cleanup();
                        this.set('state', 'unprimed');
                        link.ownedBy = this;
                        // TODO add the cancelation / cleanup routine to trigger owner
                        _assembly = link;
                        
                        this.prime();
                    },
    
                    // AKA initialize
                    prime: function(){
                        _trigger = this;
                        if(!this.ownedBy) {
                            _cleanup.call(this);
                            return false;
                        }

                        if(this.get('state') === "unprimed") {
                            this.set('state', 'primed');
                            _inform(this, "zui-trigger-primed");
                            return;
                        }

                        this.assemblyPromise = Common.QuerablePromise.call(_assembly, _assembly.evaluate);
                        _isUnderEvaluation = true;
                        this.assemblyPromise = this.assemblyPromise.then(function(data){
                            _fire.call(_trigger);
                        }).catch(function(err){
                          _inform(_trigger, 'zui-trigger-evaluation-error', err); 
                        }).finally(function(){
                            _isUnderEvaluation = false;

                            // TODO trigger a eval complete event
                            //if keepalive === false
                            // _cleanup.call(_trigger);
                        });
                    },
                    cancelEvaluation: function(reason){
                        reason = reason || 'Manually Canceled...';
                        if(_isUnderEvaluation){
                            this.assemblyPromise.handle.reject(reason);
                        }
                        _assembly.cancelEvaluation(reason);
                    },
                    cleanup: function(){
                        _cleanup.call(this);
                    }
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
                    switch(options.template) {
                        case "timer-basic":
                            var timerAssembly = TriggerAssembly.fab({
                                target: trigger,
                                sticky: options.templateVars.sticky
                            },{
                                template: "timer-basic",
                                templateVars: {
                                    template:  options.template,
                                    duration: options.templateVars.duration
                                }
                            });

                            trigger.addAssembly(timerAssembly);
                            break;
                        case "function-runner":
                            var timerAssembly = TriggerAssembly.fab({
                                target: trigger,
                                evaluationTimeout: options.templateVars.evaluationTimeout || 10,
                            },{
                                template: "function-runner",
                                templateVars: {
                                    evalPredicate: options.templateVars.evalPredicate
                                }
                            });

                            trigger.addAssembly(timerAssembly);
                            break;
                    }

                    return trigger;
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