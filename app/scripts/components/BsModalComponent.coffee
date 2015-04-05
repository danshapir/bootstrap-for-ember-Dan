###
Modal component.
###
#
#Bootstrap.ResizeMixin = Ember.Mixin.create(
#  resizing: false
#  resizeDelay: 200
#  findResizableParentView: (parent) ->
#    if Ember.isNone(parent)
#      return null
#    if parent and !parent.has('resize')
#      return @findResizableParentView(parent.get('parentView'))
#    parent
#  _setupResizeHandlers: (->
#    resizeHandler = @get('_handleResize')
#    parent = @findResizableParentView(@get('parentView'))
#    if Ember.isNone(parent)
#      resizeHandler = Ember.$.proxy(resizeHandler, this)
#      # element doesn't have resizable views, so bind to the window
#      Ember.$(window).on 'resize.' + @elementId, resizeHandler
#      @_resizeHandler = resizeHandler
#    else
#      parent.on 'resize', this, resizeHandler
#    return
#  ).on('didInsertElement')
#  _removeResizeHandlers: (->
#    if @_resizeHandler
#      Ember.$(window).off 'resize.' + @elementId, @_resizeHandler
#    return
#  ).on('willDestroyElement')
#  _handleResize: (event, promise) ->
#    if Ember.isNone(promise)
#      promise = Ember.RSVP.resolve(null, 'Resize handler')
#    if !@get('resizing')
#      @set 'resizing', true
#      if @has('resizeStart')
#        @trigger 'resizeStart', event
#    if @has('resize')
#      @trigger 'resize', event, promise
#    Ember.run.debounce this, @_endResize, event, @get('resizeDelay')
#    return
#  _endResize: (event) ->
#    @set 'resizing', false
#    if @has('resizeEnd')
#      @trigger 'resizeEnd', event
#    return
#)

Bootstrap.BsModalComponent = Ember.Component.extend(Ember.Evented,
    layoutName: 'components/bs-modal'
    classNames: ['modal']
    classNameBindings: ['fade', 'isVis:in', 'vertical:modal-dialog-center', 'class']
    attributeBindings: ['role', 'aria-labelledby', 'isAriaHidden:aria-hidden', "ariaLabelledBy:aria-labelledby"]
    isAriaHidden: (->
        "#{@get('isVisible')}"
    ).property('isVisible')
    dialogStyle: (->
      Ember.run.scheduleOnce 'afterRender', this, ->
        if @$()
          return @$().find('.modal-dialog').css('z-index', @get('zindex'))
      return
    ).observes('zindex')
    dialogVerticalStyle: (->
      if @get('vertical')
        Ember.run.scheduleOnce 'afterRender', this, ->
          if @$()
            marginHeight = @$('.modal-dialog').height() / 2
            return @$().find('.modal-dialog').css('margin-top', '-' +  marginHeight + 'px');
      return
    ).observes('vertical').on('didInsertElement')
    backdropStyle: (->
      "z-index: #{@get('zindex') - 2};"
    ).property('zindex')

    modalBackdrop: '<div class="modal-backdrop fade in"></div>'
    role: 'dialog'
    footerViews: []

    #--Defaults--
    backdrop: true
    title: null
    isVisible: false
    manual: false
    isVis: false
    fullSizeButtons: false
    fade: true
    vertical: false
    zindex: 1000
    keyClose: true

#    onResize: (->
#      # do what you want when resize is triggered
#      if @get('vertical')
#        return Ember.run.scheduleOnce('afterRender', this, ->
#          contentHeight = undefined
#          footerHeight = undefined
#          headerHeight = undefined
#          contentHeight = Ember.$(window).height() - 60
#          headerHeight = @$().find('.modal-header').outerHeight() or 2
#          footerHeight = @$().find('.modal-footer').outerHeight() or 2
#          @$().find('.modal-content').css 'max-height': ->
#            contentHeight
#          @$().find('.modal-body').css 'max-height': ->
#            contentHeight - headerHeight + footerHeight
#          @$().find('.modal-dialog').addClass('modal-dialog-center').css
#            'margin-top': ->
#              -(Ember.$(this).outerHeight() / 2)
#            'margin-left': ->
#              -(Ember.$(this).outerWidth() / 2)
#        )
#      return
#    ).on 'resize'

    didInsertElement: ->
        @._super()
        @setupBinders()
        #Register modal in the modal manager
        name = @get('name')
        Ember.assert("Modal name is required for modal view #{@get('elementId')}", @get('name'))
        name?= @get('elementId')
        Bootstrap.ModalManager.add(name, @)
#        @onResize()
        @dialogStyle()
        if @manual
            @show()

    becameVisible: ->
        Em.$('body').addClass('modal-open')
        #@appendBackdrop() if @get("backdrop")

    becameHidden: ->
        Em.$('body').removeClass('modal-open')
        #@_backdrop.remove() if @_backdrop

    appendBackdrop: ->
        parentElement = @$().parent()
        @_backdrop = Em.$(@modalBackdrop).appendTo(parentElement)

    show: ->
        @set 'isVisible', true
        Ember.run.later @, (->
            @set 'isVis', true
            return
        ), 15
        return

    hide: ->
        if @get('isDestroyed') or @get('isDestroying')
          return
        @set 'isVis', false
        if @get('fade')
          Ember.run.later this, (->
            if @get('isDestroyed') or @get('isDestroying')
              return
            @set 'isVisible', false
            return
          ), 300
        else
          @set 'isVisible', false
        false

    toggle: ->
        @toggleProperty 'isVisible'

    click: (event) ->
        target = event.target
        targetDismiss = target.getAttribute("data-dismiss")
        if targetDismiss is 'modal'
            @close()

    keyPressed: (event) ->
        #Handle ESC
        if event.keyCode == 27 and @get('keyClose') and @get('zindex') == Bootstrap.ModalManager.get('zindex')
            @close event

    close: (event) ->
        if @get('isDestroyed') or @get('isDestroying')
          return
        @set 'isVis', false
        if @get('fade')
          Ember.run.later this, (->
            if @get('isDestroyed') or @get('isDestroying')
              return
            if @get('manual') then @destroy() else @set 'isVisible', false
            @trigger 'closed', this
            return
          ), 300
        else
          @set 'isVisible', false
          @trigger 'closed', this
        

    #Invoked automatically by ember when the view is destroyed, giving us a chance to perform cleanups
    willDestroyElement: ->
        Em.$('body').removeClass('modal-open')
        @removeHandlers()
        name = @get('name')
        name?= @get('elementId')
        Bootstrap.ModalManager.remove(name, @)
        @_backdrop.remove() if @_backdrop

    removeHandlers: ->
        #Remove key press
        jQuery(window.document).unbind "keyup", @_keyUpHandler

    setupBinders: ->
        #Key press
        handler = (event) =>
            @keyPressed event
        jQuery(window.document).bind "keyup", handler
        @_keyUpHandler = handler
)

