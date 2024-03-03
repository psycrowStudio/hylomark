define([
    'mod/dom_helper'
    , 'mod/csv'
    , 'zui'
    , 'zuiRoot/layouts/base_grid'
    , 'components/tile_tray'
    , "zuiRoot/components/toolbar"
    , "THREE"
    , 'effects/glitteringSea'
    , "text!/styles/tilestream.css"
    , "text!/data/zip_lat_lon_2022.csv"
], function(
    mod_dom,
    mod_csv,
    zui, 
    layout_base,
    tileTray,
    toolbar,
    THREE,
    FX_glitteringSea,
    tilestream_css,
    zipcode_csv
){
    
    var MODULE_NAME = "Home Page";
    mod_dom.css.addRaw(MODULE_NAME, tilestream_css);


   

    // create page
    var testPage = zui.types.page.fab(
        { 
            title : 'TILE STREAM', 
            isActive: true,
            bodyClasses: ['page_grid']
        });

    // setup the grid(s)
    layout_base.generate(testPage);
    var dialogLayer = zui.components.dialogLayer.addToPage(testPage);

    console.log('Zip Convert');
    var zip_arr = mod_csv.csvStringToArray(zipcode_csv);
    var zip_map = zip_arr.reduce(function(acc, r, i){
        if(i === 0){
            // skip header row
            return acc;
        }

        acc[r[0]] = {
            zip:r[0],
            lat:r[1],
            lon:r[2]
        };
        return acc;
    }, {});

    // Tool Bar Example
    var admin_tool_settings = {
        parent: testPage.findChildView('header'),
        insertionSelector: '.rSide',
        classes:  ["admin_toolbar"],
        buttons: [
            {
                label:"",
                glyph_code:"plus-square",
                hover_text: "Add New Tile",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    tt.add_tile();
                }
            },
            {
                label:"",
                glyph_code:"clock",
                hover_text: "Add Time Tile",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    tt.add_time_tile();
                }
            },
            {
                label:"",
                glyph_code:"cloud-sun-rain",
                hover_text: "Add Weather Tile",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    // dialog to get zip
                    var settings = {
                        typeSettings: {
                            query: 'Enter the Zip Code for Local Weather',
                            input: 'text',
                            placeholder:"#####",
                            hoverText: "5 digit zip code"
                        },
                    };
    
                    var dialog_layer = zui.components.dialogLayer.current();
                    var confirmation = dialog_layer.triggerDialog('input', settings).then(function(resolve){
                        if(zip_map.hasOwnProperty(resolve)){
                            tt.add_weather_tile(zip_map[resolve]);
                        }
                        // no zipcode found...
                    }).catch(function(error){
                        console.log('rejected', error);
                    });

                    // tt.add_weather_tile("35073");
                }
            },
            {
                label:"",
                glyph_code:"qrcode",
                hover_text: "Add QR Tile",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    // tt.add_qr_tile();
                }
            },
            {
                label:"",
                glyph_code:"arrows-alt-v",
                hover_text: "Toggle Random Flip X",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    tt.toggle_rng_x(ev.currentTarget.classList.toggle('enabled'));  
                }
            },
            {
                label:"",
                glyph_code:"arrows-alt-h",
                hover_text: "Toggle Random Flip Y",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    tt.toggle_rng_y(ev.currentTarget.classList.toggle('enabled'));
                }
            },
            {
                label:"",
                glyph_code:"redo",
                hover_text: "Toggle Random Flip Z",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    tt.toggle_rng_z(ev.currentTarget.classList.toggle('enabled'));
                }
            },
            {
                label:"",
                glyph_code:"palette",
                hover_text: "Toggle Random Coloring",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    tt.toggle_rng_rgb(ev.currentTarget.classList.toggle('enabled'));
                }
            },
            {
                label:"",
                glyph_code:"braille",
                hover_text: "Toggle Background Coloring",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    if(ev.currentTarget.classList.toggle('enabled')){
                        var abl = document.querySelector('#abl_canvas');
                        FX_glitteringSea.applyToCanvas(abl);
                    }
                    else {
                        // turn it off!?

                    }

                }
            },
        ]
    };

    var admin_toolbar =  toolbar.init(admin_tool_settings);

    // tile tray
    var tt = tileTray.init(testPage.findChildView('scrolling_box'));

    // board engine


    //zui.factory.page.setActivePage(testPage);
    testPage.redraw();
});