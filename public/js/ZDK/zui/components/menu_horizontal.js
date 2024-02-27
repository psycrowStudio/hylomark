define(['underscore',
'backbone',
'zuiRoot/common',
'zuiRoot/types',
'zuiRoot/logger'], function(_, Backbone, Common, Types, Logger){
//# sourceURL=menu_horizontal.js

// window.zui.componentFactory.registerExternalType("horizontalMenu", (function(settings) {
// 	// manipulate settings

//     var _isTemplateLoaded = false;
//     var _template;

//     try {
//         $.ajax({
//             url: 'js/zui/templates/menu_horizontal.ejs',
//                 dataType: "text",
//                 contentType: 'text/plain;charset=UTF-8',
//                 success: function(ejs) {
//                     _isTemplateLoaded = true;
//                     _template = ejs;
//                     zui.log(ejs, { filter: 'http' });
//                 }
//         }).catch(function(e){});
        
//         // $.get("", {}, function (res) {
//         //     isTemplateLoaded = true;
//         //     template = res;
//         //     //console.log(res);
//         // }, 'text');
//     }
//     catch (ex){}

//     // block on loading until template loads?
//     return function(settings) {
//         if(_isTemplateLoaded)
//         {
//             settings.classes =['horizontalMenu'];
//             settings.template = _template;
//             return window.zui.componentFactory.fabricate(settings);
//         }
//         else
//         {
//             window.zui.log('No template loaded for Horizontal Menu.' , { filter: 'error' });
//         }

//         //tagName: 'li',  // div span etc...
// 		//initialize: function( { console.log('horizontalMenu'); },

// 		// render: function() {
// 			//this.$el.html(this.template(this.model.attributes));
//     		//return this;
// 		//},
// 		//events: {},

// 		//custom view properties and methods
// 		//...
// 	};
// })());

//http://stackoverflow.com/questions/20730201/load-template-by-url-in-backbone-js
// var template = $.get("/templates/needed_template.html")
//                         .done(function (res) {
//                             ns.myView = new MyView({template: res});
//                             ns.myView.render();
//                         })


//                         initialize: function() {
//    this.template = _.template(this.options.template);
});