/*
@version $Id$
@package Abricos
@copyright Copyright (C) 2011 Abricos All rights reserved.
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	yahoo:['calendar'],
	mod:[{name: 'sys', files: ['date.js']}]
};
Component.entryPoint = function(NS){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang;
	
	var NSys = Brick.mod.sys;
	
	var buildTemplate = this.buildTemplate;
	
	var YDate = YAHOO.widget.DateMath;

	NS.isCurrentDay = function(date){
		return YDate.clearTime(date).getTime() == YDate.clearTime(NSys.getDate()).getTime(); 
	};
	
	NS.dateToKey = function(date){
		date = new Date(date.getTime());
		var d = new Date(date.setHours(0,0,0,0));
		var tz = TZ_OFFSET*60*1000;
		var key = (d.getTime()-tz)/YDate.ONE_DAY_MS ; 
		return key;
	};
	
	NS.calendarLocalize = function(cal){
		var cfg = cal.cfg,
			lng = Brick.util.Language.getc('mod.widget.calendar'),
			dict = [];

		for (var i=1; i<=12; i++){
			dict[dict.length] = lng['month'][i]; 
		}
		cfg.setProperty("MONTHS_LONG", dict);

		dict = [];
		for (var i=0; i<7; i++){
			dict[dict.length] = lng['week']['short'][i]; 
		}
		cfg.setProperty("WEEKDAYS_SHORT", dict);
	};

	var dialog = null,
		elementParent = null;

	var dialogHide = function(){
		dialog.hide();
		dialog.destroy();
		dialog = null;
		elementParent = null;
	};

	E.on(document, "click", function(e) {
		var el = E.getTarget(e);
		if (el == elementParent || L.isNull(dialog)){ return; }
		
		var dialogEl = dialog.element;
		
		if (Dom.isAncestor(dialogEl, el)){ return; }
		dialogHide();
	});

	NS.showCalendar = function(elInput, callback){
		if (!L.isNull(dialog)){ return; }

		elementParent = elInput;

		dialog = new YAHOO.widget.Overlay(Dom.generateId(), {
			context: [elInput.id, "tl", "bl"], 
			visible: true,
			zindex: 100000
		});
		dialog.setBody("&#32;");
		dialog.body.id = Dom.generateId();
		dialog.render(document.body);

		var oCalendar = new YAHOO.widget.Calendar(Dom.generateId(), dialog.body.id);
		NS.calendarLocalize(oCalendar);

		var date = NSys.stringToDate(elInput.value);
		if (!L.isNull(date)){
			oCalendar.select(date);
			oCalendar.cfg.setProperty("pagedate", (date.getMonth()+1) + "/" + date.getFullYear());
		}

		oCalendar.render();

		oCalendar.selectEvent.subscribe(function() {
			if (oCalendar.getSelectedDates().length > 0) {
				var selDate = oCalendar.getSelectedDates()[0];
				if (L.isFunction(callback)){
					callback(selDate);
				}
				dialogHide();
			}
		});
	};
	
	var DateInputWidget = function(container, cfg){
		
		// настройка виджета
		cfg = L.merge({
			// дата и время. тип Date
			'date': null,
			
			// уточнить время
			'showTime': true,

			// показать кнопку "очистить"
			'showBClear': true,
			
			// показать кнопку "уточнить время/убрать время"
			'showBTime': true
		}, cfg || {});
		this.init(container, cfg);
	};
	DateInputWidget.prototype = {
		init: function(container, cfg){
			
			buildTemplate(this, 'input');
			container.innerHTML = this._TM.replace('input');

			var __self = this;
			E.on(container, 'click', function(e){
                var el = E.getTarget(e);
                if (__self.onClick(el)){ E.preventDefault(e); }
	        });
			
			this.setDate(cfg['date']);
			this.setTimeVisible(cfg['showTime']);
			this.setBClearVisible(cfg['showBClear']);
			this.setBTimeVisible(cfg['showBTime']);
		},
		clear: function(){
			this._date = null;
			this.gel('date').value = "";
			this.gel('time').value = "";
		},
		_updateDate: function(){
			var date = NSys.stringToDate(this.gel('date').value),
				time = NSys.parseTime(this.gel('time').value);
			
			if (!L.isNull(date)){
				date.setHours(time[0]);
				date.setMinutes(time[1]);
			}
			
			this.setDate(date);
		},
		setDate: function(date, notTime){
			if (L.isNull(date)){
				this.clear();
				return;
			}
			if (notTime){ // время не менять
				var dt = this._date;
				if (!L.isNull(dt)){
					date.setHours(dt.getHours(), dt.getMinutes(), 0, 0);
				}
			}

			this.gel('date').value = NSys.dateToString(date);
			this.gel('time').value = NSys.timeToString(date);
			
			this._date = date;
		},
		getDate: function(){
			this._updateDate();
			return this._date;
		},
		setTimeVisible: function(show){
			Dom.setStyle(this.gel('time'), 'display', show ? '' : 'none');
			Dom.setStyle(this.gel('timeshow'), 'display', !show ? '' : 'none');
			Dom.setStyle(this.gel('timehide'), 'display', show ? '' : 'none');
			this._timeVisible = show;
		},
		getTimeVisible: function(){
			return this._timeVisible;
		},
		setBClearVisible: function(show){
			Dom.setStyle(this.gel('clear'), 'display', show ? '' : 'none');
		},
		setBTimeVisible: function(show){
			Dom.setStyle(this.gel('btime'), 'display', show ? '' : 'none');
		},
		gel: function(elname){
			return this._TM.getEl('input.'+elname);
		},
		showCalendar: function(){
			var __self = this;
			NS.showCalendar(this._TM.getEl('input.date'), function(dt){
				__self.setDate(dt, true);
			});
		},
		onClick: function(el){
			var tp = this._TId['input'];
			switch(el.id){
			case tp['date']: this.showCalendar(); return true;
			case tp['clear']: this.clear(); return true;
			case tp['timeshow']: this.setTimeVisible(true); return true;
			case tp['timehide']: this.setTimeVisible(false); return true;
			}
			return false;
		},
		setValue: function(date){
			this.setDate(date);
		},
		getValue: function(){
			return this.getDate();
		}
	};
	
	NS.DateInputWidget = DateInputWidget;
	
};