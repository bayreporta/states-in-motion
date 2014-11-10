/* CODE TO DRAW D3.JS PATHS ADAPTED FROM NATHAN YAU'S LIFE EXPECTANCY CHART http://projects.flowingdata.com/life-expectancy/ */

//base functions
var chartFunctions = {
	highlightLine:function(){
		var current = $(this); 
		var state = current.attr("state");
				
		//append label
		var clicked = $("#selection p[state='"+state+"']").attr("clicked");
		if (clicked === "false"){
			var where = _.indexOf(states, state);
			var position = parseFloat(endPoints[where]) - 2;
			$("#main-wrapper").append("<span class=\"labels\" state=\""+state+"\" style=\"top:"+ position + "px;\">" + state + "</span>");
			$(".label[state='"+ state +"']").insertBefore("#selection");
			//highlight and up front
			current.css("stroke", "#4169E1").detach().insertAfter("svg path:last");
			
		}
	},
	unhightlightLine:function(){
		var current = $(this); 
		var state = current.attr("state");
		
		//remove label abd highlight
		var clicked = $("#selection p[state='"+state+"']").attr("clicked");
		if (clicked === "false"){
			current.css("stroke", "#e2e2e2");
			$("span[state='"+ state +"']").remove();
		}
		
	},
	setDefaults:function(){
		y = d3.scale.linear()
			.domain([endData, startData])
			.range([0 + margin.top, h - margin.bottom]),
		x = d3.scale.linear()
				.domain([startYear, endYear])
				.range([0 + margin.left, w - margin.right]),
		years = d3.range(startYear, endYear + 1),
		states = [],
		endPoints = [];

		chart = d3.select("#chart").append("svg:svg").attr("width", w).attr("height", h).append("svg:g");

		line = d3.svg.line()
			.x(function(d, i) {
				return x(d.x);
		}).y(function(d) {
				return y(d.y);
		});
	},
	drawChart:function(){
		//Draw Axes//
		chart.append("svg:line")
			.attr("x1", x(startYear))
			.attr("y1", h - 30)
			.attr("x2", 586)
			.attr("y2", h - 30)
			.attr("class", "axis"); //X-Axis
		chart.append("svg:line")
			.attr("x1", x(startYear))
			.attr("y1", y(startData))
			.attr("x2", x(startYear))
			.attr("y2", y(endData))
			.attr("class", "axis"); //Y-Axis

		//Move Axes to Top//
		$("svg line:eq(0)")
			.add("svg line:eq(1)")
			.detach()
			.insertAfter("#chart svg g");

		// Y Axis Labels //
		chart.selectAll(".yLabel")
			.data(y.ticks(4))
			.enter().append("svg:text")
			.attr("class", "yLabel")
			.text(String)
			.attr("x", 60)
			.attr("y", function(d) {
			return y(d)
		}).attr("text-anchor", "end").attr("dy", 3);

		utilityFunctions.churnLargeNumbers(true);

		// Y Axis Ticks //
		chart.selectAll(".yTicks")
			.data(y.ticks(4))
			.enter()
			.append("svg:line")
			.attr("class", "yTicks")
			.attr("y1", function(d) {
				return y(d);
		}).attr("x1", x(2004.95)).attr("y2", function(d) {
				return y(d);
		}).attr("x2", x(2005));

		if (dataType === "NAEP"){
			// X Axis Labels //
			chart.selectAll(".xLabel")
				.data(x.ticks(5))
				.enter()
				.append("svg:text")
				.attr("class", "xLabel")
				.text(String)
				.attr("x", function(d) {
				return x(d)
			}).attr("y", h - 10).attr("text-anchor", "middle");
			
			// X Axis Ticks //
			chart.selectAll(".xTicks")
				.data(x.ticks(5))
				.enter()
				.append("svg:line")
				.attr("class", "xTicks")
				.attr("x1", function(d) {
					return x(d);
			}).attr("y1", y(startData)).attr("x2", function(d) {
					return x(d);
			}).attr("y2", y(startData) + 10);
		}
		else {
			// X Axis Labels //
			chart.selectAll(".xLabel")
				.data(x.ticks(50))
				.enter()
				.append("svg:text")
				.attr("class", "xLabel")
				.text(String)
				.attr("x", function(d) {
				return x(d)
			}).attr("y", h - 10).attr("text-anchor", "middle");
			
			// X Axis Ticks //
			chart.selectAll(".xTicks")
				.data(x.ticks(50))
				.enter()
				.append("svg:line")
				.attr("class", "xTicks")
				.attr("x1", function(d) {
					return x(d);
			}).attr("y1", y(startData)).attr("x2", function(d) {
					return x(d);
			}).attr("y2", y(startData) + 10);
			chartFunctions.adjustNormalX(dataType);
		}
	},
	populateLabels:function(){
		for (i=0 ; i < states.length ; i++){
			$("#selection").append("<p state=\""+states[i]+"\"clicked=\"false\">" + states[i] + "</p>");
			$("#selection p:eq("+i+")").on("click", function(){
				var clicked = $(this).attr("clicked");
				var thisState = $(this).text();
				if (clicked === "false"){
					//determine position
					var where = _.indexOf(states, thisState);
					var position = parseFloat(endPoints[where]) - 2;
					//background and up front
					$(this).css("background", "#ddd").attr("clicked","true");
					$("#chart path[state='"+ thisState +"']").css("stroke","#4169E1").detach().insertAfter("svg path:last");
					//toggle layer
					$("#main-wrapper").append("<span class=\"labels\" state=\""+thisState+"\" style=\"top:"+ position + "px;\">" + thisState + "</span>");
					$(".label[state='"+ thisState +"']").insertBefore("#selection")
				}
				else {
					//background
					$(this).css("background", "#fff").attr("clicked","false");
					$("#chart path[state='"+ thisState +"']").css("stroke","#e2e2e2");
					//remove label
					$("span[state='"+ thisState +"']").remove();
				}
			});
		}
	},
	adjustNormalX:function(dataType){
		if (dataType === "Poverty"){
			//show certain labels
			$(".xLabel").css("display","none");
			$(".xLabel:first").css("display","block");
			$(".xLabel:last").css("display","block");
			$(".xLabel:eq(8)").css("display","block");
			$(".xLabel:eq(15)").css("display","block");
			$(".xLabel:eq(22)").css("display","block");
			$(".xLabel:eq(29)").css("display","block");

			//show certain ticks
			$(".xTicks").css("display","none");
			$(".xTicks:first").css("display","block");
			$(".xTicks:last").css("display","block");
			$(".xTicks:eq(8)").css("display","block");
			$(".xTicks:eq(15)").css("display","block");
			$(".xTicks:eq(22)").css("display","block");
			$(".xTicks:eq(29)").css("display","block");
		}
		else {
			//show certain labels
			$(".xLabel").css("display","none");
			$(".xLabel:first").css("display","block");
			$(".xLabel:last").css("display","block");
			$(".xLabel:eq(6)").css("display","block");
			$(".xLabel:eq(13)").css("display","block");
			$(".xLabel:eq(20)").css("display","block");
			$(".xLabel:eq(27)").css("display","block");
			$(".xLabel:eq(34)").css("display","block");

			//show certain ticks
			$(".xTicks").css("display","none");
			$(".xTicks:first").css("display","block");
			$(".xTicks:last").css("display","block");
			$(".xTicks:eq(6)").css("display","block");
			$(".xTicks:eq(13)").css("display","block");
			$(".xTicks:eq(20)").css("display","block");
			$(".xTicks:eq(27)").css("display","block");
			$(".xTicks:eq(34)").css("display","block");
		}
	}
}

