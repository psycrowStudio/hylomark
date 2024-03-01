define([
    'mod/dom_helper',
    'mod/animation',
    'zui',
    "zuiRoot/components/tab_view",
    "zuiRoot/components/collection_viewer",
    "zuiRoot/components/toolbar",
    "view_templates/tile"
],
function (
    mod_dom,
    mod_animation,
    zui,
    zui_tab_view,
    zui_collection_viewer,
    zui_toolbar,
    tile_template
) {
    var MODULE_NAME = "TILE_TRAY";
    
    return {
        init: function(pm, pms){
            var t = tile_template.compile({
                text: "",
                glyph_code: 'user'
            });
            
            console.log('!!!');
            
            var tile_view = zui.types.view.fab( {
                model: {}, // TODO make this a tray model
                parent: pm, 
                insertionSelector: pms,
                classes:['tile-tray'],
                events: {},
            });

            tile_view.add_tile = function(){
                var nt = zui.types.view.fab( {
                    model: {}, // TODO make this a tray model
                    parent: tile_view, 
                    insertionSelector: '.tile-tray',
                    classes:[''],
                    events: {},
                    template: t
                });
            tile_view.render();

            };

            return tile_view;
        },
    };
}
);