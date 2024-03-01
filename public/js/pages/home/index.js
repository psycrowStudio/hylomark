define([
    'mod/dom_helper'
    , 'mod/animation'
    , 'zui'
    , 'zuiRoot/layouts/base_grid'
    , 'components/tile_tray'
    , "zuiRoot/components/tab_view"
    , "zuiRoot/components/collection_viewer"
    , "zuiRoot/components/toolbar"
], function(
    mod,
    dom,
    zui, 
    layout_base,
    tileTray,
    tab_view,
    collection_viewer,
    toolbar
){
    // board engine
    var testPage = zui.types.page.fab({ 'title' : 'TILE STREAM', 'isActive': true });
    zui.types.view.fab( { 
        id:'header',
        parent: testPage, 
        template: 'TILE STREAM'
    });

    var content = zui.types.view.fab( { 
        id:'content', 
        parent: testPage,
    });

    // setup the grid(s)
    layout_base.generate(content);
  
    // TODO test out dialog layer
    var dialogLayer = zui.components.dialogLayer.addToPage(testPage);

    // tile tray
    var tt = tileTray.init(testPage);

    //zui.factory.page.setActivePage(testPage);
    testPage.redraw();
});