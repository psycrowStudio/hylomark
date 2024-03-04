define([
    'mod/dom_helper'
    , 'zui'
    , 'zuiRoot/layouts/base_grid'
    , "zuiRoot/components/toolbar"
    , "text!/styles/std_lower_third.css"
    , 'effects/glitteringSea'
], function(
    mod_dom,
    zui, 
    layout_base,
    toolbar,
    tilestream_css,
    FX_glitteringSea
){
    var MODULE_NAME = "Admin Portal Login";
    mod_dom.css.addRaw(MODULE_NAME, tilestream_css);

    // create page
    var testPage = zui.types.page.fab({ 
        'title' : 'ADMIN LOGIN', 
        'isActive': true,
        bodyClasses: ['page_grid']
    });

    // setup the grid(s)
    layout_base.generate(testPage);
    var dialogLayer = zui.components.dialogLayer.addToPage(testPage);

    console.log('admin portal');

    // Tool Bar Example
    var admin_tool_settings = {
        parent: testPage.findChildView('header'),
        insertionSelector: '.rSide',
        classes:  ["admin_toolbar"],
        buttons: [
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

    // login prompt
    var std_lower_third = zui.types.view.fab( {
        model: {}, // TODO make this a tray model
        parent: testPage.findChildView('scrolling_box'), 
        insertionSelector: '#scrolling_box',
        classes:['std_lower_third'],
        events: {},
        template: '\
        <div class="category">category</div>\
        <div class="lower_content">\
            <div class="left_content">\
                <div class="category">Lower Third Main Line</div>\
                <div class="category">Lower Third - Sub Line</div>\
                <div class="category">Lower Third - Tertiary Line</div>\
                <div class="category">Scrolling Marquee</div>\
            </div>\
            <div class="right_content">\
                <div class="r1">\
                    <span>time/weather</span><span>logo</span>\
                </div>\
                <div class="r2">\
                    <span>QR CODE</span>\
                </div>\
            </div>\
        </div>'
    });



    //zui.factory.page.setActivePage(testPage);
    testPage.redraw();
});