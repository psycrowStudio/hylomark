define([
    'zui',
    "zuiRoot/view_templates/tab_container",
    'mod/dom_helper'
], function (
    zui,
    zui_tab_container,
    mod_dom
) {
    var MODULE_NAME = "zui_tab_view";
   
    var _sortTabs= function(current){
        var sort_arr = [];

        for(key in current){
            var agg = current[key];
            agg.key = key;
            sort_arr.push(agg);
        }

        return sort_arr.sort(function(ia, ib){ return ia.order - ib.order; })
        .reduce(function(acc, el){
            var key = el.key;
            delete el.key;
            acc[key] = el;
            return acc;
        }, {});
    };

    var _compileTemplate = function(tab){
        if(tab.content === null){
            return '';
        } else if(typeof tab.content === 'string'){
            return tab.content;
        } else if(typeof tab.content === 'function'){
            return tab.content(tab);
        }
        else if(tab.content.compile){
            return tab.content.compile(tab);
        }
        else {
            return _.template(' <p><%= "Tab:" + label %></p>', view);
        }
    };

    return {
        init: function (settings) {
            settings.tabs = _sortTabs(settings.tabs);
            
            var tabs_content_row = null;

            // TODO make a vertical tabs options / styles3
            
            var _tab_view = zui.types.view.fab( {
                // do we need this ID added onto the tab id's
                parent: settings.pm, 
                insertionSelector: settings.pms,
                classes:['tab_view'],
                events: {
                    "click .zui-tab":function(ev){
                        console.log("tab_clicked");
                        if(settings.tabs.hasOwnProperty(ev.currentTarget.id)){
                            if(ev.currentTarget.classList.contains('active')){
                                return;
                            }

                            // fire event - before_tab_change?
                            // save tab content state? session? internal var?

                            var all_tabs = Array.from(_tab_view.el.querySelectorAll('.zui-tab'));
                            all_tabs.forEach(function(el){
                                el.classList.remove('active');
                            });

                            ev.currentTarget.classList.add('active');
                            // save tab state? session? internal var?

                            // fire event - after tab change?

                            // TODO flesh this out for sub components, helper methods etc...
                            if(!tabs_content_row){
                                tabs_content_row = _tab_view.el.querySelector('.tabs_content_row');
                            }

                            mod_dom.clearChildren(tabs_content_row);
                            var compiled = _compileTemplate(settings.tabs[ev.currentTarget.id]);
                            if(typeof compiled === 'string') {
                                tabs_content_row.innerHTML = compiled;
                            }
                            else if(mod_dom.isDomObject(compiled)) {
                                tabs_content_row.appendChild(compiled);
                            }

                            // TODO set default active tab
                            // investigate component creation with and without children
                            // render methods, process callbacks etc
                        }
                    }
                },
                template: zui_tab_container.compile(settings),
            });

            _tab_view.listenToOnce(_tab_view, "post-render", function(ev){
                // on inital render, set the default tabs
                var content_row = _tab_view.el.querySelector('.tabs_content_row');
                var active_tab = settings.activeTab ? _tab_view.el.querySelector('#' + settings.activeTab) : _tab_view.el.querySelector('.tabs_row > .zui-tab:first-child');

                if(active_tab && content_row){
                    active_tab.classList.add('active');
                    
                    mod_dom.clearChildren(content_row);
                    var compiled = _compileTemplate(settings.tabs[active_tab.id]);
                    if(typeof compiled === 'string') {
                        content_row.innerHTML = compiled;
                    }
                    else if(mod_dom.isDomObject(compiled)) {
                        content_row.appendChild(compiled);
                    }
                }
            });

            return _tab_view;
        }
    };
});
