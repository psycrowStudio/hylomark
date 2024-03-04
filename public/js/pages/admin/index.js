define([
    'mod/dom_helper'
    , 'zui'
    , 'zuiRoot/layouts/base_grid'
    , "zuiRoot/components/toolbar"
    , "text!/styles/admin_site.css"
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
    var login_prompt = zui.types.view.fab( {
        model: {}, // TODO make this a tray model
        parent: testPage.findChildView('scrolling_box'), 
        insertionSelector: '#scrolling_box',
        classes:['login_view'],
        events: {},
        template: '<div class="">\
        <span class="logobox"><i class="fa fa-th-list"></i></span> \
        </div>\
        <h1>Admin Portal Login</h1>\
        <div class="inputsbox">\
        <div>  \
        <input type="text" placeholder="username"></input> \
        </div>\
        <div>  \
        <input type="text" placeholder="password"></input> \
        </div>\
        <div>\
        </div>\
        </div>\
        <div><button>Login</button></div>'
    });



    //zui.factory.page.setActivePage(testPage);
    testPage.redraw();
});