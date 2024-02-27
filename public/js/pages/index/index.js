define(['zui'], function(zui){
    var testPage = zui.types.page.fab({ 'title' : 'ZUI Trigger Test Page', 'isActive': true });
    zui.types.component.fab( { id:'header', parentModel: testPage } );
    zui.types.component.fab( { id:'content', parentModel: testPage } );
    zui.types.component.fab( { id:'footer', parentModel: testPage } );
    var dialogLayer = zui.components.dialogLayer.addToPage(testPage);
    
    // what is the component below?
    //zui.componentFactory.instantiate( 'horizontalMenu', { id:'mainMenu', parentModel: testPage.components.get('header'),  parentElementSelector: '#header'} );
    zui.types.component.fab({ 
        id:'box_01', 
        parentModel: testPage.findChildView('content'), 
        parentElementSelector: '#content',
        classes:['status-error'],
        events: {
            click: function(e) {
                console.log(this);
                this.model.toggleViewState();

                var settings = {
                    type:'confirm',
                    typeSettings: {
                        query: "Would you care for some lemonade?",
                        buttonLabels: ['Accept', 'Cancel']
                    }
                };
                var confirmation = dialogLayer.triggerDialog(settings).then(function(resolve){
                    console.log('resolved', resolve);
                }).catch(function(error){
                    console.log('rejected', error);
                });

                return false;
            }
        }
    });

    zui.types.component.fab({ 
        id:'box_02', 
        parentModel: testPage.findChildView('content'), 
        parentElementSelector: '#content',
        classes:['status-active'],
        events: {
            click: function(e) {
                console.log(this);
                this.model.toggleViewState();
                
                var settings = {
                    type:'mc',
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

                var confirmation = dialogLayer.triggerDialog(settings).then(function(resolve){
                    console.log('resolved', resolve);
                }).catch(function(error){
                    console.log('rejected', error);
                });

                return false;
            }
        }
    });

    zui.types.component.fab({ 
        id:'box_03', 
        parentModel: testPage.findChildView('content'), 
        parentElementSelector: '#content',
        classes:['status-inactive'],
        events: {
            click: function(e) {
                console.log(this);
                this.model.toggleViewState();
                var settings = {
                    type:'inputField',
                    typeSettings: {
                        query: 'What is your name?',
                        subtype: 'text',
                        buttonLabels: ['Make introduction', 'Nevermind']
                    },
                    
                };

                var confirmation = dialogLayer.triggerDialog(settings).then(function(resolve){
                    console.log('resolved', resolve);
                }).catch(function(error){
                    console.log('rejected', error);
                });
                return false;
            }
        }
    });

    zui.types.component.fab({ 
        id:'box_04', 
        parentModel: testPage.findChildView('content'), 
        parentElementSelector: '#content',
        classes:['status-disabled'],
        events: {
            click: function(e) {
                console.log(this);
                this.model.toggleViewState();
                return false;
            }
        }
    });

    zui.types.component.fab({ 
        id:'box_05', 
        parentModel: testPage.findChildView('content'), 
        parentElementSelector: '#content',
        classes:['status-loading'],
        events: {
            click: function(e) {
                console.log(this);
                this.model.toggleViewState();
                return false;
            }
        }
    });

    zui.types.component.fab({ 
        id:'TriggerSandbox', 
        parentModel: testPage.findChildView('content'), 
        parentElementSelector: '#content',
        class:['status-active'],
        template:'<label>Trigger Timer</label> <input type="number" min="1000" step="500" placeholder="DELAY IN SECONDS"></input>\
                           <button> Start </button> \
                           <input type="checkbox" title="keep alive" class="keepAlive">\
                           <input type="checkbox" title="reset after fire" class="resetAfterFire">\
                           <input type="checkbox" title="sticky" class="sticky">',
        events: {
            click: function(e) {
                if(e.target.nodeName.toLowerCase() === "button") {
                    var button = e.target;
                    var input = this.model.view.el.querySelector('input:valid');

                    if(input && input.value > 0){
                        button.disabled = true;
                        //console.log("Setting " + input.value + "(s) Trigger")
                        this.listenToOnce(this, 'zui-trigger-primed', function(input){ 
                            console.log(arguments, input);
                        }); 


                        var _eval = function(handle){

                            return new Promise(function(resolve, reject) {
                                var _pScope = this;
                                //handle.resolve = resolve;
                                //console.log(resolve);
                                //handle.reject = reject;
                                var delay = Math.floor(Math.random()*(5000-3000+1)+3000);
                                console.log(delay);
                                try{
                                    setTimeout(function(){
                                        console.log('end');
                                        resolve('WINNER');
                                        //reject('Player Died');
                                        //throw "HTTP Error";
                                    }, delay);
                                } catch (err) {
                                    throw err;
                                }

                            });
                        };


                        var trigger = zui.types.trigger.fab(
                            { 
                                target: this.model,
                                keepAlive: this.keepAlive ? this.keepAlive : false,
                                resetAfterFire: this.resetAfterFire ? this.resetAfterFire : false,
                                firedLimit: 3
                            }, 
                            // {
                            //     template: "timer-basic", 
                            //     templateVars:{
                            //         duration:input.value,
                            //         sticky: this.sticky ? this.sticky : false,
                            //     }
                            {
                                template: "function-runner", 
                                templateVars:{
                                    evalPredicate: _eval,
                                    evaluationTimeout: -1
                                }
                        });
                        trigger.prime();
                        this.model.listenToOnce(trigger, "zui-trigger-consumed", function(event){
                            button.disabled = false;
                        });
                        this.model.listenToOnce(trigger, "zui-trigger-evaluation-error", function(event){
                            button.disabled = false;
                        });

                    }
                    return false;
                }
                else if(e.target.nodeName.toLowerCase() === 'input' && e.target.classList.contains('keepAlive'))
                {
                    this.keepAlive = e.target.checked;
                }
                else if(e.target.nodeName.toLowerCase() === 'input' && e.target.classList.contains('resetAfterFire')){
                    this.resetAfterFire = e.target.checked;
                }
                else if(e.target.nodeName.toLowerCase() === 'input' && e.target.classList.contains('sticky')){
                    this.sticky = e.target.checked;
                }

            }
        }
    });
   
    //zui.factory.page.setActivePage(testPage);
    testPage.redraw();
});