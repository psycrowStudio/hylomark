define([
    'zui'
], function(
    zui, 
){
    var testPage = zui.types.page.fab({ 'title' : 'CLIENT LOGIN', 'isActive': true });
    zui.types.view.fab( { 
        id:'header',
        parent: testPage, 
        template: 'CLIENT LOGIN'
    });

    //zui.factory.page.setActivePage(testPage);
    testPage.redraw();
});