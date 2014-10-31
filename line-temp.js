/* CODE TO DRAW D3.JS PATHS ADAPTED FROM NATHAN YAU'S LIFE EXPECTANCY CHART http://projects.flowingdata.com/life-expectancy/ */

//Globals//
var	w = 1300,h = 700, margin = 30,startYear = 2005,endYear = 2012,startReports = 0,endReports = 60,
	y = d3.scale.linear().domain([endReports, startReports]).range([0 + margin, h - margin]),
	x = d3.scale.linear().domain([2005, 2011]).range([0 + margin - 5, w-10]),
	years = d3.range(startYear, endYear);
var chart = d3.select("#chart").append("svg:svg").attr("width", w).attr("height", h).append("svg:g")
var line = d3.svg.line().x(function(d, i) {
	return x(d.x);
}).y(function(d) {
	return y(d.y);
});
var selpaFilter = [];
var startEnd = {}

//Grab SELPA population//
d3.text('data-3.csv', 'text/csv', function(text) {
	var selpaPop = d3.csv.parseRows(text);
	for (i = 1; i < selpaPop.length; i++) {
		selpaFilter[i] = selpaPop[i][1];
	}
});

//Populate Lines and Data//
d3.text('data-2.csv', 'text/csv', function(text) {
	var selpaData = d3.csv.parseRows(text);
	for (i = 1; i < selpaData.length; i++) {
		var values = selpaData[i].slice(2, selpaData[i.length - 1]);
		console.log(values)
		var currData = [];
		var started = false;
		for (j = 0; j < values.length; j++) {
			if (values[j] != '') {
				currData.push({
					x: years[j],
					y: values[j]
				});
				if (!started) {
					startEnd[selpaData[i][0]] = {
						'startYear': years[j],
						'startVal': values[j]
					};
					started = true;
				} else if (j == values.length - 1) {
					startEnd[selpaData[i][0]]['endYear'] = years[j];
					startEnd[selpaData[i][0]]['endVal'] = values[j];
				}
			}
		}
		chart.append("svg:path").data([currData]).attr("selpa", selpaData[i][0]).attr("class", "cat" + selpaFilter[i]).attr("d", line).on("mouseover", onmouseover).on("mouseout", onmouseout);
	}	
});

//Draw Axes//
chart.append("svg:line").attr("x1", x(2005)).attr("y1", 670).attr("x2", x(2011)).attr("y2", 670).attr("class", "axis");
chart.append("svg:line").attr("x1", x(startYear)).attr("y1", y(startReports)).attr("x2", x(startYear)).attr("y2", y(endReports)).attr("class", "axis");

//Move Axes to Top//
$("svg line:eq(0)").add("svg line:eq(1)").detach().insertAfter("#chart svg g");


//Populate Labels and Ticks
chart.selectAll(".xLabel").data(x.ticks(5)).enter().append("svg:text").attr("class", "xLabel").text(String).attr("x", function(d) {
	return x(d)
}).attr("y", h - 10).attr("text-anchor", "middle");

chart.selectAll(".yLabel").data(y.ticks(4)).enter().append("svg:text").attr("class", "yLabel").text(String).attr("x", 0).attr("y", function(d) {
	return y(d)
}).attr("text-anchor", "right").attr("dy", 3);

chart.selectAll(".xTicks").data(x.ticks(5)).enter().append("svg:line").attr("class", "xTicks").attr("x1", function(d) {
	return x(d);
}).attr("y1", y(startReports)).attr("x2", function(d) {
	return x(d);
}).attr("y2", y(startReports) + 7);

chart.selectAll(".yTicks").data(y.ticks(4)).enter().append("svg:line").attr("class", "yTicks").attr("y1", function(d) {
	return y(d);
}).attr("x1", x(2004.95)).attr("y2", function(d) {
	return y(d);
}).attr("x2", x(2005));

function onclick(d, i) {
	var currClass = d3.select(this).attr("class");
	if (d3.select(this).classed('selected')) {
		d3.select(this).attr("class", currClass.substring(0, currClass.length - 9));
	} else {
		d3.select(this).classed('selected', true);
	}
}

function onmouseover(d, i) {
	var currClass = d3.select(this).attr("class");
	var reorder = $(this);
	reorder.detach().insertAfter("svg path:last");
	d3.select(this).attr("class", currClass + " current");
	var selpaLabel = $(this).attr("selpa");
	var selpaValues = startEnd[selpaLabel];
	var info = '<h2>' + selpaLabel + '</h2>';
	info += "<p>This SELPA had <strong>" + Math.round(selpaValues['startVal']*100)/100 + "</strong> emergency behavior reports per 100 students in " + selpaValues['startYear'] + " and <strong>" + Math.round(selpaValues['endVal']*100)/100 + "</strong> in " + selpaValues['endYear'] + ".</p>";
	$("#default-info").hide();
	$("#info-content").html(info);
}

function onmouseout(d, i) {
	var currClass = d3.select(this).attr("class");
	var prevClass = currClass.substring(0, currClass.length - 8);
	d3.select(this).attr("class", prevClass);
	$("#default-info").show();
	$("#info-content").html('');
}

function showCategory(category) {
	var selpaCat = d3.selectAll("path." + category);
	if (selpaCat.classed('highlight')) {
		selpaCat.attr("class", category);
	} else {
		selpaCat.classed('highlight', true);
	}
	$(".cat1").detach().insertAfter("svg path:last");
}

$(document).ready(function() {
    $('#categories a').click(function() {
        $(".cat1").detach().insertAfter("svg path:last");
		$(".cat2").detach().insertAfter("svg path:last");
		$(".cat3").detach().insertAfter("svg path:last");
		$(".cat4").detach().insertAfter("svg path:last");
		$(".cat5").detach().insertAfter("svg path:last");
		$(".cat6").detach().insertAfter("svg path:last");
		$(".cat7").detach().insertAfter("svg path:last");
		$(".cat8").detach().insertAfter("svg path:last");
    });
});
