/* CODE TO DRAW D3.JS PATHS ADAPTED FROM NATHAN YAU'S LIFE EXPECTANCY CHART http://projects.flowingdata.com/life-expectancy/ */

//Globals//
var	w = 1300,h = 700, margin = 30,startYear = 1970,endYear = 2013,startData = 0,endData = 40000000,
	y = d3.scale.linear().domain([endData, startData]).range([0 + margin, h - margin]),
	x = d3.scale.linear().domain([startYear, endYear]).range([0 + margin - 5, w-10]),
	years = d3.range(startYear, endYear);
var chart = d3.select("#chart").append("svg:svg").attr("width", w).attr("height", h).append("svg:g")
var line = d3.svg.line().x(function(d, i) {
	return x(d.x);
}).y(function(d) {
	return y(d.y);
});
var selpaFilter = [];
var startEnd = {}


//Populate Lines and Data//
d3.text('population.csv', 'text/csv', function(text) {
	var thisData = d3.csv.parseRows(text);
	for (i = 1; i < thisData.length; i++) {
		var values = thisData[i].slice(2, thisData[i.length - 1]);
		var tempData = [];
		var started = false;
		for (j = 0; j < values.length; j++) {
			if (values[j] != '') {
				tempData.push({
					x: years[j],
					y: values[j]
				});
				if (!started) {
					startEnd[thisData[i][0]] = {
						'startYear': years[j],
						'startVal': values[j]
					};
					started = true;
				} else if (j == values.length - 1) {
					startEnd[thisData[i][0]]['endYear'] = years[j];
					startEnd[thisData[i][0]]['endVal'] = values[j];
				}
			}
		}
		chart.append("svg:path").data([tempData]).attr("state", thisData[i][0]).attr("d", line);
	}	
});

//Draw Axes//
chart.append("svg:line").attr("x1", x(startYear)).attr("y1", 670).attr("x2", x(endData)).attr("y2", 670).attr("class", "axis"); //X-Axis
chart.append("svg:line").attr("x1", x(startYear)).attr("y1", y(startData)).attr("x2", x(startYear)).attr("y2", y(endData)).attr("class", "axis"); //Y-Axis

//Move Axes to Top//
$("svg line:eq(0)").add("svg line:eq(1)").detach().insertAfter("#chart svg g");


// X Axis Labels //
chart.selectAll(".xLabel").data(x.ticks(5)).enter().append("svg:text").attr("class", "xLabel").text(String).attr("x", function(d) {
	return x(d)
}).attr("y", h - 10).attr("text-anchor", "middle");

// Y Axis Labels //
chart.selectAll(".yLabel").data(y.ticks(4)).enter().append("svg:text").attr("class", "yLabel").text(String).attr("x", 0).attr("y", function(d) {
	return y(d)
}).attr("text-anchor", "left").attr("dy", 3);

// X Axis Ticks //
chart.selectAll(".xTicks").data(x.ticks(5)).enter().append("svg:line").attr("class", "xTicks").attr("x1", function(d) {
	return x(d);
}).attr("y1", y(startData)).attr("x2", function(d) {
	return x(d);
}).attr("y2", y(startData) + 7);

// Y Axis Ticks //
chart.selectAll(".yTicks").data(y.ticks(4)).enter().append("svg:line").attr("class", "yTicks").attr("y1", function(d) {
	return y(d);
}).attr("x1", x(2004.95)).attr("y2", function(d) {
	return y(d);
}).attr("x2", x(2005));
