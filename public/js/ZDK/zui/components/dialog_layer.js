define([
    'zuiRoot/common',
    'zuiRoot/logger', 
    'zuiRoot/types',
    'mod/dom_helper',
    'mod/animation',
    "zuiRoot/view_templates/dialogs",
    "zuiRoot/components/collection_viewer",
], 
    function(
        Common, 
        Logger, 
        Types,
        mod_dom,
        mod_animation,
        dialogs,
        zui_collection_viewer
    ){
        var MODULE_NAME = "zui_dialog_layer";
        var LOADING_DIALOG_CLASS = "zui-loading-dialog";

        var _openDialogs = [];
        var loadingCount = 0;
        var _active;
        var _activeLoading;
        var _prius;

        // TODO save current focus element, and restore after?


        // AKA -- floating panel
        var _createBaseDialog = function(settings) {
            // TODO specific logic for modal type behavior
            
            var base_settings = {
                glyph_code: settings.glyph_code ? settings.glyph_code : undefined,
                title: settings.title ? settings.title : "",

                title_bar_buttons: settings.title_bar_buttons ? settings.title_bar_buttons : [],
                button_bar_buttons: settings.button_bar_buttons ? settings.button_bar_buttons : [],

                draggable: settings.draggable === false ? false : true,
                resizable: settings.resizable === false ? false : true,
                showTitleBar: settings.showTitleBar === false ? false : true,
                showTitleBarButtons: settings.showTitleBarButtons === false ? false : true,
                showButtonBar: settings.showButtonBar === false ? false : true,
                showOverlay: settings.showOverlay === false ? false : true
            };
            
            var dialog = Types.view.fab({  
                parent: this,
                insertionSelector: '.dialogContainer',
                classes: [
                    "zui-dialog",
                    (settings.draggable === false ? "" : "zui-drag"), 
                    (settings.showOverlay === false ? "" : "darken")],
                template: dialogs.templates['base'].compile(base_settings),
                events: {
                    'zui-dialog-resolution': function(e) {
                        console.log('Resolved Event:', e, this);
                        payload = !e && !e.detail ? {} : e.detail;

                        this.parentView.resolveDialog(this.id, true, payload);
                    },
                    'zui-dialog-rejection': function(e) {
                        console.log('Rejected Event:', e, this);
                        payload = !e && !e.detail ? {} : e.detail;

                        this.parentView.resolveDialog(this.id, false, payload);
                    },
                    'keydown': function(e){
                        if(e.keyCode === 27 && this.el.classList.contains('active')){
                            //ESC KEY
                            for(var i in base_settings.title_bar_buttons) {
                                if(base_settings.title_bar_buttons[i].hotkey_code === 27) {
                                    if(Array.isArray(base_settings.title_bar_buttons[i].classes) && base_settings.title_bar_buttons[i].classes.indexOf("dismissPanel") > -1){
                                        this.parentView.resolveDialog(this.id, false);
                                    }
                                    else if(typeof base_settings.title_bar_buttons[i].onClick === 'function'){
                                        base_settings.title_bar_buttons[i].onClick(this, e);
                                    }
                                }
                            }

                            for(var i in base_settings.button_bar_buttons) {
                                if(base_settings.button_bar_buttons[i].hotkey_code === 27) {
                                    if(Array.isArray(base_settings.button_bar_buttons[i].classes) && base_settings.button_bar_buttons[i].classes.indexOf("dismissPanel") > -1){
                                        this.parentView.resolveDialog(this.id, false);
                                    }
                                    else if(typeof base_settings.button_bar_buttons[i].onClick === 'function'){
                                        base_settings.button_bar_buttons[i].onClick(this, e);
                                    }
                                }
                            }

                            return false;
                        }
                        if(e.keyCode === 13 && this.el.classList.contains('active') && document.activeElement.tagName.toLocaleLowerCase() !== "button")
                        {
                            //ENTER KEY
                            for(var i in base_settings.button_bar_buttons) {
                                if(base_settings.button_bar_buttons[i].hotkey_code === 13) {
                                    if(Array.isArray(base_settings.button_bar_buttons[i].classes) && base_settings.button_bar_buttons[i].classes.indexOf("confirmPanel") > -1){
                                        this.parentView.resolveDialog(this.id, true);
                                    }
                                    else if(typeof base_settings.button_bar_buttons[i].onClick === 'function'){
                                        base_settings.button_bar_buttons[i].onClick(this, e);
                                    }
                                }
                            }
                            return false;
                        }
                    },
                    'click .zui-dialog-title-bar button:not(.dismissPanel):not(.confirmPanel)': function(e) {
                        var index = parseInt(e.currentTarget.getAttribute('data-index'));
                        if(typeof base_settings.title_bar_buttons[index].onClick === 'function'){
                            base_settings.title_bar_buttons[index].onClick(this, e);
                        }

                        return false;
                    },
                    'click .zui-dialog-button-bar button:not(.dismissPanel):not(.confirmPanel)': function(e) {
                        var index = parseInt(e.currentTarget.getAttribute('data-index'));
                        if(typeof base_settings.button_bar_buttons[index].onClick === 'function'){
                            base_settings.button_bar_buttons[index].onClick(this, e);
                        }

                        return false;
                    },
                    'click .zui-dialog-title-bar .dismissPanel': function(e) {
                        console.log('Dismiss Panel', e, this);

                        var index = parseInt(e.currentTarget.getAttribute('data-index'));
                        if(Array.isArray(base_settings.title_bar_buttons) && typeof base_settings.title_bar_buttons[index].onClick === 'function'){
                            this.parentView.resolveDialog(this.id, false, base_settings.title_bar_buttons[index].onClick(this, e));
                        }
                        else {
                            this.parentView.resolveDialog(this.id, false);
                        }

                        return false;
                    },
                    'click .zui-dialog-title-bar .confirmPanel': function(e) {
                        console.log('Confirm Panel', e, this);

                        var index = parseInt(e.currentTarget.getAttribute('data-index'));
                        if(Array.isArray(base_settings.title_bar_buttons) && typeof base_settings.title_bar_buttons[index].onClick === 'function'){
                            this.parentView.resolveDialog(this.id, true, base_settings.title_bar_buttons[index].onClick(this, e));
                        }
                        else {
                            this.parentView.resolveDialog(this.id, true);
                        }
                        return false;
                    },
                    'click .zui-dialog-button-bar .dismissPanel': function(e) {
                        console.log('Dismiss Panel', e, this);

                        var index = parseInt(e.currentTarget.getAttribute('data-index'));
                        if(Array.isArray(base_settings.button_bar_buttons) && typeof base_settings.button_bar_buttons[index].onClick === 'function'){
                            this.parentView.resolveDialog(this.id, false, base_settings.button_bar_buttons[index].onClick(this, e));
                        }
                        else {
                            this.parentView.resolveDialog(this.id, false);
                        }

                        return false;
                    },
                    'click .zui-dialog-button-bar .confirmPanel': function(e) {
                        console.log('Confirm Panel', e, this);

                        var index = parseInt(e.currentTarget.getAttribute('data-index'));
                        if(Array.isArray(base_settings.button_bar_buttons) && typeof base_settings.button_bar_buttons[index].onClick === 'function'){
                            this.parentView.resolveDialog(this.id, true, base_settings.button_bar_buttons[index].onClick(this, e));
                        }
                        else {
                            this.parentView.resolveDialog(this.id, true);
                        }
                        return false;
                    },
                    'mousedown .zui-dialog-title-bar' : function(e) {
                        if(this.el.classList.contains('zui-drag')){
                            _startDrag.call(this,e);
                        }
                    },
                    'mousedown .zui-dialog-panel': function(e){
                        this.parentView.activateDialog(this.id);
                    },
                    'click .zui-dialog-panel':function(e){
                        // this captures any panel click, preventing it from propigating to the page
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        return false;
                    },
                    'mousedown .resize-N': function(e) {
                        _startResizePanel.call(this,'N', e);
                    },
                    'mousedown .resize-NE': function(e) {
                        _startResizePanel.call(this,'NE', e);
                    },
                    'mousedown .resize-NW': function(e) {
                        _startResizePanel.call(this,'NW', e); 
                    },
                    'mousedown .resize-S': function(e) {
                        _startResizePanel.call(this, 'S', e); 
                    },
                    'mousedown .resize-SE': function(e) {
                        _startResizePanel.call(this,'SE', e);  
                    },
                    'mousedown .resize-SW': function(e) {
                        _startResizePanel.call(this,'SW', e);
                    },
                    'mousedown .resize-E': function(e) {
                        _startResizePanel.call(this,'E', e);
                    },
                    'mousedown .resize-W': function(e) {
                        _startResizePanel.call(this,'W', e);
                    }
                },
                autoInsert: settings.autoInsert
            });

            return dialog;
        };

        var _createTypedDialog = function(dialogType, settings) { 
            var default_accept_button = {
                label:"OK",
                glyph_code:"check",
                hover_text: "OK",
                classes: ["confirmPanel"],
                hotkey_code: 13 
            };

            var default_reject_button = {
                label:"Cancel",
                glyph_code:"times",
                hover_text: "Cancel",
                classes: ["dismissPanel"]
            };

            var default_x_button = {
                label:"",
                glyph_code:"times",
                hover_text: "Cancel",
                classes: ["dismissPanel"],
                hotkey_code: 27 
            };
            
            if(dialogType === "confirm"){
                // button labels in typeSettings
                var confirm_label = Array.isArray(settings.typeSettings.buttonLabels) && settings.typeSettings.buttonLabels.length == 2? settings.typeSettings.buttonLabels[0] : "Yes";
                var decline_label = Array.isArray(settings.typeSettings.buttonLabels) && settings.typeSettings.buttonLabels.length == 2? settings.typeSettings.buttonLabels[1] : "No";

                settings.glyph_code = settings.glyph_code || "alert"; 
                settings.title_bar_buttons = [];
                settings.button_bar_buttons = settings.button_bar_buttons || [
                    {
                        label: confirm_label,
                        glyph_code:"check",
                        hover_text: confirm_label,
                        hotkey_code: 13,
                        classes: ["confirmPanel"]
                    },
                    {
                        label: decline_label,
                        glyph_code:"times",
                        hover_text: decline_label,
                        hotkey_code: 27,
                        classes: ["dismissPanel"]
                    }
                ];
                dialogType = "info"; // the remaining details are the same as info

            } 
            else if(dialogType === "error"){                
                settings.classes.append('zui-error-dialog');
                settings.glyph_code = settings.glyph_code || "alert"; 
                settings.title_bar_buttons = [];
                settings.button_bar_buttons = settings.button_bar_buttons || [
                   default_accept_button
                ];

                dialogType = "info"; // the remaining details are the same as info
            }
            else if(dialogType === "info"){       
                settings.button_bar_buttons = settings.button_bar_buttons || [default_accept_button];
            }
            else if(dialogType === "mc"){       
                settings.title_bar_buttons = settings.title_bar_buttons || [default_x_button];
            }
            else if(dialogType === "input"){       
                var default_input_accept_button = {
                    label:"OK",
                    glyph_code:"check",
                    hover_text: "OK",
                    hotkey_code: 13,
                    onClick: function(view, ev){
                        console.log("input OK");
                        var inputField = view.el.querySelector('.dialog-input').value;
                        
                        // validate input
                        if(inputField){
                            mod_dom.raiseCustomEvent("zui-dialog-resolution", inputField, dialog.el);
                        }
                        else {
                            // validation failed...
                            console.error("Input cannot be blank...");
                        }
                    }
                };
                
                settings.title_bar_buttons = settings.title_bar_buttons || [default_x_button];
                settings.button_bar_buttons = [default_input_accept_button];
            }

            var dialog = _createBaseDialog.call(this, settings);
            dialog.listenTo(dialog, 'post-render', function(){
                var content_box = dialog.el.querySelector('.zui-dialog-content');
                var content = "";
                switch(dialogType){
                    case "info":
                        content = dialogs.templates['info'].compile(settings.typeSettings);
                        break;
                    case "input":
                        content = dialogs.templates['input'].compile(settings.typeSettings);
                        break;
                    case "mc":
                        content = dialogs.templates['mc'].compile(settings.typeSettings);
                        break;
                    case "custom":
                        content = _compileTemplate.call(this, settings.typeSettings.content, settings.typeSettings);
                        break;
                }
    
                if(mod_dom.isDomObject(content)){
                    content_box.insertAdjacentElement('beforeend', content);
                } else if(content){
                    content_box.insertAdjacentHTML('beforeend', content);
                }

                switch(dialogType){
                    case "mc": 
                        var list_settings = {
                            dataset: settings.typeSettings.buttons,
                            insertionSelector: ".mc-box",
                            parent: dialog,
                            generateItemSettings:  settings.typeSettings.generateItemSettings ? settings.typeSettings.generateItemSettings : function(el, i){
                                return {
                                    label: el.label,
                                    hover_text: el.label,
                                    value: el.value
                                };
                            },
                            onClick:function(view, ev){
                                console.log("dialog item picked", view.model[ev.currentTarget.id.split('_')[1]]);
                                
                                mod_dom.raiseCustomEvent("zui-dialog-resolution", view.model[ev.currentTarget.id.split('_')[1]], dialog.el);
                            }
                        };

                        var list =  zui_collection_viewer.createListViewer(list_settings);
                        list.render();
                    break;
                }
            });

            return dialog;
        };

        var _compileTemplate = function(content, settings){
            if(content === null){
                return '';
            } else if(typeof content === 'string'){
                return content;
            } else if(typeof content === 'function'){
                return content(settings);
            }
            else if(content.compile){
                return content.compile(settings);
            }
            else {
                return '';
            }
        };

        var _activateDialog = function(dialog){
            _prius.toggleLayer(true);

            dialog.autoInsert = true;
            dialog.render();

            _openDialogs.push(dialog);
            _prius.activateDialog(dialog.id);
            return _basicTransitionIn(dialog);
        };

        function _addPromiseToView(view){
            var generator = function(handle){
                var promise = new Promise(function(resolve, reject){
                    handle.resolve = resolve;
                    handle.reject = reject;
                });
                view.handle = handle;
                return promise;
            };

            return Common.QuerablePromise.call(view, generator);
        }

        function _findFocus(view){
            var af = view.el.querySelector('.autofocus');
            if(af){
                af.focus();
                return true;
            }
            
            var firstButton = view.el.querySelector('.zui-dialog-button-bar .buttons button:first-child');
            if(firstButton) {
                firstButton.focus();
                return true;
            }

            return false;
        }

        return {
            current: function(){ return _prius; },
            addToPage: function(page){
               
                // setup a page level listener, helpful for click offs and other event tracking
                //    page.view.el.addEventListener('click', function(e){
                //         if(_active && !e.target.classList.contains('zui-dialog-panel')){
                //             console.log('clicked');
                //         }
                //         //             console.log('deactivating non-modal dialogs...');
                //         //             this.activateDialog();
                //         //         }
                    
                //    });

                page.view.delegateEvents({
                    "click": function(ev){
                        if(_active){
                            console.log('deactivating non-modal dialogs...');
                            _prius.activateDialog();
                        }
                    }
                });
               
                _prius = Types.view.fab({ 
                    id:'dialogLayer', 
                    parent: page,
                    classes: ['zui-hidden'],
                    template:'',
                    events:{
                        // 'mouseup' : function(e) {
                        //     _stopDrag.call(this,e);
                        // },
                        // 'click' : function(e) {
                        //     if(e.target.classList.contains('zui-dialog') || e.target.classList.contains('zui-dialog-body')){
                        //         console.log('deactivating non-modal dialogs...');
                        //         this.activateDialog();
                        //     }
                        // }
                    }
                });

                _prius.triggerDialog = this.triggerDialog.bind(_prius);
                _prius.toggleLayer = this.toggleLayer.bind(_prius);
                _prius.resolveDialog = this.resolveDialog.bind(_prius);
                _prius.activateDialog = this.activateDialog.bind(_prius);

                // grid adds
                _prius.triggerLoading = this.triggerLoading.bind(_prius);
                _prius.clearLoading = this.clearLoading.bind(_prius);
                return _prius;
            },
            triggerLoading: function (loadingMessage) {
                var loadingContainer = _activeLoading ? _activeLoading : null;
                if (!loadingContainer) {
                    this.toggleLayer(true);

                    loadingCount = 0;
                    
                    var loading_settings = {
                        resizable: false,
                        label: loadingMessage !== undefined ? loadingMessage : "Loading..."
                    };

                    loadingContainer = Types.view.fab({  
                        parent: this,
                        classes: ["zui-dialog", LOADING_DIALOG_CLASS, 'darken'],
                        template: dialogs.templates['loading'].compile(loading_settings),
                        dialogType: "loading",
                        events: { }
                    });

                    _activeLoading = loadingContainer;
                    loadingContainer.render();

                    _basicTransitionIn(loadingContainer);
                }

                loadingCount++;
                return loadingContainer.id;
            },
            clearLoading: function (clearAll) {
                if (loadingCount > 1 && !clearAll) {
                    loadingCount--;
                }
                else if (loadingCount === 1 || clearAll === true) {
                    _basicTransitionOut(_activeLoading).then(function(res){
                        _activeLoading.el.parentNode.removeChild(_activeLoading.el);
                        _prius.removeView(_activeLoading);
                        _activeLoading = null;
                        loadingCount = 0;

                        if(_openDialogs.length === 0){
                            _prius.toggleLayer(false);
                        }
                    });
                }
            },

            triggerDialog:function(dialogType, settings){
                // TODO Consider how to return the dialog ID to the callee

                var base_settings = {
                    glyph_code:  "globe",
                    resizable: true,
                    draggable: true
                }

                settings = settings || base_settings;
                
                for(key in base_settings){
                    settings[key] = settings.hasOwnProperty(key) ? settings[key] : base_settings[key];
                }

                var dialog =_createTypedDialog.call(this, dialogType, settings);

                return _activateDialog.call(this, dialog).then(function(){
                    return _addPromiseToView.call(this, dialog);
                });
            },

            toggleLayer: function(state){ 
                if(state === true){
                    this.el.classList.remove('zui-hidden');
                }
                else if(state === false) {
                    this.el.classList.add('zui-hidden');
                }
                else {
                    this.el.classList.toggle('zui-hidden');
                }
            },
            resolveDialog: function(id, state, settings){
                console.log('resolving dialog', id, settings);
                var activeInstance = _openDialogs.find(function(item){ return item.id === id; });
                if(activeInstance) { 
                    if(state === true) {
                        activeInstance.handle.resolve(settings || true);
                    }
                    else {
                        activeInstance.handle.reject(settings || false)
                    }

                    _basicTransitionOut(activeInstance).then(function(res){
                        if(activeInstance.el && activeInstance.el.parentNode){
                            activeInstance.parentView.removeView(activeInstance);
                            activeInstance.el.parentNode.removeChild(activeInstance.el);                            
                            _openDialogs.splice(_openDialogs.indexOf(activeInstance), 1);
                            _active = null;
                        }

                        if(_openDialogs.length === 0){
                            _prius.toggleLayer(false);
                        }
                    });
                }
            },
            activateDialog: function(id){
                if(!id) {
                    if(_active)
                    {
                        console.log('Deactivating:', _active.id);
                        _active.el.classList.remove('active');
                    }
                    _active = null;
                }
                else {
                    
                    var next = _openDialogs.find(function(item){ return item.id === id; });
                    if(next && next != _active){
                        console.log('Activating:', id);
                        if(_active)
                        {
                            _active.el.classList.remove('active');
                        }
                        
                        next.el.classList.add('active');
                        _active = next;
                    }
                }
            }
        };

        // animation helpers
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

        function _basicTransitionOut(view){
            document.activeElement.blur();
            var dialog_container = view.el;
            var dialog_body = view.el.querySelector('.zui-dialog-body');
            var outBoundQ = [
                {
                    element: dialog_body,
                    animation: 'fadeOutUp'
                },
                {
                    element: dialog_container,
                    animation: 'fadeOut'
                },
            ];
            return mod_animation.queueAnimationSequence(outBoundQ)
        }

        // Dialog Move & Resize Helpers
        function _move(x,y) {
            var rawX =  x;
            rawX = rawX < this.box_x_zero ? this.box_x_zero : rawX;
            rawX = rawX > window.innerWidth - (this.offsetWidth - this.box_x_zero) ? window.innerWidth - (this.offsetWidth - this.box_x_zero) : rawX;

            var rawY = y;
            rawY = rawY < this.box_y_zero  ? this.box_y_zero : rawY;
            rawY = rawY > window.innerHeight - (this.offsetHeight - this.box_y_zero) ? window.innerHeight - (this.offsetHeight - this.box_y_zero) : rawY;

            this.style.left = rawX + "px";
            this.style.top  = rawY + "px";
        }

        function _mouseMoveHandler(e) {
            e = e || window.event;
        
            if(!this.isDragging){ return true };
        
            //console.log('dragging!');

            var offsetX = this.offsetX;
            var offsetY = this.offsetY;

            var x = e.clientX; //_mouseX(e);
            var y = e.clientY;//_mouseY(e);
            if (x != offsetX || y != offsetY) {
                _move.call(this, x - offsetX, y - offsetY);
                offsetX = x;
                offsetY = y;
            }
            return false;
        };

        function _startDrag(e) {
            e = e || window.event;
      
            var dialog_body = this.el.querySelector('.zui-dialog-body');
            var body_rect = dialog_body.getBoundingClientRect();

            var dialog_panel = this.el.querySelector('.zui-dialog-panel');
            var panel_rect = dialog_panel.getBoundingClientRect();

            var rect = body_rect;
            
            dialog_panel.box_x_zero = -body_rect.left;
            dialog_panel.box_y_zero = -body_rect.top;

            console.log('starting drag...', rect);
            dialog_panel.offsetX = e.clientX - (panel_rect.left -body_rect.left);
            dialog_panel.offsetY = e.clientY - (panel_rect.top -body_rect.top);
            dialog_panel.isDragging = true;
            var _scope = this;

            this.el.onmousemove = function(ev){
                _mouseMoveHandler.call(dialog_panel, ev);
                return false;
            };

            this.el.onmouseup = function(ev){
                dialog_panel.isDragging = false;
                _stopDrag.call(_scope, ev);
                return false;
            };
            
            // TODO setup an automatic time-out for this drag
            // useful for when mouseup happens outside the window

            return false;
        }

        function _stopDrag() {
            this.isDragging = false;      
      
            console.log('stopping drag...');
            this.el.onmousemove = null;
            this.el.onmouseup = null;
            return false;
        }

        function _resizePanel(direction, e){
            //TODO add in a check for minimum size (stored on model?)

            e = e || window.event;
        
            if(!this.isResizing){ return true };      
            var resizeX = this.resizeMouseX;
            var resizeY = this.resizeMouseY;

            var originalW = this.resizeW;
            var originalH = this.resizeH;
            var originalLeft = this.resizeX;
            var originalTop = this.resizeY;

            var _adustEast = function(){
                var diffX = e.clientX - resizeX;
                this.style.width = (originalW + diffX) + 'px';
            };

            var _adustWest = function(){
                var diffX = resizeX - e.clientX;
                this.style.left = (originalLeft - diffX) + 'px';
                this.style.width = (originalW + diffX) + 'px';
            };

            var _adjustNorth = function(){
                var diffY = resizeY - e.clientY;
                this.style.top = (originalTop - diffY) + 'px';
                this.innerEdge.style.height = (originalH + diffY) + 'px';
            };

            var _adjustSouth = function(){
                var diffY = e.clientY - resizeY;
                this.innerEdge.style.height = (originalH + diffY) + 'px';
            };

            if(direction === 'E') {
                _adustEast.call(this);
            } 
            else if(direction === 'W') {
                _adustWest.call(this);
            } 
            else if(direction === 'N') {
                _adjustNorth.call(this);
            } 
            else if(direction === 'S') {
                _adjustSouth.call(this);
            }
            else if(direction === 'NE') {
                _adustEast.call(this);
                _adjustNorth.call(this);
            } 
            else if(direction === 'NW') {
                _adjustNorth.call(this);
                _adustWest.call(this);
            } 
            else if(direction === 'SE') {
                _adjustSouth.call(this);
                _adustEast.call(this);
            } 
            else if(direction === 'SW') {
                _adjustSouth.call(this);
                _adustWest.call(this);
            }
        };

        function _startResizePanel(direction, e){
            e = e || window.event;

            var dialog_body = this.el.querySelector('.zui-dialog-body');
            var body_rect = dialog_body.getBoundingClientRect();

            var dialog_panel = this.el.querySelector('.zui-dialog-panel');
            var panel_rect = dialog_panel.getBoundingClientRect();
            var inner_edge = this.el.querySelector('.edge');
        
            var rect = panel_rect;
            dialog_panel.resizeMouseX = e.clientX;
            dialog_panel.resizeMouseY = e.clientY;
            dialog_panel.resizeX = (panel_rect.left -body_rect.left) //rect.left;
            dialog_panel.resizeY = (panel_rect.top -body_rect.top) //rect.top;
            dialog_panel.resizeW = rect.width;
            dialog_panel.resizeH = rect.height;
            dialog_panel.isResizing = true;
            dialog_panel.innerEdge = inner_edge; // used to adjust height with our new grid layout

            var _scope = this;
            _prius.parentView.view.el.onmousemove = function(ev){
                _resizePanel.call(dialog_panel, direction, ev);
                return false;
            };

            _prius.parentView.view.el.onmouseup = function(ev){
                dialog_panel.isResizing = false;
                _stopResizePanel.call(_scope);
                return false;
            };
        };

        function _stopResizePanel(){
            console.log('Stopping Resize...');
            this.isResizing = false;
            _prius.parentView.view.el.onmousemove = null;
            _prius.parentView.view.el.onmouseup = null;
            return false;
        };
    });
    //TYPES: blank, text input, text area, MC & bool, 