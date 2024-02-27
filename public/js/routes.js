define(['backbone'], function (backbone) {
    console.log('route start');

    var _router = Backbone.Router.extend({
        routes: {
            '': 'home',
            '/': 'home',
        },

        home: function (){
            require(['pages/index/index'], function(index){});
        },
    })

    var zui_router = new _router();
    if(!Backbone.history.start({
        hashChange: false,
        silent: false
    }))
    {
        // 404
    }

    return zui_router;
});