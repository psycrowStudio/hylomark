define([
    'zui'
], function(
    zui, 
){
    var testPage = zui.types.page.fab({ 'title' : 'AFFILIATE LOGIN', 'isActive': true });
    zui.types.view.fab( { 
        id:'header',
        parent: testPage, 
        template: 'AFFILIATE LOGIN'
    });

    //zui.factory.page.setActivePage(testPage);
    testPage.redraw();
});