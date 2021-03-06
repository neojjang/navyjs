/**
 * @class Navy.View.Image
 */
Navy.Class('Navy.View.Image', Navy.View.View, {
  _imgElm: null,

  initialize: function($super, layout, callback) {
    $super(layout, callback);
  },

  _createExtraElement: function($super, layout) {
    $super(layout);

    var imgElm = document.createElement('img');
    this._element.appendChild(imgElm);
    this._imgElm = imgElm;
  },

  _applyExtraLayout: function($super, layout, callback) {
    $super(layout, callback);
  },

  _loadExtraAsset: function($super, layout, callback) {
    if (layout && layout.extra.src) {
      this.setSrc(layout.extra.src, function(){
        $super(layout, callback);
      });
    } else {
      $super(layout, callback);
    }
  },

  _calcWrapContentSize: function() {
    var border = this.getBorderSize();
    var padding = this.getPaddingSize();
    // android: widthではなくnaturalWidthを使うのはwidthだとなぜか1pxの誤差ができる時がある(Nexus5 Chrome32で発生)
    return {
      width: this._imgElm.naturalWidth + border.left + border.right + padding.left + padding.right,
      height: this._imgElm.naturalHeight + border.top + border.bottom + padding.top + padding.bottom
    };
  },

  _onLoadImage: function(src, width, height){
    this.trigger('SizeChanged');
  },

  setSrc: function(src, callback) {
    this._layout.extra.src = src;
    Navy.Asset.loadImage(this._imgElm, src, function(src, width, height){
      this._onLoadImage(src, width, height);
      callback && callback();
    }.bind(this));
  },

  getSrc: function() {
    return this._layout.src;
  }
});
