define([
    'mod/dom_helper',
    'zui',
    "text!/js/ZDK/zui/styles/base_grid.css"

], function(
    mod_dom,
    zui,
    css
){
    var MODULE_NAME = "base_grid_layout";
    mod_dom.css.addRaw(MODULE_NAME, css);
    
    var _base_layout = {
        generate: function(pv){       
            var h = zui.types.view.fab( { 
                id:'abl', 
                parent: pv,
                classes:['abl'],
                template:'<canvas id="abl_canvas"></canvas>'
            });

            var h = zui.types.view.fab( { 
                id:'header', 
                parent: pv
            });

            zui.types.view.fab( {
                id:'context_bar', 
                parent: h,
                insertionSelector: '#header',
                classes:['context-bar', 'g-v-24'],
                events: {
                },
                template:'<div class="lSide g-col-6"><span class="logo"><i class="fa fa-th"></i>&nbsp;TILE-STREAM&nbsp;<i class="fa fa-stream"></i></span></div><div class="rSide g-col-6"></div>'
            });

            var content = zui.types.view.fab({ 
                id:'content', 
                parent: pv,
                template:''
            });

            zui.types.view.fab( {
                id:'scrolling_box', 
                parent: pv,
                insertionSelector: '#content',
                classes:['scrolling_box'],
                events: {
                },
                template:''
            });

            zui.types.view.fab( { id:'footer', 
            parent: pv,                 
            template:' &copy;2024 &#x16E6;&#x16E6;' 
        });
        }
    };
    
    return _base_layout;
}
);