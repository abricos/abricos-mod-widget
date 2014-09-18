/*!
 * Copyright 2014 Alexander Kuzmin <roosit@abricos.org>
 * Licensed under the MIT license
 */

var Component = new Brick.Component();
Component.requires = {
    yui: ['aui-menu'],
    mod: [
        {name: 'sys', files: ['component.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,

        COMPONENT = this,

        BOUNDING_BOX = 'boundingBox';


    return;


    /*
    var MenuNode = function(){
    };
    MenuNode.prototype = {
        initializer: function(){
            this.nodeExtensions = this.nodeExtensions.concat(NS.AppMenuNode);
        }
    }

    var _apmiKey = new Abricos.Key('menu.items');

    var AppMenuNode = function(tree, config){
        this._serializable = this._serializable.concat('title');
        this._serializable = this._serializable.concat('url');

        var lng = tree.get('cmpLanguage');

        this.title = 'title' in config ? config.title : '';
        if (this.title === '' && lng){
            this.title = lng.get(_apmiKey.push(this.id, true));
        }

        this.url = 'url' in config ? config.url : '#';
    };
    AppMenuNode.prototype = {
        title: '',
        url: ''
    };
    NS.AppMenuNode = AppMenuNode;

    NS.AppMenu = Y.Base.create('appMenu', Y.Tree, [
        MenuNode
    ], {
        initializer: function(){
            var component = this.get('component'),
                cmpLanguage = null;

            if (component){
                cmpLanguage = new Abricos.ComponentLanguage(component);
            }
            this.set('cmpLanguage', cmpLanguage);
        }
    }, {
        ATTRS: {
            component: {
                value: null
            }
        }
    });
    /**/

    NS.NavbarWidget = Y.Base.create('navbarWidget', Y.Widget, [
        NS.Language,
        NS.Template
    ], {
        initializer: function(){
            Y.after(this._syncUINavbarWidget, this, 'syncUI');
        },
        _syncUINavbarWidget: function(){
            var bBox = this.get(BOUNDING_BOX),
                items = this.get('items');

            var tp = this.template;

            /*
             bBox.setHTML(tp.replace('menu'));

             console.log(appMenu.children);
             /**/
        }
    }, {
        ATTRS: {
            component: {
                value: COMPONENT
            },
            templateBlockName: {
                value: 'menu'
            },
            items: {
                value: []
            },
            render: {
                value: true
            }
        }
    });

};