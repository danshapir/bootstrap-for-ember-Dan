(function() {
  Bootstrap.BsAlertComponent = Ember.Component.extend(Bootstrap.TypeSupport, {
    classNames: ['alert'],
    classNameBindings: ['fade', 'fade:in'],
    layoutName: 'components/bs-alert',
    classTypePrefix: 'alert',
    attributeBindings: ['data-timeout'],
    dismissAfter: 0,
    closedParam: null,
    didInsertElement: function() {
      var _this = this;
      if (this.dismissAfter > 0) {
        Ember.run.later(this, 'dismiss', this.dismissAfter * 1000);
      }
      Ember.$("#" + this.elementId).bind('closed.bs.alert', function() {
        _this.sendAction('closed', _this.get('closedParam'));
        return _this.destroy();
      });
      return Ember.$("#" + this.elementId).bind('close.bs.alert', function() {
        return _this.sendAction('close', _this.get('closedParam'));
      });
    },
    dismiss: function() {
      return Ember.$("#" + this.elementId).alert('close');
    }
  });

  Ember.Handlebars.helper('bs-alert', Bootstrap.BsAlertComponent);

}).call(this);

this["Ember"] = this["Ember"] || {};
this["Ember"]["TEMPLATES"] = this["Ember"]["TEMPLATES"] || {};

this["Ember"]["TEMPLATES"]["components/bs-alert"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  data.buffer.push("\r\n    <a class=\"close\" data-dismiss=\"alert\" href=\"#\">&times;</a>\r\n");
  }

  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "dismiss", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\r\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "message", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "yield", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  return buffer;
  
});