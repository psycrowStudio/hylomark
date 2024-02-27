define([
    "mod/templating",
    "mod/dom_helper",
    "text!/js/ZDK/zui/view_templates/css/toolbar_views.css"
],
function (
    mod_templating,
    mod_dom,
    css
) {
    var MODULE_NAME = "toolbar_views";
    mod_dom.css.addRaw(MODULE_NAME, css);

    return {
        templates:{

        }
    };
}
);