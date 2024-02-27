define([
    'mod/dom_helper',
    'text!/js/ZDK/styles/3rdParty/animate.css',
    'velocity-animate',
    '3p/velocity.ui.min'
],
    function (
        mod_dom,
        css,
        Velocity
    ) {
        var MODULE_NAME = "animation";
        mod_dom.css.addRaw(MODULE_NAME, css);

        var _getAnimationEndEventName = function () {
            var i,
                undefined,
                animations = {
                    'animation': 'animationend',
                    'OAnimation': 'oanimationend',
                    'MozAnimation': 'animationend',
                    'WebkitAnimation': 'webkitAnimationEnd'
                };

            for (i in animations) {
                if (animations.hasOwnProperty(i) && document.body.style[i] !== undefined) {
                    return animations[i];
                }
            }
        };

        var _getTransitionEndEventName = function () {
            // SOURCE: https://stackoverflow.com/questions/5023514/how-do-i-normalize-css3-transition-functions-across-browsers
            var i,
                undefined,
                transitions = {
                    'transition': 'transitionend',
                    'OTransition': 'otransitionend',  // oTransitionEnd in very old Opera
                    'MozTransition': 'transitionend',
                    'WebkitTransition': 'webkitTransitionEnd'
                };

            for (i in transitions) {
                if (transitions.hasOwnProperty(i) && document.body.style[i] !== undefined) {
                    return transitions[i];
                }
            }
        };

        return {
            applyTransitionEndEventListener: function (el, callback) {
                el.addEventListener(_getTransitionEndEventName(), callback);
            },
            applyAnimationEndEventListener: function (el, callback) {
                el.addEventListener(_getAnimationEndEventName(), callback);
            },
            removeTransitionEndEventListener: function (el, callback) {
                el.removeEventListener(_getTransitionEndEventName(), callback);
            },
            removeAnimationEndEventListener: function (el, callback) {
                el.removeEventListener(_getAnimationEndEventName(), callback);
            },
            queueAnimationSequence: function (aniMap) {
                var _scope = this;

                //TODO remove any of the hidden class modifiers here. these should not be done here.
                if (aniMap.length > 0) {
                    return new Promise(function (RES, REJ) {
                        var _startAnimation = function (el, ani, index) {
                            mod_dom.hide(el, false);
                            return new Promise(function (resolve, reject) {
                                var internal_cb = function (ev) {
                                    _scope.removeAnimationEndEventListener(el, internal_cb);
                                    el.classList.remove(ani);
                                    el.classList.remove('animating');

                                    if (aniMap[index].stayHidden) {
                                        mod_dom.hide(el, true);
                                    }

                                    resolve();

                                    if (index === aniMap.length - 1) {
                                        RES();
                                    }
                                };

                                _scope.applyAnimationEndEventListener(el, internal_cb);
                                DOMTokenList.prototype.add.apply(el.classList, ['animated', 'animating', ani]);
                            });
                        };

                        var chain = Promise.resolve();
                        aniMap.forEach(function(anim, i){
                            chain = chain.then(function (result) {
                                // TODO these are all started consecutivly without waiting on complete
                                // can fix by returning the promise below, but this casues other timing / state issues
                                _startAnimation(anim.element, anim.animation, i);
                            });
                        });

                        return chain;
                    });
                }

                return Promise.resolve();
            },
            velocity: Velocity,
            // animateCSS : function(element, animation, prefix = 'animate__') {
            //     // We create a Promise and return it
                
            //     // animateCSS('.my-element', 'bounce').then((message) => {
            //     //     // Do something after the animation
            //     // });
                
            //     return new Promise((resolve, reject) => {
            //         const animationName = prefix + animation;
            //         const node = document.querySelector(element);
                
            //         node.classList.add(prefix + 'animated', animationName);
                
            //         // When the animation ends, we clean the classes and resolve the Promise
            //         function handleAnimationEnd(event) {
            //             event.stopPropagation();
            //             node.classList.remove(prefix + 'animated', animationName);
            //             resolve('Animation ended');
            //         }
                
            //         node.addEventListener('animationend', handleAnimationEnd, {once: true});
            //     });
            // }
        };
    }
);