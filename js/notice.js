/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[
        {name: 'widget', files: ['lib.js']}
	]
};
Component.entryPoint = function(NS){
	
	var Dom = YAHOO.util.Dom,
		L = YAHOO.lang;
	
	var buildTemplate = this.buildTemplate;
	
	var NoticeWidget = function(container, msg, cfg){
		cfg = L.merge({
			
		}, cfg || {});
		NoticeWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'widget' 
		}, msg, cfg);
	};
	YAHOO.extend(NoticeWidget, Brick.mod.widget.Widget, {
		onLoad: function(msg, cfg){
			this.elSetHTML('msg', msg);
		},
		destroy: function(){
			var el = this.gel('id').parentNode;
			NoticeWidget.superclass.destroy.call(this);
			el.parentNode.removeChild(el);
		},
		onClick: function(el, tp){
			this.close();
		},
		close: function(){
			var __self = this;
			var el = this.gel('id'); 
			Dom.setStyle(el, 'overflow', 'hidden');
			var rg = Dom.getRegion(el), h = rg.height-10, dy = 1;
			
			var intid = setInterval(function(){
				h = h - dy;
				if (h <= 0){
					clearInterval(intid);
					__self.destroy();
				}else{
					Dom.setStyle(el, 'height', h+'px');
				}
			}, 5)
		}
	});
	NS.NoticeWidget = NoticeWidget;

	var NoticeContainerWidget = function(container){
		NoticeContainerWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'cont' 
		});
	};
	YAHOO.extend(NoticeContainerWidget, Brick.mod.widget.Widget, {
		show: function(msg, cfg){
			var div = document.createElement('div');
			this.gel('list').appendChild(div);
			var w = new NS.NoticeWidget(div, msg, cfg);
			
			setTimeout(function(){
				w.close();
			}, 3000);
		}
	});
	NS.NoticeContainerWidget = NoticeContainerWidget;

	var div = document.createElement('div');
	document.body.appendChild(div);
	NS.notice = new NS.NoticeContainerWidget(div);
	
};