/**
 * @class Navy.View.TextEdit
 */
Navy.Class('Navy.View.TextEdit', Navy.View.View, {
  _textElement: null,

  /**
   *
   * @param $super
   * @param {TextEditLayout} layout
   * @param {function} callback
   */
  initialize: function($super, layout, callback) {
    $super(layout, callback);
  },

  _createExtraElement: function($super, layout) {
    $super(layout);

    this._textElement = document.createElement('input');
    this._textElement.style.cssText = '-webkit-user-select:auto; width: 100%; height:100%; box-sizing:border-box; border:none;';
    this._element.appendChild(this._textElement);
  },

  _loadExtraAsset: function($super, layout, callback) {
    this.setText(layout.extra.text);

    $super(layout, callback);
  },

  _calcWrapContentSize: function() {
    return {
      width: this._textElement.offsetWidth,
      height: this._textElement.offsetHeight
    };
  },

  _applyExtraLayout: function($super, layout, callback) {
    if (!layout.extra) {
      return;
    }

    this.setFontSize(layout.extra.fontSize);
    this.setFontColor(layout.extra.fontColor);
    this.setPlaceholder(layout.extra.placeholder);
    this.setTextType(layout.extra.textType);

    $super(layout, callback);
  },

  setText: function(text) {
    this._layout.extra.text = text;
    this._textElement.value = text;

    if (this._layout.sizePolicy.width === this.SIZE_POLICY_WRAP_CONTENT || this._layout.sizePolicy.height === this.SIZE_POLICY_WRAP_CONTENT) {
      this._updateSizeWithWrapContentSize();
      this.trigger('SizeChanged');
    }
  },

  getText: function() {
    return this._textElement.value;
  },

  setFontSize: function(fontSize) {
    this._layout.extra.fontSize = fontSize;
    this._textElement.style.fontSize = fontSize + 'px';

    if (this._layout.sizePolicy.width === this.SIZE_POLICY_WRAP_CONTENT || this._layout.sizePolicy.height === this.SIZE_POLICY_WRAP_CONTENT) {
      this._updateSizeWithWrapContentSize();
      this.trigger('SizeChanged');
    }
  },

  getFontSize: function() {
    return this._layout.extra.fontSize;
  },

  setFontColor: function(fontColor) {
    this._layout.extra.fontColor = fontColor;
    this._textElement.style.color = fontColor;
  },

  getFontColor: function() {
    return this._layout.extra.fontColor;
  },

  getPlaceholder: function() {
    return this._layout.extra.placeHolder;
  },

  setPlaceholder: function(placeholder) {
    this._textElement.placeholder = placeholder;
    this._layout.extra.placeholder = placeholder;
  },

  setTextType: function(textType) {
    this._layout.extra.textType = textType;
    this._textElement.type = textType;
  },

  getTextType: function() {
    return this._layout.extra.textType;
  }
});
