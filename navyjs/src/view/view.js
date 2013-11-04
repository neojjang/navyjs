/**
 * @class Navy.View.View
 * @eventNames link, sizeChanged, posChanged
 */
Navy.Class('Navy.View.View', {
  SIZE_POLICY_FIXED: 'fixed',
  SIZE_POLICY_WRAP_CONTENT: 'wrapContent',
  SIZE_POLICY_MATCH_PARENT: 'matchParent',

  _id: null,
  _page: null,
  _scene: null,
  _layout: null,
  _element: null,
  _parentView: null,

  _eventCallbackMap: null,
  _eventCallbackId: 0,

  _linkGesture: null,

  /**
   *
   * @param {function} callback
   * @param {ViewLayout} layout
   */
  initialize: function(layout, callback) {
    this._eventCallbackMap = {};

    if (layout) {
      this._id = layout.id;
    }

    this._layout = layout;

    this._createElement(layout);
    this._createExtraElement(layout);

    this.setLayout(layout, callback);
  },

  setLayout: function(layout, callback) {
    if (!layout) {
      return;
    }

    function onLoadResource() {
      var notify = new Navy.Notify(2, onApplyLayout.bind(this));
      var pass = notify.pass.bind(notify);
      this._applyLayout(layout, pass);
      this._applyExtraLayout(layout, pass);
    }

    function onApplyLayout() {
      this._updateSizeWithWrapContentSize();
      this._element.style.visibility = '';
      callback && callback(this);
    }

    this._layout = layout;
    var notify = new Navy.Notify(2, onLoadResource.bind(this));
    var pass = notify.pass.bind(notify);
    this._loadResource(layout, pass);
    this._loadExtraResource(layout, pass);
  },

  getLayout: function() {
    return this._cloneObject(this._layout);
  },

  _createElement: function(layout) {
    this._element = document.createElement('div');
    this._element.style.visibility = 'hidden';

    this._linkGesture = new Navy.Gesture.Tap(this._element, this._onLink.bind(this));
  },

  _applyLayout: function(layout, callback) {
    this._element.style.position = 'absolute';

    this.setVisible(layout.visible);
    this.setPos(layout.pos);
    this.setSizePolicy(layout.sizePolicy, true);
    this.setSize(layout.size);
    this.setBackgroundColor(layout.backgroundColor);
    this.setLink(layout.link);

    this._setRawStyle({overflow:'hidden'});

    callback && setTimeout(callback, 0);
  },

  _loadResource: function(layout, callback) {
    callback && setTimeout(callback, 0);
  },

  /**
   * @forOverride
   * @param layout
   * @private
   */
  _createExtraElement: function(layout) {
  },

  /**
   * @forOverride
   * @param layout
   * @param callback
   * @private
   */
  _applyExtraLayout: function(layout, callback) {
    callback && setTimeout(callback, 0);
  },

  /**
   * @forOverride
   * @param layout
   * @param callback
   * @private
   */
  _loadExtraResource: function(layout, callback) {
    callback && setTimeout(callback, 0);
  },

  /**
   * @forOverride
   * @private
   */
  _calcWrapContentSize: function() {
    return {width: 0, height: 0};
  },

  _updateSizeWithWrapContentSize: function() {
    if (this._layout.sizePolicy !== this.SIZE_POLICY_WRAP_CONTENT) {
      return;
    }

    var size = this._calcWrapContentSize();
    this._element.style.width = size.width + 'px';
    this._element.style.height = size.height + 'px';

    this.trigger('sizeChanged', this, null);
  },

  _setRawStyle: function(style) {
    var cssText = '';
    for (var key in style) {
      var value = style[key];
      if (value !== undefined) {
        var propertyName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        if (propertyName.indexOf('webkit') === 0) {
          propertyName = '-' + propertyName;
        }

        if (value === '') {
          this._element.style[key] = '';
        } else {
          cssText += propertyName + ':' + value + ';';
        }
      }
    }

    this._element.style.cssText += cssText;
  },

  _onLink: function(ev) {
    // TODO: Navy.Eventオブジェクトを作る.
    this.trigger('link', this, ev);

    // TODO: evがpreventDefault的なことをされていれば遷移しないようにする.
    var type = this._layout.link.type;
    var id = this._layout.link.id;

    switch (type) {
    case 'page':
      this.getScene().linkPage(id);
      break;
    case 'scene':
      Navy.Root.linkScene(id);
      break;
    }
  },

  on: function(eventName, callback) {
    if (!this._eventCallbackMap[eventName]) {
      this._eventCallbackMap[eventName] = [];
    }

    var eventCallbackId = this._eventCallbackId++;
    this._eventCallbackMap[eventName].push({
      callbackId: eventCallbackId,
      callback: callback
    });

    return eventCallbackId;
  },

  off: function(eventName, callbackOrId) {
    var eventCallbacks = this._eventCallbackMap[eventName];
    if (!eventCallbacks) {
      return;
    }

    if (typeof callbackOrId === 'function') {
      var callback = callbackOrId;
      for (var i = 0; i < eventCallbacks.length; i++) {
        if (callback === eventCallbacks[i].callback) {
          eventCallbacks.splice(i, 1);
          i--;
        }
      }

    } else {
      var callbackId = callbackOrId;
      for (var i = 0; i < eventCallbacks.length; i++) {
        if (callbackId === eventCallbacks[i].callbackId) {
          eventCallbacks.splice(i, 1);
          return;
        }
      }
    }
  },

  trigger: function(eventName, view, event) {
    var eventCallbacks = this._eventCallbackMap[eventName];
    if (!eventCallbacks) {
      return;
    }

    for (var i = 0; i < eventCallbacks.length; i++) {
      var callback = eventCallbacks[i].callback;
      callback(view, event);

      // TODO: preventDefault, stopPropagation, stopNext的なのを実装
    }
  },

  addRawEventListener: function(eventName, callback) {
    this._element.addEventListener(eventName, callback);
  },

  removeRawEventListener: function(eventName, callback) {
    this._element.removeEventListener(eventName, callback);
  },

  getId: function(){
    return this._id;
  },

  setPage: function(page) {
    this._page = page;
  },

  getPage: function() {
    return this._page;
  },

  setScene: function(scene) {
    this._scene = scene;
  },

  getScene: function() {
    return this._scene;
  },

  getElement: function(){
    return this._element;
  },

  setParent: function(parentView) {
    this._parentView = parentView;
  },

  getParent: function() {
    return this._parentView;
  },

  destroy: function() {
    this._parentView.removeView(this);

    var names = Object.getOwnPropertyNames(this);
    for (var i = 0; i < names.length; i++) {
      this[names[i]] = null;
    }
  },

  toJSON: function() {
    return this._layout;
  },

  _cloneObject: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /*
   * Viewのレイアウトに関するメソッド群
   */

  isVisible: function() {
    if (!this._layout.visible) {
      return false;
    }

    for (var parent = this.getParent(); parent; parent = parent.getParent()) {
      if (!parent.isVisible()) {
        return false;
      }
    }

    return true;
  },

  setVisible: function(visible) {
    this._layout.visible = visible;

    if (visible) {
      this._element.style.display = 'block';
    } else {
      this._element.style.display = 'none';
    }
  },

  setBackgroundColor: function(backgroundColor) {
    this._layout.backgroundColor = backgroundColor;
    this._element.style.backgroundColor = backgroundColor;
  },

  getBackgroundColor: function() {
    return this._layout.backgroundColor;
  },

  setSizePolicy: function(sizePolicy, disableUpdateSizeWithWrapContentSize) {
    this._layout.sizePolicy = sizePolicy;

    switch (sizePolicy) {
    case this.SIZE_POLICY_FIXED:
      break;
    case this.SIZE_POLICY_WRAP_CONTENT:
      if (!disableUpdateSizeWithWrapContentSize) {
        this._updateSizeWithWrapContentSize();
      }
      break;
    case this.SIZE_POLICY_MATCH_PARENT:
      this._element.style.cssText = 'width: 100%; height: 100%';
      break;
    default:
      throw new Error('unknown size policy. ' + this._layout.sizePolicy);
    }
  },

  getSizePolicy: function() {
    return this._layout.sizePolicy;
  },

  getSize: function() {
    switch (this._layout.sizePolicy) {
    case this.SIZE_POLICY_FIXED:
      return {width: this._layout.size.width, height: this._layout.size.height};
    case this.SIZE_POLICY_WRAP_CONTENT:
      return {width: this._element.clientWidth, height: this._element.clientHeight};
    case this.SIZE_POLICY_MATCH_PARENT:
      return {width: this._element.clientWidth, height: this._element.clientHeight};
    default:
      throw new Error('unknown size policy. ' + this._layout.sizePolicy);
    }
  },

  setSize: function(size) {
    if (!size) {
      return;
    }

    if (this._layout.sizePolicy !== this.SIZE_POLICY_FIXED) {
      return;
    }

    if (!this._layout.size) {
      this._layout.size = {};
    }

    var cssText = '';

    if (typeof size.width === 'number') {
      this._layout.size.width = size.width;
      cssText += 'width:' + size.width + 'px;';
    }

    if (typeof size.height === 'number') {
      this._layout.size.height = size.height;
      cssText += 'height:' + size.height + 'px;';
    }

    this._element.style.cssText += cssText;

    // TODO: Eventオブジェクト作る.
    this.trigger('sizeChanged', this, null);
  },

  setPos: function(pos) {
    var cssText = '';

    if (typeof pos.x === 'number') {
      var x = parseInt(pos.x, 10);
      this._layout.pos.x = x;
      cssText += 'left:' + x + 'px;';
    }

    if (typeof pos.y === 'number') {
      var y = parseInt(pos.y, 10);
      this._layout.pos.y = y;
      cssText += 'top:' + y + 'px;';
    }

    if (typeof pos.z === 'number') {
      var z = parseInt(pos.z, 10);
      this._layout.pos.z = z;
      cssText += 'z-index:' + z + ';';
    }

    this._element.style.cssText += cssText;

    // TODO: Eventオブジェクト作る.
    this.trigger('posChanged', this, null);
  },

  addPos: function(deltaPos) {
    var x = this._layout.pos.x + (deltaPos.x || 0);
    var y = this._layout.pos.y + (deltaPos.y || 0);
    this.setPos({x: x, y: y});
  },

  getPos: function() {
    return this._cloneObject(this._layout.pos);
  },

  setLink: function(link) {
    this._layout.link = link;

    if (link) {
      this._linkGesture.start();
    } else {
      this._linkGesture.stop();
    }
  },

  getLink: function() {
    return this._cloneObject(this._layout.link);
  }
});
