define([
    'zui',
    'mod/templating',
    'mod/text'
], function (
    zui,
    mod_templating,
    mod_text
) {
    var MODULE_NAME = "zui_forms_fields";
    // var TOOLBAR_CLASSES = ['toolbar-container'];
    // var TOOLBAR_BUTTON_CLASSES = ['toolbar-button'];

    // TODO -- Add:
    // Array / Object Editors

    // FORM HELPERS
    // -- Change Watcher
    // -- Validation
    // 

    // -- Form Input Creators --
    var _CreateLabel = function (settings) {
        var label = document.createElement('label');
        label.className = ZUI_LABEL_CLASSES.join(' ');
        label.textContent = settings.label;
        label.title = settings.hover_text;
        label.htmlFor = settings.field_name;
        return label;
    };

    var _CreateOutput = function (settings, source) {
        var output = document.createElement('output');
        output.className = ZUI_OUTPUT_CLASSES.join(' ');;
        output.htmlFor = settings.field_name;
        output.title = settings.hover_text;
        output.value = settings.value;
        output.setAttribute("onforminput", "value = " + settings.field_name + ".value;");
        
        if(settings.misc && typeof settings.misc.calculateOutput === "function"){
            output.value = settings.misc.calculateOutput(source, output);
            source.addEventListener('input', function(el){
                output.value = settings.misc.calculateOutput(source);
            });
        }
        else {
            source.addEventListener('change', function(el){
                output.value = el.target.value;
            });
        }
        return output;
    };

    var _CreatePrompt = function (promptText) {
        var prompt = document.createElement('p');
        prompt.className = ZUI_PROMPT_CLASSES.join(' ');;
        prompt.textContent = promptText;
        return prompt;
    };

    var _CreateInput = function (settings) {
        var input = document.createElement('input');
        input.id = settings.field_name;
        input.className = settings.classes.join(' ');
        input.name = settings.field_name;
        input.type = settings.type;
        input.dataset.initial_value = settings.value;
        input.title = settings.hover_text;
        if(settings.disabled){
            input.disabled = true;
        }

        for(var key in settings.attributes){
            input[key] = settings.attributes[key]
        }

        if (settings.type === "checkbox") {
            input.checked = settings.value;
        } else {
            input.value = settings.value;
        }

        return input;
    };

    var _CreateButton = function (settings) {
        settings.classes = Array.isArray(settings.classes) ? settings.classes.concat(ZUI_BUTTON_CLASSES) : ZUI_BUTTON_CLASSES;
        var button = zui.components.button_basic.init_dom.call(this, settings);
        return button
    };

    var _CreateTextArea = function (settings) {
        var area = document.createElement('textarea');
        area.id = settings.field_name;
        area.className = settings.classes.join(' ');
        area.name = settings.field_name;
        area.value = settings.value;
        area.maxLength = MAX_TEXTAREA_LENGTH;
        area.title = settings.hover_text;
        area.dataset.initial_value = settings.value;

        if(settings.disabled){
            area.disabled = true;
        }

        return area;
    };

    var _CreateSelect = function (settings) {
        var select = document.createElement('select');
        select.id = settings.field_name;
        select.className = settings.classes.join(' ');
        select.name = settings.field_name;
        select.title = settings.hover_text;
        select.dataset.initial_value = settings.value;

        if(settings.disabled){
            select.disabled = true;
        }

        for (var opt in settings.options) {
            var option = document.createElement('option');
            option.value = settings.options[opt].value;
            option.textContent = settings.options[opt].label;
            if (settings.options[opt].selected || settings.options[opt].value === settings.value) {
                option.selected = true;
            }
            select.add(option);
        }

        return select;
    };


    var ZUI_FIELD_ROW_CLASSES = ['zui-field-row', "g-row", "g-v-24"];
    var ZUI_INPUT_CLASSES = ['zui-input', "g-col-12"];
    var ZUI_OUTPUT_CLASSES = ['zui-output', "g-col-3"];
    var ZUI_LABEL_CLASSES = ['zui-input-label', 'g-row'];
    var ZUI_PROMPT_CLASSES = ['zui-field-prompt', 'g-row'];
    var ZUI_BUTTON_CLASSES = ['zui-input-button'];
    var ZUI_FIELDSET_CLASSES = ['zui-fieldset'];
    var ZUI_LEGEND_CLASSES = ['zui-legend'];

    var MAX_TEXTAREA_LENGTH = 100000;

    // MODULE ------------------------------------------------------------------------------------------------------------------------ 
    var _forms = {
        create_field_row_basic:function(settings) {
            // settings.options / Select / check list / radios
            // settings.validation[] // required // TBD
            // settings.input_buttons

            settings.classes = settings.classes ? ZUI_INPUT_CLASSES.concat(settings.classes) : ZUI_INPUT_CLASSES;
            settings.field_name = settings.field_name ? settings.field_name : mod_text.random.hexColor();

            var row = document.createElement('div');
            row.className = ZUI_FIELD_ROW_CLASSES.join(' ')
           
            var input = null;
            var row_children = [];
            switch(settings.type){
                case "textarea":
                    input = _CreateTextArea(settings);
                    break;
                case "select":
                    input = _CreateSelect(settings);
                    break;
                case "radio":
                    //row_children.push(_CreateSelect(settings.label, settings.fieldName));
                    break;
                case "checklist":
                    //row_children.push(_CreateSelect(settings.label, settings.fieldName));
                    break;
                case "range":
                    // needs output...
                    // needs additional labels... 
                    input = _CreateInput(settings)
                    row_children.push(_CreateOutput(settings, input));
                    break;
                default:
                    input = _CreateInput(settings);
                    break;
            }

            if(typeof settings.onChange === 'function'){
                input.addEventListener('change', function(ev){
                    settings.onChange(ev);
                });
            }

            row_children.unshift(input);

            if(Array.isArray(settings.buttons)){
                settings.buttons.forEach(function(el, i) {
                    row_children.push(_CreateButton.call(settings, el));
                });
            }

            if(settings.label && settings.type !== "checklist" && settings.type !== "radio"){
                row_children.unshift(_CreateLabel(settings));
            }

            if(settings.prompt){
                row_children.unshift(_CreatePrompt(settings.prompt));
            }

            row_children.forEach(function (el) {
                //debugger;
                row.appendChild(el);
            });

            return row;
        },
        create_fieldset:function(settings){
            var fieldset = document.createElement('fieldset');
            fieldset.id = settings.id ? settings.id : mod_text.random.hexColor();
            fieldset.className =  Array.isArray(settings.classes) ? settings.classes.concat(ZUI_FIELDSET_CLASSES).join(' ') : ZUI_FIELDSET_CLASSES.join(' ');
            
            if(settings.disabled){
                fieldset.disabled = true;
            }

            if(settings.label){
                var label = document.createElement('legend');
                label.className = ZUI_LEGEND_CLASSES;
                label.textContent = settings.label;
                label.title = settings.hover_text;

                label.addEventListener('click', function(ev){
                   console.log(ev.currentTarget, ' clicked');
                    if(ev.currentTarget.parentNode.classList.contains('collapsed')){
                        ev.currentTarget.parentNode.classList.remove('collapsed');
                    }
                    else {
                        ev.currentTarget.parentNode.classList.add('collapsed');
                    }
                });

                fieldset.appendChild(label);
            }

            if(settings.prompt){
                fieldset.appendChild(_CreatePrompt(settings.prompt));
            }

            if(Array.isArray(settings.fields)){
                settings.fields.forEach(function(el, i){
                    fieldset.appendChild(el);
                });
            }

            return fieldset;    
        }
    };

    return _forms;
});
