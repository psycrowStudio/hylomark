define([
    'mod/dom_helper',
    'mod/animation',
    'zui',
    "zuiRoot/components/tab_view",
    "zuiRoot/components/collection_viewer",
    "zuiRoot/components/toolbar",
    "/view_templates/tile",
    "rbssRoot/tools/actorEditor/components/stat_viewer",
    "rbssRoot/tools/actorEditor/components/basic_info_viewer",
    "rbssRoot/tools/actorEditor/components/demographics_viewer",
    "rbssRoot/tools/actorEditor/components/log_book_viewer",
    "rbssRoot/tools/actorEditor/components/resources_viewer",
    "rbssRoot/framework/models/actor"
],
function (
    mod_dom,
    mod_animation,
    zui,
    zui_tab_view,
    zui_collection_viewer,
    zui_toolbar,
    actor_editor_template,
    rbss_stat_viewer,
    rbss_basic_info_viewer,
    rbss_demographics_viewer,
    rbss_log_book_viewer,
    rbss_resources_viewer,
    rbss_actor
) {
    var MODULE_NAME = "actor_viewer";
    
    var test_tile = actor_editor_template.compile(actor);

    return {
        init: function(pm, pms){
            var actor_viewer = zui.types.view.fab( {
                // model: actor, // TODO make this a tray model
                parent: pm, 
                insertionSelector: pms,
                classes:['tile-tray'],
                events: {},
                template: ''
            });

            actor.listenTo(actor, 'change:glyph_code', function(m, v, o){
                console.log('glyph changed', v);
                var actor_glyph = actor_viewer.el.querySelector('#actor_glyph');
                if(actor_glyph){
                    actor_glyph.className = "fa fa-"+ v;
                }
            });

            actor.listenTo(actor, 'change:accent_color', function(m, v, o){
                console.log('accent_color changed', v);
                var actor_glyph = actor_viewer.el.querySelector('#actor_glyph');
                if(actor_glyph){
                    actor_glyph.style.color = v;
                }
            });

            // TODO consider if these need to be a model or not...
            var tabSettings = {
                pm:actor_viewer,
                pms: '.tab_row_one',
                tabs: {
                    "basic_info": {
                        label: "Basic Info",
                        hover: "!!!",
                        order: 0,
                        glyph_code: "info-circle",
                        content: function(tab){
                            var basic_info_viewer = rbss_basic_info_viewer.init(tr1, '.tabs_content_row', actor);

                            basic_info_viewer.render();

                            return basic_info_viewer.el;
                        }
                    },
                    "stats": {
                        label: "Stats",
                        hover: "!!!",
                        order: 0,
                        glyph_code: "sliders",
                        content: function(tab){
                            var stat_viewer = rbss_stat_viewer.init(tr1, '.tabs_content_row', ["STR", "INT", "CHA"] );

                            stat_viewer.render();

                            return stat_viewer.el;
                        }
                    },
                    "demo": {
                        label: "Demographics",
                        hover: "@@@",
                        order: 2,
                        glyph_code: "address-card",
                        content: function(tab){
                            var demographics_viewer = rbss_demographics_viewer.init(tr1, '.tabs_content_row', actor);

                            demographics_viewer.render();

                            return demographics_viewer.el;
                        }
                    },
                    "traits": {
                        label: "Traits",
                        hover: "###",
                        order: 4,
                        glyph_code: "user",
                        content: function(tab){
                            var settings = {
                                dataset: ["AAAA", "BBBBBBB", "CCC"],
                                autoInsert: false,
                                generateItemSettings: function(el, i){
                                    return {
                                        label: el.length,
                                        hover_text: el
                                    };
                                },
                                onClick:function(view, ev){
                                    console.log("collection-grid-item clicked", view.model[ev.currentTarget.id.split('_')[1]]);
                                }
                            };

                            var grid =  zui_collection_viewer.createGridViewer(settings);
                            console.log(grid);
                            grid.render();

                            setTimeout(function(){
                                grid.addItem("DDDDDDDDDDD");
                            }, 3000)

                            return grid.el;
                        }
                    },
                    "talents": {
                        label: "Talents",
                        hover: "###",
                        order: 4,
                        glyph_code: "user",
                        content: function(tab){
                            var settings = {
                                dataset: ["AAAA", "BBBBBBB", "CCC"],
                                autoInsert: false,
                                generateItemSettings: function(el, i){
                                    return {
                                        label: el.length,
                                        hover_text: el
                                    };
                                },
                                onClick:function(view, ev){
                                    console.log("collection-grid-item clicked", view.model[ev.currentTarget.id.split('_')[1]]);
                                }
                            };

                            var grid =  zui_collection_viewer.createGridViewer(settings);
                            console.log(grid);
                            grid.render();

                            setTimeout(function(){
                                grid.addItem("DDDDDDDDDDD");
                            }, 3000)

                            return grid.el;
                        }
                    }
                }
            };

            var tr1 = zui_tab_view.init(tabSettings);

            var tabSettings2 = {
                pm:actor_viewer,
                pms: '.tab_row_two',
                tabs: {
                    "abilities": {
                        label: "Abilities",
                        hover: "!!!",
                        order: 0,
                        glyph_code: "flash",
                        content: function(tab){
                            var skills_view = zui.types.view.fab({
                                classes:['skills_viewer'],
                                events: {
                                    "click #btn_1": function(ev){
                                        var settings = {
                                            typeSettings: {
                                                query: "Would you care for some lemonade?",
                                                buttonLabels: ['Yes, Please', 'No, thank you']
                                            }
                                        };

                                        var dialog_layer = zui.components.dialogLayer.current();
                                        var confirmation = dialog_layer.triggerDialog('confirm', settings).then(function(resolve){
                                            console.log('resolved', resolve);
                                        }).catch(function(error){
                                            console.log('rejected', error);
                                        });
                                    },
                                    "click #btn_2": function(ev){
                                        var settings = {
                                            typeSettings: {
                                                query: "Pick a number?",
                                                buttons: [{
                                                    label: 'One',
                                                    value: '1'
                                                },
                                                {
                                                    label: 'Two',
                                                    value: '2'
                                                },
                                                {
                                                    label: 'Three',
                                                    value: '3'
                                                },
                                                {
                                                    label: 'Four',
                                                    value: '4'
                                                },{
                                                    label: 'Five',
                                                    value: '5'
                                                }]
                                            }
                                        };
                        
                                        var dialog_layer = zui.components.dialogLayer.current();
                                        var confirmation = dialog_layer.triggerDialog('mc', settings).then(function(resolve){
                                            console.log('resolved', resolve);
                                        }).catch(function(error){
                                            console.log('rejected', error);
                                        });                            
                                    },
                                    "click #btn_3": function(ev){
                                        var settings = {
                                            typeSettings: {
                                                query: 'What is your name?',
                                                input: 'text',
                                                placeholder:"Text placeholder",
                                                hoverText: "Some thing to hover"
                                            },
                                        };
                        
                                        var dialog_layer = zui.components.dialogLayer.current();
                                        var confirmation = dialog_layer.triggerDialog('input', settings).then(function(resolve){
                                            console.log('resolved', resolve);
                                        }).catch(function(error){
                                            console.log('rejected', error);
                                        });
                                    },
                                    "click #btn_4": function(ev){
                                        var dialog_layer = zui.components.dialogLayer.current();
                                        dialog_layer.triggerLoading();

                                        setTimeout(function(){
                                            dialog_layer.clearLoading();
                                        }, 5000);

                                    },
                                    "click #btn_5": function(ev){
                                        var dialog_layer = zui.components.dialogLayer.current();
                                        
                                        var custom_settings = {
                                            title: "Some title text",
                                            glyph_code: "cog",
                                            showOverlay: false,
                                            title_bar_buttons: [
                                                {
                                                    label:"",
                                                    glyph_code:"times",
                                                    hover_text: "Cancel",
                                                    classes: ["dismissPanel"],
                                                    hotkey_code: 27 
                                                }
                                            ],
                                            typeSettings: {
                                                content: "<p> custom </p>"
                                            },
                                        };
                                        dialog_layer.triggerDialog("custom", custom_settings);
                                    }
                                },
                                template: '\
                                <button id="btn_1">Confirm</button>\
                                <button id="btn_2">MC</button>\
                                <button id="btn_3">Input</button>\
                                <button id="btn_4">Loading</button>\
                                <button id="btn_5">Custom Dialog</button>\
                                ',
                                autoInsert: false
                            });

                            skills_view.render();
                            return skills_view.el;
                        }
                    },
                    "log_book": {
                        label: "Log Book",
                        hover: "@@@",
                        order: 2,
                        glyph_code: "book",
                        content: function(tab){
                            var log_book_viewer = rbss_log_book_viewer.init(tr1, '.tabs_content_row', actor);

                            log_book_viewer.render();

                            return log_book_viewer.el;
                        }
                    },
                    "resources": {
                        label: "Resources",
                        hover: "###",
                        order: 4,
                        glyph_code: "cubes",
                        content: function(tab){
                            var resources_viewer = rbss_resources_viewer.init(tr1, '.tabs_content_row', actor);

                            resources_viewer.render();

                            return resources_viewer.el;
                        }
                    },
                    "preferences": {
                        label: "Preferences",
                        hover: "***",
                        order: 5,
                        glyph_code: "star",
                        content: function(tab){
                            var settings = {
                                buttons: [
                                    {
                                        label:"",
                                        glyph_code:"home",
                                        hover_text: "Home",
                                        disabled: false,
                                        visible: true,
                                        onClick:function(view, ev){
                                            console.log("Home", this);
                                            var glyph = ev.currentTarget.querySelector('.glyph');
                                            if(glyph.classList.contains('fa-' + this.glyph_code)){
                                                glyph.classList.remove('fa-' + this.glyph_code);
                                                glyph.classList.add('fa-cog');
                                            }
                                            else {
                                                glyph.classList.remove('fa-cog');
                                                glyph.classList.add('fa-' + this.glyph_code);
                                            }
                                        }
                                    },
                                    {
                                        label:"",
                                        glyph_code:"globe",
                                        hover_text: "World Map",
                                        disabled: false,
                                        visible: true,
                                        onClick:function(view, ev){
                                            console.log("World Map", this);
                                        }
                                    },
                                    {
                                        label:"",
                                        glyph_code:"cog",
                                        hover_text: "Settings",
                                        disabled: false,
                                        visible: true,
                                        onClick:function(view, ev){
                                            console.log("Settings", this);
                                        }
                                    },
                                ],
                                autoInsert: false
                            };

                            var toolbar =  zui_toolbar.init(settings);
                            toolbar.render();

                            return toolbar.el;
                        },
                        disabled: true
                    },
                    "art_assets": {
                        label: "Art Assets",
                        hover: "***",
                        order: 6,
                        glyph_code: "folder-open",
                        content: "<p>Art Assets</p>",
                        disabled: true
                    }
                }
            };

            var tr2 = zui_tab_view.init(tabSettings2);

            // actor_viewer.on('post-render', function(data){
            //     var photo = actor_viewer.el.querySelector('.photo_box');
            
            //     var inBoundQ = [
            //         {
            //             element: photo,
            //             animation: 'fadeOut',
            //             stayHidden: true
            //         }
            //     ];

            //     mod_animation.queueAnimationSequence(inBoundQ).then(function(res){
            //         console.log('!! DONE !!', res);
            //     });
            // });

            return actor_viewer;
        },
        //load
        //refresh
        //exportToJSON

    };
}
);