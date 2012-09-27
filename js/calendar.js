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
	
	var lz = function(num){
		var snum = num+'';
		return snum.length == 1 ? '0'+snum : snum; 
	};

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

		var oCalendar = new YAHOO.widget.Calendar(Dom.generateId(), dialog.body.id, {
			'start_weekday': 1
		});
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
			'showBTime': true,
			
			// учитывать секунды
			'showSeconds': false
		}, cfg || {});
		this.init(container, cfg);
	};
	DateInputWidget.prototype = {
		init: function(container, cfg){
			
			this.changedEvent = new YAHOO.util.CustomEvent('changedEvent');
			
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
			
			this._showSeconds = cfg['showSeconds'];
			
			if (cfg['showSeconds']){
				Dom.addClass(this.gel('time'), 'dttimesec');
			}
			
			var __self = this;
			E.on(this.gel('time'), 'blur', function(){
				__self._updateDate();
			});
			
			E.on(this.gel('time'), 'keypress', function(e){
				if (e.keyCode != 13){ return false; }
				__self._updateDate();
				return true;
			});
		},
		destroy: function(){ },
		clear: function(){
			this._date = null;
			this.gel('date').value = "";
			this.gel('time').value = "";
		},
		_updateDate: function(){
			var v = this.gel('time').value.replace(/,/gi, ':').replace(/\./gi, ':'),
				va = v.split(':');
		
			var h = va[0]*1, m = va[1]*1, s = va[2]*1;
			if (!(h>=0 && h<=24)){ h = 0; }
			if (!(m>=0 && m<=59)){ m = 0; }
			if (!(s>=0 && s<=59)){ s = 0; }

			var date = NSys.stringToDate(this.gel('date').value),
				time = NSys.parseTime(lz(h)+':'+lz(m)+':'+lz(s));
			
			if (!L.isNull(date)){
				date.setHours(time[0]);
				date.setMinutes(time[1]);
				date.setSeconds(time[2]);
			}
			
			this.setDate(date);
		},
		onChanged: function(){
			this.changedEvent.fire(this);
		},
		setDate: function(date, notTime){
			var sDate = this._date;
			
			if (L.isNull(date)){
				this.clear();
			}else{
				if (notTime){ // время не менять
					var dt = this._date;
					if (!L.isNull(dt)){
						date.setHours(dt.getHours(), dt.getMinutes(), 0, 0);
					}
				}

				this.gel('date').value = NSys.dateToString(date);
				this.gel('time').value = NSys.timeToString(date, this._showSeconds);
				this._date = date;
			}
			
			var d1 = (!this._date || L.isNull(this._date)) ? 0 : this._date.getTime();
			var d2 = (!sDate || L.isNull(sDate)) ? 0 : sDate.getTime();
			
			if (d1 != d2){
				this.onChanged();
			}
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
			case tp['time']:
				try{el.select();}catch(e){};
			return true;
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