###
Bootstrap.BsModalComponent = Bootstrap.BsModalComponent.reopenClass(
    build: (options) ->
        options = {}  unless options
        options.manual = true
        modalPane = @create(options)
        modalPane.append()
)
###

Bootstrap.ModalManager = Ember.Object.createWithMixins(Ember.Evented,
    add: (name, modalInstance) ->
        zindex = @get('zindex')
        @set('zindex', zindex + 2)
        modalInstance.set('zindex', zindex + 2)
        modalInstance.on 'closed', (e) ->
          zindex = e.get('zindex')
          Bootstrap.ModalManager.set('zindex', zindex - 2) if zindex is Bootstrap.ModalManager.get('zindex')
          Bootstrap.ModalManager.trigger 'closed', e
        @set name, modalInstance

    register: (name, modalInstance) ->
        @add(name, modalInstance);
        modalInstance.appendTo(modalInstance.get('targetObject').namespace.rootElement)

    remove: (name) ->
        @set name, null

    close: (name) ->
        @get(name).close()

    hide: (name) ->
        @get(name).hide()

    show: (name) ->
        @get(name).show()

    toggle: (name) ->
        @get(name).toggle()

    confirm: (controller, title, message, options, confirmButtonTitle = "Confirm", confirmButtonEvent = "modalConfirmed",confirmButtonType = null, cancelButtonTitle = "Cancel", cancelButtonEvent = "modalCanceled",cancelButtonType = null) ->
        body = Ember.View.extend(
            template: Ember.Handlebars.compile(message || "Are you sure you would like to perform this action?")
        )
        buttons = [
            Ember.Object.create({title: confirmButtonTitle, clicked: confirmButtonEvent, type: confirmButtonType, dismiss: 'modal'})
            Ember.Object.create({title: cancelButtonTitle, clicked: cancelButtonEvent, type: cancelButtonType, dismiss: 'modal'})
        ]
        @open('confirm-modal', title || 'Confirmation required!', body, buttons, controller, options)

    okModal: (controller, title, message, options, okButtonTitle = "OK", okButtonEvent = "okModal", okButtonType = null) ->
        body = Ember.View.extend(
            template: Ember.Handlebars.compile(message || "Are you sure you would like to perform this action?")
        )
        buttons = [
            Ember.Object.create({title: okButtonTitle, clicked:okButtonEvent, type: okButtonType, dismiss: 'modal'})
        ]
        @open('ok-modal', title || 'Confirmation required!', body, buttons, controller, options)

    openModal: (modalView, options = {}) ->
        rootElement = options.rootElement or '.ember-application'
        instance = modalView.create options
        instance.appendTo rootElement

    openManual: (name, title, content, footerButtons, controller, options) ->
      view = Ember.View.extend(
        template: Ember.Handlebars.compile(content)
        controller: controller
      )
      @open name, title, view, footerButtons, controller, options

    open: (name, title, view, footerButtons, controller, options) ->
      cl = undefined
      modalComponent = undefined
      template = undefined
      options = {}  unless options?
      options.fade = @get("fade")  unless options.fade?
      options.fullSizeButtons = @get("fullSizeButtons")  unless options.fullSizeButtons?
      options.targetObject = controller  unless options.targetObject?
      options.vertical = @get("vertical")  unless options.vertical?
      cl = controller.container.lookup("component-lookup:main")
      modalComponent = cl.lookupFactory("bs-modal", controller.get("container")).create()
      modalComponent.setProperties
        name: name
        title: title
        manual: true
        footerButtons: footerButtons
		
      modalComponent.setProperties(options)
	  
      if Ember.typeOf(view) is "string"
      	template = controller.container.lookup("template:" + view)
      	Ember.assert "Template " + view + " was specified for Modal but template could not be found.", template
      	if template
      		modalComponent.setProperties body: Ember.View.extend(
      			template: template
      			controller: controller
      		)
      else if Ember.typeOf(view) is "class"
      	modalComponent.setProperties
      		body: view
      		controller: controller
      rootElement = controller.rootElement
      rootElement = controller.namespace.rootElement unless typeof controller.rootElement isnt "undefined"
      modalComponent.appendTo rootElement
    fade: true
    fullSizeButtons: false
    vertical: false
    zindex: 1000
)


Ember.Application.initializer
    name: 'bs-modal'
    initialize: (container, application) ->
#      Ember.$(window).resize(Bootstrap.adjustModalMaxHeightAndPosition).trigger "resize"  if Ember.$(window).height() >= 320
      container.register "component:bs-modal", Bootstrap.BsModalComponent