define([
    'zuiRoot/common',
    'zuiRoot/logger', 
    'zuiRoot/types',
    'mod/dom_helper',
    'mod/animation',
    "zuiRoot/view_templates/dialogs",
    "zuiRoot/components/collection_viewer",
    "3p/tour.min",
    "text!/js/ZDK/styles/3rdParty/tour.min.css",
], 
    function(
        Common, 
        Logger, 
        Types,
        mod_dom,
        mod_animation,
        dialogs,
        zui_collection_viewer,
        tour,
        tour_css
    ){
        var MODULE_NAME = "zui_popover_component";
        mod_dom.css.addRaw(MODULE_NAME, tour_css);


        //options
        // hide
        // var steps =[{
        //     content: "This is a short guide to get you set up and show you where things are",
        //     title: "Welcome aboard 👋",
        //     target: document.querySelector('.tileTray'),
        // }];

        // var settings = {
        //     steps: steps
        // };

        var tg = new tour.TourGuideClient();

        return {
            tour: tg,
            
        };
    });
    //TYPES: blank, text input, text area, MC & bool, 