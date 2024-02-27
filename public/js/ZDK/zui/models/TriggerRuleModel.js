
	define(['underscore', 'backbone',
    'zuiRoot/common',
    'zuiRoot/logger'], function(_, Backbone, Common, Logger){
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

                var _successCallback = function(input, handle){
                    this.set('state', 'initialized');

                    this.set('status', true);
                    this.trigger("zui-triggerRule-evaluate-success");

                    // sticky enables this to remain true after a successful evaluation
                    if(this.get('becameTrueAt') === 0 || this.get('sticky') === false) {
                        this.set('becameTrueAt', Date.now());
                    }
                    handle.resolve(input);
                };

                var _failCallback = function(input, handle){
                    this.trigger("zui-triggerRule-evaluate-fail");
                    this.set('status', false);
                    this.set('state', 'initialized');
                    handle.reject(input);
                };

                var _errorCallback = function(status){
                    this.trigger("zui-triggerRule-evaluate-error");
                    this.set('state', 'initialized');
                    throw status;
                };

                var _resetVariables = function(){
                    //this.owner, check if saved vars exist, if not
                    //this.myAssembly.restoreVariables(this.get('id'));
                };

                var _clearVariables = function(){
                    //this.myAssembly.clearVariables(this.get('id'));
                };

                var _saveVariables = function(){
                    //this.myAssembly.saveVariables(this.get('id'));
                };
                //var _rulescope = this;

                return {
                    defaults : {
                        'id' : Common.genId(),
                        'state' : 'uninitialized', //'initialized', 'evaluating'
                        'status' : false,
                        'sticky': typeof settings.sticky !== 'undefined' ? settings.sticky : false,
                        'clearVariablesOnReset': typeof settings.clearVariablesOnReset !== 'undefined' ? settings.clearVariablesOnReset : false,
                        'lastEvaluation': 0,
                        'evaluationCount' : 0,
                        'evaluationTimeout': 10,
                        'becameTrueAt': 0
                    },

                    initialize : function(){
                        if(this.rulePrime && this.get('state') === 'uninitialized') {
                            this.rulePrime.call(this);
                        }

                        this.set('state', 'initialized');
                        this.createSavePoint();
                        this.trigger("zui-triggerRule-created"); 
                    },

                    status: function() { return this.get('status') },
                    myAssembly: settings.target,
                    evalPredicate: settings.evalPredicate,
                    rulePrime: settings.prime,
                    ruleUnprime: settings.unprime,

                    // handle refers to the object reference within a queryable promise
                    evaluate: function(handle){
                        var _scope = this;
                        var _currentEvaluation;

                        var rulePromise = new Promise(function(resolve, reject){
                            if(!_scope.myAssembly) {
                                _scope.cleanup();
                                return reject();
                            }
                            handle.resolve = resolve;
                            handle.reject = reject;
    
                            if(_scope.get('state') !== 'evaluating' && (_scope.get('status') === false || _scope.get('sticky') === false)) {
                                var currnetCount = _scope.get('evaluationCount');
                                _scope.set('evaluationCount', currnetCount+=1);
                                _scope.set('lastEvaluation', Date.now());
                                _scope.set('state', 'evaluating');
                                
                                if(_scope.evalPredicate){
                                     //TODO make this query able?
                                     // To add an automatic timeout, modify the following
                                     // Promise.race([promise, Common.DelayPromise(delay, true)]).then(function(result) {
                                    _currentEvaluation = _scope.evalPredicate.call(_scope, {}).then(function(asyncResolve){
                                        _successCallback.call(_scope, asyncResolve, handle);
                                    }, function(asyncReject){
                                        _failCallback.call(_scope, asyncReject, handle);
                                        //reject(asyncReject);
                                    }).catch(function(err){
                                        _errorCallback.call(_scope, err);
                                    });
                                }
                            }
                            
                            if(_scope.get('state') !== 'evaluating'){
                                return _scope.get('status') ? resolve() : reject();
                            }
                        });

                        return rulePromise;
                    },

                    //TODO rule event handler
                    cleanup : function() {
                        if(this.ruleUnprime){
                            this.ruleUnprime();
                        }
                        _clearVariables.call(this);
                        this.trigger("zui-triggerRule-consumed");
                        this.stopListening();
                        this.myAssembly = null;
                    },
                    reset : function(){
                        // if(this.evalPredicate) {
                        //     delete this.evalPredicate
                        // }
                        _resetVariables.call(this);
                        this.trigger("zui-triggerRule-reset");
                        this.set({
                            'state': 'initialized',
                            'status': false,
                            'becameTrueAt': 0
                        });
                    },

                    createSavePoint : function(){
                        _saveVariables.call(this);
                    }
                };
            })(settings);
        };

        //These are the static methods that this type will inherit
        var staticMethods = (function() {
            return {
                fab: function( objValues){
                    var rule = new (_prius.extend(generateScope(objValues)))();
                    // TODO for reset, set save point ??
                    return rule;
                }
            }
        })();

        _prius = Backbone.Model.extend(generateSuperScope(), staticMethods);
        return _prius;
});