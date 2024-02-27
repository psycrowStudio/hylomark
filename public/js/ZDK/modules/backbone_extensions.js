define([
    'backbone',
    'underscore',
    'mod/misc'
], function(
    backbone,
    underscore,
    mod_misc
){
    
    function _clone(obj) {
        var c = null;

        if(obj instanceof Backbone.Model || obj instanceof Backbone.Collection){
            c = obj.clone();
        }
        else {
            c = mod_misc.deepClone(obj);
        }
        return c;
    }
    
    // convert an object to JSON
    Backbone.Model.prototype.toJSON = function() {
        // var _recurse_object = function(json){
        //     _.each(json, function(value, name) {
        //         if(_.isFunction((value || "").toJSON)) {
        //             json[name] = value.toJSON();
        //         }
        //         else if(_.isArray(value) || _.isObject(value)){
        //             json[name] = _recurse_object(_.clone(value));
        //         }
        //     });
        //     return json;
        // };

        // if (this._isSerializing) {
        //     return this.id || this.cid;
        // }

        this._isSerializing = true;
        var json = JSON.parse(JSON.stringify(this.attributes));
        this._isSerializing = false;
        return json;
    };

    // convert a JSON data object into our model
    Backbone.Model.prototype.fromJSON = function(json) {
        var _recurse_object = function(attributes, data){
            _.each(data, function(value, name) {
                if(attributes.hasOwnProperty(name) && attributes[name] instanceof Backbone.Model) {
                    attributes[name].fromJSON(data[name]);
                }
                else if(attributes.hasOwnProperty(name) && attributes[name] instanceof Backbone.Collection){
                    attributes[name].reset(data[name]);
                }
                else if(attributes.hasOwnProperty(name) && _.isArray(attributes[name])){
                    attributes[name] = data[name].slice(0);
                }
                else if(attributes.hasOwnProperty(name) && _.isObject(attributes[name])){
                    attributes[name] = _recurse_object(attributes[name], data[name]);
                }

                else {
                    attributes[name] = data[name]
                }
            });
            return attributes;
        };

        try {
            var defaults = _clone(this.defaults);
            json = _recurse_object(defaults, json);
            
            Backbone.Model.apply(this, arguments);
            return true;
        }
        catch(ex){
            // something went wrong with applying the parameters to the model.
            // likly a  serialization issue
            return false;
        }
    };
});