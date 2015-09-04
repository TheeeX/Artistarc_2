/*
 * This file is part of the Sonatra package.
 *
 * (c) François Pluchino <francois.pluchino@sonatra.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*global define*/
/*global jQuery*/
/*global window*/
/*global navigator*/
/*global document*/
/*global CSSMatrix*/
/*global WebKitCSSMatrix*/
/*global MSCSSMatrix*/
/*global Hammer*/
/*global Sidebar*/

/**
 * @param {jQuery} $
 */
(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    var nativeScrollWidth = null;

    /**
     * Get the width of native scrollbar.
     *
     * @returns {Number}
     */
    function getNativeScrollWidth() {
        var sbDiv = document.createElement("div"),
            size;
        sbDiv.style.width = '100px';
        sbDiv.style.height = '100px';
        sbDiv.style.overflow = 'scroll';
        sbDiv.style.position = 'absolute';
        sbDiv.style.top = '-9999px';
        document.body.appendChild(sbDiv);
        size = sbDiv.offsetWidth - sbDiv.clientWidth;
        document.body.removeChild(sbDiv);

        return size;
    }

    /**
     * Check if is a mobile device.
     *
     * @returns {boolean}
     *
     * @private
     */
    function mobileCheck() {
        if (null === nativeScrollWidth) {
            nativeScrollWidth = getNativeScrollWidth();
        }

        return 0 === nativeScrollWidth;
    }

    /**
     * Changes the css transition configuration on target element.
     *
     * @param {jQuery} $target    The element to edited
     * @param {string} transition The css transition configuration of target
     *
     * @private
     */
    function changeTransition($target, transition) {
        $target.css('-webkit-transition', transition);
        $target.css('transition', transition);
    }

    /**
     * Changes the css transform configuration on target element.
     *
     * @param {jQuery} $target   The element to edited
     * @param {string} transform The css transform configuration of target
     *
     * @private
     */
    function changeTransform($target, transform) {
        $target.css('-webkit-transform', transform);
        $target.css('transform', transform);
    }

    /**
     * Translate the jquery element with Translate 3D CSS.
     *
     * @param {jQuery } $target The jquery element
     * @param {Number}  delta   The delta of translate
     */
    function changeTranslate($target, delta) {
        var trans = delta + 'px, 0px, 0px';

        changeTransform($target, 'translate3d(' + trans + ')');
    }

    /**
     * Get the horizontal position of target element.
     *
     * @param {jQuery} $target The jquery target
     *
     * @return {number}
     *
     * @private
     */
    function getTargetPosition($target) {
        var transformCss = $target.css('transform'),
            transform = {e: 0, f: 0},
            reMatrix,
            match;

        if (transformCss) {
            if ('function' === typeof CSSMatrix) {
                transform = new CSSMatrix(transformCss);

            } else if ('function' === typeof WebKitCSSMatrix) {
                transform = new WebKitCSSMatrix(transformCss);

            } else if ('function' === typeof MSCSSMatrix) {
                transform = new MSCSSMatrix(transformCss);

            } else {
                reMatrix = /matrix\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/;
                match = transformCss.match(reMatrix);

                if (match) {
                    transform.e = parseInt(match[1], 10);
                    transform.f = parseInt(match[2], 10);
                }
            }
        }

        return transform.e;
    }

    /**
     * Binding actions of keyboard.
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function keyboardAction(event) {
        if (! (event instanceof jQuery.Event)) {
            return;
        }

        if (event.data.options.disabledKeyboard) {
            return;
        }

        var self = event.data,
            kbe = self.options.keyboardEvent;

        if (event.shiftKey === kbe.shiftKey &&
                event.ctrlKey  === kbe.ctrlKey &&
                event.altKey   === kbe.altKey &&
                event.keyCode  === kbe.keyCode) {
            self.toggle(event);
        }
    }

    /**
     * Checks if the window width is wider than the minimum width defined in
     * options.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @returns {boolean}
     *
     * @private
     */
    function isOverMinWidth(self) {
        var $window = $(window),
            windowWidth = $window.innerWidth();

        if ($('body').height() > $window.innerHeight()) {
            windowWidth += self.nativeScrollWidth;
        }

        return windowWidth >= self.options.minLockWidth;
    }

    /**
     * Close the sidebar since external action.
     *
     * @param {Event} event The event
     *
     * @typedef {Sidebar} Event.data The sidebar instance
     *
     * @private
     */
    function closeExternal(event) {
        var self = event.data,
            $target = $(event.currentTarget.activeElement),
            $directTarget = $(event.target),
            isOver = isOverMinWidth(self);

        if ((self.isLocked() && isOver) ||
            $target.hasClass(self.options.classWrapper) ||
            $directTarget.hasClass(self.options.classWrapper) ||
            $target.hasClass('sidebar-swipe') ||
            $directTarget.hasClass('sidebar-swipe') ||
            $target.parents('.' + self.options.classWrapper).size() > 0 ||
            $directTarget.parents('.' + self.options.classWrapper).size() > 0 ||/*
            (self.$toggle !== null && self.$toggle.attr('id') === $target.attr('id')) ||
            (self.$toggle !== null && self.$toggle.attr('id') === $target.attr('id')) ||*/
            true === self.mouseDragEnd) {
            self.mouseDragEnd = null;
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        if (isOver) {
            self.close();

        } else {
            self.forceClose();
        }
    }

    /**
     * Close the sidebar or reopen the locked sidebar on window resize event.
     *
     * @param {Event} event The event
     *
     * @typedef {Sidebar} Event.data The sidebar instance
     *
     * @private
     */
    function onResizeWindow(event) {
        var self = event.data;

        changeTransition(self.$element, 'none');

        if (isOverMinWidth(self) && self.isLocked()) {
            self.forceOpen();

            return;
        }

        closeExternal(event);

        if (undefined === self.resizeDelay) {
            self.resizeDelay = setTimeout(function () {
                delete self.resizeDelay;
                changeTransition(self.$element, '');
            }, 500);
        }
    }

    /**
     * Action of "on drag start" hammer event.
     *
     * @param {Sidebar} self  The sidebar instance
     * @param {object}  event The hammer event
     *
     * @typedef {Number} event.direction The hammer direction const
     *
     * @private
     */
    function onDragStart(self, event) {
        self.dragDirection = event.direction;
        self.$element.css('user-select', 'none');
    }

    /**
     * Action of "on drag" hammer event.
     *
     * @param {Sidebar} self  The sidebar instance
     * @param {object}  event The hammer event
     *
     * @typedef {Number} event.deltaX The hammer delta X
     *
     * @private
     */
    function onDrag(self, event) {
        var delta;

        if (-1 === $.inArray(self.dragDirection, [Hammer.DIRECTION_LEFT, Hammer.DIRECTION_RIGHT]) ||
            self.options.locked && isOverMinWidth(self)) {
            return;
        }

        event.preventDefault();

        if (null === self.dragStartPosition) {
            self.dragStartPosition = getTargetPosition(self.$element);
        }

        delta = Math.round(self.dragStartPosition + event.deltaX);

        if ((Sidebar.POSITION_LEFT === self.getPosition() && delta > 0) ||
            (Sidebar.POSITION_RIGHT === self.getPosition() && delta < 0)) {
            delta = 0;
        }

        self.$element.addClass(self.options.classOnDragging);
        changeTransition(self.$element, 'none');
        changeTranslate(self.$element, delta);
    }

    /**
     * Action of "on drag end" hammer event.
     *
     * @param {Sidebar} self  The sidebar instance
     * @param {object}  event The hammer event
     *
     *
     * @typedef {Number} event.deltaX    The hammer delta X
     * @typedef {Number} event.direction The hammer direction const
     *
     * @private
     */
    function onDragEnd(self, event) {
        var closeGesture = Hammer.DIRECTION_LEFT,
            openGesture  = Hammer.DIRECTION_RIGHT;

        self.dragStartPosition = null;

        event.preventDefault();

        if ('mouse' === event.pointerType) {
            self.mouseDragEnd = true;
        }

        self.$element.removeClass(self.options.classOnDragging);
        self.$element.css('user-select', '');
        changeTransition(self.$element, '');
        changeTransform(self.$element, '');

        if (Math.abs(event.deltaX) <= (self.$element.innerWidth() / 4)) {
            self.dragDirection = null;

            return;
        }

        if (Sidebar.POSITION_RIGHT === self.getPosition()) {
            closeGesture = Hammer.DIRECTION_RIGHT;
            openGesture = Hammer.DIRECTION_LEFT;
        }

        if (self.isOpen() && closeGesture === self.dragDirection) {
            self.forceClose();

        } else if (openGesture === self.dragDirection) {
            if (self.isOpen() && isOverMinWidth(self) &&
                $.inArray(self.options.forceToggle, [Sidebar.FORCE_TOGGLE, Sidebar.FORCE_TOGGLE_ALWAYS]) >= 0) {
                self.forceOpen();

            } else if (isOverMinWidth(self) && Sidebar.FORCE_TOGGLE_ALWAYS === self.options.forceToggle) {
                self.forceOpen();

            } else {
                self.open();
            }
        }

        self.dragDirection = null;
    }

    /**
     * Init the hammer instance.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @private
     */
    function initHammer(self) {
        if (!self.options.draggable || typeof Hammer !== 'function') {
            return;
        }

        self.$swipe = $('<div id="sidebar-swipe' + self.guid + '" class="sidebar-swipe"></div>');
        self.$element.after(self.$swipe);

        self.hammer = new Hammer(self.$wrapper.get(0), $.extend(true, {}, self.options.hammer));
        self.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        self.hammer.get('swipe').set({ enable: false });
        self.hammer.get('tap').set({ enable: false });

        self.hammer.on('panstart', function (event) {
            onDragStart(self, event);
        });
        self.hammer.on('pan', function (event) {
            onDrag(self, event);
        });
        self.hammer.on('panend', function (event) {
            onDragEnd(self, event);
        });
    }

    /**
     * Destroy the hammer configuration.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @private
     */
    function destroyHammer(self) {
        if (!self.options.draggable || typeof Hammer !== 'function') {
            return;
        }

        self.$swipe.remove();
        self.hammer.destroy();

        delete self.$swipe;
        delete self.hammer;
    }

    /**
     * Init the scroller instance.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @private
     */
    function initScroller(self) {
        var options = {
            scrollbarInverse: Sidebar.POSITION_RIGHT === self.options.position
        };

        if ($.fn.scroller && self.options.useScroller) {
            self.$element.scroller($.extend({}, options, self.options.scroller));
        }
    }

    /**
     * Destroy the hammer scroll configuration.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @private
     */
    function destroyScroller(self) {
        if ($.fn.scroller && self.options.useScroller) {
            self.$element.scroller('destroy');
        }
    }

    // SIDEBAR CLASS DEFINITION
    // ========================

    /**
     * @constructor
     *
     * @param {string|elements|object|jQuery} element
     * @param {object}                        options
     *
     * @this Sidebar
     */
    var Sidebar = function (element, options) {
        this.guid = jQuery.guid;
        this.options = $.extend(true, {}, Sidebar.DEFAULTS, options);
        this.eventType = mobileCheck() ? 'touchstart' : 'click';
        this.nativeScrollWidth = getNativeScrollWidth();
        this.$element = $(element);
        this.$toggle = null !== this.options.toggleId ?  $('#' + this.options.toggleId) : null;
        this.$wrapper = $('<div class="' + this.options.classWrapper + '"></div>');
        this.$container = $('> .' + this.options.classContainer, this.$element.parent());
        this.$swipe = null;
        this.hammer = null;
        this.dragStartPosition = null;
        this.mouseDragEnd = null;
        this.dragDirection = null;

        this.$element.before(this.$wrapper);
        this.$wrapper.append(this.$element);
        this.$element.attr('data-sidebar', 'true');

        if (Sidebar.POSITION_RIGHT !== this.options.position) {
            this.options.position = Sidebar.POSITION_LEFT;

        } else {
            this.$element.addClass('sidebar-right');
        }

        if (this.$element.hasClass('sidebar-right')) {
            this.options.position = Sidebar.POSITION_RIGHT;
        }

        if (this.options.position === Sidebar.POSITION_RIGHT) {
            this.options.keyboardEvent.shiftKey = true;
        }

        if (this.options.locked) {
            this.options.forceToggle = Sidebar.FORCE_TOGGLE_ALWAYS;
            changeTransition(this.$element, 'none');
            this.$element
                .addClass(this.options.classLocked)
                .addClass(this.options.classForceOpen)
                .addClass(this.options.classOpen + '-init');

            if (null !== this.$toggle) {
                this.$toggle
                    .addClass(this.options.classLocked + '-toggle')
                    .addClass(this.options.classForceOpen + '-toggle');
            }
        }

        if (null !== this.$toggle) {
            this.$toggle.on(this.eventType + '.st.sidebar' + this.guid, null, this, Sidebar.prototype.toggle);

            if (!mobileCheck() && this.options.toggleOpenOnHover && null !== this.$toggle) {
                this.$toggle.on('mouseover.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.open, this));
            }
        }

        $(window).on('keyup.st.sidebar' + this.guid, null, this, keyboardAction);
        $(window).on('resize.st.sidebar' + this.guid, null, this, onResizeWindow);

        if (this.$element.hasClass(this.options.classOpen + '-init')) {
            if (isOverMinWidth(this)) {
                this.$element.addClass(this.options.classOpen);

            } else {
                this.$element.removeClass(this.options.classOpen);
            }

            this.$element.removeClass(this.options.classOpen + '-init');
        }

        if (this.$element.hasClass(this.options.classOpen)) {
            $(document).on(this.eventType + '.st.sidebar' + this.guid, null, this, closeExternal);
        }

        initScroller(this);
        initHammer(this);
        changeTransition(this.$element, '');
        this.$element.addClass('sidebar-ready');
    },
        old;

    /**
     * Defaults options.
     *
     * @type {object}
     */
    Sidebar.DEFAULTS = {
        classWrapper:       'sidebar-wrapper',
        classContainer:     'container-main',
        classOpen:          'sidebar-open',
        classLocked:        'sidebar-locked',
        classForceOpen:     'sidebar-force-open',
        classOnDragging:    'sidebar-dragging',
        forceToggle:        Sidebar.FORCE_TOGGLE_NO,
        locked:             false,
        position:           Sidebar.POSITION_LEFT,
        minLockWidth:       992,
        toggleId:           null,
        toggleOpenOnHover:  false,
        draggable:          true,
        useScroller:        true,
        scroller:           {
            contentSelector: '.sidebar-menu',
            scrollerStickyHeader: true,
            stickyOptions: {
                selector: '> .sidebar-menu > .sidebar-group > span'
            }
        },
        hammer:             {},
        disabledKeyboard:   false,
        keyboardEvent:      {
            ctrlKey:  true,
            shiftKey: false,
            altKey:   true,
            keyCode:  'S'.charCodeAt(0)
        }
    };

    /**
     * Left position.
     *
     * @type {string}
     */
    Sidebar.POSITION_LEFT  = 'left';

    /**
     * Right position.
     *
     * @type {string}
     */
    Sidebar.POSITION_RIGHT = 'right';

    /**
     * Not force toggle.
     *
     * @type {boolean}
     */
    Sidebar.FORCE_TOGGLE_NO = false;

    /**
     * Force toggle.
     *
     * @type {boolean}
     */
    Sidebar.FORCE_TOGGLE = true;

    /**
     * Always force toggle.
     *
     * @type {string}
     */
    Sidebar.FORCE_TOGGLE_ALWAYS = 'always';

    /**
     * Get sidebar position.
     *
     * @returns {string} The position (left or right)
     *
     * @this Sidebar
     */
    Sidebar.prototype.getPosition = function () {
        return this.options.position;
    };

    /**
     * Checks if sidebar is locked (always open).
     *
     * @returns {boolean}
     *
     * @this Sidebar
     */
    Sidebar.prototype.isLocked = function () {
        return this.options.locked;
    };

    /**
     * Checks if sidebar is locked (always open).
     *
     * @returns {boolean}
     *
     * @this Sidebar
     */
    Sidebar.prototype.isOpen = function () {
        return this.$element.hasClass(this.options.classOpen);
    };

    /**
     * Checks if sidebar is fully opened.
     *
     * @return {boolean}
     *
     * @this Sidebar
     */
    Sidebar.prototype.isFullyOpened = function () {
        return this.$element.hasClass(this.options.classForceOpen);
    };

    /**
     * Force open the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.forceOpen = function () {
        if (this.isOpen() && this.isFullyOpened()) {
            return;
        }

        this.$element.addClass(this.options.classForceOpen);
        this.open();

        if (null !== this.$toggle) {
            this.$toggle.addClass(this.options.classForceOpen + '-toggle');
        }
    };

    /**
     * Force close the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.forceClose = function () {
        if (!this.isOpen() || (this.isLocked() && isOverMinWidth(this))) {
            return;
        }

        if (null !== this.$toggle) {
            this.$toggle.removeClass(this.options.classForceOpen + '-toggle');
        }

        this.$element.removeClass(this.options.classForceOpen);
        this.close();
    };

    /**
     * Open the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.open = function () {
        if (this.isOpen()) {
            return;
        }

        $('[data-sidebar=true]').sidebar('forceClose');

        if (null !== this.$toggle) {
            this.$toggle.addClass(this.options.classOpen);
        }

        this.$element.addClass(this.options.classOpen);
        $(document).on(this.eventType + '.st.sidebar' + this.guid, null, this, closeExternal);

        if ($.fn.scroller && this.options.useScroller) {
            this.$element.scroller('resizeScrollbar');
        }
    };

    /**
     * Close open the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.close = function () {
        if (!this.isOpen() || (this.isFullyOpened() && isOverMinWidth(this))) {
            return;
        }

        if (null !== this.$toggle) {
            this.$toggle.removeClass(this.options.classOpen);
        }

        this.$element.removeClass(this.options.classOpen);
        $(document).off(this.eventType + '.st.sidebar' + this.guid, closeExternal);

        if ($.fn.scroller && this.options.useScroller) {
            this.$element.scroller('resizeScrollbar');
        }
    };

    /**
     * Toggle the sidebar ("close, "open", "force open").
     *
     * @param {jQuery.Event|Event} [event]
     *
     * @typedef {Sidebar} Event.data The sidebar instance
     *
     * @this Sidebar
     */
    Sidebar.prototype.toggle = function (event) {
        var self = (undefined !== event) ? event.data : this;

        if (undefined !== event) {
            event.stopPropagation();
            event.preventDefault();
        }

        if (self.isOpen()) {
            if (self.isFullyOpened()) {
                self.forceClose();

            } else if (isOverMinWidth(self) && $.inArray(self.options.forceToggle, [true, Sidebar.FORCE_TOGGLE_ALWAYS]) >= 0) {
                self.forceOpen();

            } else {
                self.close();
            }

        } else if (isOverMinWidth(self) && Sidebar.FORCE_TOGGLE_ALWAYS === self.options.forceToggle) {
            self.forceOpen();

        } else {
            self.open();
        }
    };

    /**
     * Destroy instance.
     *
     * @this Sidebar
     */
    Sidebar.prototype.destroy = function () {
        if (null !== this.$toggle) {
            this.$toggle.off('mouseover.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.open, this));
            this.$toggle.off(this.eventType + '.st.sidebar' + this.guid, Sidebar.prototype.toggle);
        }

        this.forceClose();
        $(window).off('keyup.st.sidebar' + this.guid, keyboardAction);
        $(window).off('resize.st.sidebar' + this.guid, onResizeWindow);
        $(document).off(this.eventType + '.st.sidebar' + this.guid, closeExternal);

        destroyHammer(this);
        destroyScroller(this);

        this.$wrapper.before(this.$element);
        this.$wrapper.remove();

        this.$element.attr('data-sidebar', '');
        this.$element.removeClass('sidebar-ready');
        this.$element.removeData('st.sidebar');

        delete this.guid;
        delete this.options;
        delete this.eventType;
        delete this.nativeScrollWidth;
        delete this.$element;
        delete this.$wrapper;
        delete this.$container;
        delete this.$toggle;
        delete this.dragStartPosition;
        delete this.mouseDragEnd;
        delete this.dragDirection;
    };


    // SIDEBAR PLUGIN DEFINITION
    // =========================

    function Plugin(option, value) {
        var ret;

        this.each(function () {
            var $this   = $(this),
                data    = $this.data('st.sidebar'),
                options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }

            if (!data) {
                $this.data('st.sidebar', (data = new Sidebar(this, options)));
            }

            if (typeof option === 'string') {
                ret = data[option](value);
            }
        });

        return undefined === ret ? this : ret;
    }

    old = $.fn.sidebar;

    $.fn.sidebar             = Plugin;
    $.fn.sidebar.Constructor = Sidebar;


    // SIDEBAR NO CONFLICT
    // ===================

    $.fn.sidebar.noConflict = function () {
        $.fn.sidebar = old;

        return this;
    };


    // SIDEBAR DATA-API
    // ================

    $(window).on('load', function () {
        $('[data-sidebar="true"]').each(function () {
            var $this = $(this);
            Plugin.call($this, $this.data());
        });
    });

}));
