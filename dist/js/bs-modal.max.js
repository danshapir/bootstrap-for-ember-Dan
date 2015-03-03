/*
Modal component.
*/


(function() {
  Bootstrap.ResizeMixin = Ember.Mixin.create({
    resizing: false,
    resizeDelay: 200,
    findResizableParentView: function(parent) {
      if (Ember.isNone(parent)) {
        return null;
      }
      if (parent && !parent.has('resize')) {
        return this.findResizableParentView(parent.get('parentView'));
      }
      return parent;
    },
    _setupResizeHandlers: (function() {
      var parent, resizeHandler;
      resizeHandler = this.get('_handleResize');
      parent = this.findResizableParentView(this.get('parentView'));
      if (Ember.isNone(parent)) {
        resizeHandler = Ember.$.proxy(resizeHandler, this);
        Ember.$(window).on('resize.' + this.elementId, resizeHandler);
        this._resizeHandler = resizeHandler;
      } else {
        parent.on('resize', this, resizeHandler);
      }
    }).on('didInsertElement'),
    _removeResizeHandlers: (function() {
      if (this._resizeHandler) {
        Ember.$(window).off('resize.' + this.elementId, this._resizeHandler);
      }
    }).on('willDestroyElement'),
    _handleResize: function(event, promise) {
      if (Ember.isNone(promise)) {
        promise = Ember.RSVP.resolve(null, 'Resize handler');
      }
      if (!this.get('resizing')) {
        this.set('resizing', true);
        if (this.has('resizeStart')) {
          this.trigger('resizeStart', event);
        }
      }
      if (this.has('resize')) {
        this.trigger('resize', event, promise);
      }
      Ember.run.debounce(this, this._endResize, event, this.get('resizeDelay'));
    },
    _endResize: function(event) {
      this.set('resizing', false);
      if (this.has('resizeEnd')) {
        this.trigger('resizeEnd', event);
      }
    }
  });

  Bootstrap.BsModalComponent = Ember.Component.extend(Ember.Evented, Bootstrap.ResizeMixin, {
    layoutName: 'components/bs-modal',
    classNames: ['modal'],
    classNameBindings: ['fade', 'isVis:in', 'vertical:vertical'],
    attributeBindings: ['role', 'aria-labelledby', 'isAriaHidden:aria-hidden', "ariaLabelledBy:aria-labelledby"],
    isAriaHidden: (function() {
      return "" + (this.get('isVisible'));
    }).property('isVisible'),
    dialogStyle: (function() {
      Ember.run.scheduleOnce('afterRender', this, function() {
        if (this.$()) {
          return this.$().find('.modal-dialog').css('z-index', this.get('zindex'));
        }
      });
    }).observes('zindex'),
    backdropStyle: (function() {
      return "z-index: " + (this.get('zindex') - 2) + ";";
    }).property('zindex'),
    modalBackdrop: '<div class="modal-backdrop fade in"></div>',
    role: 'dialog',
    footerViews: [],
    backdrop: true,
    title: null,
    isVisible: false,
    manual: false,
    isVis: false,
    fullSizeButtons: false,
    fade: true,
    vertical: false,
    zindex: 1000,
    onResize: (function() {
      if (this.get('vertical')) {
        return Ember.run.scheduleOnce('afterRender', this, function() {
          var contentHeight, footerHeight, headerHeight;
          contentHeight = void 0;
          footerHeight = void 0;
          headerHeight = void 0;
          contentHeight = Ember.$(window).height() - 60;
          headerHeight = this.$().find('.modal-header').outerHeight() || 2;
          footerHeight = this.$().find('.modal-footer').outerHeight() || 2;
          this.$().find('.modal-content').css({
            'max-height': function() {
              return contentHeight;
            }
          });
          this.$().find('.modal-body').css({
            'max-height': function() {
              return contentHeight - headerHeight + footerHeight;
            }
          });
          return this.$().find('.modal-dialog').addClass('modal-dialog-center').css({
            'margin-top': function() {
              return -(Ember.$(this).outerHeight() / 2);
            },
            'margin-left': function() {
              return -(Ember.$(this).outerWidth() / 2);
            }
          });
        });
      }
    }).on('resize'),
    didInsertElement: function() {
      var name;
      this._super();
      this.setupBinders();
      name = this.get('name');
      Ember.assert("Modal name is required for modal view " + (this.get('elementId')), this.get('name'));
      if (name == null) {
        name = this.get('elementId');
      }
      Bootstrap.ModalManager.add(name, this);
      this.onResize();
      this.dialogStyle();
      if (this.manual) {
        return this.show();
      }
    },
    becameVisible: function() {
      return Em.$('body').addClass('modal-open');
    },
    becameHidden: function() {
      return Em.$('body').removeClass('modal-open');
    },
    appendBackdrop: function() {
      var parentElement;
      parentElement = this.$().parent();
      return this._backdrop = Em.$(this.modalBackdrop).appendTo(parentElement);
    },
    show: function() {
      var current;
      this.set('isVisible', true);
      current = this;
      setTimeout((function() {
        current.set('isVis', true);
      }), 15);
    },
    hide: function() {
      var current;
      this.set('isVis', false);
      current = this;
      if (this.get('fade')) {
        this.$().one('webkitTransitionEnd', function(e) {
          current.set('isVisible', false);
        });
      } else {
        current.set('isVisible', false);
      }
      return false;
    },
    toggle: function() {
      return this.toggleProperty('isVisible');
    },
    click: function(event) {
      var target, targetDismiss;
      target = event.target;
      targetDismiss = target.getAttribute("data-dismiss");
      if (targetDismiss === 'modal') {
        return this.close();
      }
    },
    keyPressed: function(event) {
      if (event.keyCode === 27) {
        return this.close(event);
      }
    },
    close: function(event) {
      var current;
      this.set('isVis', false);
      current = this;
      if (this.get('fade')) {
        this.$().one('webkitTransitionEnd', function(e) {
          if (current.get('manual')) {
            current.destroy();
          } else {
            current.hide();
          }
        });
      } else {
        current.hide();
      }
      return this.trigger('closed', this);
    },
    willDestroyElement: function() {
      var name;
      Em.$('body').removeClass('modal-open');
      this.removeHandlers();
      name = this.get('name');
      if (name == null) {
        name = this.get('elementId');
      }
      Bootstrap.ModalManager.remove(name, this);
      if (this._backdrop) {
        return this._backdrop.remove();
      }
    },
    removeHandlers: function() {
      return jQuery(window.document).unbind("keyup", this._keyUpHandler);
    },
    setupBinders: function() {
      var handler,
        _this = this;
      handler = function(event) {
        return _this.keyPressed(event);
      };
      jQuery(window.document).bind("keyup", handler);
      return this._keyUpHandler = handler;
    }
  });

  /*
  Bootstrap.BsModalComponent = Bootstrap.BsModalComponent.reopenClass(
      build: (options) ->
          options = {}  unless options
          options.manual = true
          modalPane = @create(options)
          modalPane.append()
  )
  */


  Bootstrap.ModalManager = Ember.Object.createWithMixins(Ember.Evented, {
    add: function(name, modalInstance) {
      var zindex;
      zindex = this.get('zindex');
      this.set('zindex', zindex + 2);
      modalInstance.set('zindex', zindex + 2);
      modalInstance.on('closed', function(e) {
        zindex = e.get('zindex');
        if (zindex === Bootstrap.ModalManager.get('zindex')) {
          Bootstrap.ModalManager.set('zindex', zindex - 2);
        }
        return Bootstrap.ModalManager.trigger('closed', e);
      });
      return this.set(name, modalInstance);
    },
    register: function(name, modalInstance) {
      this.add(name, modalInstance);
      return modalInstance.appendTo(modalInstance.get('targetObject').namespace.rootElement);
    },
    remove: function(name) {
      return this.set(name, null);
    },
    close: function(name) {
      return this.get(name).close();
    },
    hide: function(name) {
      return this.get(name).hide();
    },
    show: function(name) {
      return this.get(name).show();
    },
    toggle: function(name) {
      return this.get(name).toggle();
    },
    confirm: function(controller, title, message, options, confirmButtonTitle, confirmButtonEvent, confirmButtonType, cancelButtonTitle, cancelButtonEvent, cancelButtonType) {
      var body, buttons;
      if (confirmButtonTitle == null) {
        confirmButtonTitle = "Confirm";
      }
      if (confirmButtonEvent == null) {
        confirmButtonEvent = "modalConfirmed";
      }
      if (confirmButtonType == null) {
        confirmButtonType = null;
      }
      if (cancelButtonTitle == null) {
        cancelButtonTitle = "Cancel";
      }
      if (cancelButtonEvent == null) {
        cancelButtonEvent = "modalCanceled";
      }
      if (cancelButtonType == null) {
        cancelButtonType = null;
      }
      body = Ember.View.extend({
        template: Ember.Handlebars.compile(message || "Are you sure you would like to perform this action?")
      });
      buttons = [
        Ember.Object.create({
          title: confirmButtonTitle,
          clicked: confirmButtonEvent,
          type: confirmButtonType,
          dismiss: 'modal'
        }), Ember.Object.create({
          title: cancelButtonTitle,
          clicked: cancelButtonEvent,
          type: cancelButtonType,
          dismiss: 'modal'
        })
      ];
      return this.open('confirm-modal', title || 'Confirmation required!', body, buttons, controller, options);
    },
    okModal: function(controller, title, message, okButtonTitle, okButtonEvent, okButtonType, options) {
      var body, buttons;
      if (okButtonTitle == null) {
        okButtonTitle = "OK";
      }
      if (okButtonEvent == null) {
        okButtonEvent = "okModal";
      }
      if (okButtonType == null) {
        okButtonType = null;
      }
      body = Ember.View.extend({
        template: Ember.Handlebars.compile(message || "Are you sure you would like to perform this action?")
      });
      buttons = [
        Ember.Object.create({
          title: okButtonTitle,
          clicked: okButtonEvent,
          type: okButtonType,
          dismiss: 'modal'
        })
      ];
      return this.open('ok-modal', title || 'Confirmation required!', body, buttons, controller, options);
    },
    openModal: function(modalView, options) {
      var instance, rootElement;
      if (options == null) {
        options = {};
      }
      rootElement = options.rootElement || '.ember-application';
      instance = modalView.create(options);
      return instance.appendTo(rootElement);
    },
    openManual: function(name, title, content, footerButtons, controller, options) {
      var view;
      view = Ember.View.extend({
        template: Ember.Handlebars.compile(content),
        controller: controller
      });
      return this.open(name, title, view, footerButtons, controller, options);
    },
    open: function(name, title, view, footerButtons, controller, options) {
      var cl, modalComponent, template;
      cl = void 0;
      modalComponent = void 0;
      template = void 0;
      if (options == null) {
        options = {};
      }
      if (options.fade == null) {
        options.fade = this.get("fade");
      }
      if (options.fullSizeButtons == null) {
        options.fullSizeButtons = this.get("fullSizeButtons");
      }
      if (options.targetObject == null) {
        options.targetObject = controller;
      }
      if (options.vertical == null) {
        options.vertical = this.get("vertical");
      }
      cl = controller.container.lookup("component-lookup:main");
      modalComponent = cl.lookupFactory("bs-modal", controller.get("container")).create();
      modalComponent.setProperties({
        name: name,
        title: title,
        manual: true,
        footerButtons: footerButtons
      });
      modalComponent.setProperties(options);
      if (Ember.typeOf(view) === "string") {
        template = controller.container.lookup("template:" + view);
        Ember.assert("Template " + view + " was specified for Modal but template could not be found.", template);
        if (template) {
          modalComponent.setProperties({
            body: Ember.View.extend({
              template: template,
              controller: controller
            })
          });
        }
      } else if (Ember.typeOf(view) === "class") {
        modalComponent.setProperties({
          body: view,
          controller: controller
        });
      }
      return modalComponent.appendTo(controller.namespace.rootElement);
    },
    fade: true,
    fullSizeButtons: false,
    vertical: false,
    zindex: 1000
  });

  Ember.Application.initializer({
    name: 'bs-modal',
    initialize: function(container, application) {
      return container.register("component:bs-modal", Bootstrap.BsModalComponent);
    }
  });

}).call(this);

