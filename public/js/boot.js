requirejs.config({
    // appDir: window["s5config"]["domain_root"],
    // baseUrl: window["s5config"]["static_root"],
    appDir: window.location.origin,
    baseUrl: window.location.origin + "/js", //"./js/",
    shim: {
        // for non-AMD libraries
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        underscore: { exports: "_" },
        jquery: { exports: '$' },
        luxon: { exports: 'luxon' },
    },
    paths: {
        "router": "./routes",

        // requireJS plugins
        "text": './ZDK/3rdParty/require_text',
        underscore: './ZDK/3rdParty/underscore.amd',  
        backbone: './ZDK/3rdParty/backbone.amd',
        
        'velocity-animate': './ZDK/3rdParty/velocity.min',
        //d3: 'js/3rdParty/d3.v3.min.js',

        zui: './ZDK/zui/zui_init',
        zuiRoot: 'ZDK/zui',
        
        // 3P shim modules
        jquery: 'https://code.jquery.com/jquery-3.4.1.min',
        luxon: 'https://cdn.jsdelivr.net/npm/luxon@1.25.0/build/global/luxon.min',
        
        // mapping to hosted 3p libraries
        '3p': './ZDK/3rdParty',

        //mapping to our client modules
        'mod': './ZDK/modules',

        //mapping to our client view logic
        //'s5-view-logic': window["s5config"]["static_root"] + 'js/view_helpers',

        //mapping to our client view templates
        //'s5-view-template': window["s5config"]["static_root"] + 'view_templates'

        // testing view
        //'initalPage': 'pages/index/index'
    },
    config: {
        text: {
            useXhr: function (url, protocol, hostname, port) {
                return true;
            }
        }
    }
});

require([
    'zui', 
    'backbone',
    'mod/backbone_extensions',
    'jquery',
    'underscore',
    'luxon',
    'router',
    "mod/dom_helper",
    'text!/js/ZDK/zui/styles/zui.css'
], function(
    zui, 
    backbone,
    backbone_extensions,
    jquery,
    underscore,
    luxon,
    router,
    mod_dom,
    css
) {
    var MODULE_NAME = "ZDK";
    mod_dom.css.addRaw(MODULE_NAME, css);

    console.log('ZDK initialized');
    zui.logger.log('ZDK Loaded!', { tags:'zui-all', eventName: 'zui-load' });
});