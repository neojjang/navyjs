/**
 * @class Navy.View.Text
 */
Navy.Class('Navy.View.Text', Navy.View.View, {
  _textElement: null,

  /**
   *
   * @param $super
   * @param {TextLayout} layout
   * @param {function} callback
   */
  initialize: function($super, layout, callback) {
    $super(layout, callback);
  },

  _createExtraElement: function($super, layout) {
    $super(layout);

    this._textElement = document.createElement('span');
    // inlineだとdivとの間に隙間ができてY方向でぴったり揃わないのでinline-blockにする.
    this._textElement.style.display = 'inline-block';
    this._textElement.style.lineHeight = 'normal';
    this._element.appendChild(this._textElement);
  },

  _applyExtraLayout: function($super, layout, callback) {
    if (!layout.extra) {
      return;
    }

    this.setFontSize(layout.extra.fontSize);
    this.setFontColor(layout.extra.fontColor);
    this.setFontBold(layout.extra.fontBold);
    this.setTextAlign(layout.extra.textAlign);

    $super(layout, callback);
  },

  _loadExtraAsset: function($super, layout, callback) {
    this.setText(layout.extra.text);

    $super(layout, callback);
  },

  _calcWrapContentSize: function() {
    var border = this.getBorderSize();
    var padding = this.getPaddingSize();
    return {
      width: this._textElement.offsetWidth + border.left + border.right + padding.left + padding.right,
      height: this._textElement.offsetHeight + border.top + border.bottom + padding.top + padding.bottom
    };
  },

  setSize: function($super, size) {
    $super(size);
    this._element.style.lineHeight = this._element.clientHeight + 'px';
  },

  setText: function(text) {
    this._layout.extra.text = text;
    this._textElement.textContent = text;

    if (this._layout.sizePolicy.width === this.SIZE_POLICY_WRAP_CONTENT || this._layout.sizePolicy.height === this.SIZE_POLICY_WRAP_CONTENT) {
      this._updateSizeWithWrapContentSize();
      this.trigger('SizeChanged');
    }
  },

  getText: function() {
    return this._layout.extra.text;
  },

  setFontSize: function(fontSize) {
    this._layout.extra.fontSize = fontSize;
    this._element.style.fontSize = fontSize + 'px';

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
    this._element.style.color = fontColor;
  },

  getFontColor: function() {
    return this._layout.extra.fontColor;
  },

  setTextAlign: function(textAlign) {
    this._layout.extra.textAlign = textAlign;

    if (textAlign) {
      this._element.style.textAlign = textAlign.horizontal;
      this._textElement.style.verticalAlign = textAlign.vertical;
    }
  },

  getTextAlign: function() {
    return this._cloneObject(this._layout.extra.textAlign);
  },

  setFontBold: function(bold) {
    this._layout.extra.fontBold = bold;
    if (bold) {
      this._textElement.style.fontWeight = 'bold';
    } else {
      this._textElement.style.fontWeight = '';
    }
  },

  isFontBold: function() {
    return this._layout.extra.fontBold;
  }
});
