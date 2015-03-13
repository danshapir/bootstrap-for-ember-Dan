Bootstrap.BsButtonComponent = Ember.Component.extend(Ember._ProxyMixin, Bootstrap.TypeSupport, Bootstrap.SizeSupport,
  layoutName: 'components/bs-button'
  tagName: 'button'
  classNames: ['btn']
  classNameBindings: ['blockClass']
  classTypePrefix: 'btn'
  clickedParam: null
  block: null
  attributeBindings: ['disabled', 'dismiss:data-dismiss', 'contentDismiss:data-dismiss', '_type:type', 'style']
  _type: 'button'
  bubbles: true
  allowedProperties: ['title', 'type', 'size', 'block', 'disabled', 'clicked', 'dismiss', 'class']
  icon_active: undefined
  icon_inactive: undefined
  getPojoProperties: (pojo) ->
    if Ember.isEmpty(pojo)
      return []
    Object.keys pojo

  getProxiedProperties: (proxyObject) ->
    # Three levels, first the content, then the prototype, then the properties of the instance itself
    contentProperties = @getObjectProperties(proxyObject.get('content'))
    prototypeProperties = Object.keys(proxyObject.constructor.prototype)
    objectProperties = @getPojoProperties(proxyObject)
    contentProperties.concat(prototypeProperties).concat(objectProperties).uniq()

  getEmberObjectProperties: (emberObject) ->
    prototypeProperties = Object.keys(emberObject.constructor.prototype)
    objectProperties = @getPojoProperties(emberObject)
    prototypeProperties.concat(objectProperties).uniq()

  getEmberDataProperties: (emberDataObject) ->
    attributes = Ember.get(emberDataObject.constructor, 'attributes')
    keys = Ember.get(attributes, 'keys.list')
    Ember.getProperties emberDataObject, keys

  getObjectProperties: (object) ->
    if object instanceof DS.Model
      @getEmberDataProperties object
    else if object instanceof Ember.ObjectProxy or Ember._ProxyMixin.detect(object)
      @getProxiedProperties object
    else if object instanceof Ember.Object
      @getEmberObjectProperties object
    else
      @getPojoProperties object

  init: ->
     @_super()
     me = @
     # If content is an object (may happen when a button is the view class of a collectionView), then assign allowed properties to the button component.
     if @get('content')? and Ember.typeOf(@get('content')) is 'instance'
         properties = @.getObjectProperties(@.get('content'))
         @.getProperties(properties)
     else
         if not @get('title')?
             @set('title', @get('content'))
     #@attributeBindings.pushObject attr for attr of @ when attr.match(/^data-[\w-]*$/)?

  blockClass: ( ->
      if @block then "#{@classTypePrefix}-block" else null
  ).property('block')

  contentDismiss: ( ->
    @get('content.dismiss')
  ).property('content.dismiss')

  click: (evt) ->
      evt.stopPropagation() unless @get('bubbles')
      @sendAction('clicked', @get('clickedParam'))

  loadingChanged: (->
      loading = if @get('loading') isnt null then @get('loading') else "reset"
      if loading isnt 'reset' and Ember.isEmpty(@.get('reset'))
        @.set('reset', @.$().html())

      @set('disabled', true)
      @.$().html(@.get(loading))

      if loading is 'reset'
        @set('disabled', false)
        @set('reset', null)
      #Ember.$("##{@elementId}").button(loading)
  ).observes('loading')

  icon: (->
      if @get('isActive') then @get('icon_active') else @get('icon_inactive')
  ).property('isActive')
)

Ember.Handlebars.helper 'bs-button', Bootstrap.BsButtonComponent