//Globals//
var dataType = $("meta").attr("content");
var	w = 600,h = 400, startYear = 1970,endYear = 2013,startData = 0,endData = 0,
	margin = {
		all:-1,
		left:70,
		right:15,
		top:30,
		bottom:30
	};
var chart, line, x, y
switch(dataType){
	case "Population":
		endData = 40000000;
		chartFunctions.setDefaults();
		break;
	case "Students":
		endData = 6500000;
		chartFunctions.setDefaults();
		break;
	case "Students per Capita":
		endData = 40;
		chartFunctions.setDefaults();
		break;
	case "NAEP":
		endData = 60;
		startYear = 2003;
		endYear = 2012;
		chartFunctions.setDefaults();
		break;
	case "Income":
		endData = 80000;
		startYear = 1970;
		endYear = 2013;
		chartFunctions.setDefaults();
		break;
	case "Salaries":
		endData = 100000;
		startYear = 1970;
		endYear = 2011;
		chartFunctions.setDefaults();
		break;
	case "Salaries-Income":
		startData = -2;
		endData = 2;
		startYear = 1970;
		endYear = 2011;
		chartFunctions.setDefaults();
		break;
	case "Poverty":
		endData = 60;
		startYear = 1977;
		endYear = 2013;
		chartFunctions.setDefaults();
		break;
}

