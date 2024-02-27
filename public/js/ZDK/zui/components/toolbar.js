define([
    'zui',
    "zuiRoot/view_templates/toolbar_views",
], function (
    zui,
    zui_toolbar_views,
) {
    var MODULE_NAME = "zui_toolbar";
    var TOOLBAR_CLASSES = ['toolbar-container'];
    var TOOLBAR_BUTTON_CLASSES = ['toolbar-button'];

    // MODULE ------------------------------------------------------------------------------------------------------------------------ 
    var _toolbar = {
        init: function (settings) {
            var toolbar = zui.types.view.fab( {
                // do we need this ID added onto the tab id's
                tagName: 'div',
                model: settings.buttons,
                parent: typeof settings.parent !== 'undefined' ? settings.parent : null, 
                insertionSelector: typeof settings.insertionSelector !== 'undefined' ? settings.insertionSelector : null,
                classes: Array.isArray(settings.classes) ? TOOLBAR_CLASSES.concat(settings.classes) : TOOLBAR_CLASSES,
                autoInsert: typeof settings.autoInsert !== 'undefined' ? settings.autoInsert : true,
                events: {
                    "click .toolbar-button":function(ev){
                        this.model[ev.currentTarget.id.split('_')[1]].onClick(this, ev);
                    }
                },
                template: function(view){
                    var buttons = '';
                    settings.buttons.forEach(function(el, i){
                        el.id = view.id + '_' + i, 
                        el.classes = Array.isArray(el.classes) ? TOOLBAR_BUTTON_CLASSES.concat(el.classes) : TOOLBAR_BUTTON_CLASSES
                        buttons += zui.components.button_basic.init_html(el);
                    });
                    return buttons;
                },
            });

            return toolbar;
        },
    };

    return _toolbar;
});
