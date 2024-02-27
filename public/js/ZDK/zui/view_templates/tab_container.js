define([
        "mod/templating",
        "mod/dom_helper",
        "text!/js/ZDK/zui/view_templates/ejs/tab_container.ejs",
        "text!/js/ZDK/zui/view_templates/css/tab_container.css"
    ],
    function (
        mod_templating,
        mod_dom,
        ejs,
        css
    ) {
        var MODULE_NAME = "tab_container";
        mod_dom.css.addRaw(MODULE_NAME, css);

        return mod_templating.buildTemplateHarness({
            key: MODULE_NAME, 
            ejs: ejs,
            context: {}
        });
    }
);