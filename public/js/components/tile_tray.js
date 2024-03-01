define([
    'mod/dom_helper',
    'mod/animation',
    'mod/text',
    'zui',
    "zuiRoot/components/tab_view",
    "zuiRoot/components/collection_viewer",
    "zuiRoot/components/toolbar",
    "zuiRoot/components/fa_glyph_picker",
    "view_templates/tile"
],
function (
    mod_dom,
    mod_animation,
    mod_text,
    zui,
    zui_tab_view,
    zui_collection_viewer,
    zui_toolbar,
    glyph_picker,
    tile_template
) {
    var MODULE_NAME = "TILE_TRAY";
    
    var  xLoop = null;
    var last_x_tile = null;
    var  yLoop = null;
    var last_y_tile = null;
    var  zLoop = null;
    var last_z_tile = null;
    return {
        init: function(pm, pms){
            var glyphs = glyph_picker.getGlyphCodes();
            var g = glyphs[mod_text.random.int(0, glyphs.length-1)];

            var t = tile_template.compile({
                text: "",
                glyph_code: g ? g : 'user'
            });
            
            console.log('!!!');
            
            //TODO add this to the text random section
            var tile_view = zui.types.view.fab( {
                model: {}, // TODO make this a tray model
                parent: pm, 
                insertionSelector: pms,
                classes:['tile-tray'],
                events: {},
            });

            tile_view.add_tile = function(){
                var glyphs = glyph_picker.getGlyphCodes();
                var g = glyphs[mod_text.random.int(0, glyphs.length-1)];
    
                var t = tile_template.compile({
                    text: "",
                    glyph_code: g ? g : 'user'
                });
                
                var nt = zui.types.view.fab( {
                    model: {}, // TODO make this a tray model
                    parent: tile_view, 
                    insertionSelector: '.tile-tray',
                    classes:['tile'],
                    events: {},
                    template: t
                });
            tile_view.render();

            };

            tile_view.toggle_rng_x = function(animate){
                var js_view = this;
                if(animate){
                    // setup scope /closuer for tracking things
                    (function(){
                        xLoop = setInterval(function(){
                            if(last_x_tile){
                                last_x_tile.classList.remove('rotX');
                            }

                            var tiles = Array.from(js_view.el.querySelectorAll('.tile'));
                            if(Array.isArray(tiles) && tiles.length > 0){
                                last_x_tile = tiles[mod_text.random.int(0, tiles.length-1)];
                                last_x_tile.classList.add('rotX')
                            }
                        }, 5000);
                    })();
                }
                else {
                    clearInterval(xLoop);
                    if(last_x_tile){
                        last_x_tile.classList.remove('rotX');
                        last_x_tile = null;
                    }
                }
            };

            tile_view.toggle_rng_y = function(animate){
                var js_view = this;
                if(animate){
                    // setup scope /closuer for tracking things
                    (function(){
                        yLoop = setInterval(function(){
                            if(last_y_tile){
                                last_y_tile.classList.remove('rotY');
                            }

                            var tiles = Array.from(js_view.el.querySelectorAll('.tile'));
                            if(Array.isArray(tiles) && tiles.length > 0){
                                last_y_tile = tiles[mod_text.random.int(0, tiles.length-1)];
                                last_y_tile.classList.add('rotY');
                            }
                        }, 5000);
                    })();
                }
                else {
                    clearInterval(yLoop);
                    if(last_y_tile){
                        last_y_tile.classList.remove('rotY');
                        last_y_tile = null;
                    }
                }
            };

            tile_view.toggle_rng_z = function(animate){
                var js_view = this;
                if(animate){
                    // setup scope /closuer for tracking things
                    (function(){
                        zLoop = setInterval(function(){
                            if(last_z_tile){
                                last_z_tile.classList.remove('rotZ');
                            }

                            var tiles = Array.from(js_view.el.querySelectorAll('.tile'));
                            if(Array.isArray(tiles) && tiles.length > 0){
                                last_z_tile = tiles[mod_text.random.int(0, tiles.length-1)];
                                last_z_tile.classList.add('rotZ')
                            }
                        }, 5000);
                    })();
                }
                else {
                    clearInterval(zLoop);
                    if(last_z_tile){
                        last_z_tile.classList.remove('rotZ');
                        last_z_tile = null;
                    }
                }
            };

            return tile_view;
        },
    };
}
);