/*
 @package Abricos
 @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 */

var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['widget.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        BOUNDING_BOX = 'boundingBox',
        SYS = Brick.mod.sys;

    NS.NoticeWidget = Y.Base.create('noticeWidget', Y.Widget, [
        SYS.Template,
        SYS.WidgetClick
    ], {
        initializer: function(){
            Y.after(this._syncUIAppWidget, this, 'syncUI');
        },
        _syncUIAppWidget: function(){
            var bBox = this.get(BOUNDING_BOX),
                tp = this.template;

            bBox.setHTML(tp.replace(tp.cfg.defTName));
            tp.gel('msg').innerHTML = this.get('message');
        },
        onClick: function(){
            this.close();
        },
        close: function(){
            if (this._isNoticeClosed){
                return;
            }
            this._isNoticeClosed = true;

            var bBox = this.get(BOUNDING_BOX);
            bBox.setStyle('overflow', 'hidden');

            var instance = this,
                h = ((bBox.getStyle('height').replace('px', ''))|0) - 10, dy = 1;

            var intid = setInterval(function(){
                h = h - dy;
                if (h <= 0){
                    clearInterval(intid);
                    instance.destroy();
                } else {
                    instance.set('height', h);
                }
            }, 5)
        }
    }, {
        ATTRS: {
            component: {
                value: COMPONENT
            },
            templateBlockName: {
                value: 'widget'
            },
            message: {
                value: ''
            },
            render: {
                value: true
            }
        }
    });

    NS.NoticeContainerWidget = Y.Base.create('noticeContainerWidget', Y.Widget, [
        SYS.Template
    ], {
        initializer: function(){
            Y.after(this._syncUIAppWidget, this, 'syncUI');
        },
        _syncUIAppWidget: function(){
            var bBox = this.get(BOUNDING_BOX),
                tp = this.template;

            bBox.setHTML(tp.replace(tp.cfg.defTName));
        },
        show: function(msg){
            var div = document.createElement('div');
            this.template.gel('list').appendChild(div);
            var w = new NS.NoticeWidget({boundingBox: div, message: msg});

            setTimeout(function(){
                w.close();
            }, 3000);
        }
    }, {
        ATTRS: {
            component: {
                value: COMPONENT
            },
            templateBlockName: {
                value: 'cont'
            },
            render: {
                value: true
            }
        }
    });

    var div = document.createElement('div');
    document.body.appendChild(div);
    NS.notice = new NS.NoticeContainerWidget({
        boundingBox: div
    });

};