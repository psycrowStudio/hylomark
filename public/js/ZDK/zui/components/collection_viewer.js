define([
    'zuiRoot/types',
    "zuiRoot/view_templates/collection_views",
    'mod/animation'
], function (
    Types,
    zui_collection_views,
    mod_animation
) {
    var MODULE_NAME = "zui_collection_viewer";
    var LIST_ITEM_CLASSES = ['collection-list-item'];
    var LIST_CONTAINER_CLASSES = ['collection-list-container'];
    var GRID_ITEM_CLASSES = ['collection-grid-item', 'g-col-4', 'g-row-4'];
    var GRID_CONTAINER_CLASSES = ['collection-grid-container', 'g-v-24', 'g-h-24'];
    var CLICKABLE_CLASS = 'clickable-item';

     // LIST HELPER METHODS ------------------------------------------------------------------------------------------------------------------------
    var _buildListRow = function (view, item, index, settings) {
        var item_settings_defaults = {
            index: index,
            id: view.id + '_' + index,
            label: typeof item === 'string' ? item : 'Item: ' + index,
            hover_text: view.id + '_' + index,
            classes: settings.classes || [].concat(LIST_ITEM_CLASSES)
        };

        var item_settings = item_settings_defaults;
        if(settings && typeof settings.generateItemSettings === 'function'){
            var item_setting_overrides = settings.generateItemSettings(item, index);
            for(var key in item_setting_overrides){
                item_settings[key] = Array.isArray(item_settings[key]) ?  item_settings[key].concat(item_settings[key]) : item_setting_overrides[key];
            }
        }

        if(settings && settings.clickable !== false){
            item_settings.classes.push(CLICKABLE_CLASS);
        }

        return zui_collection_views.templates['list_item'].compile(item_settings);
    };

    var _compileListTemplate = function(view, settings){
        var compiled_items = '';
        if(Array.isArray(view.model)){
            view.model.forEach(function(el, i){
                compiled_items += _buildListRow(view, el, i, settings);
            });
        }
        
        return compiled_items;
    };

    // GRID HELPER METHODS ------------------------------------------------------------------------------------------------------------------------
    var _buildGridRow = function (view, item, index, settings) {
        var item_settings_defaults = {
            index: index,
            id: view.id + '_' + index,
            label: typeof el === 'string' ? item : 'Item: ' + index,
            hover_text: view.id + '_' + index,
            classes: settings.classes || [].concat(GRID_ITEM_CLASSES)
        };

        var item_settings = item_settings_defaults;
        if(settings && typeof settings.generateItemSettings === 'function'){
            var item_setting_overrides = settings.generateItemSettings(item, index);
            for(var key in item_setting_overrides){
                item_settings[key] = Array.isArray(item_settings[key]) ?  item_settings[key].concat(item_settings[key]) : item_setting_overrides[key];
            }
        }

        if(settings && settings.clickable !== false){
            item_settings.classes.push(CLICKABLE_CLASS);
        }

        return zui_collection_views.templates['grid_item'].compile(item_settings);
    };

    var _compileGridTemplate = function(view, settings){
        var compiled_items = '';
        if(Array.isArray(view.model)){
            view.model.forEach(function(el, i){
                compiled_items += _buildGridRow(view, el, i, settings);
            });
        }
        
        return compiled_items;
    };

    // MODULE ------------------------------------------------------------------------------------------------------------------------ 
    var _collection_viewer = {
        createListViewer: function (settings) {
            var list_view = Types.view.fab( {
                // do we need this ID added onto the tab id's
                tagName: 'ul',
                model: settings.dataset,
                parent: typeof settings.parent !== 'undefined' ? settings.parent : null, 
                insertionSelector: typeof settings.insertionSelector !== 'undefined' ? settings.insertionSelector : null,
                classes: Array.isArray(settings.classes) ? LIST_CONTAINER_CLASSES.concat(settings.classes) : LIST_CONTAINER_CLASSES,
                autoInsert: typeof settings.autoInsert !== 'undefined' ? settings.autoInsert : true,
                events: {
                    "click .collection-list-item":function(ev){
                        if(settings.clickable !== false)
                        {
                            if(typeof settings.onClick === 'function')
                            {
                                settings.onClick(this, ev)
                            }
                        }
                    }
                },
                template: function(view){
                    if(typeof settings.templateOverride === 'function') {
                        // custom logic for building the list
                        return settings.templateOverride(view, settings, zui_collection_views.templates['list_item']);
                    }
                    else{
                        // use default logic within the template
                        return _compileListTemplate(view, settings)
                    }
                },
            });

            // add item function -- update collection & add item
            list_view.addItem = function(o){
                var item_settings = {
                    onClick : settings.onClick || undefined,
                    classes: ["hidden"].concat(LIST_ITEM_CLASSES),
                    generateItemSettings: settings.generateItemSettings || undefined
                }

                this.el.insertAdjacentHTML('beforeend', _buildListRow(this, o, this.model.length, item_settings));
                this.model.push(o);
               
                
                var inBoundQ = [
                    {
                        element: this.el.lastChild,
                        animation: 'fadeInDown',
                    }
                ];

                setTimeout(function(){
                    mod_animation.queueAnimationSequence(inBoundQ);
                }, 1);
            }

            return list_view;
        },
        createGridViewer: function (settings) {
            var grid_view = Types.view.fab( {
                // do we need this ID added onto the tab id's
                tagName: 'ul',
                model: settings.dataset,
                parent: typeof settings.parent !== 'undefined' ? settings.parent : null, 
                insertionSelector: typeof settings.insertionSelector !== 'undefined' ? settings.insertionSelector : null,
                classes: Array.isArray(settings.classes) ? GRID_CONTAINER_CLASSES.concat(settings.classes) : GRID_CONTAINER_CLASSES,
                autoInsert: typeof settings.autoInsert !== 'undefined' ? settings.autoInsert : true,
                events: {
                    "click .collection-grid-item":function(ev){
                        if(settings.clickable !== false)
                        {
                            if(typeof settings.onClick === 'function')
                            {
                                settings.onClick(this, ev)
                            }
                        }
                    }
                },
                template: function(view){
                    if(typeof settings.templateOverride === 'function') {
                        // custom logic for building the list
                        return settings.templateOverride(view, settings, zui_collection_views.templates['grid_item']);
                    }
                    else{
                        // use default logic within the template
                        return _compileGridTemplate(view, settings)
                    }
                },
            });

            // add item function -- update collection & add item
            grid_view.addItem = function(o){
                var item_settings = {
                    onClick : settings.onClick || undefined,
                    classses: ["hidden"].concat(GRID_ITEM_CLASSES),
                    generateItemSettings: settings.generateItemSettings || undefined
                }

                this.el.insertAdjacentHTML('beforeend', _buildGridRow(this, o, this.model.length, item_settings));
                this.model.push(o);
                var inBoundQ = [
                    {
                        element: this.el.lastChild,
                        animation: 'fadeInDown',
                    }
                ];

                setTimeout(function(){
                    mod_animation.queueAnimationSequence(inBoundQ);
                }, 1);
            }

            return grid_view;
        }
    };

    return _collection_viewer;
});
