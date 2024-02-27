define([
    "mod/templating",
    "mod/dom_helper",
    "text!/js/ZDK/zui/view_templates/ejs/list_item.ejs",
    "text!/js/ZDK/zui/view_templates/ejs/grid_item.ejs",
    "text!/js/ZDK/zui/view_templates/css/collection_views.css"
],
function (
    mod_templating,
    mod_dom,
    list_item_ejs,
    grid_item_ejs,
    css
) {
    var MODULE_NAME = "collection_views";
    mod_dom.css.addRaw(MODULE_NAME, css);

    // return mod_templating.buildTemplateHarness({
    //     key: MODULE_NAME, 
    //     ejs: ejs,
    //     context: {}
    // });

    return {
        templates:{
            list_item: mod_templating.buildTemplateHarness({
                key: "list_item", 
                ejs: list_item_ejs,
                context: {}
            }),
            grid_item: mod_templating.buildTemplateHarness({
                key: "grid_item", 
                ejs: grid_item_ejs,
                context: {}
            }),
        }
    };
}
);