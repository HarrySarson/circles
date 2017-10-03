'use strict';
var $ = require('jquery'),
    _ = require('lodash'),
    animate = require('animate'),
    inherit = require('class'),
    restrict = require('./angles.js').restrict;


var drawBin = require('./canvas-shapes/bin.js');


var smoother = require('./smoother.js');

var ItemCtor = {
    Arrow: require('./items/arrow.js'),
    Points: require('./items/points.js'),
    Circles: require('./items/circles.js'),
    Bin: require('./items/bin.js')
};
var Manager = {
    Select: require('./manager/select.js'),
    Canvas: require('./manager/canvas.js'),
    CSS: require('./manager/css.js')
};

var cosh = Math.cosh || function(x) {
    return 0.5 * (Math.exp(x) + Math.exp(-x));
}

var almostzero = function(x, elipson) {
    elipson = elipson === undefined ? 1e-5 : elipson;

    return Math.abs(x) < elipson;
};


var $main = $('.main');
var cursor = new Manager.CSS($('html'), 'cursor', 'pointer');

var cnvs = new Manager.Canvas($main);


var arc = function(layer) {
    layer.context().arc(layer.width() / 2, layer.height() / 2, 100, 0, 2 * Math.PI);
    layer.context().strokeStyle = 'white';
    layer.context().lineWidth = 10;
    layer.context().stroke();
};

var box = function(layer) {
    layer.context().rect(0, 0, layer.width(), layer.height());
    layer.context().strokeStyle = 'red';
    layer.context().lineWidth = 50;
    layer.context().stroke();
};

// returns random number x, lower <= x < upper
function randomBetween(lower, upper, generator /* = Math.random */ ) {
    var rand = _.isFunction(generator) ?
        restrict(generator(), 0, 1) : Math.random(),
        range = upper - lower;

    return lower + range * rand;
}

var force_replot;

cnvs.resizeCanvas();

animate(function(controller) {
    //controller.minRefresh(500);

    var $resize = $('.resize');
    var offset = $resize.offset();

    // use outerwidth to include border as in css, box-sizing: border-box;
    var initial = {
        x: 0,
        y: 0,
        width: $main.outerWidth(),
        height: $main.outerHeight()
    };
    var current = _.clone(initial);
    var adjusted;

    var n = 0;

    // critically damped
    var b = 0.1;
    var adjust = {};
    adjust.x = smoother({
        a: 1,
        b: b,
        c: b * b / 4
    });
    adjust.y = smoother({
        a: 1,
        b: b,
        c: b * b / 4
    });

    var stoptime;


    controller.on('animate', function(data) {

        var newW = adjust.x(current.width, initial.width + current.x - initial.x, data.deltatime),
            newH = adjust.y(current.height, initial.height + current.y - initial.y, data.deltatime);

        var elipson = 1e-3;

        if (Math.abs(newW - current.width) < elipson || Math.abs(newH - current.height) < elipson) {
            stoptime = stoptime || data.time;
            if (data.time - stoptime > 300)
                controller.stop();
        } else {
            stoptime = undefined;
        }

        current.width = newW;
        current.height = newH;

        $main.css({
            'width': current.width,
            'height': current.height
        });


    }).on('start', function(data) {

        initial.x = current.x;
        initial.y = current.y;

    }).on('stop', function(data) {

        cnvs.resizeCanvas();
        initial.width = current.width;
        initial.height = current.height;
        force_replot();
    });

    var updateMouse = function(e) {
        current.x = e.pageX;
        current.y = e.pageY;
        controller.start();
    };

    $resize.mousedown(function(e) {
        $resize.addClass('moving');
        cursor.on('resizeClicked');
        updateMouse(e);

        $(document).on({
            'mousemove.resizeMain': updateMouse,
            'mouseup.resizeMain': function(e) {
                $(this).off('.resizeMain');
                $resize.removeClass('moving');
                cursor.off('resizeClicked')
            }
        });
    });
});

