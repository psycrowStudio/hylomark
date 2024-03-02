define([
    'mod/text',
    'mod/dom_helper',
    'zuiRoot/logger'
], function(
    mod_text,
    mod_dom,
    Logger
    ){
        var MODULE_NAME = "zui_view";
        var _prius;

        var _compileTemplate = function(view){
            if(view.template === null){
                return '';
            } else if(typeof view.template === 'string'){
                return view.template;
            } else if(typeof view.template === 'function'){
                return view.template(view);
            }
            else if(view.template.compile){
                return view.template.compile(view);
            }
            else {
                return _.template(' <p><%= tagName + ":" + id %></p>', view);
            }
        };

        var _generateScope = function(settings){
            return new (function(settings){
                settings = typeof settings === 'undefined' ? {} : settings; 

                return {
                    enabled: typeof settings.enabled !== "undefined" ? settings.enabled : true,
                    model: typeof settings.model !== "undefined" ? settings.model : null,
                    
                    parentView: typeof settings.parent !== "undefined" ? settings.parent : null,
                    insertionSelector: typeof settings.insertionSelector !== "undefined" ? settings.insertionSelector : '',
                    insertionPosition: typeof settings.insertionPosition !== "undefined" ? settings.insertionPosition : 'beforeend',
                    clearOnInsert: typeof settings.clearOnInsert !== "undefined" ? settings.clearOnInsert : false,

                    tagName: typeof settings.tagName !== "undefined" ? settings.tagName : 'div',
                    id: typeof settings.id !== "undefined" ? settings.id : mod_text.random.hexColor(),
                    classes:  Array.isArray(settings.classes) ? ['zui-component'].concat(settings.classes) : ['zui-component'],
                    attributes: settings.attributes ? settings.attributes : {},

                    autoInsert: typeof settings.autoInsert !== "undefined" ? settings.autoInsert : true,
                    renderOrder: typeof settings.renderOrder !== "undefined" ? settings.renderOrder : 0,
                    childViews : [],
                    
                    template : typeof settings.template !== "undefined" ? settings.template : null,
                    
                    //domSections : typeof settings.domSections !== "undefined" ? settings.domSections : null, //{ key map for sections} 'MAPPING TO THE RELEVANT SECTIONS WITHIN THIS COMPONENT'
                    //modifiers : typeof settings.modifiers !== "undefined" ? settings.modifiers : [],
                    //afterTemplateGenerate : typeof settings.afterTemplateGenerate === "function" ? settings.afterTemplateGenerate : null,
                    //TODO add & sort / remove modifiers
                    
                    initialize: function() {
                        this.el.className = this.classes.join(' ');
                        if(this.parentView) {
                            this.renderOrder = typeof settings.renderOrder === "undefined" ? this.parentView.childViews.length + 1 : this.renderOrder;
                            this.parentView.addView(this);
                        }
    
                        //_inform(this, "zui-component-created");
                        //this.listenTo(this.model, 'all', this.onComponentEvent)

                        Logger.log('ZUI View(' + this.id + ') Created', { tags: 'create' });
                    },

                    render : function(){
                        if(!this.enabled)
                            return;

                        this.trigger('pre-render', this);

                        mod_dom.clearChildren(this.el);
                        var compliled_template = _compileTemplate(this);
                        if(typeof compliled_template === 'string') {
                            this.el.innerHTML = compliled_template;
                        }
                        else if(mod_dom.isDomObject(compliled_template)) {
                            this.el.appendChild(compliled_template);
                        }
                        
                        this.childViews.forEach(function(child){
                            child.render();
                        });
                        
                        if(!this.el.parentNode && this.autoInsert){
                            var parent_dom = !this.parentView ? document.body : this.parentView instanceof Backbone.Model ? this.parentView.view.el : this.parentView.el;
                            parent_dom = this.insertionSelector ? parent_dom.querySelector(this.insertionSelector) || parent_dom : parent_dom;

                            if(parent_dom){
                                if(this.clearOnInsert){
                                    mod_dom.clearChildren(parent_dom);
                                }
    
                                parent_dom.insertAdjacentElement(this.insertionPosition, this.el);
                                this.trigger('post-insert', this);
                            }
                            else {
                                console.warn('No parent located for: ' + this.id);
                            }
                        }

                        this.trigger('post-render', this);

                        return this;
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
                            //'click' : this.model.onClick
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
                                // TODO remove the HTML element from the DOM?
                                return this.childViews.splice(ndx, 1);
                            }       
                        }
                    },
                };
            })(settings);
        };    
        
        //These are the static methods that this type will inherit
        var staticMethods = (function() {
            return {
                fab: function(objValues){   
                    var view = new (_prius.extend(_generateScope(objValues)))();
                    return view;
                }
            }
        })();

        _prius = Backbone.View.extend({}, staticMethods);
        return _prius;
});