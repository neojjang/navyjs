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
    this._element.appendChild(this._textElement);
  },

  _applyExtraLayout: function($super, layout, callback) {
    if (!layout.extra) {
      return;
    }

    this.setFontSize(layout.extra.fontSize);

    $super(layout, callback);
  },

  _loadExtraResource: function($super, layout, callback) {
    this.setText(layout.extra.text);

    $super(layout, callback);
  },

  _calcWrapContentSize: function() {
    return {
      width: this._textElement.offsetWidth,
      height: this._textElement.offsetHeight
    };
  },

  setText: function(text) {
    this._layout.extra.text = text;
    this._textElement.textContent = text;
    this.trigger('sizeChanged', this, null);
  },

  getText: function() {
    return this._layout.extra.text;
  },

  setFontSize: function(fontSize) {
    this._layout.extra.fontSize = fontSize;
    this._element.style.fontSize = fontSize + 'px';
    this.trigger('sizeChanged', this, null);
  },

  getFontSize: function() {
    return this._layout.extra.fontSize;
  }
});
