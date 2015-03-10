Bootstrap = window.Bootstrap
get = Ember.get
set = Ember.set

Bootstrap.TypeSupport = Ember.Mixin.create(
    classTypePrefix: Ember.required(String)
    classNameBindings: ['typeClass']
    type: 'default'

    typeClass: ( ->
        type = @get 'content.type'
        type = @get 'type' if not type? or typeof type is 'undefined'
        type = 'default' if not type?

        pref = @get 'classTypePrefix'
        "#{pref}-#{type}"
    ).property('type', 'content.type').cacheable()
)