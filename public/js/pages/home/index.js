define([
    'mod/dom_helper'
    , 'mod/animation'
    , 'mod/text'
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
    mod_animation,
    mod_text,
    mod_csv,
    zui, 
    layout_base,
    tileTray,
    toolbar,
    THREE,
    FX_glitteringSea,
    tilestream_css,
    zipcode_csv,
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
            {
                label:"",
                glyph_code:"soap",
                hover_text: "Wobble Animation",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    var tiles = Array.from(tt.el.querySelectorAll('.tile:not(.noFX)'));
                        if(Array.isArray(tiles) && tiles.length > 0){
                            last_x_tile = tiles[mod_text.random.int(0, tiles.length-1)];
                            var inBoundQ = [
                                {
                                    element: last_x_tile,
                                    animation: 'rubberBand'
                                },
                            ];
                            mod_animation.queueAnimationSequence(inBoundQ).then(function(){
                                console.log('done!');
                            });
                        }
                }
            },
            {
                label:"",
                glyph_code:"question",
                hover_text: "Get Help",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    var steps =[
                    {
                        group:'test1',
                        content: "This is a short guide to get you set up and show you where things are",
                        title: "👋Welcome To Test 1",
                        target: document.querySelector('.tileTray'),
                    },
                    {
                        group:'test2',
                        content: "This is a short guide to get you set up and show you where things are",
                        title: "Welcome To Test 2",
                        target: ev.currentTarget,
                    }
                ];

                    var settings = {
                        steps: steps,
                        completeOnFinish:false
                    };

                    var tg = zui.components.popover;
                    tg.setOptions(settings);
                    tg.onBeforeStepChange(function(x,z,y){
                        // pick a random tile and focus it?
                        switch(tg.activeStep + 1){
                            case 1:
                                console.log('Step 2');
                                tg.tourSteps[1].target = document.querySelector('.logo');
                                tg.tourSteps[1].content = "HELLO";
                                tg.tourSteps[1].title = "WORLD";
                                tg.tourSteps.push({
                                    group:'test2',
                                    content: "This is a short guide to get you set up and show you where things are",
                                    title: "Welcome To Test 2",
                                    target: ev.currentTarget,
                                });
                                break;
                            case 2:
                                console.log('Step 2');

                                break;
                        }
                    })
                    tg.start();
                    
                    // tg.refresh();
                    // tg.onFinish(()=>{ 
                    //     console.log('Help!');
                    //     tg.deleteFinishedTour();
                    //     //tg.Fins();
                    //     var elem = document.querySelectorAll('tg-backdrop')
                    //  });
                    
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