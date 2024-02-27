define(['zuiRoot/models/ComponentModel',
    'zuiRoot/models/PageModel',
    'zuiRoot/models/TriggerModel',
    'zuiRoot/models/View'
], function(componentModel, pageModel, triggerModel, viewModel){
    
    //TODO for each in arguements, apply ZUI common functions (unless already exists)

    return {
        component : componentModel,
        page: pageModel,
        trigger: triggerModel,
        view: viewModel
    };
});