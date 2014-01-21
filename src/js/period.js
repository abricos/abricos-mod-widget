/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = { 
	mod:[
        {name: '{C#MODNAME}', files: ['calendar.js']}
	]		
};
Component.entryPoint = function(NS){

	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang;

	var YDate = YAHOO.widget.DateMath;

	var buildTemplate = this.buildTemplate;
	
	var PeriodWidget = function(container){
		this.init(container);
	};
	PeriodWidget.prototype = {
		init: function(container){
			
			var TM = buildTemplate(this, 'widget');
			container.innerHTML = TM.replace('widget');
			
			var __self = this;
			E.on(container, 'click', function(e){
                var el = E.getTarget(e);
                if (__self.onClick(el)){ E.preventDefault(e); }
	        });
			var cincfg = {
				'showBTime': false,
				'showBClear': false,
				'showTime': false
			};
			this.fromWidget = new NS.DateInputWidget(TM.getEl('widget.bcin'), cincfg);
			this.endWidget = new NS.DateInputWidget(TM.getEl('widget.ecin'), cincfg);
			
			this.periodChangedEvent = new YAHOO.util.CustomEvent('onDateChanged');
			
			this.setValue();
		},
		destroy: function(){
			var el = this._TM.getEl('widget.id');
			el.parentNode.removeChild(el);
		},
		onPeriodChanged: function(){
			this.periodChangedEvent.fire();
		},
		onClick: function(el){
			var tp = this._TId['widget'];
			switch(el.id){
			case tp['bday']: this.selectType('day'); break;
			case tp['bweek']: this.selectType('week'); break;
			case tp['bmonth']: this.selectType('month'); break;
			case tp['bcustom']: this.selectType('custom'); break;
			
			case tp['bmprev']: this.movePrev(); break;
			case tp['bmcurrent']: this.moveCurrent(); break;
			case tp['bmnext']: this.moveNext(); break;
			
			case tp['bcin']: this.applyCustom(); break;
			
			}
			return false;
		},
		movePrev: function(){
			this._moveMethod(-1);
		},
		moveCurrent: function(){
			this._moveMethod(0);
		},
		moveNext: function(){
			this._moveMethod(1);
		},
		_moveMethod: function(m){
			var pd = this.period;
			if (m == 0){
				pd['fdt'] = new Date();
			}else{
				switch(pd['tp']){
				case 'day':
					pd['fdt'] = YDate.add(pd['fdt'], YDate.DAY, m);
					break;
				case 'week':
					pd['fdt'] = YDate.add(pd['fdt'], YDate.WEEK, m);
					break;
				case 'month':
					pd['fdt'] = YDate.add(pd['fdt'], YDate.MONTH, m);
					break;
				}
			}
			this.selectType(pd['tp']);
		},
		getValue: function(){
			var pd = this.period, ret = { 'tp': pd['tp'] },
				date = new Date(pd['fdt'].setHours(0, 0, 0, 0));

			if (pd.tp == 'day'){
				ret['fdt'] = ret['edt'] = date;
			}else if (pd.tp == 'week'){
				ret['fdt'] = YDate.getFirstDayOfWeek(date, 1);
				ret['edt'] = YDate.add(ret['fdt'], YDate.DAY, 6);
			}else if (pd.tp == 'month'){
				ret['fdt'] = YDate.findMonthStart(date);
				ret['edt'] = YDate.findMonthEnd(date);
			}else{
				var spd = this._savedpd;
				ret['fdt'] = spd['fdt'];
				ret['edt'] = spd['edt'];
			}
			
			ret['fdt'] = new Date(ret['fdt'].setHours(0, 0, 0, 0));
			ret['edt'] = new Date(ret['edt'].setHours(23, 59, 59));
			
			this._savedpd = ret;
			
			return ret;
		},
		setValue: function(pd){
			pd = L.merge({
				'fdt': new Date(),
				'edt': new Date(),
				'tp': 'day' // day, week, month, custom
			}, pd || {});

			this.period = pd;
			this.selectType(pd['tp']);
		},
		applyCustom: function(){
			var pd = this.period;
			pd['fdt'] = this.fromWidget.getValue();
			pd['edt'] = this.endWidget.getValue();
			this._savedpd = pd;
			this.setValue(pd);
		},
		renderView: function(){
			var TM = this._TM, pd = this.getValue();
			var sview = Brick.dateExt.convert(pd.fdt.getTime()/1000, 3, true);

			sview += ' - ' + Brick.dateExt.convert(pd.edt.getTime()/1000, 3, true);
			
			TM.getEl('widget.view').innerHTML = sview;
			
			this.fromWidget.setValue(pd.fdt);
			this.endWidget.setValue(pd.edt);
		},
		selectType: function(type){
			this.period['tp'] = type;
			
			this.renderView();
			
			// if (this.currentType == type){ return; }
			this.currentType = type;
			
			var TM = this._TM,
				types = ['day', 'week', 'month', 'custom'],
				eltp = TM.getEl('widget.tp');
			
			for (var i=0;i<types.length;i++){
				var t = types[i], 
					el = TM.getEl('widget.'+t);
				
				if (type == t){
					Dom.addClass(el, 'sel');
					Dom.addClass(eltp, 'tp'+t);
				}else{
					Dom.removeClass(el, 'sel');
					Dom.removeClass(eltp, 'tp'+t);
				}
			}
			
			var ckpd = this._ckperiod,
				pd = this.getValue();

			if (!ckpd || 
					ckpd['fdt'].getTime() != pd['fdt'].getTime() || 
					ckpd['edt'].getTime() != pd['edt'].getTime() || 
					ckpd['tp'] != pd['tp']){
				
				this._ckperiod = pd;
				this.onPeriodChanged();
			}
		}
	};
	NS.PeriodWidget = PeriodWidget;
};