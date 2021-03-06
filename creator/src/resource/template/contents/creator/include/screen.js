/**
 * @typedef {Object} Include.Screen
 */
Navy.Class.instance('Include.Screen', Include.Include, {
  _setScreen: function(sceneId, pageId, enable) {
    if (sceneId && Navy.Config.scene[sceneId]) {
      var sceneLayout = JSON.parse(JSON.stringify(Navy.Config.scene[sceneId]));
      this._contentLayoutMeta.__creator__.screenSceneId = sceneId;
    }

    if (pageId && Navy.Config.page[pageId]) {
      var pageLayout = JSON.parse(JSON.stringify(Navy.Config.page[pageId]));
      this._contentLayoutMeta.__creator__.screenPageId = pageId;
    }

    if (sceneLayout && pageLayout) {
      var scene = this.getScene();

      //FIXME: 本来はレイアウトの設定でIDが変わらないようにNavyを修正すべき
      sceneLayout.id = scene.getId();

      //レイアウトを再設定するのでPage以外のviewを削除しておく
      var views = scene.getAllViews();
      for (var viewId in views) {
        var view = views[viewId];
        if (view !== this) {
          scene.removeView(view);
        }
      }
      scene.setLayout(sceneLayout, this._setScreenEnable.bind(this, enable));

      this.setBackgroundColor(pageLayout.backgroundColor);
    } else if (sceneLayout) {
      var scene = this.getScene();
      scene.setBackgroundColor(sceneLayout.backgroundColor);

      this._setScreenEnable(enable);
    } else {
      this._setScreenEnable(enable);
    }
  },

  _setScreenEnable: function(enable) {
    this._contentLayoutMeta.__creator__.screenEnable = enable;

    var scene = this.getScene();
    var views = scene.getAllViews();
    for (var viewId in views) {
      var view = views[viewId];
      if (view !== this) {
        view.setVisible(enable);
      }
    }

    /*
     * 無効にする場合は背景も合わせて透明にしておく.
     * 有効にする場合、Creator側で再度setScreenToJSを発行してもらうため元の背景色を復元させなくてもよい.
     */
    if (!enable) {
      this.setBackgroundColor('transparent');
      scene.setBackgroundColor('transparent');
    }
  }
});
