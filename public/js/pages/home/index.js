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
        insertionSelector: '#header',
        classes:  ["admin_toolbar"],
        buttons: [
            {
                label:"",
                glyph_code:"plus-square",
                hover_text: "TEST",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    //console.log('Hello!');
                    tt.add_tile();
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