(function() {
  Bootstrap.BsBadgeComponent = Ember.Component.extend(Bootstrap.TypeSupport, {
    layoutName: 'components/bs-badge',
    tagName: 'span',
    classNames: ['badge'],
    classTypePrefix: 'badge'
  });

  Ember.Handlebars.helper('bs-badge', Bootstrap.BsBadgeComponent);

}).call(this);

Ember.TEMPLATES["components/bs-badge"] = Ember.HTMLBars.template((function() {
  return {
    isHTMLBars: true,
    blockParams: 0,
    cachedFragment: null,
    hasRendered: false,
    build: function build(dom) {
      var el0 = dom.createDocumentFragment();
      var el1 = dom.createTextNode("");
      dom.appendChild(el0, el1);
      var el1 = dom.createTextNode("");
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
      if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
      var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
      content(env, morph0, context, "content");
      return fragment;
    }
  };
}()));