/*
Modal component.
*/


(function() {
  Bootstrap.BsModalComponent = Ember.Component.extend(Ember.Evented, {
    layoutName: 'components/bs-modal',
    classNames: ['modal'],
    classNameBindings: ['fade', 'isVis:in'],
    attributeBindings: ['role', 'aria-labelledby', 'isAriaHidden:aria-hidden', "ariaLabelledBy:aria-labelledby"],
    isAriaHidden: (function() {
      return "" + (this.get('isVisible'));
    }).property('isVisible'),
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
      if (this.manual) {
        return this.show();
      }
    },
    becameVisible: function() {
      Em.$('body').addClass('modal-open');
      if (this.get("backdrop")) {
        return this.appendBackdrop();
      }
    },
    becameHidden: function() {
      Em.$('body').removeClass('modal-open');
      if (this._backdrop) {
        return this._backdrop.remove();
      }
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
      this.$().one('webkitTransitionEnd', function(e) {
        current.set('isVisible', false);
      });
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
      this.$().one('webkitTransitionEnd', function(e) {
        if (current.get('manual')) {
          current.destroy();
        } else {
          current.hide();
        }
      });
      return this.trigger('closed');
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


  Bootstrap.ModalManager = Ember.Object.create({
    add: function(name, modalInstance) {
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
    confirm: function(controller, title, message, confirmButtonTitle, confirmButtonEvent, confirmButtonType, cancelButtonTitle, cancelButtonEvent, cancelButtonType, targetObj, fade, fullSizeButtons) {
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
      if (targetObj == null) {
        targetObj = controller;
      }
      if (fade == null) {
        fade = true;
      }
      if (fullSizeButtons == null) {
        fullSizeButtons = false;
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
      return this.open('confirm-modal', title || 'Confirmation required!', body, buttons, controller, fade, fullSizeButtons, targetObj);
    }
  }, {
    okModal: function(controller, title, message, okButtonTitle, okButtonEvent, okButtonType, targetObj, fade, fullSizeButtons) {
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
      if (targetObj == null) {
        targetObj = controller;
      }
      if (fade == null) {
        fade = true;
      }
      if (fullSizeButtons == null) {
        fullSizeButtons = false;
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
      return this.open('ok-modal', title || 'Confirmation required!', body, buttons, controller, fade, fullSizeButtons, targetObj);
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
    openManual: function(name, title, content, footerButtons, controller, fade, fullSizeButtons, targetObj) {
      var view;
      view = Ember.View.extend({
        template: Ember.Handlebars.compile(content),
        controller: controller
      });
      return this.open(name, title, view, footerButtons, controller, fade, fullSizeButtons, targetObj);
    },
    open: function(name, title, view, footerButtons, controller, fade, fullSizeButtons, targetObj) {
      var cl, modalComponent, template;
      if (fullSizeButtons == null) {
        fullSizeButtons = false;
      }
      if (targetObj == null) {
        targetObj = controller;
      }
      cl = controller.container.lookup('component-lookup:main');
      modalComponent = cl.lookupFactory('bs-modal', controller.get('container')).create();
      modalComponent.setProperties({
        name: name,
        title: title,
        manual: true,
        footerButtons: footerButtons,
        targetObject: targetObj,
        fade: fade,
        fullSizeButtons: fullSizeButtons
      });
      if (Ember.typeOf(view) === 'string') {
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
      } else if (Ember.typeOf(view) === 'class') {
        modalComponent.setProperties({
          body: view,
          controller: controller
        });
      }
      return modalComponent.appendTo(controller.namespace.rootElement);
    }
  });

  Ember.Application.initializer({
    name: 'bs-modal',
    initialize: function(container, application) {
      return container.register('component:bs-modal', Bootstrap.BsModalComponent);
    }
  });

}).call(this);

this["Ember"] = this["Ember"] || {};
this["Ember"]["TEMPLATES"] = this["Ember"]["TEMPLATES"] || {};

this["Ember"]["TEMPLATES"]["components/bs-modal"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\r\n                    <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("titleIconClasses")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></i>\r\n                ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\r\n                ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.body", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\r\n            ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\r\n                ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "yield", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\r\n            ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\r\n                ");
  hashContexts = {'content': depth0,'targetObjectBinding': depth0};
  hashTypes = {'content': "ID",'targetObjectBinding': "STRING"};
  options = {hash:{
    'content': (""),
    'targetObjectBinding': ("view.targetObject")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-button'] || depth0['bs-button']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-button", options))));
  data.buffer.push("\r\n            ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\r\n                ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\r\n            ");
  return buffer;
  }

  data.buffer.push("<div class=\"modal-dialog\">\r\n    <div class=\"modal-content\">\r\n        <div class=\"modal-header\">\r\n            <button type=\"button\" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":close allowClose::hide")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\r\n            <h4 class=\"modal-title\">\r\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "titleIconClasses", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\r\n                ");
  hashContexts = {'unescaped': depth0};
  hashTypes = {'unescaped': "STRING"};
  stack2 = helpers._triageMustache.call(depth0, "title", {hash:{
    'unescaped': ("true")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\r\n            </h4>\r\n        </div>\r\n        <div class=\"modal-body\">\r\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "body", {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\r\n        </div>\r\n        <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":modal-footer fullSizeButtons:modal-footer-full")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\r\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "footerButtons", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\r\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "footerViews", {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\r\n        </div>\r\n    </div>\r\n</div>");
  return buffer;
  
});