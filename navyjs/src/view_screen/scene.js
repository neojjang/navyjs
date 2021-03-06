/**
 * @class Navy.Scene
 * @eventNames Create, ResumeBefore, ResumeAfter, PauseBefore, PauseAfter, Destroy
 */
Navy.Class('Navy.Scene', Navy.ViewGroup.ViewGroup, {
  LIFE_CYCLE_STATE_CREATE: 1,
  LIFE_CYCLE_STATE_RESUME_BEFORE: 2,
  LIFE_CYCLE_STATE_RESUME_AFTER: 3,
  LIFE_CYCLE_STATE_PAUSE_BEFORE: 4,
  LIFE_CYCLE_STATE_PAUSE_AFTER: 5,
  LIFE_CYCLE_STATE_DESTROY: 6,

  _lifeCycleState: 0,
  _pageStack: null,
  _sceneFixedFirstView: null,

  initialize: function($super, layout, callback){
    this._pageStack = [];

    $super(layout, function(){
      var viewId = this._viewsOrder[0];
      this._sceneFixedFirstView = this._views[viewId];
      this.nextPage(layout.extra.page, null, callback.bind(null, this));
    }.bind(this));
  },

  setLayout: function($super, layout, callback) {
    // シーン、ページの場合はsize, posは固定値でよい
    layout.visible = true;
    layout.pos = {x:0, y:0};
    layout.sizePolicy = {width: this.SIZE_POLICY_FIXED, height: this.SIZE_POLICY_FIXED};
    layout.size = {width: Navy.Config.app.size.width, height: Navy.Config.app.size.height};

    $super(layout, callback);
  },

  setPage: function(page) {
    // ignore
  },

  getPage: function() {
    return null;
  },

  setScene: function(scene) {
    // ignore
  },

  getScene: function() {
    return this;
  },

  getCurrentPage: function() {
    var currentStackObj = this._getCurrentStack();
    return currentStackObj.page;
  },

  getPageStackCount: function() {
    return this._pageStack.length;
  },

  // fixme: callbackを実装する.
  linkPage: function(id, data) {
    if (id === '$back') {
      this.backPage(data);
    } else {
      this.nextPage(id, data);
    }
  },

  nextPage: function(pageName, data, callback) {
    Navy.Root.lockView();

    Navy.History.forwarded();

    this._createPage(pageName, function(page){
      this._addPage(page, data);
      callback && callback(page);
    }.bind(this));
  },

  backPage: function(data) {
    if (this._pageStack.length >= 2) {
      Navy.Root.lockView();

      Navy.History.backed();

      var currentStackObj = this._getCurrentStack();
      var prevStackObj = this._getPrevStack();

      currentStackObj.page.trigger('PauseBefore');
      prevStackObj.page.trigger('ResumeBefore', data);

      var transition = currentStackObj.transition;
      transition.back(this._onTransitionBackEnd.bind(this));
    }
  },

  onCreate: function(ev) {
    this._lifeCycleState = this.LIFE_CYCLE_STATE_CREATE;

    ev.addDefaultCallback(function(){
      var page = this.getCurrentPage();
      page.trigger('Create', ev.data);
    });
  },

  onResumeBefore: function(ev){
    this._lifeCycleState = this.LIFE_CYCLE_STATE_PAUSE_BEFORE;

    ev.addDefaultCallback(function(){
      var page = this.getCurrentPage();
      page.trigger('ResumeBefore', ev.data);
    });
  },

  onResumeAfter: function(ev){
    this._lifeCycleState = this.LIFE_CYCLE_STATE_PAUSE_AFTER;

    ev.addDefaultCallback(function(){
      var page = this.getCurrentPage();
      page.trigger('ResumeAfter', ev.data);
    });
  },

  onPauseBefore: function(ev){
    this._lifeCycleState = this.LIFE_CYCLE_STATE_PAUSE_BEFORE;

    ev.addDefaultCallback(function(){
      var page = this.getCurrentPage();
      page.trigger('PauseBefore', ev.data);
    });
  },

  onPauseAfter: function(ev){
    this._lifeCycleState = this.LIFE_CYCLE_STATE_PAUSE_AFTER;

    ev.addDefaultCallback(function(){
      var page = this.getCurrentPage();
      page.trigger('PauseAfter', ev.data);
    });
  },

  onDestroy: function(ev){
    this._lifeCycleState = this.LIFE_CYCLE_STATE_DESTROY;

    ev.addDefaultCallback(function(){
      // TODO: いきなりsceneが終わる場合もあるのですべてのスタックを綺麗にする必要ありそう.
      var page = this.getCurrentPage();
      page.trigger('Destroy', ev.data);
    });
  },

  // fixme: 不要？
  /*
  _getBottomPageLayout: function(layout) {
    var bottomLayout = {
      class: 'Navy.Page',
      id: '$bottom',
      pos: {x:0, y:0},
      size: {width: layout.size.width, height: layout.size.height},
      extra: {
        contentLayoutFile: layout.extra.contentBottomLayoutFile
      }
    };

    return bottomLayout;
  },
  */

  // fixme: 不要？
  /*
  _getTopPageLayout: function(layout) {
    var topLayout = {
      class: 'Navy.Page',
      id: '$top',
      pos: {x:0, y:0, z:100},
      size: {width: layout.size.width, height: layout.size.height},
      extra: {
        contentLayoutFile: layout.extra.contentTopLayoutFile
      }
    };

    return topLayout;
  },
  */

  _createPage: function(pageName, callback) {
    var layout = this._cloneObject(Navy.Config.page[pageName]);
    Navy.Asset.loadScript(layout.classFile, this._onLoadScript.bind(this, layout, callback));
  },

  _createPageByLayout: function(layout, callback) {
    var PageClass = Navy.Asset.getClass(layout.class);
    var page = new PageClass(layout, callback);
    this.addView(page, this._sceneFixedFirstView);
  },

  _onLoadScript: function(layout, callback) {
    var PageClass = Navy.Asset.getClass(layout.class);
    var page = new PageClass(layout, callback);

    // addViewしてしまうとpageが見えてしまうので遷移アニメーションが開始するまで非表示にしておく.
    page.setVisible(false);
    this.addView(page, this._sceneFixedFirstView);
  },

  _addPage: function(page, data) {
    this._lifeCycleState >= this.LIFE_CYCLE_STATE_CREATE && page.trigger('Create', data);
    this._lifeCycleState >= this.LIFE_CYCLE_STATE_RESUME_BEFORE && page.trigger('ResumeBefore');

    var currentStackObj = this._getCurrentStack();
    if (currentStackObj) {
      var beforePage = currentStackObj.page;
      beforePage.trigger('PauseBefore');
    }

    // TODO: 組み込みだけじゃんくてカスタムのTransitionにも対応する.
    var TransitionClass = Navy.Asset.getClass(page.getLayout().extra.transition.class);
    var transition = new TransitionClass(beforePage, page);
    this._pageStack.push({
      page: page,
      transition: transition
    });
    transition.start(this._onTransitionStartEnd.bind(this));
  },

  _getCurrentStack: function() {
    if (this._pageStack.length >= 1) {
      return this._pageStack[this._pageStack.length - 1];
    } else {
      return null;
    }
  },

  _getPrevStack: function(){
    if (this._pageStack.length >= 2) {
      return this._pageStack[this._pageStack.length - 2];
    } else {
      return null;
    }
  },

  _onTransitionStartEnd: function(){
    var prevStackObj = this._getPrevStack();
    if (prevStackObj) {
      prevStackObj.page.trigger('PauseAfter');
    }

    var currentStackObj = this._getCurrentStack();
    if (currentStackObj) {
      this._lifeCycleState >= this.LIFE_CYCLE_STATE_RESUME_AFTER && currentStackObj.page.trigger('ResumeAfter');
    }

    Navy.Root.unlockView();
  },

  _onTransitionBackEnd: function(){
    var prevStackObj = this._getPrevStack();
    if (prevStackObj) {
      prevStackObj.page.trigger('ResumeAfter');
    }

    var currentStackObj = this._getCurrentStack();
    if (currentStackObj) {
      currentStackObj.page.trigger('PauseAfter');
      currentStackObj.page.trigger('Destroy');

      var stackObj = this._pageStack.pop();
      stackObj.page.destroy();
    }

    Navy.Root.unlockView();
  }
});
