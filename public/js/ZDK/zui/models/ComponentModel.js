define(['underscore', 'backbone',
    'zuiRoot/common',
    'zuiRoot/logger'], function(_, Backbone, Common, Logger){
        var _prius;

        var generateScope = function(settings){
            return new (function(settings){
                settings = typeof settings === 'undefined' ? {} : settings; 

                return { 
                    defaults : {
                        'id': settings.id || Common.genId(),
                        'title': settings && settings.title ? settings.title : 'New Page',
                        'state': 'solo',
                        'echo': false,
                        'isActive': settings && settings.isActive ? settings.isActive : true,
                        'isLoading': false,
                        'parentElementSelector': settings && settings.parentElementSelector ? settings.parentElementSelector : 'body',
                        'classes': settings && Array.isArray(settings.classes) ? ['zui-component'].concat(settings.classes) : ['zui-component']
                        // TODO sort by : 'drawOrder': settings && settings.parentElementSelector ? settings.parentElementSelector : 0
                    },
        
                    initialize : function(){   
                        _inform(this, "zui-component-created");
                        settings = typeof settings === 'undefined' ? {} : settings;
                        this.view = new (Backbone.View.extend({
                            model: this,
                            id: typeof settings.id !== "undefined" ? settings.id : this.get('id'),
                            tagName: typeof settings.tagName !== "undefined" ? settings.tagName : 'div',
                            el: typeof settings.el !== "undefined" ? settings.el : undefined,
                            //TODO make template a module loading function that returns promise
                            template : typeof settings.template !== "undefined" ? _.template(settings.template, this.model) : _.template(' <p>I am <%= get("id") %></p>', this.model), //TODO create the default template for components
                            //domSections : typeof settings.domSections !== "undefined" ? settings.domSections : null, //{ key map for sections} 'MAPPING TO THE RELEVANT SECTIONS WITHIN THIS COMPONENT'
                            modifiers : typeof settings.modifiers !== "undefined" ? settings.modifiers : [],
                            //TODO add & sort / remove modifiers
                            render : typeof settings.renderer === "function" ? settings.renderer : function(){
                                //queue render call if loading
                                if(!this.model.get('isActive'))
                                    return;
                                
        

                                for(var z = 0; z < this.modifiers.length; z++){
                                    // TODO save post-render modifiers until the end? [a finnally f()?]
                                    if(this.modifiers[z].render.call(this) === false)
                                    {
                                        return;
                                    }
                                }

                                var clipboard = document.createDocumentFragment();
                                this.model.childViews.forEach(function(child){
                                    if(child.view.el)
                                    {
                                        clipboard.appendChild(child.view.el);
                                    }
                                });

                                this.el.innerHTML = this.template(this.model);
                                // possible issue if we do not have a single element for this.el... not checked

                                this.el.className = this.model.get('classes').join(' ');


                                if(this.model.afterTemplateGenerate) {
                                    this.model.afterTemplateGenerate(this.el);
                                }
                            
                                if(!this.el.parentElement){
                                    var parent = document.querySelector(this.model.get('parentElementSelector'));
                                    if(parent){
                                        parent.appendChild(this.el);
                                    }
                                }
    
                                this.model.childViews.forEach(function(child){
                                    if(child.view.el)
                                    {
                                        child.view.render();
                                    }
                                });

                                //if post renerer modifiers, call them here
                                this.trigger('render', { "hello": true } );
                                
                                return this;
                            },
                            initialize: function() {
                                //this.listenTo(this.model, 'all', this.onComponentEvent)
                                this.listenTo(this.model, "change", function(model, options){
                                    //this.model.output('component [' + this.model.get('id') + '] Model Changed', { filter: 'changed' });
                                    //console.log(model, options); 
                                    //this.render();
                                });
                                this.listenTo(this.model, "change:viewState", this.onViewStateChanged);
                                Logger.log('Component View Created', { tags: 'create' });
                            },
                            events : function(){
                                //event mapping & routing
                                var defaultEventMapping = {
                                    // 'keyup' : this.model.onKeyUp,
                                    // 'keydown' : this.model.onKeyDown,
                                    // 'mouseenter' : this.model.onMouseIn,
                                    // 'mouseout' : this.model.onMouseOut,
                                    // 'mousedown' : this.model.onMouseDown,
                                    // 'mouseup' : this.model.onMouseUp,
                                    'click' : this.model.onClick
                                };
    
                                for(var event in settings.events) {
                                    if(settings.events.hasOwnProperty(event))
                                    {
                                        //override default && || add to object
                                        defaultEventMapping[event] = settings.events[event];
                                    }
                                }
    
                                return defaultEventMapping;
                            },
                            onViewStateChanged : function(model, value, options) {
                                //this.change:[attribute]
                                switch(value){
                                    case 'active':
                                    this.el.disabled = false;                      
                                    break;
                                case 'inactive':
                                    this.el.disabled = false;      
                                    break;
                                case 'loading':
                                    this.el.disabled = true;      
                                    break;
                                case 'disabled':
                                    this.el.disabled = true;
                                    //TODO consider behavior differneces between top-level, nodal, general components
                                    var screenElement = this.el.querySelector('.zui-screen');
    
                                    // if(screenElement)
                                    // {
                                    //     screenElement.querySelector('.zui-screen .zui-message').innerHTML = opt ? opt.message : '';
                                        
                                    // }
                                    // else
                                    // {
                                    //     //TODO track components and partials that are added.
                                    //     //console.log(window.zui.templateManager.use('screen', { message: opt ? opt.message : '' }));
                                    //     //this.view.el.innerHTML = this.view.el.innerHTML + window.zui.templateManager.use('screen', { message: opt ? opt.message : '' });
                                    //     // var temp = 
                                    //     this.el.insertAdjacentHTML('beforeend', window.zui.templateManager.use('screen', { message: opt ? opt.message : '' }));
                                    //     //this.view.render();
                                    // }
    
                                    //this.view.el.querySelector('.zui-screen').remove(['zui-invis','zui-hidden', 'zui-noDisplay']);
                                    
                                break;
                                case 'error':
                                    nextState = 'error';     
                                    this.el.disabled = false;  
                                break;
                                case 'transitionIn':
                                    nextState = 'transitionIn';  
                                    this.el.disabled = true;     
                                break;
                                case 'transitionOut':
                                    nextState = 'transitionOut'; 
                                    this.el.disabled = true;      
                                break;
                                }
                            }
                        }))();

                        //TODO map el.sections to domSections
                        //domSections { 'name' : 'selector' }
                        Logger.log('Component Created', { tags: 'create' });
                    },
                    attributes: typeof settings.viewAttributes === 'object' ? settings.viewAttributes : {},
                    
                    //model instance properties and methods 
                    parentModel : typeof settings.parentModel !== "undefined" ? settings.parentModel : null,      
                    afterTemplateGenerate : typeof settings.afterTemplateGenerate === "function" ? settings.afterTemplateGenerate : null,
                    childViews : new Backbone.Collection(null, {
                        model : _prius
                        //TODO make this a sorted collection that forces render order
                    }),

                    addView: function(component) {
                        //TODO add the logic for this
                        if(this.childViews )
                        {
                            if(!this.childViews.get(component))
                            {
                                Logger.log('adding sub-component', { tags: 'ZUI' });
                                return this.childViews.add(component);
                            }      
                        }
                    },
                    findChildView: function(c) {
                        var found = this.childViews.get(c)

                        if(!found)
                        {
                            this.childViews.each(function(model, index, list){
                                if(!found){
                                    found = model.findChildComponent(c);
                                }
                            });
                            return found || null;
                        }
                        return found;  
                    },
                    removeView: function(component){
                        if(this.childViews )
                        {
                            if(this.childViews.get(component))
                            {
                                Logger.log('removing sub-component', { tags: 'ZUI' });
                                return this.childViews.remove(component);
                            }       
                        }
                    },
                            //event handlers -- these run in the context of the view
                    onClick : function(e){Logger.log('Component [' + this.model.get('id') + '] Clicked.', { filter: 'click' });},
                    onKeyUp : function(e){Logger.log('key up');},
                    onKeyDown : function(e){Logger.log('key down');},
                    onMouseIn : function(e){Logger.log('mouse in');},
                    onMouseOut : function(e){Logger.log('mouse out');},
                    onMouseDown : function(e){Logger.log('mouse down');},
                    onMouseUp : function(e){Logger.log('mouse up');},

                    state: function() {	return this.get('state'); },

                    activate: function() {
                        this.set('isActive', true);
                    },
                    render: function() {
                        this.view.render();
                    },
                    toggleViewState: function(st, opt) {   
                        var currentState = this.get('viewState');
                        
                        if(currentState === st)
                            return;
                        
                        if(this.view && this.view.el) {
                            for(var z = 0; z < this.view.el.classList.length; z++){
                                if(this.view.el.classList[z].indexOf('status-') > -1) {
                                    this.view.el.classList.remove(this.view.el.classList[z]);
                                }
                            }
                
                            var nextState = '';
            
                            switch(st) {
                                case 'active':
                                    nextState = 'active';
                                    this.view.el.disabled = false;                      
                                break;
                                case 'inactive':
                                    nextState = 'inactive'; 
                                    this.view.el.disabled = false;      
                                break;
                                case 'loading':
                                    nextState = 'loading'; 
                                    this.view.el.disabled = true;      
                                break;
                                case 'disabled':
                                    nextState = 'disabled'; 
                                    this.view.el.disabled = true;
                                    //TODO consider behavior differneces between top-level, nodal, general components
                                    var screenElement = this.view.el.querySelector('.zui-screen');
                
                                    if(screenElement)
                                    {
                                        screenElement.querySelector('.zui-screen .zui-message').innerHTML = opt ? opt.message : '';
                                        
                                    }
                                    else
                                    {
                                        //TODO track components and partials that are added.
                                        //console.log(window.zui.templateManager.use('screen', { message: opt ? opt.message : '' }));
                                        //this.view.el.innerHTML = this.view.el.innerHTML + window.zui.templateManager.use('screen', { message: opt ? opt.message : '' });
                                        // var temp = 
                                        //this.view.el.insertAdjacentHTML('beforeend', window.zui.templateManager.use('screen', { message: opt ? opt.message : '' }));
                                        //this.view.render();

                                    }
                
                                    //this.view.el.querySelector('.zui-screen').remove(['zui-invis','zui-hidden', 'zui-noDisplay']);
                                        
                                break;
                                case 'error':
                                    nextState = 'error';     
                                    this.view.el.disabled = false;  
                                break;
                                case 'transitionIn':
                                    nextState = 'transitionIn';  
                                    this.view.el.disabled = true;     
                                break;
                                case 'transitionOut':
                                    nextState = 'transitionOut'; 
                                    this.view.el.disabled = true;      
                                break;
                            }
                            
                            this.view.el.classList.add('status-' + nextState);
                            this.set({viewState: nextState});
                        }
                    }
                };
            })(settings);
        };    
        
        //These are the static methods that this type will inherit
        var staticMethods = (function() {
            return {
                fab: function(objValues,  options){   
                    var component = new (_prius.extend(generateScope(objValues)))();
                    
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
                    if(Array.isArray(objValues.components)) {
                        objValues.components.forEach(function(el){
                            component.addComponent(el);
                        });
                    }
                    else if(objValues.component) {
                        component.addComponent(component);
                    }
    
                    if(component.parentModel) {
                        component.parentModel.addView(component);
                    }


                    return component;
                },
                fabFromJson: function(json) {
                    var component = new (_prius.extend(generateScope(JSON.parse(json))))();
                    return component;
                },

                messageDefaults: {
                    "zui-component-created": {
                        message: "Component Created",
                        logLevel: 1,
                        tags: ["zui-create"]
                    }
                }
            }
        })();

        //These are private methods shared by the entire class
        function _inform(callee, event, message) {
            //var messageDefaults = {}; //TODO bring message defaults in here ?? 
            
            var eventObject = {
                id: callee.get('id'),
                source: callee
            };
            var logSettings = {
                message: message ? message :  _prius.messageDefaults.hasOwnProperty(event) ? _prius.messageDefaults[event].message : '--',
                tags: _prius.messageDefaults.hasOwnProperty(event) && _prius.messageDefaults[event].tags ? ["ZUI", "zui-component"].concat(_prius.messageDefaults[event].tags) : ["ZUI", "zui-component"],
                eventName: callee,
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