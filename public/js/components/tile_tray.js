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
    var  rgbLoop = null;
    var last_rgb_tile = null;
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
                var rng_glyph = mod_text.random.int(1,10);
                var g = glyphs[mod_text.random.int(0, glyphs.length-1)];
                switch(rng_glyph){
                    case(1):
                    case(2):
                        g = ''
                        break;
                }
    
                var t = tile_template.compile({
                    text: "",
                    glyph_code: g ? g : ''
                });
                
                var rng = mod_text.random.int(1,10);
                var wMod = '';
                var hMod = '';
                switch(rng){
                    case(1):
                        wMod = 'w2';
                        break;
                    case(2):
                        hMod = 'h2';
                        break;
                    case(3):
                    case(4):
                        hMod = 'h2';
                        wMod = 'w2';
                        break;
                }

                var nt = zui.types.view.fab( {
                    model: {}, // TODO make this a tray model
                    parent: tile_view, 
                    insertionSelector: '.tile-tray',
                    classes:['tile', wMod, hMod],
                    events: {},
                    template: t
                });
                
                // colorize tile?
                // ID already has a fairly unique color
                //nt.el.style.backgroundColor = '#'+nt.el.id;
            tile_view.render();

            };

            tile_view.add_time_tile = function(){
                var t = tile_template.compile({
                    time: new Date()
                });

                var nt = zui.types.view.fab( {
                    model: {}, // TODO make this a tray model
                    parent: tile_view, 
                    insertionSelector: '.tile-tray',
                    classes:['tile', 'timebox', 'noFX'],
                    events: {},
                    template: t,
                    timer: (function(){
                        setInterval(function(){
                            var now = luxon.DateTime.local();
                            
                            var dom_timebox = nt.el.querySelector('.timebox');
                            dom_timebox.textContent = now.toLocaleString(luxon.DateTime.DATETIME_MED_WITH_SECONDS);

                            // var dom_month = nt.el.querySelector('.timebox');
                            // dom_month.textContent = now.getMonth();
                            // var dom_day = nt.el.querySelector('.t_day');
                            // dom_day.textContent = now.getDate();
                            // var dom_year = nt.el.querySelector('.t_year');
                            // dom_year.textContent = now.getFullYear();

                            // var dom_hour = nt.el.querySelector('.t_hour');
                            // dom_hour.textContent = now.getHours();
                            // var dom_min = nt.el.querySelector('.t_min');
                            // dom_min.textContent = now.getMinutes();
                            // var dom_sec = nt.el.querySelector('.t_sec');
                            // dom_sec.textContent = now.getSeconds();

                        }, 200);
                    })()
                });
                
                // colorize tile?
                // ID already has a fairly unique color
                //nt.el.style.backgroundColor = '#'+nt.el.id;
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

                            var tiles = Array.from(js_view.el.querySelectorAll('.tile:not(.noFX)'));
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

                            var tiles = Array.from(js_view.el.querySelectorAll('.tile:not(.noFX)'));
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

                            var tiles = Array.from(js_view.el.querySelectorAll('.tile:not(.noFX)'));
                            if(Array.isArray(tiles) && tiles.length > 0){
                                last_z_tile = tiles[mod_text.random.int(0, tiles.length-1)];
                                last_z_tile.classList.add('rotZ')
                            }
                        }, 9000);
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

            tile_view.toggle_rng_rgb = function(animate){
                var js_view = this;
                if(animate){
                    // setup scope /closuer for tracking things
                    (function(){
                        rgbLoop = setInterval(function(){
                            if(last_rgb_tile){
                                last_rgb_tile.style.backgroundColor = null;
                            }

                            var tiles = Array.from(js_view.el.querySelectorAll('.tile:not(.noFX)'));
                            if(Array.isArray(tiles) && tiles.length > 0){
                                last_rgb_tile = tiles[mod_text.random.int(0, tiles.length-1)];
                                var rngcolor = '#'+mod_text.random.hexColor();
                                last_rgb_tile.style.backgroundColor = rngcolor;
                            }
                        }, 5000);
                    })();
                }
                else {
                    clearInterval(rgbLoop);
                    if(last_rgb_tile){
                        last_rgb_tile.style.backgroundColor = null;
                        last_rgb_tile = null;
                    }
                }
            };



            return tile_view;
        },
    };
}
);