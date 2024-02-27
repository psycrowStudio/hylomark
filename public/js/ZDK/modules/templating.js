define([
        "mod/dom_helper",
        "3p/ejs.min"
    ],
    function (
        s5_dom,
        ejs
    ) {
        var MODULE_NAME = "templating";
        var _templateCache = {};
        var _domParser = new DOMParser();

        var _defaultTemplateCompile = function(key, data){
            return _module.compileToRawHtml(key, data);
        };        
        
        var _defaultTemplateUnload = function(key){
            return s5_dom.css.unloadFromDom(key);
        };

        var _module = {
            // TODO create cache management helpers, clear, etc
            createFromEjs : function(key, ejs_template) { 
                //_templateCache[key] = _.template(ejs_template); // _ substitute for ejs
                _templateCache[key] = ejs.compile(ejs_template);
                return _templateCache[key];
            },
            compileToRawHtml: function(key, data){
                // alternate formatters
                //.replace(/\s\s+/g, '')
                //.replace(/^\s*(.*)\s*/, '$1')
                return _templateCache.hasOwnProperty(key) ? _templateCache[key](data) : "";  //_templateCache[key](data).replace(/\s\s+/g, '')
            },
            buildTemplateHarness: function(settings){
                // cache our template code
                if(settings.ejs && typeof settings.ejs === "string") {
                    _module.createFromEjs(settings.key, settings.ejs);
                }
                else if(settings.ejs && typeof settings.ejs === "function"){
                    _module.createFromEjs(settings.key, settings.ejs());
                }

                return {
                    name: settings.key,
                    context: settings.context || {},
                    compile: function(data){
                        var context = data ? data : settings.context;

                        if(settings.compile && typeof settings.compile === "function"){
                            return settings.compile(settings.key, context);
                        }
                        else {
                            for(key in context){
                                // if(typeof context[key] === "function"){
                                //     // parameters?
                                //     context_exec = {};
                                //     context_exec[key] = context[key]();
                                // }
                            }
                            return _defaultTemplateCompile(settings.key, context);
                        }
                    },
                    unload: function(key){
                        if(settings.unload && typeof settings.unload === "function"){
                            settings.unload(key);
                        }
                        else {
                            _defaultTemplateUnload(key);
                        }
                    }
                };
            }
        };

        return _module;
    }
);