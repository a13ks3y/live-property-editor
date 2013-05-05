(function (global){

    /* utils */

    /**
     * forEach wrapper. can be used for arrays, and for objects
     * @param arr {Array|Object}
     * @param callback
     */
    var forEach = function (arr, callback) {
        if (arr instanceof Array) {
            return arr.forEach(function (value, index, list){
                return callback(value, index, list);
            });
        } else if (arr instanceof Object) {
            return Object.keys(arr).forEach(function (key) {
                return callback(arr[key], key, arr);
            });
        }
    };

    /* DSL */

    var node = function (name, options) {
        var element = global.document.createElement(name);
        if (options.text) {
            element.innerText = options.text;
        }

        if (options.visible == false) {
            element.style.display = 'none';
        }

        if (options.className) {
            element.setAttribute("class", options.className);
        }

        forEach(options, function(optionVlaue, optionName) {
            if (optionName.indexOf('on') === 0 && optionVlaue instanceof Function) {
                element[optionName] = optionVlaue;
            }
        });

        return element;
    };

    var h1 = function(text) {
        return node("h1", {text : text});
    }

    var list = function (options) {
        var list = node("ul", options);
        forEach(options.children, function (child) {
            var li = node("li", {});
            li.appendChild(child);
            list.appendChild(li);
        });
        return list;
    }

    var panel = function (options) {
        var panelNode = node("div", options);
        Object.keys(options.children).forEach(function (key) {
            if (options.children[key]) {
                panelNode.appendChild(options.children[key]);
            }
        });
        return panelNode;
    }

    var input = function (options) {
        var input = node("input", options);
        if (options.value != undefined) {
            input.value = options.value;
        }
        if (options.type) {
            input.type = options.type;
        }
        return input;
    };

    var select = function (options) {
        var select = node("select", options);

        if (options.defaultOption) {
            select.appendChild(node("option", {
                text : options.defaultOption.name,
                value : options.defaultOption.value
            }));
            select.value = options.defaultOption.value;
        }

        forEach(options.options, function (option) {
            select.appendChild(node("option", {
                text : option.name,
                value : option.value
            }));
        });

        return select;
    };

    /* Widget */

    var buildValueGui = function (valueInfo, context) {
        var wrapper = node("div", {});
        var label = node("p", {text : valueInfo.name + '{' + valueInfo.type + '}'});

        var inputType = {string: 'text', number : 'number', boolean: 'checkbox'}[valueInfo.type] || 'text';

        var field = input({
            name : valueInfo.name,
            value : valueInfo.value,
            type : inputType,
            className : valueInfo.type + " input"
        });
        var editButton = node("button", {text: "Edit", onclick : function () {
            //todo change value
            //todo cast value to correct type
            context.root[valueInfo.name] = field.value;
            //alert(valueInfo.name);
        }});
        wrapper.appendChild(label);
        wrapper.appendChild(field);
        wrapper.appendChild(editButton);
        return wrapper;
    };

    var buildContextGui = function (context, parentNode) {



        var contextPanel = panel({
            className : "property-editor well",
            children : {
                header : h1(context.name),
                parentButton : node("button", {
                    text : "Parent",
                    visible : context.parentContext != null,
                    onclick: function () {
                        context.changeRootToParent();
                    }
                }),
                linkValuesSelect : select({ visible: context.objects.length, onchange : function (event) {
                    context.selectChildRoot(event.target.value);
                }, defaultOption : {name : '---', value: '' }, options : context.objects.map(function (valueInfo) {
                    return { value : valueInfo.name, name : valueInfo.name};
                })}),
                values : list({type : "ul", className: "values unstyled", children : context.values.map(function (valueInfo) {
                    return buildValueGui(valueInfo, context);
                })})

            }
        });

        parentNode.appendChild(contextPanel);
        return contextPanel;

    };

    var jpeContext = function(name, root, parentContext) {
        var context = {
            root : root,
            parentContext : parentContext,
            name : name,
            values : [],
            objects : []
        };



        var valueTypes = ["string", "number", "boolean"];


        Object.getOwnPropertyNames(root).forEach(function (propertyName) {

            var propertyValue = root[propertyName];
            var propertyType = (typeof propertyValue).toLowerCase();

            if (valueTypes.indexOf(propertyType) != -1) {
                var collection = context.values;
            } else if (propertyType == 'object') {
                var collection = context.objects;
            } else if (propertyValue instanceof Function){
                //todo functions
            }
            if (collection) {
                collection.push({
                    name : propertyName,
                    value : propertyValue,
                    type : propertyType,
                    parent : root
                });
            }
        });



        return context;
    };
    /**
     * Create property-editor widget
     * @param parentNode {HTMLElement}
     * @param root {Object}
     * @returns {Object}
     */
    var jpe = function (parentNode, root) {

        var context = jpeContext("root", root, null);
        var editorPanel;

        var changeRoot = function (name, root, parentContext) {
            context = jpeContext(name, root, parentContext);
            context.selectChildRoot = function (name) {
                var childRoot = context.root[name];
                if ((typeof childRoot).toLowerCase() == 'object') {
                    changeRoot(name, childRoot, context);
                }
            };

            context.changeRootToParent = function () {
                var parentContext = context.parentContext;
                if (parentContext) {
                    changeRoot(parentContext.name, parentContext.root, parentContext.parentContext);
                }
            };
            if (editorPanel) {
                parentNode.removeChild(editorPanel);
            }
            editorPanel = buildContextGui(context, parentNode);
        };

        changeRoot("root", root, null);

        return context;
    };

    global.jpe = jpe;

}(window));