var startEnd = {}

var utilityFunctions = {
	commaSeparateNumber:function(val){
	    while (/(\d+)(\d{3})/.test(val.toString())){
	      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	    }
	    return val;
	},
	churnLargeNumbers:function(line){
		var countX = $(".xLabel").length;
		var countY = $(".yLabel").length;
		var xLabels = [], xTemp = [], yLabels = [], yTemp = [];
		
		if (!line){
			for (i=0 ; i < countX ; i++){
				xTemp[i] = $(".xLabel:eq("+i+")").text();
				xLabels[i] = utilityFunctions.commaSeparateNumber(xTemp[i]);
				$(".xLabel:eq("+i+")").text(xLabels[i]);
			}
		}
		
		for (i=0 ; i < countY ; i++){
			yTemp[i] = $(".yLabel:eq("+i+")").text();
			yLabels[i] = utilityFunctions.commaSeparateNumber(yTemp[i]);
			$(".yLabel:eq("+i+")").text(yLabels[i]);
		}

	}
}

//Populate Lines and Data//
switch(dataType){
	case "Population":
		d3.text('data/population.csv', 'text/csv', function(text) {
			var thisData = d3.csv.parseRows(text);
			for (i = 1; i < thisData.length; i++) {
				var values = thisData[i].slice(1,45);
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

				//populate state labels
				states[i-1] = thisData[i][0];

				chart.append("svg:path")
					.data([tempData])
					.attr("state", thisData[i][0])
					.attr("d", line)
					.attr("shape-rendering","auto")
					.on("mouseover", chartFunctions.highlightLine)
					.on("mouseleave", chartFunctions.unhightlightLine)

				//populate end points for each line
				var ii = i - 1;
				var temp = $("#chart path:eq("+ii+")").attr("d");
				var split = temp.split(",");
				var end = split.length - 1;
				endPoints[ii] = split[end];
			}	

			chartFunctions.populateLabels();
			chartFunctions.drawChart();
		});
		break;
	case "Students":
		d3.text('data/students.csv', 'text/csv', function(text) {
			var thisData = d3.csv.parseRows(text);
			for (i = 1; i < thisData.length; i++) {
				var values = thisData[i].slice(1,45);
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

				//populate state labels
				states[i-1] = thisData[i][0];

				chart.append("svg:path")
					.data([tempData])
					.attr("state", thisData[i][0])
					.attr("d", line)
					.attr("shape-rendering","auto")
					.on("mouseover", chartFunctions.highlightLine)
					.on("mouseleave", chartFunctions.unhightlightLine)

				//populate end points for each line
				var ii = i - 1;
				var temp = $("#chart path:eq("+ii+")").attr("d");
				var split = temp.split(",");
				var end = split.length - 1;
				endPoints[ii] = split[end];
			}	

			chartFunctions.populateLabels();
			chartFunctions.drawChart();
		});
		break;
	case "Students per Capita":
		d3.text('data/studentspercapita.csv', 'text/csv', function(text) {
			var thisData = d3.csv.parseRows(text);
			for (i = 1; i < thisData.length; i++) {
				var values = thisData[i].slice(1,45);
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

				//populate state labels
				states[i-1] = thisData[i][0];

				chart.append("svg:path")
					.data([tempData])
					.attr("state", thisData[i][0])
					.attr("d", line)
					.attr("shape-rendering","auto")
					.on("mouseover", chartFunctions.highlightLine)
					.on("mouseleave", chartFunctions.unhightlightLine)

				//populate end points for each line
				var ii = i - 1;
				var temp = $("#chart path:eq("+ii+")").attr("d");
				var split = temp.split(",");
				var end = split.length - 1;
				endPoints[ii] = split[end];
			}	

			chartFunctions.populateLabels();
			chartFunctions.drawChart();
		});
		break;
	case "NAEP":
		d3.text('data/naep.csv', 'text/csv', function(text) {
			var thisData = d3.csv.parseRows(text);
			for (i = 1; i < thisData.length; i++) {
				var values = thisData[i].slice(1,45);
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

				//populate state labels
				states[i-1] = thisData[i][0];

				chart.append("svg:path")
					.data([tempData])
					.attr("state", thisData[i][0])
					.attr("d", line)
					.attr("shape-rendering","auto")
					.on("mouseover", chartFunctions.highlightLine)
					.on("mouseleave", chartFunctions.unhightlightLine)

				//populate end points for each line
				var ii = i - 1;
				var temp = $("#chart path:eq("+ii+")").attr("d");
				var split = temp.split(",");
				var end = split.length - 1;
				endPoints[ii] = split[end];
			}	

			chartFunctions.populateLabels();
			chartFunctions.drawChart();
		});
		break;
	case "Salaries":
		d3.text('data/salaries.csv', 'text/csv', function(text) {
			var thisData = d3.csv.parseRows(text);
			for (i = 1; i < thisData.length; i++) {
				var values = thisData[i].slice(1,45);
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

				//populate state labels
				states[i-1] = thisData[i][0];

				chart.append("svg:path")
					.data([tempData])
					.attr("state", thisData[i][0])
					.attr("d", line)
					.attr("shape-rendering","auto")
					.on("mouseover", chartFunctions.highlightLine)
					.on("mouseleave", chartFunctions.unhightlightLine)

				//populate end points for each line
				var ii = i - 1;
				var temp = $("#chart path:eq("+ii+")").attr("d");
				var split = temp.split(",");
				var end = split.length - 1;
				endPoints[ii] = split[end];
			}	

			chartFunctions.populateLabels();
			chartFunctions.drawChart();
		});
		break;
	case "Salaries-Income":
		d3.text('data/sVi.csv', 'text/csv', function(text) {
			var thisData = d3.csv.parseRows(text);
			for (i = 1; i < thisData.length; i++) {
				var values = thisData[i].slice(1,45);
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

				//populate state labels
				states[i-1] = thisData[i][0];

				chart.append("svg:path")
					.data([tempData])
					.attr("state", thisData[i][0])
					.attr("d", line)
					.attr("shape-rendering","auto")
					.on("mouseover", chartFunctions.highlightLine)
					.on("mouseleave", chartFunctions.unhightlightLine)

				//populate end points for each line
				var ii = i - 1;
				var temp = $("#chart path:eq("+ii+")").attr("d");
				var split = temp.split(",");
				var end = split.length - 1;
				endPoints[ii] = split[end];
			}	
			
			chart.append("svg:line")
				.attr("class","baseline")
				.attr("x1", 70)
				.attr("x2", 586)
				.attr("y1", 200)
				.attr("y2", 200)
				.attr("shape-rendering","auto")

			chartFunctions.populateLabels();
			chartFunctions.drawChart();
		});
		break;
	case "Income":
		d3.text('data/income.csv', 'text/csv', function(text) {
			var thisData = d3.csv.parseRows(text);
			for (i = 1; i < thisData.length; i++) {
				var values = thisData[i].slice(1,45);
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

				//populate state labels
				states[i-1] = thisData[i][0];

				chart.append("svg:path")
					.data([tempData])
					.attr("state", thisData[i][0])
					.attr("d", line)
					.attr("shape-rendering","auto")
					.on("mouseover", chartFunctions.highlightLine)
					.on("mouseleave", chartFunctions.unhightlightLine)

				//populate end points for each line
				var ii = i - 1;
				var temp = $("#chart path:eq("+ii+")").attr("d");
				var split = temp.split(",");
				var end = split.length - 1;
				endPoints[ii] = split[end];
			}	

			chartFunctions.populateLabels();
			chartFunctions.drawChart();
		});
		break;
	case "Poverty":
		case "Income":
			d3.text('data/poverty.csv', 'text/csv', function(text) {
				var thisData = d3.csv.parseRows(text);
				for (i = 1; i < thisData.length; i++) {
					var values = thisData[i].slice(1,45);
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

					//populate state labels
					states[i-1] = thisData[i][0];

					chart.append("svg:path")
						.data([tempData])
						.attr("state", thisData[i][0])
						.attr("d", line)
						.attr("shape-rendering","auto")
						.on("mouseover", chartFunctions.highlightLine)
						.on("mouseleave", chartFunctions.unhightlightLine)

					//populate end points for each line
					var ii = i - 1;
					var temp = $("#chart path:eq("+ii+")").attr("d");
					var split = temp.split(",");
					var end = split.length - 1;
					endPoints[ii] = split[end];
				}	

				chartFunctions.populateLabels();
				chartFunctions.drawChart();
			});
			break;
}


