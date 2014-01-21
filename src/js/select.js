/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[
		{name: '{C#MODNAME}', files: ['lib.js']}
	]
};
Component.entryPoint = function(NS){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang,
		buildTemplate = this.buildTemplate;
	
	var SelectWidget = function(container, list, cfg){
		cfg = L.merge({
			'exclude': [],
			'value': null,
			'notEmpty': false
		}, cfg || {});
		SelectWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'widget,select,optionempty,option' 
		}, list, cfg);
	};
	YAHOO.extend(SelectWidget, NS.Widget, {
		init: function(list, cfg){
			this.list = list;
			this.cfg = cfg;
			this._value = cfg['value'];
		},
		getValue: function(){
			return this.gel('select.id').value;
		},
		setValue: function(value){
			this._value = value;
			this.gel('select.id').value = value;
		},
		render: function(){
			var __self = this, TM = this._TM, value = this._value, cfg = this.cfg;
	
			var lst = "";
			if (!cfg['notEmpty']){
				lst += TM.replace('optionempty');
			}
			
			var exd = [];
			if (L.isArray(cfg['exclude'])){
				exd = cfg['exclude'];
			}else if (L.isValue(cfg['exclude'])){
				exd[exd.length] = cfg['exclude'];
			}
			this.list.foreach(function(item){
				for (var i=0;i<exd.length;i++){
					if (item.id == exd[i]){ return; }
				}
				var tl  = __self.buildTitle(item);
				if (tl.length > 80){
					tl = tl.substring(0, 80)+'...';
				}
				lst += TM.replace('option',{
					'id': item.id,
					'tl': tl
				});
			});
			
			this.gel('id').innerHTML = TM.replace('select', {'rows': lst});
			this.setValue(value);
		},
		buildTitle: function(item){
			return item.title;
		}
	});
	NS.SelectWidget = SelectWidget;	
	
};