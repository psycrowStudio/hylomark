define([
    'mod/dom_helper'
    , 'zui'
    , 'zuiRoot/layouts/base_grid'
    , 'components/tile_tray'
    , "zuiRoot/components/toolbar"
    , "text!/styles/tilestream.css"
], function(
    mod_dom,
    zui, 
    layout_base,
    tileTray,
    toolbar,
    tilestream_css
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
  
    // TODO test out dialog layer
    var dialogLayer = zui.components.dialogLayer.addToPage(testPage);

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
                glyph_code:"stopwatch",
                hover_text: "Add Time Tile",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    tt.add_time_tile();
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
        ]
    };

    var admin_toolbar =  toolbar.init(admin_tool_settings);

    // tile tray
    var tt = tileTray.init(testPage.findChildView('scrolling_box'));

    // board engine

    //zui.factory.page.setActivePage(testPage);
    testPage.redraw();
});