define([
    'zui',
    '3p/keypress',
    'mod/phaser'
], function(
    zui,
    keypress,
    phaser
){
    var MODULE_NAME = "Phaser Sandbox";
    console.log('loading Phaser Sandbox');
    var phaser_sandbox = zui.types.page.fab({ 
        'title' : 'Phaser Sandbox', 
        'isActive': true,
        'bodyClasses': ['page_grid']
    });

    var generate = function(pageModel){
        // var header_compiled = vt_rbss_header.compile({
        //     titleText : "Role-Based Scenario Simulator",
        //     titleHover : "R.B.S.S.",
        //     titleUrl : "/",
        //     links: [
        //         {
        //             text : "ActorCreator",
        //             hover : "Create and Edit your characters",
        //             url : "/tools/actorEditor",
        //         },
        //         {
        //             text : "WorldBuilder",
        //             hover : "Create and Edit your Environment",
        //             url : "/",
        //         },
        //         {
        //             text : "ActionSequencer",
        //             hover : "Create and Edit your Triggers & RuleSets",
        //             url : "/",
        //         },
        //     ]
        // });
    
        zui.types.view.fab( { 
            id:'header', 
            parent: pageModel,
            template: '<header>header</header>', //header_compiled
        });
    
        var content = zui.types.view.fab({ 
            id:'content', 
            parent: pageModel,
            template:'<div id="myContent"></div>'
        });
        
        zui.types.view.fab( {
            id:'context_bar', 
            parent: content, 
            insertionSelector: '#content',
            classes:['context-bar', 'g-v-24'],
            events: {
            },
            template:'<div class="lSide g-col-6"></div><div class="rSide g-col-6"></div>'
        });
    
        zui.types.view.fab( {
            id:'scrolling_box', 
            parent: content, 
            insertionSelector: '#content',
            classes:['scrolling_box'],
            events: {
            },
            template:''
        });
    
        zui.types.view.fab( { id:'footer', 
            parent: pageModel,                 
            template:' &copy;2020 PsyCrow Studio &#x03A8;&#x16E6;' 
        });

        var dialogLayer = zui.components.dialogLayer.addToPage(pageModel);
    };

    generate(phaser_sandbox);
    // get content componet -- #scrolling_box
    var scroll_box = phaser_sandbox.findChildView('scrolling_box');

    // Note post render is not actually on screen at this moment :/
    scroll_box.listenToOnce(scroll_box, "post-render", function(ev){
       var x = document.getElementById("scrolling_box");
        console.log("post render 2");
        phaser.start(ev.el);
    });

    phaser_sandbox.redraw();
});