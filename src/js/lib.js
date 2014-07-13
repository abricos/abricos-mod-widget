/*
 @package Abricos
 @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 */

var Component = new Brick.Component();
Component.requires = {
    'yui': ['node']
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        L = Y.Lang,
        Dom = Y.DOM;

    var E = YAHOO.util.Event;

    /**
     * Виджет.
     * Существуюет два основных типа виджетов:
     * 1. Обычный виджет.
     *        Сразу после генерации шаблона идет отрисовка.
     * 2. Потоковый виджет (cfg.isRowWidget = true).
     *        Отрисовка запускается отдельно виджетом родителя.
     */
    var Widget = function(container, cfg, p0, p1, p2, p3, p4, p5, p6, p7){
        cfg = Y.merge({
            'buildTemplate': null,
            'tnames': null,
            'ftname': null, // Main (first) template name
            'override': null, // компонент перегрузки
            'isRowWidget': false
        }, cfg || {});

        var sErr = "Error in Brick.mod.Widget: ";

        container = L.isString(container) ? Dom.byId(container) : container;

        if (L.isNull(container)){
            Brick.console(sErr + "container is null");
            return;
        }

        if (L.isFunction(cfg['buildTemplate'])
            && L.isString(cfg['tnames'])){

            this.initMethod(container, cfg, p0, p1, p2, p3, p4, p5, p6, p7);
        } else {
            Brick.console(sErr + "this class is not a Brick Widget");
        }
    };
    Widget.prototype = {
        initMethod: function(container, cfg, p0, p1, p2, p3, p4, p5, p6, p7){
            this.container = container;
            this._widgetConfig = cfg;
            this._isDestroy = false;

            this.init(p0, p1, p2, p3, p4, p5, p6, p7);

            var ftName = cfg['ftname'];
            if (!L.isString(ftName)){
                ftName = cfg['ftname'] = cfg['tnames'].split(',')[0];
            }
            var TM = cfg['buildTemplate'](this, cfg['tnames'], cfg['override']);
            var html = TM.replace(ftName, this.buildTData(p0, p1, p2, p3, p4, p5, p6, p7));

            if (cfg['isRowWidget']){
                container.innerHTML += html;
            } else {
                container.innerHTML = html;
            }

            this.onLoad(p0, p1, p2, p3, p4, p5, p6, p7);

            if (!cfg['isRowWidget']){

                var tp = this._TId[cfg['ftname']];
                var __self = this;

                Y.one(container).on('click', function(e){
                    var el = e.target.getDOMNode();

                    if (__self.onClick(el, tp)){
                        e.preventDefault();
                    }
                });

                if (L.isFunction(this.onEnter)){
                    E.on(container, 'keypress', function(e){
                        var el = E.getTarget(e);
                        if (e.keyCode == 13){
                            if (__self.onEnter(el, tp)){
                                E.preventDefault(e);
                            }
                        }
                    });
                }

                this.render();
            }
        },
        init: function(p0, p1, p2, p3, p4, p5, p6, p7){
        },
        buildTData: function(){
            return {};
        },
        isDestroy: function(){
            return this._isDestroy;
        },
        destroy: function(){
            if (this.isDestroy()){
                return;
            }
            this._isDestroy = true;
            var el = this._TM.getEl(this._widgetConfig['ftname'] + '.id');
            if (!L.isNull(el)){
                el.parentNode.removeChild(el);
            }
        },
        onLoad: function(){
        },
        onClick: function(el){
            return false;
        },
        render: function(){
        },
        gel: function(n){
            var tName = this._widgetConfig['ftname'];
            var a = n.split('.');
            if (a.length > 1){
                tName = L.trim(a[0]);
                if (tName.length == 0){
                    tName = this._widgetConfig['ftname'];
                }
                n = a[1];
            }
            return this._TM.getEl(tName + '.' + n);
        },
        gels: function(els){
            if (!L.isString(els)){
                return els;
            }

            var arr = els.split(','), tname = '';
            els = [];

            for (var i = 0; i < arr.length; i++){
                var arr1 = arr[i].split('.');
                if (arr1.length == 2){
                    tname = L.trim(arr1[0]);
                    els[els.length] = L.trim(arr[i]);
                } else {
                    els[els.length] = tname + '.' + L.trim(arr[i]);
                }
            }
            return els;
        },
        elHide: function(els){
            this.elSetVisible(els, false);
        },
        elShow: function(els){
            this.elSetVisible(els, true);
        },
        elHideShow: function(hels, sels){
            this.elHide(hels);
            this.elShow(sels);
        },
        elShowHide: function(sels, hels){
            this.elShow(sels);
            this.elHide(hels);
        },
        elSetVisible: function(els, show){
            els = this.gels(els);
            if (!L.isArray(els)){
                return;
            }
            for (var i = 0; i < els.length; i++){
                var el = this.gel(els[i]);
                if (el){
                    Dom.setStyle(el, 'display', show ? '' : 'none');
                }
            }
        },
        _getNVObject: function(tname, html){
            if (!L.isObject(tname)){
                var obj = {};
                obj[tname] = html;
                tname = obj;
            }
            return tname;
        },
        elSetHTML: function(tname, html){
            tname = this._getNVObject(tname, html);
            for (var n in tname){
                var el = this.gel(n);
                if (!L.isNull(el)){
                    tname[n] = L.isNumber(tname[n]) ? tname[n] + '' : tname[n];
                    el.innerHTML = L.isString(tname[n]) ? tname[n] : '';
                }
            }
        },
        elSetValue: function(tname, value){
            tname = this._getNVObject(tname, value);
            for (var n in tname){
                var el = this.gel(n);
                if (!L.isNull(el)){
                    tname[n] = L.isNumber(tname[n]) ? tname[n] + '' : tname[n];
                    el.value = L.isString(tname[n]) ? tname[n] : '';
                }
            }
        },
        elEnable: function(els){
            this.elSetDisabled(els, false);
        },
        elDisable: function(els){
            this.elSetDisabled(els, true);
        },
        elSetDisabled: function(els, isdis){
            els = this.gels(els);

            if (!L.isArray(els)){
                return;
            }
            for (var i = 0; i < els.length; i++){
                var el = this.gel(els[i]);
                if (!L.isNull(el)){
                    el.disabled = isdis ? "disabled" : "";
                }
            }
        },
        componentLoad: function(module, component, callback, cfg){
            cfg = Y.merge({
                'hide': '',
                'show': ''
            }, cfg || {});

            this.elHide(cfg['hide']);
            this.elShow(cfg['show']);
            var __self = this;
            Brick.ff(module, component, function(){
                __self.elShow(cfg['hide']);
                __self.elHide(cfg['show']);
                if (L.isFunction(callback)){
                    callback();
                }
            });
        }
    };
    NS.Widget = Widget;

};