animate(function(controller) {
    var ui = cnvs.getlayer(1);

    var generate = function(len, cb) {
        var arr = [];
        if (!_.isFunction(cb)) {
            cb = function() {
                return cb;
            };
        }
        for (var i = 0; i < len; ++i) {
            arr.push(cb(i, arr));
        }
        return arr;
    };

    var colors = function() {
        var typemap = ['pri', 'sec2', 'compl']; // NB sec1 is not in typemap: sec1 reserved for arrow etc not for circles
        var startpos = 2;
        var posmap = _.shuffle(generate(this.pri.length - 2, function(i) {
            return i;
        }));
        var itercount = 0;
        this.cnvs = function(i) {
            var type = typemap[i % typemap.length];
            // type is either sec1, sec2 or compl

            // order is 2,0,3,4,3,0,2,1,2,0

            var clipped = (i + startpos) % posmap.length;

            return this[type][posmap[clipped]];
        };
        this.next = function() {
            return this.cnvs(itercount++);
        };
        return this;
    }.apply({
        "pri": ["#C65D82", "#FDB9D1", "#EC89AC", "#802E4B", "#2E0E19"],
        "sec1": ["#E2A36B", "#FFDBBB", "#FFC694", "#926035", "#34210F"],
        "sec2": ["#754E98", "#DBBBF8", "#A67CCC", "#462862", "#180C23"],
        "compl": ["#96CC60", "#DCFDBA", "#BEEF8B", "#5A832F", "#1F2F0E"],
    });

    var selected = new Manager.Select()
        .type_set(cursor.on.bind(cursor, 'uiSelect'))
        .type_unset(cursor.off.bind(cursor, 'uiSelect'));

    var mouse = {};

    var newpointadded = false,
        firstplot = true;

    force_replot = function() {
        firstplot = true;
    }


    var items = {
        bin: new ItemCtor.Bin(selected, {
            x: 30,
            y: -60
        }, 35, 60, {
            x: 0,
            y: 1
        })
    };


    items.points = new ItemCtor.Points(selected, items.bin, function(x) {
            return 1 / (cosh(0.01 * x * x));
        }),

        items.points.add(randomBetween(50, 150), randomBetween(200, 250))
        .add(randomBetween(290, 310), randomBetween(290, 310));

    items.arrow = new ItemCtor.Arrow(items.points.coor(0), randomBetween(-Math.PI * 0.6, -Math.PI * 0.4), selected);
    items.circles = new ItemCtor.Circles(items.points, items.arrow, selected);


    controller.on('animate', function(data) {
        // cursor
        var toSelect = null,
            any_item_changed = firstplot;

        firstplot = false;

        // for all items, test the clickboxes
        _.forOwn(items, function(item) {
            if (item.clickbox && _.isFunction(item.clickbox)) {
                var mouseover = item.clickbox(mouse.x, mouse.y);
                if (mouseover && // if mouse is over clickbox
                    (!toSelect || // and either mouse is not over any previously tested clickboxes    
                        mouseover.d < toSelect.d)) { // or mouse is closer to this item than it is to the other item

                    // unless toSelect is overwritten by item not yet tested, this item will be selected
                    toSelect = mouseover;
                }
            }
        });

        //  if item was selected before but is not anymore then any_item_changed = true
        any_item_changed = any_item_changed || (toSelect == null && selected.is_selected());

        if (toSelect) {
            // if previously selected item is not the same as the new selected item then any_item_changed = true
            any_item_changed = any_item_changed || !selected.is_type(toSelect.type, toSelect.id);
            selected.type(toSelect.type, toSelect.id);
        } else {
            selected.unselect();

            // if left mouse button pressed then add point, but only once
            if (selected.is_unselected() && selected.mousedown() && !newpointadded) {
                var id = items.points.length;

                // add point
                items.points.add(mouse.x, mouse.y);

                // force newly added point to be selected
                selected.override_type(ItemCtor.Points.itemType, id);

                newpointadded = true;
            }
        }


        // for all items, animate
        _.forOwn(items, function(item) {
            if (item.animate && _.isFunction(item.animate)) {
                item.animate(mouse, data, function() {
                    any_item_changed = true;
                });
            }
        });

        if (any_item_changed) {
            items.circles.recalc();

            // plot
            ui.context.clearRect(0, 0, ui.width, ui.height);
            items.points.draw(ui, colors);
            items.arrow.draw(ui, colors);
            items.circles.draw(ui, colors.cnvs.bind(colors));
            items.bin.draw(ui, colors);

            ui.context.fillStyle = 'transparent';
            ui.context.strokeStyle = 'white';
            ui.context.lineWidth = 1;



        }

    }).start();

    var offset = ui.canvas.offset();

    var getcoor = function(e) {
        var coor = {
            x: e.pageX - offset.left,
            y: e.pageY - offset.top
        };

        if (coor.x < 0)
            coor.x = 0;
        else if (coor.x > ui.width)
            coor.x = ui.width;

        if (coor.y < 0)
            coor.y = 0;
        else if (coor.y > ui.height)
            coor.y = ui.height;

        return coor;
    };

    cnvs.parent.on({
        mousedown: function(e) {


            selected.mousedown(e.which);
            newpointadded = $(e.target).hasClass('resize') ? true : false; // no new points added if user is resizing
            e.preventDefault();
        },
        mouseup: function(e) {
            selected.mousedown(false);
        }
    });
    $(document).on({
        mousemove: function(e) {
            mouse = getcoor(e);
        }
    });
});