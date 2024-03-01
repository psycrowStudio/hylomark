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
            zui.types.view.fab( {
                id:'context_bar', 
                parent: pv,
                insertionSelector: '#content',
                classes:['context-bar', 'g-v-24'],
                events: {
                },
                template:'<div class="lSide g-col-6"></div><div class="rSide g-col-6"></div>'
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
        }
    };
    
    return _base_layout;
}
);