	define(['underscore', 'backbone',
    'zuiRoot/common',
    'zuiRoot/logger',
    'zuiRoot/models/TriggerRuleModel'], function(_, Backbone, Common, Logger, Rule){
        var _prius;
        var generateSuperScope = function(){
            return new (function(){
                return {

                };
            })();
        }

        var generateScope = function(settings){

            return new (function(settings){
                settings = typeof settings === 'undefined' ? {} : settings;

                var _successCallback = function(result, handle){
                    console.log('success', result);
                    this.set('underEvaluation', false);

                    
                    this.set('status', true);
                    // sticky enables this to remain true after a successful evaluation
                    if(this.get('becameTrueAt') === 0 || this.get('sticky') === false) {
                        this.set('becameTrueAt', Date.now());
                    }

                    this.trigger("zui-triggerAssembly-evaluate-success");
                    handle.resolve(result);      
                };

                var _failCallback = function(input, handle){
                    this.trigger("zui-triggerAssembly-evaluate-fail");
                    this.set('underEvaluation', false);
                    handle.reject(input);
                };

                var _errorCallback = function(status){
                    this.trigger("zui-triggerAssembly-evaluate-error");
                    this.set('underEvaluation', false);

                    //TODO check for other conditions, to determine if we should cleanup or not
                    return Promise.reject(status);
                };

                var _checkAfterResolve = function(result, handle){
                    //check to make sure not already set to true
                    _scope = this;
                    if(!_scope.get('underEvaluation')) {
                        return;
                    }

                    if(_scope.get('binding') === 'OR') {
                        return _successCallback.call(_scope, result, handle);
                    } else if(_scope.get('binding') === 'AND') {
                        var didAllPass = _scope.promises.reduce(function(acc, el){
                            return acc ? el.isFulfilled() : false;
                        }, true);

                        if(didAllPass && _scope.conditions.length === _scope.promises.length) {
                            return _successCallback.call(_scope, result, handle);
                        } else if(_scope.get('mode') === 'serial' && _scope.promises.length < _scope.conditions.length) {
                            // kick off the next condition
                            var nextElement = _scope.conditions[_scope.promises.length];
                            var length = _scope.promises.push(Common.QuerablePromise.call(nextElement, nextElement.evaluate));
                            var promise = _scope.promises[length-1];

                            return Promise.race([promise, Common.DelayPromise(10000)]).then(function(result) {
                                    return _checkAfterResolve.call(_scope, result, handle);
                                },
                                function(result){
                                    return _checkAfterReject.call(_scope, result, handle);
                                }).catch(function(error){   
                                    return _errorCallback.call(_scope, error);
                            }); 
                        } 
                    }
                };

                var _checkAfterReject = function(result, handle){
                    if(!this.get('underEvaluation')) {
                        return;
                    }

                    if(this.get('binding') === 'AND') {
                        return _failCallback.call(this, result, handle);
                    }else if(this.get('binding') === 'OR') {
                        //var outbound = this.promises.length;
                        var didAllFail = this.promises.reduce(function(acc, el){
                            //outbound = el.isPending() ? outbound : outbound -1;
                            return acc ? el.isRejected() : false;
                        }, true);

                        if(didAllFail && this.conditions.length === this.promises.length) {
                            return _failCallback.call(this, result, handle);
                        } else if(_scope.get('mode') === 'serial' && _scope.promises.length < _scope.conditions.length) {
                            // kick off the next condition
                            var nextElement = _scope.conditions[_scope.promises.length];
                            var length = _scope.promises.push(Common.QuerablePromise.call(nextElement, nextElement.evaluate));
                            var promise = _scope.promises[length-1];

                            return Promise.race([promise, Common.DelayPromise(10000)]).then(function(result) {
                                    return _checkAfterResolve.call(_scope, result, handle);
                                }, 
                                function(result){
                                    return _checkAfterReject.call(_scope, result, handle);
                                }).catch(function(error){   
                                    return _errorCallback.call(_scope, error);
                            }); 
                        }
                    }
                };

                return {
                    defaults : {
                        'id' : Common.genId(),
                        'state' : 'uninitialized', //'initialized', 'evaluating'
                        'isRootAssembly': typeof settings.status !== 'undefined' ? settings.status : true,
                        'status' : typeof settings.status !== 'undefined' ? settings.status : false,
                        'sticky': typeof settings.sticky !== 'undefined' ? settings.sticky : false,
                        'underEvaluation' : false,
						'binding' : settings.binding ? settings.binding : 'OR',
						'mode' : settings.mode ? settings.mode : 'parallel',  // or serial
						'timing' : settings.timing ? settings.timing : 'window', //'window',  //window or delay
                        'delayLength' : 0,
                        'windowLength' : 10000,
                        'lastEvaluation': 0,
                        'evaluationCount' : 0,
                        'evaluationTimeout': 10,
                        'evaluationExpiration': 0,
						'becameTrueAt': 0
                    },

                    initialize : function(){
                        this.createSavePoint();
                        this.trigger("zui-triggerAssembly-created");
                        this.set('state', 'initialized');
                        
                        // traverse owner to find myTrigger.
                    },

                    status: function() {   return this.get('status'); },
                    ownedBy: settings.target, 
                    //myTrigger: 

                    //properties for evaluation:
                    promises: [],
                    // rules
                    conditions: [],



                    // clear on destroy
                    // need accessor / setter methods
                    // variables: {
                    //     ruleId : {
                    //         custom: '',
                    //         variables: 000,
                    //         here: []
                    //     }
                    // }
                    //     INTERNAL VARIABLES:
                    //         * count / increment(x)
                    //         * average, sum
                    //         * max
                    //         * min
                    
                    // AKA initialize
                    evaluate: function(handle){
                        if(!this.ownedBy) {
                            this.cleanup();
                            return false;
                        }

                        var _scope = this;
                        this.promises = []; // TODO beware of mem leak here...    

                        var P = new Promise(function(resolve, reject){
                            handle.resolve = resolve;
                            //console.log(resolve);
                            handle.reject = reject;

                            if(_scope.get('underEvaluation') === false && (_scope.get('status') === false || _scope.get('sticky') === false)) {
                                //var expiration = new Date(Date.now());
                                //_scope.set('evaluationExpiration', expiration.setSeconds(expiration.getSeconds() + _scope.get('evaluationTimeout')));
                                _scope.set('lastEvaluation', Date.now());
                                _scope.set('underEvaluation', true);
                                _scope.set('state', 'evaluating');

                                var continueEvaluation = function(){
                                    if(_scope.get('mode') === 'parallel' && _scope.get('binding') === 'AND') {
                                        _scope.conditions.forEach(function(element){
                                            _scope.promises.push(Common.QuerablePromise.call(element, element.evaluate));
                                        });
    
                                        return _scope.promises.length === 0 ? _successCallback.call(_scope, undefined, handle) : Promise.all(_scope.promises)
                                            .then(function(result) {
                                                return _successCallback.call(_scope, result, handle);
                                            }, function(result){
                                                return _failCallback.call(_scope, result);
                                            }).catch(function(error){
                                                return _errorCallback.call(_scope, error);
                                            });
                                    }
                                    else if(_scope.get('mode') === 'parallel' && _scope.get('binding') === 'OR') {
                                        return _scope.conditions.length === 0 ? _successCallback.call(_scope, undefined, handle) : new Promise(function(resolve,reject){
                                            _scope.conditions.forEach(function(element){
                                                var length = _scope.promises.push(Common.QuerablePromise.call(element, element.evaluate));
                                                var promise = _scope.promises[length-1];
    
                                                promise.then(function(result) {
                                                   return _checkAfterResolve.call(_scope, result, handle);
                                                }, function(result){
                                                   return _checkAfterReject.call(_scope, result, handle);
                                                }).catch(function(error){
                                                    _errorCallback.call(_scope, error);
                                                });
                                            });
                                        }).catch(function(err){ console.log(err); });
    
                                    }
                                    else if(_scope.get('mode') === 'serial') {
                                        return _scope.conditions.length === 0 ? _successCallback.call(_scope, undefined, handle) : new Promise(function(resolve,reject){                                          
                                            var length = _scope.promises.push(Common.QuerablePromise.call(_scope.conditions[0], _scope.conditions[0].evaluate));
                                            var promise = _scope.promises[length-1];
                                            var base = _scope.get('evaluationTimeout');
                                            var delay = base * 1000 * multiplier;

                                            return Promise.race([promise, Common.DelayPromise(delay, true)]).then(function(result) {
                                                    return _checkAfterResolve.call(_scope, result, handle);
                                                }, 
                                                function(result){
                                                    return _checkAfterReject.call(_scope, result, handle);
                                                }).catch(function(error){   
                                                    return _errorCallback.call(_scope, error);
                                            }); 
                                        });
                                    }
                                };
    
                                // if timing, start window or delay.
                                if(_scope.get('status') === false && _scope.get('timing') === 'delay')
                                {
                                    return Common.DelayPromise(_scope.get('delayLength')).then(function(result) {
                                        return continueEvaluation.call(_scope, result);
                                    });
                                }
                                else if(_scope.get('status') === false && _scope.get('timing') === 'window'){
                                    //TODO this is a promise race case //TODO clean this up, as this is the same as the timeout...
                                    continueEvaluation.call(_scope);
                                    return Common.DelayPromise(_scope.get('windowLength')).then(function(){
                                       
                                        if(_scope.get('underEvaluation') === false && _scope.get('status') === true) {
                                            return _successCallback.call(_scope, undefined, handle);
                                       }
                                       else {
                                            return _failCallback.call(_scope, 'Trigger Window Timeout', handle);
                                       }
                                    }, _scope.get('windowLength'));
                                }
                                else {
                                    return continueEvaluation.call(_scope);
                                }
                            }    
                        });

                        handle.promise = P;
                        var extraDelay = _scope.get('mode') === 'serial' ? _scope.conditions.length * _scope.get('evaluationTimeout') : _scope.get('evaluationTimeout');
                        return _scope.get('evaluationTimeout') < 0 ? P : Promise.race([P, Common.DelayPromise(extraDelay * 1000, true)]).then(function(result){
                            return Promise.resolve(result);
                        },
                        function(err){
                           throw err || "Trigger Timed Out";
                        });
                        
                    },

                    cancelEvaluation: function(){
                        if(_isUnderEvaluation){
                            // loop over promises & cancel 
                            this.promises.forEach(function(handle){
                               handle.handle.reject();
                            });
                        } 
                    },

                    addRule: function(rule){
                       //TODO subscribe to rule object for events...
                        _conditions.add(rule);
                    },

                    cleanup : function() {
                        this.trigger("zui-triggerAssembly-consumed");
                        
                        //_rules.cleanup();+

                        this.stopListening();
                        this.ownedBy = null;
                    },
                    reset : function() {
                        //rules.reset();
                        this.trigger("zui-triggerAssembly-reset");
                        this.set({
                            'state': 'initialized',
                            'status': false,
                            'underEvaluation' : false,
                            'evaluationExpiration': 0,
                            'becameTrueAt': 0
                        });
                    },

                    cancelEvaluation: function(){
                        if(this.get('underEvaluation') === true)
                        {
                            // do some stuff
                            this.set('underEvaluation', false);
                        }
                    },

                    createSavePoint : function(){
                        // rules.forEach().createSavePoint()
                    }
                };
            })(settings);
        };

        //These are the static methods that this type will inherit
        var staticMethods = (function() {
            return {
                fab: function( objValues,  options){
                    var assembly = new (_prius.extend(generateScope(objValues)))();

                    options = options ? options : {};

                    // handling template & template settings
                    switch(options.template) {
                        case "timer-basic":
                            //add
                            assembly.set('timing', 'delay');
                            assembly.set('delayLength', options.templateVars.duration);
                        break;

                        case "function-runner":
                            // this is a poor rule, used for testing the logic in the assembly

                            var ruleSettings = {
                                target: assembly,
                                evalPredicate: options.templateVars.evalPredicate
                            }
                            var rule = Rule.fab(ruleSettings);


                            assembly.conditions.push(rule);
                            /* types of rules: 
                            * function runner, chain runner (template), option to respect return vals or not
                            * Object exists 
                            //         * evalPredicate()^: 
                            //             * EventEquality: _evName == ev.name && ev.data === _evExactMatch || {_variables contained match _evContians }
                            //             * linkagesEquality: does a _var[] property match a pattern
                            //             * triggerEquality: does a specific trigger match a pattern
                            //             * objectExists: does a specific JS object exist in memory?
                            //         * EventEquality: does an event name, and or body match a pattern
                            //         * linkagesEquality: does a _var[] property match a pattern
                            //         * triggerEquality: does a specific trigger match a pattern
                            * property compare (include internal #s)
                            */ 
                        break;
                    }

                    // TODO for reset, set save point ??

                    return assembly;
                }
            }
        })();

        _prius = Backbone.Model.extend(generateSuperScope(), staticMethods);
        return _prius;
});