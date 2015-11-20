/// <reference path="typings/tsd.d.ts" />
/// <reference path="tsd.missing.d.ts" />

module EA {

    export class Timeline {
        'use strict';
        element: D3.Selection;
        data: Array<any>;
        width: number;
        margin: any;

        x: D3.Scale.TimeScale;
        xBrush: D3.Scale.TimeScale;

        xAxis: D3.Svg.Axis;
        xAxis2: D3.Svg.Axis;
        xAxisBrush: D3.Svg.Axis;

        y: D3.Scale.OrdinalScale;
        yAxis: D3.Svg.Axis;

        svg: D3._Selection<any>;
        chart: D3._Selection<any>;
        context: D3._Selection<any>;

        brush: D3.Svg.Brush;

        private _mainBarHeight: number = 40;
        get mainBarHeight(): number {
            return this._mainBarHeight;
        }
        set mainBarHeight(height: number) {
            this._mainBarHeight = height;
        }
        spacing: number = 2;

        //timewindow: number = 24;
        focusMargin: number = 35;
        contextHeight: number = 60;
        tip: any;
        focusExtent: [Date, Date] = [d3.time.hour.offset(new Date(), -1 * 24), d3.time.hour.offset(new Date(), 0)];
        contextExtent: [Date, Date] = [d3.time.day.offset(new Date(), -5), new Date()];

        constructor(element: D3.Selection, data: Array<any> = []) {
            var self = this;
            this.element = element;
            this.data = data;

            this.margin = { top: 30, right: 20, bottom: 30, left: 100 };
            this.width = parseInt(this.element.style('width'), 10) - this.margin.left - this.margin.right;
            if (!this.width) {
                this.width = 100;
            }
            var height = 200; // placeholder
            var contextHeight = 100;
            //var barHeight = 40;

            var percent = d3.format('%');
        
            // scales and axes
            this.x = d3.time.scale()
                .clamp(true)
                .domain(this.focusExtent)
                .range([0, this.width]);

            this.xBrush = d3.time.scale()
                .clamp(true)
                .domain(this.contextExtent)
                .range([0, this.width]);

            this.brush = d3.svg.brush()
                .x(this.xBrush)
                .extent(this.focusExtent)
                .on("brush", () => {
                    if (!this.brush.empty()) {
                        var extent: [Date, Date] = <[Date, Date]>this.brush.extent();
                        var now = new Date();
                        if (extent[1] > now) {
                            extent[1] = now;
                        }
                        this.focusExtent = extent;
                        this.x.domain(extent);
                        this.moveTimescale();
                    }
                });

            this.y = d3.scale.ordinal();
            this.yAxis = d3.svg.axis();

            this.xAxis = d3.svg.axis()
                .scale(this.x);

            this.xAxis2 = d3.svg.axis()
                .scale(this.x)
                .ticks(d3.time.hours, 8)
            //.tickFormat(d3.time.format("%H:%M"));
            this.xAxisBrush = d3.svg.axis()
                .scale(this.xBrush);
                
            // render the chart
            // create the chart
            this.svg = this.element.append('svg')
                .style('width', (this.width + this.margin.left + this.margin.right) + 'px');
            this.chart = this.svg.append('g')
                .attr('class', 'focus')
                .attr('transform', 'translate(' + [this.margin.left, this.margin.top] + ')');
            // add top and bottom axes
            this.chart.append('g')
                .attr('class', 'x axis top');

            this.chart.append('g')
                .attr('class', 'x axis bottom')
                .attr('transform', 'translate(0,' + height + ')');
            
            // add y axes
            this.chart.append("g")
                .attr("class", "y axis")
                .attr('transform', 'translate(' + (-1 * this.spacing) + ',' + this.spacing + ')');

            // render the brush
            // add top and bottom axes
            this.context = this.svg.append('g')
                .attr('class', 'context')
                .attr('transform', 'translate(' + [this.margin.left, 0] + ')');

            this.context.append('g')
                .attr('class', 'x axis context bottom')
                .attr('transform', 'translate(0,' + height + ')');

            this.context.append("g")
                .attr("class", "x brush")
                .call(this.brush)
                .selectAll("rect")
                .attr("y", -6)
                .attr("height", this.contextHeight + 5);

            var intervalID = window.setInterval(() => { this.moveTimescale() }, 1000);

            this.tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    var tooltip = '<strong class="value">' + d.name
                    // + '</strong><br> <span>' + moment(d.startTime).calendar() + ' &ndash; ' + moment(d.endTime).calendar() + '</span>'
                        + '</span><br> <span>' + moment(d.startTime).format('h:mm:ss a') + ' &ndash; ' + moment(d.endTime).format('h:mm:ss a')
                        + '<br> (' + moment.duration(moment(d.endTime).diff(d.startTime)).format("d[d] h [hrs], m [min], s [sec]") + ')</span>';
                    return tooltip;
                });

