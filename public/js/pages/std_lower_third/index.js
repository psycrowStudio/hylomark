define([
    'mod/animation'
    , 'mod/dom_helper'
    , 'mod/misc'
    , 'mod/csv'
    , 'zui'
    , 'zuiRoot/layouts/base_grid'
    , "zuiRoot/components/toolbar"
    , "text!/styles/std_lower_third.css"
    , 'effects/glitteringSea'
    , '3p/qrcode'
    , "text!/data/zip_lat_lon_2022.csv"
], function(
    mod_animation,
    mod_dom,
    mod_misc,
    mod_csv,
    zui, 
    layout_base,
    toolbar,
    tilestream_css,
    FX_glitteringSea,
    qrcode,
    zipcode_csv
){
    var MODULE_NAME = "Admin Portal Login";
    mod_dom.css.addRaw(MODULE_NAME, tilestream_css);

    var announcement_loop;

    console.log('Zip Convert');
    var zip_arr = mod_csv.csvStringToArray(zipcode_csv);
    var zip_map = zip_arr.reduce(function(acc, r, i){
        if(i === 0){
            // skip header row
            return acc;
        }

        acc[r[0]] = {
            zip:r[0],
            lat:r[1],
            lon:r[2]
        };
        return acc;
    }, {});

    // create page
    var testPage = zui.types.page.fab({ 
        'title' : 'ADMIN LOGIN', 
        'isActive': true,
        bodyClasses: ['page_grid']
    });

    // setup the grid(s)
    layout_base.generate(testPage);
    var dialogLayer = zui.components.dialogLayer.addToPage(testPage);

    console.log('admin portal');

    // Tool Bar Example
    var admin_tool_settings = {
        parent: testPage.findChildView('header'),
        insertionSelector: '.rSide',
        classes:  ["admin_toolbar"],
        buttons: [
            {
                label:"",
                glyph_code:"braille",
                hover_text: "Toggle Background Coloring",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    if(ev.currentTarget.classList.toggle('enabled')){
                        var abl = document.querySelector('#abl_canvas');
                        FX_glitteringSea.applyToCanvas(abl);
                    }
                    else {
                        // turn it off!?

                    }

                }
            },
            {
                label:"",
                glyph_code:"cloud-sun-rain",
                hover_text: "Add Weather Tile",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    // dialog to get zip
                    var settings = {
                        typeSettings: {
                            query: 'Enter the Zip Code for Local Weather',
                            input: 'text',
                            placeholder:"#####",
                            hoverText: "5 digit zip code"
                        },
                    };
    
                    var dialog_layer = zui.components.dialogLayer.current();
                    var confirmation = dialog_layer.triggerDialog('input', settings).then(function(resolve){
                        if(zip_map.hasOwnProperty(resolve)){
                            std_lower_third.add_weather(zip_map[resolve]);
                        }
                        // no zipcode found...
                    }).catch(function(error){
                        console.log('rejected', error);
                    });

                    // tt.add_weather_tile("35073");
                }
            },
            {
                label:"",
                glyph_code:"birthday-cake",
                hover_text: "Toggle Annoucement Demo",
                disabled: false,
                visible: true,
                onClick:function(view, ev){
                    
                    var collection = {
                        "Missed Connections" : [
                            {
                                main_line: "Missed Connections 1",
                                sub_line: "One Missed Connections",
                                tri_line: "Happy One Birthday",
                            },
                            {
                                main_line: "Missed Connections 2",
                                sub_line: "Two Missed Connections",
                                tri_line: "Happy Two Birthday",
                            },
                            {
                                main_line: "Missed Connections 3",
                                sub_line: "Three Missed Connections",
                                tri_line: "Happy Three Birthday",
                            },
                            {
                                main_line: "Missed Connections 4",
                                sub_line: "Four Missed Connections",
                                tri_line: "Missed Four Connections",
                            }
                        ],
                        "Birthdays":[
                            {
                                main_line: "HAPPY BIRTHDAY 1",
                                sub_line: "One Happy Birthday",
                                tri_line: "Happy One Birthday",
                            },
                            {
                                main_line: "HAPPY BIRTHDAY 2",
                                sub_line: "Two Happy Birthday",
                                tri_line: "Happy Two Birthday",
                            },
                            {
                                main_line: "HAPPY BIRTHDAY 3",
                                sub_line: "Three Happy Birthday",
                                tri_line: "Happy Three Birthday",
                            },
                            {
                                main_line: "HAPPY BIRTHDAY 4",
                                sub_line: "Four Happy Birthday",
                                tri_line: "Happy Four Birthday",
                            }
                        ],
                        "Engagements & Anniverseries" : [
                            {
                                main_line: "Engagements & Anniverseries 1",
                                sub_line: "One Engagements & Anniverseries",
                                tri_line: "Happy One Birthday",
                            },
                            {
                                main_line: "Engagements & Anniverseries 2",
                                sub_line: "Two Engagements & Anniverseries",
                                tri_line: "Happy Two Birthday",
                            },
                            {
                                main_line: "Engagements & Anniverseries 3",
                                sub_line: "Three Engagements & Anniverseries",
                                tri_line: "Happy Three Birthday",
                            },
                            {
                                main_line: "Engagements & Anniverseries 4",
                                sub_line: "Four Engagements & Anniverseries",
                                tri_line: "Happy Four Birthday",
                            }
                        ],
                        "Public Announcements" : [
                            {
                                main_line: "Public Announcements 1",
                                sub_line: "One Public Announcements",
                                tri_line: "Happy One Birthday",
                            },
                            {
                                main_line: "Public Announcements 2",
                                sub_line: "Two Public Announcements",
                                tri_line: "Happy Two Birthday",
                            },
                            {
                                main_line: "Public Announcements 3",
                                sub_line: "Three Public Announcements",
                                tri_line: "Happy Three Birthday",
                            },
                            {
                                main_line: "Public Announcements 4",
                                sub_line: "Four Public Announcements",
                                tri_line: "Happy Four Birthday",
                            }
                        ]
                    };
                    var marquee_text = "Add your Announcement today. email us at ads@domain.com - OR - Scan the QR Code >>>>>>>>";
                    std_lower_third.queue_announcements(ev.currentTarget.classList.toggle('enabled'), collection, marquee_text);
                }
            },
        ]
    };

    var admin_toolbar =  toolbar.init(admin_tool_settings);

    var std_lower_third = zui.types.view.fab({
        model: {},
        parent: testPage.findChildView('scrolling_box'), 
        insertionSelector: '#scrolling_box',
        classes:['std_lower_third'],
        events: {},
        template: '\
        <div class="category">\
            <div class="tab">category</div>\
        </div>\
        <div class="lower_content">\
            <div class="left_content">\
                <div class="main_line">Lower Third Main Line</div>\
                <div class="sub_line">Lower Third - Sub Line</div>\
                <div class="tri_line">Lower Third - Tertiary Line</div>\
                <div class="marquee"><marquee><div class="segment">Scrolling Marquee</div></marquee></div>\
            </div>\
            <div class="right_content">\
                <div class="r1">\
                    <div class="">\
                        <div class="timebox">time</div>\
                        <div class="weatherbox">\
                            <span class="temp">--</span><span class="deg"><sup>&deg;F</sup></span>\
                            <span class="icon fa fa-sun"></span>\
                        </div>\
                    </div>\
                    <div class="network_logo"><i class="fa fa-th-list"></i></div>\
                </div>\
                <div class="r2">\
                    <div><h3>SCAN TO INTERACT</h3></div>\
                    <div class="qr_code"></div>\
                </div>\
            </div>\
        </div>'
    });

    std_lower_third.add_weather = function(location){
        var gps_str = (location.lat + "," + location.lon).replace(/\s/g,'');
        var url = "https://api.weather.gov/points/{0}".replace("{0}", gps_str);
        mod_misc.http(url, "GET").then(function(response){
            console.log('weather loc acquired!');
            return std_lower_third.weather_refresh(response.properties.forecastHourly);
        }).then(function(response){
            console.log('base weather acquired!');
            setInterval((function(){
                var rr = response;
                return function(){
                    var et = Date.parse(rr.properties.periods[0].endTime);
                    var now = new Date();
                    if(et > now.getTime()){
                        std_lower_third.updateWeather(rr.properties.periods[0].temperature, 
                            rr.properties.periods[0].shortForecast.toLowerCase(),
                            rr.properties.periods[0].isDaytime
                            );
                    }
                    else {
                        std_lower_third.weather_refresh().then(function(r2){
                            console.log('base weather re-acquired!');
                            rr = r2;
                        });
                    }
                }
            })(), 5000);
        });
    };

    std_lower_third.updateWeather = function(temp_value, sForecast, isDaytime){
        var temp = std_lower_third.el.querySelector('.weatherbox .temp');
        var icon = std_lower_third.el.querySelector('.weatherbox .icon');
        temp.textContent = temp_value;
        
        var glpyh = '';
        // TODO if night time, use moon icon
        if(sForecast.includes('partly sunny')){
            glpyh = isDaytime === false ? 'cloud-moon' : 'cloud-sun';
        }
        if(sForecast.includes('sunny') || sForecast.includes('clear')){
            glpyh = isDaytime === false ? 'moon' : 'sun';
        }
        else if (sForecast.includes('partly cloudy') || sForecast.includes('mostly clear')){
            glpyh = isDaytime === false ? 'cloud-moon' : 'cloud-sun';
        }
        else if (sForecast.includes('mostly cloudy')){
            glpyh = 'cloud';
        }
        else if (sForecast.includes('slight chance light rain')){
            glpyh = isDaytime === false ? 'cloud-moon-rain' : 'cloud-sun-rain';
        }
        else if (sForecast.includes('chance light rain')){
            glpyh = 'cloud-rain';
        }
        else if (sForecast.includes('rain')){
            glpyh = 'cloud-showers-heavy';
        }
        else if (sForecast.includes('fog')){
            glpyh = 'smog';
        }
        else if (sForecast.includes('snow')){
            glpyh = 'snowflake';
        }
        else if (sForecast.includes('wind')){
            glpyh = 'wind';
        }
        else if (sForecast.includes('lightning') || sForecast.includes('thunder')){
            glpyh = 'bolt';
        }
        //Slight Chance Light Rain
        icon.className = "";
        icon.classList.add('icon');
        icon.classList.add('fa');
        icon.classList.add('fa-' + glpyh);
    }

    std_lower_third.weather_refresh = (function(url){
        var loc_url = !loc_url && url ? url : null;
        return function(url){
            loc_url = !loc_url && url ? url : loc_url;
            return mod_misc.http(loc_url, "GET").then(function(response){
                std_lower_third.updateWeather(response.properties.periods[0].temperature, 
                    response.properties.periods[0].shortForecast.toLowerCase(),
                    response.properties.periods[0].isDaytime
                    );
                return response;
            });
        };
    })();

    std_lower_third.queue_announcements = function(status, announcements, marquee_text){
        var main_line = std_lower_third.el.querySelector('.main_line');
        var sub_line = std_lower_third.el.querySelector('.sub_line');
        var category_tab = std_lower_third.el.querySelector('.category .tab');
        var tri_line = std_lower_third.el.querySelector('.tri_line');
        var marquee = std_lower_third.el.querySelector('.marquee .segment');
       
        console.log('@@@@');
        //var swap_category_at : timestamp
        if(status){
            // setup scope /closuer for tracking things
            var js_view = this;
            var key_ndx = 0;
            var ndx = 0;
            category_tab.textContent = '';
            marquee.textContent = marquee_text;
            (function(){
                announcement_loop = setInterval(function(){
                    var r = Array.isArray(announcements[Object.keys(announcements)[key_ndx]]) 
                        && announcements[Object.keys(announcements)[key_ndx]].length > 0 
                        && announcements[Object.keys(announcements)[key_ndx]].length >= ndx
                    ? announcements[Object.keys(announcements)[key_ndx]][ndx] 
                    : null;
            
                    if(r){
                        category_tab.textContent = Object.keys(announcements)[key_ndx];

                        // TO DO ANIMATE THESE IN / OUT
                        main_line.textContent = r.main_line;
                        sub_line.textContent = r.sub_line;
                        tri_line.textContent = r.tri_line;
                        var inBoundQ = [
                            {
                                element: main_line,
                                animation: 'fadeIn'
                            },
                            {
                                element: sub_line,
                                animation: 'fadeIn'
                            },
                            {
                                element: tri_line,
                                animation: 'fadeIn'
                            },
                        ];
                        
                        if(announcements[Object.keys(announcements)[key_ndx]].length >= ndx + 1){
                            mod_animation.queueAnimationSequence(inBoundQ).then(function(){
                                ndx+=1; 
                            });
                            return;
                        }
                        // else change category
                    }

                    //change category
                    if(Object.keys(announcements).length > key_ndx + 1){
                        // got some left
                        key_ndx+=1
                    }
                    else{
                        //restart
                        key_ndx = 0;
                    }
                    ndx = 0;
                }, 5000);
            })();
        }
        else {
            clearInterval(announcement_loop);
            main_line.textContent = '';
            sub_line.textContent = '';
            category_tab.textContent = '';
            tri_line.textContent = '';
            marquee.textContent = '';
        }
    }

    //zui.factory.page.setActivePage(testPage);
    testPage.redraw();


    // SUB to render function so you can redraw qr codes / weather when needed...
    var cvs = std_lower_third.el.querySelector('.qr_code');
    
    var qrcode = new qrcode(cvs, {
        text: "http://google.com",
        width: 96,
        height: 96
    });
    //new qrcode(cvs, "http://google.com");

    std_lower_third.timer = (function(){
        setInterval(function(){
            var now = luxon.DateTime.local();
            
            var dom_timebox = std_lower_third.el.querySelector('.timebox');
            dom_timebox.textContent = now.toLocaleString(luxon.DateTime.DATETIME_MED_WITH_SECONDS);
        }, 200);
    })();



    function _basicTransitionIn(view){
        document.activeElement.blur();
        var dialog_container = view.el;
        var dialog_body = view.el.querySelector('.zui-dialog-body');
        var dialog_panel = view.el.querySelector('.zui-dialog-panel');
        var inBoundQ = [
            {
                element: dialog_container,
                animation: 'fadeIn'
            },
            {
                element: dialog_body,
                animation: 'fadeInDown'
            },
        ];
        return mod_animation.queueAnimationSequence(inBoundQ).then(function(){
            _prius.activateDialog(view.id);
            if(!_findFocus(view)){
                dialog_panel.focus();
            }
        });
    }

});