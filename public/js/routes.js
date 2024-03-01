define(['backbone'], function (backbone) {
    console.log('route start');

    var _router = Backbone.Router.extend({
        routes: {
            '': 'home',
            '/': 'home',
            'aff': 'affiliate_login',
            'cli': 'client_login',
        },

        home: function (){
            require(['pages/home/index'], function(index){});
        },
        affiliate_login: function (){
            require(['pages/affiliate_login/index'], function(index){});
        },
        client_login: function (){
            require(['pages/client_login/index'], function(index){});
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