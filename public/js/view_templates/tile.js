define([
    "mod/templating",
    "mod/dom_helper",
    "text!/js/view_templates/ejs/tile.ejs",
    "text!/js/view_templates/css/tile.css"
],
function (
    mod_templating,
    mod_dom,
    ejs,
    css
) {
    var MODULE_NAME = "tile";
    mod_dom.css.addRaw(MODULE_NAME, css);

    return mod_templating.buildTemplateHarness({
        key: MODULE_NAME, 
        ejs: ejs,
        // parent model (page / component)
        context: {}
    });
}
);