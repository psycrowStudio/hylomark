define([
    'zuiRoot/models/PageModel',
    'zuiRoot/models/TriggerModel',
    'zuiRoot/models/View'
], function(pageModel, triggerModel, viewModel){
    
    //TODO for each in arguements, apply ZUI common functions (unless already exists)

    return {
        page: pageModel,
        trigger: triggerModel,
        view: viewModel
    };
});