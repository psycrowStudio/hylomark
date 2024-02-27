define([
    'hy-module/text'
],
    function (
        text
    ) {
        return (function () {
            // BluePrint serves as our multipurpose model binding framework
            // used correctly this module can save you time and headache when dealing with data editing via forms.

            // TO BIND DATA:
            //NewBluePrint(your_object)

            // TO BIND FORMS:
            //BindToData(where this form is in the object hierarchy, dom_element, is_this_a_dict_key_field)

            var _bp = {
                Data: {
                    Clean: {
                        Json: [],
                        BluePrint: []
                    },
                    Dirty: {
                        Json: [],
                        BluePrint: []
                    }
                },
                CreateBluePrint: function (originalObject, parentIndex) {
                    return (function (o, p) {
                        var blueprint = [];
                        Object.keys(o).forEach(function (key, index) {
                            var value = o[key];
                            var bpo = _bp.CreateBlueprintPropertyObject(key, value, index, p);
                            _bp.Data.Clean.BluePrint[_bp.CurrentBluePrintIndex()].push(bpo);
                        });
                    })(originalObject, parentIndex);
                },
                NewBluePrint: function (originalObject) {
                    return (function (o) {
                        _bp.Data.Clean.BluePrint.push(new Array());
                        _bp.Data.Clean.Json.push(o);
                        _bp.CreateBluePrint(o);
                    })(originalObject);
                },
                PopData: function () {
                    return (function () {
                        return (_bp.Data.Clean.Json.pop() && _bp.Data.Clean.BluePrint.pop())
                    })();
                },
                PushToBluePrint: function (obj) {
                    return (function () {
                        _bp.Data.Clean.Json.push(obj);
                        _bp.Data.Clean.BluePrint.push(_bp.CreateBluePrint(obj));
                    })();
                },
                RemoveBluePrint: function (hierarchy) {
                    return (function (h) {
                        var hArr = h.split(':');
                        var parentHa = null;
                        var thisChildIndex = null;

                        if (hArr.length > 1) {
                            thisChildIndex = hArr.splice(hArr.length - 1)[0];
                            parentHa = hArr.join(':');
                        }

                        var isChildRx = RegExp('^' + h + '.*');
                        var isSiblingRx = RegExp('^' + parentHa + ':.*');
                        var isDirectSiblingRx = RegExp('^' + parentHa + ':\\d+$');
                        var isParentRx = RegExp('^' + parentHa + '$');

                        // items to remove
                        var itemsToRemove = [];
                        var directSiblings = [];
                        var directSiblingDescendants = [];
                        var parentObj = null;

                        var sortedBP = _bp.Data.Clean.BluePrint[_bp.CurrentBluePrintIndex()].sort(_bp.SortByHierarchyLength);
                        //console.log"Pre-Delete Sorted Count: ", sortedBP.length);
                        for (var z = 0; z < sortedBP.length; z++) {
                            var hTemp = sortedBP[z].hierarchy;

                            if (sortedBP[z].hierarchy === h) {
                                //console.log'bp removing: ', z, sortedBP[z]);
                                itemsToRemove.push(z);
                            }
                            else if (isChildRx.test(hTemp)) {
                                //console.log'bp removing child: ', z, sortedBP[z]);
                                itemsToRemove.push(z);
                            }
                            else if (parentHa && isDirectSiblingRx.test(hTemp)) {
                                //console.log'bp found direct sibling: ', z, sortedBP[z]);
                                directSiblings.push(z);
                            }
                            else if (parentHa && isSiblingRx.test(hTemp)) {
                                //console.log'bp found direct sibling descendants: ', z, sortedBP[z]);
                                directSiblingDescendants.push(z);
                            }
                            else if (isParentRx.test(hTemp)) {
                                parentObj = sortedBP[z];
                            }
                        }

                        if (parentObj && (parentObj.type === 'array' || parentObj.type === 'object')) {
                            //console.log'array found');


                            directSiblings.forEach(function (itemIndex, index) {
                                var hBeforeRenumber = sortedBP[itemIndex].hierarchy;

                                //console.log'renumber sibling:');

                                if (parentObj && parentObj.type === 'array') {
                                    sortedBP[itemIndex].keyName = '' + index;
                                    parentObj.value.splice(thisChildIndex, 1);
                                }
                                else {
                                    ////console.logparentObj, parentObj.value);
                                    //TODO -- need to delete property from obj here?
                                }

                                sortedBP[itemIndex].hierarchy = parentHa + ':' + index;

                                var hAfterRenumber = sortedBP[itemIndex].hierarchy;

                                if (hBeforeRenumber !== hAfterRenumber) {
                                    var belongsToThisSiblingRx = RegExp('^' + hBeforeRenumber + ':');

                                    var dsd = directSiblingDescendants.filter(function (d) { return belongsToThisSiblingRx.test(sortedBP[d].hierarchy); });

                                    for (var z = 0; z < dsd.length; z++) {
                                        //console.log'renumber sibling descendant:');
                                        var item = sortedBP[dsd[z]];
                                        item.hierarchy = item.hierarchy.replace(belongsToThisSiblingRx, hAfterRenumber + ':');
                                    }
                                }
                            });
                        }

                        // reverse before deleting, otherwise our indicies are incorrect. 
                        itemsToRemove.sort(function (a, b) {
                            return b - a;
                        }).forEach(function (itemIndex) {
                            //console.log'removing: ', itemIndex);
                            sortedBP.splice(itemIndex, 1);
                        });

                        //console.log"Parent: ", parentObj);
                        //console.log"Sorted Count: ", sortedBP.length);

                        _bp.Data.Clean.BluePrint[_bp.CurrentBluePrintIndex()] = sortedBP;

                        //console.log"BP Count: ", _bp.Data.Clean.BluePrint[_bp.CurrentBluePrintIndex()].length);

                    })(hierarchy);
                },
                RemoveBluePrintByKeyName: function (keyName, underH) {
                    return (function (kn, uh) {

                        var isChildRx = uh ? RegExp('^' + uh + ':.*') : null;

                        var sortedBP = _bp.Data.Clean.BluePrint[_bp.CurrentBluePrintIndex()].sort(_bp.SortByHierarchyLength);

                        for (var z = 0; z < sortedBP.length; z++) {
                            if (kn === sortedBP[z].keyName && isChildRx.test(sortedBP[z].hierarchy)) {
                                //console.log'found the keyname', sortedBP[z]);
                                return _bp.RemoveBluePrint(sortedBP[z].hierarchy);
                            }
                        }
                    })(keyName, underH);
                },
                // OUTPUT
                BuildObjectFromBluePrint: function () {
                    return (function () {
                        var objArr = _bp.Data.Clean.BluePrint[_bp.CurrentBluePrintIndex()];
                        var parsedBp = {};
                        var sortedBP = objArr.sort(_bp.SortByHierarchyLength);

                        for (var z = 0; z < sortedBP.length; z++) {
                            if (sortedBP[z].children) {
                                delete sortedBP[z].children;
                            }

                            var h = sortedBP[z].hierarchy.split(':');
                            if (h.length === 1) {
                                // build top level:
                                parsedBp[h[0]] = sortedBP[z];

                            }
                            else {
                                // build children
                                var first = h.shift();
                                var topLevel = parsedBp[first];

                                var builtObject = topLevel;
                                var lastLevel = builtObject;
                                nxt = h.shift();

                                while (nxt) {
                                    if (!lastLevel.children) {
                                        lastLevel.children = {};
                                        lastLevel.children[nxt] = sortedBP[z];
                                    }
                                    else if (h.length === 0) {
                                        lastLevel.children[nxt] = sortedBP[z];
                                        lastLevel = lastLevel.children[nxt];
                                    }
                                    else {
                                        lastLevel = lastLevel.children[nxt];
                                    }


                                    nxt = h.shift();
                                }
                                topLevel = builtObject;
                                ////console.logsortedBP[z].hierarchy, sortedBP[z]);
                            }
                        }
                        ////console.logparsedBp);


                        var recursiveOutputObjectBuilder = function (itemToOutput) {
                            if (itemToOutput.type.toLowerCase() !== 'array' && itemToOutput.type.toLowerCase() !== 'object') {
                                return itemToOutput.type.toLowerCase() !== 'number' ? itemToOutput.value : parseFloat(itemToOutput.value);
                            }
                            else if (itemToOutput.type.toLowerCase() === 'array') {
                                if (!itemToOutput.children) {
                                    return [];
                                }
                                else {
                                    var arr = [];
                                    for (var key in itemToOutput.children) {
                                        arr[key] = recursiveOutputObjectBuilder(itemToOutput.children[key]);
                                    }
                                    return arr;
                                }
                            } else if (itemToOutput.type.toLowerCase() === 'object') {
                                if (!itemToOutput.children) {
                                    return {};
                                }
                                else {
                                    var obj = {};
                                    for (var key2 in itemToOutput.children) {
                                        obj[itemToOutput.children[key2].originalKeyName] = recursiveOutputObjectBuilder(itemToOutput.children[key2]);
                                    }
                                    return obj;
                                }
                            }
                        };

                        var output = {};
                        for (var key in parsedBp) {
                            var item = parsedBp[key];
                            output[item.originalKeyName] = recursiveOutputObjectBuilder(item);
                        }

                        _bp['singleton'] = output;
                        return output;
                    })();
                },
                ClearData: function () {
                    return (function () {
                        _bp.Data.Clean.Json = [];
                        _bp.Data.Clean.BluePrint = [];
                    })();
                },

                //FORM FIELD BINDING
                BindModelInput: function (obj, property, domElem) {
                    return (function (obj, prop, de) {
                        if (prop !== 'hierarchy') {
                            Object.defineProperty(obj, prop, {
                                get: function () { return de.type !== 'checkbox' ? de.value : de.checked; },
                                set: function (newValue) { de.value = newValue; },
                                configurable: true
                            });
                        } else {
                            Object.defineProperty(obj, prop, {
                                get: function () { return de.getAttribute('hierarchy'); },
                                set: function (newValue) { de.setAttribute('hierarchy', newValue); },
                                configurable: true
                            });
                        }

                    })(obj, property, domElem);
                },
                BindToData: function (hierarchy, field, isKey) {
                    return (function (h, f, ik) {
                        if (_bp.Data.Clean.BluePrint) {
                            var condition = function (el) { return el.hierarchy === '' + h; };
                            var bpObj = _bp.Data.Clean.BluePrint[_bp.CurrentBluePrintIndex()].find(condition);
                            var prop = ik ? 'keyName' : 'value';
                            if (typeof bpObj === 'object' && !(Array.isArray(bpObj.value))) {
                                _bp.BindModelInput(_bp.Data.Clean.BluePrint[_bp.CurrentBluePrintIndex()].find(condition), prop, f);
                                _bp.BindModelInput(_bp.Data.Clean.BluePrint[_bp.CurrentBluePrintIndex()].find(condition), 'hierarchy', f);
                            }
                        }
                    })(hierarchy, field, isKey);
                },

                // MISC HELPER METHODS
                CurrentBluePrintIndex: function () {
                    return (function () {
                        return (_bp.Data.Clean.BluePrint.length === 0 ? 0 : _bp.Data.Clean.BluePrint.length - 1);
                    })();
                },
                IsValueObj: function (value) {
                    return (function (v) {
                        return typeof v === 'object';
                    })(value);
                },
                SortSingleton: function () {
                    return _bp.Data.Clean.BluePrint[_bp.CurrentBluePrintIndex()].sort(_bp.SortByHierarchyLength);
                },
                SortByHierarchyLength: function (a, b) {
                    return (function (a, b) {
                        return _bp.GetHierarchyLength(a.hierarchy) - _bp.GetHierarchyLength(b.hierarchy);
                    })(a, b);
                },
                GetHierarchyLength: function (hierarchy) {
                    return (function (hierarchy) {
                        return hierarchy.length;
                    })(hierarchy);
                },
                GetValueType: function (value) {
                    return (function (value) {
                        if (Array.isArray(value)) {
                            return 'array';
                        } else {
                            return typeof value;
                        }
                    })(value);
                },
                CreateBlueprintPropertyObject: function (key, value, index, parentIndex) {
                    return (function (k, v, i, p) {
                        var blueprintPropertyObject = new Object(null);
                        var hierarchy = _bp.GenerateBluePrintHierarchy(p, i);
                        blueprintPropertyObject = {
                            id: Math.floor(Math.random() * 10000000),
                            keyName: k,
                            originalKeyName: k,
                            hierarchy: hierarchy,
                            type: _bp.GetValueType(v),
                            value: v
                        };
                        if (_bp.IsValueObj(v)) {
                            _bp.CreateBluePrint(v, hierarchy);
                        }
                        return blueprintPropertyObject;
                    })(key, value, index, parentIndex);
                },
                CreateObjectFromFieldMap: function (object, sortedKeyNameArr) {
                    //may not need this
                    return (function (obj, skna) {
                        var newObj = new Object();
                        skna.forEach(function (keyName) {
                            newObj[keyName] = text.alpha.lowercaseFirstLetter(keyName);
                        });
                        _bp.Data.Clean.Json = newObj;
                        _bp.CreateBluePrint(newObj);
                    })(object, sortedKeyNameArr);
                },
                GenerateBluePrintHierarchy: function (parentIndex, index) {
                    return (function (p, i) {
                        return !p ? '' + i : p + ':' + i;
                    })(parentIndex, index);
                }
            };

            return _bp;
        })();
    }
);