            this.chart.call(this.tip);
            this.update(this.data);
        }

        zoom(ms: number) {
            this.focusExtent[0] = new Date(this.focusExtent[1].getTime() - ms);
            this.moveTimescale();
        }

        update(data: Array<any>) {
            var self = this;
            this.data = data;
            var height: number;

            this.y
                .domain(data.map(function(d) { return d.key; }))
                .rangeBands([0, data.length * this._mainBarHeight]);
            this.yAxis.scale(this.y);
            this.chart.select('.y.axis').call(this.yAxis.orient('left'));
        
            // set height based on data
            height = this.y.rangeExtent()[1];
            d3.select(this.chart.node().parentNode)
                .style('height', (height + this.margin.top + this.focusMargin + this.contextHeight + this.margin.bottom) + 'px')

            this.svg.select('.context').attr('transform', () => {
                return 'translate(' + [this.margin.left, height + this.margin.top + this.focusMargin] + ')';
            });

            this.chart.select('.x.axis.bottom').attr('transform', () => {
                return 'translate(0,' + (height + 2 * this.spacing) + ')';
            });

            this.context.select('.x.axis.context.bottom').attr('transform', () => {
                return 'translate(0,' + this.contextHeight + ')';
            });

            var bars = this.chart.selectAll('.bar')
                .data(data, (d) => { return d.key; });

            bars.enter()
                .append('g')
                .attr('class', 'bar')
                .append('rect')
                .attr('class', 'background')
                .attr('height', this.y.rangeBand())
                .attr('width', this.width);

            bars.attr('transform', (d, i) => {
                var index: number = d3.map(data, (d) => { return d.key; }).keys().indexOf(d.key);
                return 'translate(0,' + (index * this._mainBarHeight + this.spacing) + ')';
            });

            var funct = bars.selectAll('rect.function')
                .data((d) => {
                    return (d.values) ? d.values : [];
                });

            funct.enter().append('rect')
                .on('mouseover', this.tip.show)
                .on('mouseout', this.tip.hide)
                .on('contextmenu', d3.contextMenu(function(data) {
                    var menu = [];
                    if(data.docLink){
                        menu.push({
                            title: '<core-icon icon="help" self-center></core-icon>Documentation',
                             action: function(elm, d, i) {
                                console.log('Item #1 clicked!');
                                window.location.href = d.docLink;
                            }
                        });
                    }
                    return menu;
                }));

            funct.attr('transform', (d) => {
                return 'translate(' + self.x(d.startTime) + ',0)'
            })
                .attr('class', (d) => {
                    var cls = 'function';
                    if (!d.endTime)
                        cls += ' running';
                    if (d.status)
                        cls += ' status' + d.status;
                    return cls;
                })
                .attr('height', self.y.rangeBand())
                .attr('width', (d) => {
                    return this.calculateWidth(d, this.x);
                });

            funct.exit().remove();

            bars.exit().remove();

            var contextbars = this.context.selectAll('.bar')
                .data(data, (d) => { return d.key; });

            contextbars.enter()
                .insert('g', ":first-child")
                .attr('class', 'bar');
            contextbars.attr('transform', (d, i) => {
                var barHeight = this.contextHeight / data.length;
                return 'translate(0,' + i * barHeight + ')';
            })

            var contextFunct = contextbars.selectAll('rect.function')
                .data((d) => {
                    return (d.values) ? d.values : [];
                });

            contextFunct.enter().append('rect');

            contextFunct.attr('transform', (d) => {
                return 'translate(' + self.xBrush(d.startTime) + ',0)'
            })
                .attr('class', (d) => {
                    var cls = 'function';
                    if (!d.endTime)
                        cls += ' running';
                    if (d.status)
                        cls += ' status' + d.status;
                    return cls;
                })
                .attr('height', this.contextHeight / data.length)
                .attr('width', (d) => {
                    return this.calculateWidth(d, this.xBrush);
                });

            contextbars.exit().remove();
            contextFunct.exit().remove();

        }

        moveTimescale() {
            // prevent moving into the future
            var moveByInMilli: number = (new Date()).getTime() - this.contextExtent[1].getTime();
            this.focusExtent[0] = new Date(this.focusExtent[0].getTime() + moveByInMilli);
            this.focusExtent[1] = new Date(this.focusExtent[1].getTime() + moveByInMilli);
            this.contextExtent[0] = new Date(this.contextExtent[0].getTime() + moveByInMilli);
            this.contextExtent[1] = new Date(this.contextExtent[1].getTime() + moveByInMilli);

            this.x.domain(this.focusExtent);
            this.xBrush.domain(this.contextExtent);

            this.chart.selectAll('rect.function')
                .attr('transform', (d) => { return 'translate(' + this.x(d.startTime) + ',0)' })
                .attr('width', (d) => {
                    return this.calculateWidth(d, this.x);
                });

            this.context.selectAll('rect.function')
                .attr('transform', (d) => { return 'translate(' + this.xBrush(d.startTime) + ',0)' })
                .attr('width', (d) => {
                    return this.calculateWidth(d, this.xBrush);
                });         
            // update axes
            this.chart.select('.x.axis.top').call(this.xAxis.orient('top'));
            this.chart.select('.x.axis.bottom').call(this.xAxis2.orient('bottom'));
            this.context.select('.x.axis.context.bottom').call(this.xAxisBrush.orient('bottom'));
            this.context.select('.x.brush').call(this.brush.extent(this.focusExtent));
        }

        resize() {
        
            // update width
            this.width = parseInt(this.element.style('width'), 10);
            this.width = this.width - this.margin.left - this.margin.right;
 
            // resize the chart
            this.x.range([0, this.width]);
            this.xBrush.range([0, this.width]);
            //this.brush.clear();
            
            d3.select(this.chart.node().parentNode)
            //.style('height', (this.y.rangeExtent()[1] + this.margin.top + this.margin.bottom + 300) + 'px')
                .style('width', (this.width + (this.margin).left + this.margin.right) + 'px');

            this.chart.selectAll('rect.background')
                .attr('width', this.width);

            this.chart.selectAll('rect.function')
                .attr('transform', (d) => { return 'translate(' + this.x(d.startTime) + ',0)' })
                .attr('width', (d) => {
                    return this.calculateWidth(d, this.x);
                });

            this.context.selectAll('rect.function')
                .attr('transform', (d) => { return 'translate(' + this.xBrush(d.startTime) + ',0)' })
                .attr('width', (d) => {
                    return this.calculateWidth(d, this.xBrush);
                });           
            // update axes
            this.chart.select('.x.axis.top').call(this.xAxis.orient('top'));
            this.chart.select('.x.axis.bottom').call(this.xAxis2.orient('bottom'));
            this.context.select('.x.axis.context.bottom').call(this.xAxisBrush.orient('bottom'));
            this.context.select('.x.brush').call(this.brush.extent(this.focusExtent));
        }

        calculateWidth = function(d, xa: D3.Scale.TimeScale) {
            var width: number = 0;
            if (!d.endTime)
                width = xa(new Date()) - xa(d.startTime);
            else if (d.startTime)
                width = xa(d.endTime) - xa(d.startTime);
            if (width > 0 && width < 1)
                width = 1;
            return width;
        };
    }
}

this.EA = EA;