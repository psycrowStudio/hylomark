define([
        "mod/text"
    ], function (
        mod_text
    ) {
    var MODULE_NAME = "dom_helper";
    var _hiddenClass = 'hidden';

    // 'polyfill' for the matches method
    if (!Element.prototype.matches) {
        var ep = Element.prototype;

        if (ep.webkitMatchesSelector) // Chrome <34, SF<7.1, iOS<8
            ep.matches = ep.webkitMatchesSelector;

        if (ep.msMatchesSelector) // IE9/10/11 & Edge
            ep.matches = ep.msMatchesSelector;

        if (ep.mozMatchesSelector) // FF<34
            ep.matches = ep.mozMatchesSelector;
    }



    function isNode(o){
        return (
          typeof Node === "object" ? o instanceof Node : 
          o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
        );
      }
      
     //Returns true if it is a DOM element    
    function isElement(o){
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
        );
    }

    var _dom = {
        hide: function (el, state) {
            if (!el)
                return;

            if (state === true) {
                el.classList.add(_hiddenClass);
            }
            else if (state === false) {
                el.classList.remove(_hiddenClass);
            } else if (!state) {
                el.classList.toggle(_hiddenClass);
            }
        },
        getNextSibling: function (el, selector) {
            var parentofSelected = el.parentNode;

            var children = parentofSelected.childNodes;
            var pastEl = false;
            for (var i = 0; i < children.length; i++) {
                if (children[i] === el) {
                    pastEl = true;
                    continue;
                }

                if (pastEl && children[i].matches(selector)) {
                    return children[i];
                }
            }
        },
        getDistanceFromPageTop: function (el) {
            var location = 0;
            if (el.offsetParent) {
                do {
                    location += el.offsetTop;
                    el = el.offsetParent;
                } while (el);
            }
            return location >= 0 ? location : 0;
        },
        isElementInViewport: function (el, fullyInView, offset) {
            offset = offset || 0;
            var pageTop = window.pageYOffset;
            var pageBottom = pageTop + window.innerHeight;
            var elementTop = this.getDistanceFromPageTop(el);
            var elementBottom = elementTop + el.clientHeight;

            //console.log(pageTop, pageBottom, elementTop, elementBottom);

            if (fullyInView === true) {
                return ((pageTop + offset < elementTop) && (pageBottom - offset > elementBottom));
            } else {
                return ((elementTop <= pageBottom - offset) && (elementBottom >= pageTop + offset));
            }
        },
        clearChildren: function (el) {
            while (el.lastChild) {
                el.removeChild(el.lastChild);
            }
        },
        localizeTimeTags:function(){ 
            var timeTags = Array.from(document.querySelectorAll('time'));
            timeTags.forEach(function(el){
                var valueString = el.getAttribute('datetime');
                var zoneString = el.getAttribute('data-tz');
                var formatString = el.getAttribute('data-format');
                
                el.textContent = mod_text.time.formatFromUtc(valueString, formatString, zoneString);
            });
        },
        isDomObject: function(o){
            return isNode(o) || isElement(0);
        },
        raiseCustomEvent:function (eventType, payload, domEl) {
            var ev = new CustomEvent(eventType, {
                bubbles: true,
                cancelable: true,
                // whatever is added to detail will be passed along as event properties
                detail: payload
            });
            domEl.dispatchEvent(ev);
        },
        css: (function () {
            var _stylesAvailable = {};
            var _stylesLoaded = {};

            var _styleBlock;
            var _CreateStyleBlock = function () {
                _styleBlock = document.createElement('style');
                _styleBlock.id = "rbss-styles";

                document.head.insertAdjacentElement('beforeend', _styleBlock);
                return _styleBlock;
            };
            _CreateStyleBlock();

            return {
                addRaw: function (name, cssText, delayDomLoad) {
                    _stylesAvailable[name] = mod_text.token.replace(cssText);
                    
                    if(!delayDomLoad){
                        _dom.css.loadToDom(name);
                    }
                },
                loadToDom: function (name) {
                    if (_stylesLoaded.hasOwnProperty(name) || !_stylesAvailable.hasOwnProperty(name) || !_styleBlock) {
                        return false;
                    }

                    var style = document.createElement('style');
                    style.id = name;
                    style.innerHTML = _stylesAvailable[name];

                    _stylesLoaded[name] = style;

                    _styleBlock.insertAdjacentElement('beforeend', style);
                    return true;
                },
                unloadFromDom: function (name) {
                    if (!_stylesLoaded.hasOwnProperty(name) || !_styleBlock) {
                        return false;
                    }

                    _stylesLoaded[name].parentNode.removeChild(_stylesLoaded[name]);
                    delete _stylesLoaded[name];
                    return true;
                },
            };
        })()
        //TODO add in the recursive absolute pixel dim calculation.
    };

    return _dom;
});