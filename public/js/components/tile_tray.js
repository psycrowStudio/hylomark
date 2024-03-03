define([
    'mod/dom_helper',
    'mod/animation',
    'mod/text',
    'mod/misc',
    'zui',
    "zuiRoot/components/tab_view",
    "zuiRoot/components/collection_viewer",
    "zuiRoot/components/toolbar",
    "zuiRoot/components/fa_glyph_picker",
    "view_templates/tile", 
    '3p/qrcode'
],
function (
    mod_dom,
    mod_animation,
    mod_text,
    mod_misc,
    zui,
    zui_tab_view,
    zui_collection_viewer,
    zui_toolbar,
    glyph_picker,
    tile_template,
    qrcode,
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
                        }, 200);
                    })()
                });

                tile_view.render();
            };

            tile_view.add_qr_tile = function(){
                // var cvs = document.querySelector('#abl_canvas');
                // console.log('qr', cvs); 
                // new qrcode(tt.el, "http://google.com");

                // var t = tile_template.compile({
                //     time: new Date()
                // });

                // var nt = zui.types.view.fab( {
                //     model: {}, // TODO make this a tray model
                //     parent: tile_view, 
                //     insertionSelector: '.tile-tray',
                //     classes:['tile', 'qr', 'noFX'],
                //     events: {},
                //     template: t,
                //     timer: (function(){
                //         setInterval(function(){
                //             var now = luxon.DateTime.local();
                            
                //             var dom_timebox = nt.el.querySelector('.timebox');
                //             dom_timebox.textContent = now.toLocaleString(luxon.DateTime.DATETIME_MED_WITH_SECONDS);
                //         }, 200);
                //     })()
                // });

                // tile_view.render();
            };

            tile_view.add_weather_tile = function(location){
                var t = tile_template.compile({
                    weather: {
                        current_temperature: '--',
                        current_icon: 'sun'
                    }
                });

                var gps_str = (location.lat + "," + location.lon).replace(/\s/g,'');
                var url = "https://api.weather.gov/points/{0}".replace("{0}", gps_str);
                mod_misc.http(url, "GET").then(function(response){
                    console.log('weather loc acquired!');
                    return nt.weather_refresh(response.properties.forecastHourly, "GET");
                }).then(function(response){
                    console.log('base weather acquired!');
                    setInterval((function(){
                        var rr = response;
                        return function(){
                            var et = Date.parse(rr.properties.periods[0].endTime);
                            var now = new Date();
                            if(et > now.getTime()){
                                nt.updateTile(rr.properties.periods[0].temperature, 
                                    rr.properties.periods[0].shortForecast.toLowerCase(),
                                    rr.properties.periods[0].isDaytime
                                    );
                            }
                            else {
                                nt.weather_refresh().then(function(r2){
                                    console.log('base weather re-acquired!');
                                    rr = r2;
                                });
                            }
                        }
                    })(), 5000);
                });

                var nt = zui.types.view.fab( {
                    model: {}, // TODO make this a tray model
                    parent: tile_view, 
                    insertionSelector: '.tile-tray',
                    classes:['tile', 'weatherbox', 'noFX'],
                    events: {},
                    template: t,
                });

                // sub to the refresh call ()

                nt.updateTile = function(temp_value, sForecast, isDaytime){
                    var temp = nt.el.querySelector('.temp');
                    var icon = nt.el.querySelector('.icon');
                    temp.textContent = temp_value;
                    
                    var glpyh = '';
                    // TODO if night time, use moon icon
                    if(sForecast.includes('partly sunny')){
                        glpyh = isDaytime === false ? 'cloud-moon' : 'cloud-sun';
                    }
                    if(sForecast.includes('sunny') || sForecast.includes('clear')){
                        glpyh = isDaytime === false ? 'moon' : 'sun';
                    }
                    else if (sForecast.includes('partly cloudy') || sForecast.includes('mostly clear')){
                        glpyh = isDaytime === false ? 'cloud-moon' : 'cloud-sun';
                    }
                    else if (sForecast.includes('mostly cloudy')){
                        glpyh = 'cloud';
                    }
                    else if (sForecast.includes('slight chance light rain')){
                        glpyh = isDaytime === false ? 'cloud-moon-rain' : 'cloud-sun-rain';
                    }
                    else if (sForecast.includes('chance light rain')){
                        glpyh = 'cloud-rain';
                    }
                    else if (sForecast.includes('rain')){
                        glpyh = 'cloud-showers-heavy';
                    }
                    else if (sForecast.includes('fog')){
                        glpyh = 'smog';
                    }
                    else if (sForecast.includes('snow')){
                        glpyh = 'snowflake';
                    }
                    else if (sForecast.includes('wind')){
                        glpyh = 'wind';
                    }
                    else if (sForecast.includes('lightning') || sForecast.includes('thunder')){
                        glpyh = 'bolt';
                    }
                    //Slight Chance Light Rain
                    icon.className = "";
                    icon.classList.add('icon');
                    icon.classList.add('fa');
                    icon.classList.add('fa-' + glpyh);
                }

                nt.weather_refresh = (function(url){
                    var loc_url = !loc_url && url ? url : null;
                    return function(url){
                        loc_url = !loc_url && url ? url : loc_url;
                        return mod_misc.http(loc_url, "GET").then(function(response){
                            nt.updateTile(response.properties.periods[0].temperature, 
                                response.properties.periods[0].shortForecast.toLowerCase(),
                                response.properties.periods[0].isDaytime
                                );
                            return response;
                        });
                    };
                })()

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