Ember.TEMPLATES["components/bs-modal"] = Ember.HTMLBars.template((function() {
  var child0 = (function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("                    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("i");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1]);
        element(env, element0, context, "bind-attr", [], {"class": "titleIconClasses"});
        return fragment;
      }
    };
  }());
  var child1 = (function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("                ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        inline(env, morph0, context, "view", [get(env, context, "view.body")], {});
        return fragment;
      }
    };
  }());
  var child2 = (function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("                ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }());
  var child3 = (function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("                ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        inline(env, morph0, context, "bs-button", [], {"content": get(env, context, "this"), "targetObjectBinding": "view.targetObject"});
        return fragment;
      }
    };
  }());
  var child4 = (function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("                ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        inline(env, morph0, context, "view", [get(env, context, "this")], {});
        return fragment;
      }
    };
  }());
  return {
    isHTMLBars: true,
    blockParams: 0,
    cachedFragment: null,
    hasRendered: false,
    build: function build(dom) {
      var el0 = dom.createDocumentFragment();
      var el1 = dom.createElement("div");
      dom.setAttribute(el1,"class","modal-dialog");
      var el2 = dom.createTextNode("\n    ");
      dom.appendChild(el1, el2);
      var el2 = dom.createElement("div");
      dom.setAttribute(el2,"class","modal-content");
      var el3 = dom.createTextNode("\n        ");
      dom.appendChild(el2, el3);
      var el3 = dom.createElement("div");
      dom.setAttribute(el3,"class","modal-header");
      var el4 = dom.createTextNode("\n            ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("button");
      dom.setAttribute(el4,"type","button");
      dom.setAttribute(el4,"data-dismiss","modal");
      dom.setAttribute(el4,"aria-hidden","true");
      var el5 = dom.createTextNode("×");
      dom.appendChild(el4, el5);
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n            ");
      dom.appendChild(el3, el4);
      var el4 = dom.createElement("h4");
      dom.setAttribute(el4,"class","modal-title");
      var el5 = dom.createTextNode("\n");
      dom.appendChild(el4, el5);
      var el5 = dom.createTextNode("                ");
      dom.appendChild(el4, el5);
      var el5 = dom.createTextNode("\n            ");
      dom.appendChild(el4, el5);
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("\n        ");
      dom.appendChild(el3, el4);
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n        ");
      dom.appendChild(el2, el3);
      var el3 = dom.createElement("div");
      dom.setAttribute(el3,"class","modal-body");
      var el4 = dom.createTextNode("\n");
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("        ");
      dom.appendChild(el3, el4);
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n        ");
      dom.appendChild(el2, el3);
      var el3 = dom.createElement("div");
      var el4 = dom.createTextNode("\n");
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("");
      dom.appendChild(el3, el4);
      var el4 = dom.createTextNode("        ");
      dom.appendChild(el3, el4);
      dom.appendChild(el2, el3);
      var el3 = dom.createTextNode("\n    ");
      dom.appendChild(el2, el3);
      dom.appendChild(el1, el2);
      var el2 = dom.createTextNode("\n");
      dom.appendChild(el1, el2);
      dom.appendChild(el0, el1);
      var el1 = dom.createTextNode("\n\n");
      dom.appendChild(el0, el1);
      var el1 = dom.createElement("div");
      dom.appendChild(el0, el1);
      return el0;
    },
    render: function render(context, env, contextualElement) {
      var dom = env.dom;
      var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block, content = hooks.content;
      dom.detectNamespace(contextualElement);
      var fragment;
      if (env.useFragmentCache && dom.canClone) {
        if (this.cachedFragment === null) {
          fragment = this.build(dom);
          if (this.hasRendered) {
            this.cachedFragment = fragment;
          } else {
            this.hasRendered = true;
          }
        }
        if (this.cachedFragment) {
          fragment = dom.cloneNode(this.cachedFragment, true);
        }
      } else {
        fragment = this.build(dom);
      }
      var element1 = dom.childAt(fragment, [0, 1]);
      var element2 = dom.childAt(element1, [1]);
      var element3 = dom.childAt(element2, [1]);
      var element4 = dom.childAt(element2, [3]);
      var element5 = dom.childAt(element1, [5]);
      if (this.cachedFragment) { dom.repairClonedNode(element5,[1]); }
      var element6 = dom.childAt(fragment, [2]);
      var morph0 = dom.createMorphAt(element4,0,1);
      var morph1 = dom.createUnsafeMorphAt(element4,1,2);
      var morph2 = dom.createMorphAt(dom.childAt(element1, [3]),0,1);
      var morph3 = dom.createMorphAt(element5,0,1);
      var morph4 = dom.createMorphAt(element5,1,2);
      element(env, element3, context, "bind-attr", [], {"class": ":close allowClose::hide"});
      block(env, morph0, context, "if", [get(env, context, "titleIconClasses")], {}, child0, null);
      content(env, morph1, context, "title");
      block(env, morph2, context, "if", [get(env, context, "body")], {}, child1, child2);
      element(env, element5, context, "bind-attr", [], {"class": ":modal-footer fullSizeButtons:modal-footer-full"});
      block(env, morph3, context, "each", [get(env, context, "footerButtons")], {}, child3, null);
      block(env, morph4, context, "each", [get(env, context, "footerViews")], {}, child4, null);
      element(env, element6, context, "bind-attr", [], {"style": get(env, context, "backdropStyle"), "class": ":modal-backdrop :fade backdrop:in"});
      return fragment;
    }
  };
}()));