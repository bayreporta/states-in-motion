//Globals//
var	w = 600,h = 400, barPadding = 2, startYear = 0,endYear = 0,yearPosition = 0, startData, endData, chart,xScale,yScale,line,
	margin = {
		all:-1,
		left:70,
		right:15,
		top:30,
		bottom:30
	},
	dataPosition = 0,
	fullMotion = false,
	padding = 60,
	currentData = [], currentDataChk = false, 
	years = [];
var barData = [], states = [], endPoints = [], firstPlot = [], xPosition = [];
var startEnd = {}

//base functions
var chartFunctions = {
	highlightBar:function(){
		var current = $(this); 
		var state = current.attr("state");

		//append label
		var clicked = $("#selection p[state='"+state+"']").attr("clicked");
		if (clicked === "false"){
			//determine position
			var whereY = parseInt($("#chart rect[state='" + state + "']").attr("y")) - 10;
			var whereX = parseInt($("#chart rect[state='" + state + "']").attr("x")) + 7;
		
			//toggle layer
			$("#chart").append("<span class=\"labels\" state=\""+state+"\" style=\"left:" + whereX + "px;top:" + whereY + "px\">" + state + "</span>");
			$(".label[state='"+ state +"']").insertBefore("#selection");
			
			current.css("fill", "#4169E1");
		}
	},
	unhightlightBar:function(){
		var current = $(this); 
		var state = current.attr("state");

		//remove label abd highlight
		var clicked = $("#selection p[state='"+state+"']").attr("clicked");
		if (clicked === "false"){				
			//remove label
			current.css("fill", "#e2e2e2");
			$("span[state='"+ state +"']").remove();
		}

	},
	setDefaults:function(){
		chart = d3.select("#chart").append("svg:svg").attr("width", w).attr("height", h).append("svg:g");
	},
	updateChart:function(position){
		var newData = [];
		
		for (i = 0; i < states.length; i++) {
			//populate state labels
			newData[i] = parseInt(barData[i][position]);
		}	
		
		//change year position
		yearPosition = years[position + 1];
					
		//update chart
		chartFunctions.drawChart(newData);
		
		//re-calc label positions
		chartFunctions.updateLabels();
		
		//update slider
		$("#yearSlider").attr("value", yearPosition);
		$("#nav-wrapper h2").text(yearPosition);
		
		if (fullMotion == true){
			//DO IT AGAIN!
			setTimeout(function(){
				if (dataPosition !== years.length - 2){
					dataPosition = dataPosition + 1;
					chartFunctions.updateChart(dataPosition);
				}
			}, 500)
		}

	},
	rankBars:function(data){
		var thisData = [];
		var rankCheck = [];
		
		
		for (i = 0 ; i < states.length ; i++){
			//building data foundation for sorting
			if (currentDataChk == false){
				currentData[i] = new Object;
			}
			currentData[i]["state"] = states[i];
			currentData[i]["data"] = data[i];
			thisData[i] = data[i];
			currentData[i]["rank"] = 0;
			rankCheck[i] = false;
		}
		currentDataChk = true;

		
		//sort data
		thisData.sort(function(b, a){return a-b});
		
		//determine rank for each state
		for (i = 0 ; i < states.length ; i++){

			for (ii = 0 ; ii < states.length ; ii++){
				if (thisData[ii] == currentData[i]["data"] && rankCheck[ii] == false){
					currentData[i]["rank"] = ii;
					rankCheck[ii] = true;
					break;
				}
			}
			$("#chart rect[state='" + currentData[i]["state"] + "']").attr("rank", currentData[i]["rank"]).attr("x", xPosition[currentData[i]["rank"]]);				
		}
		
	},
	drawChart:function(data){
		if (yearPosition !== startYear){
			//create bars
			chart.selectAll("rect")
				.data(data)
				.attr("x", function(d, i){
					return (i * (540/data.length)) + 62
				})
				.attr("y-update", function(d, i){
					return (h - yScale(d));
				})
				.transition()
				.duration(200)
				.attr("y", function(d, i){
					return (h - yScale(d));
				})
				.attr("height", function(d){
					return yScale(d) - 30

				})
			
			//meta data for bars
			for (i=0 ; i < states.length ; i++){
				$("#chart rect:eq("+i+")").attr("state", states[i]).attr("clicked","false").attr("data", data[i]);
				xPosition[i] = $("#chart rect:eq("+i+")").attr("x");

			}
		}
		else {
			//Set Scales
			yScale = d3.scale.linear()
				.domain([startData, endData])
				.range([0 + margin.top, h - margin.bottom]);
			//create bars
			chart.selectAll("rect")
				.data(data)
				.enter()
				.append("rect")
				.attr("class", "barItem")
				.attr("x", function(d, i){
					return (i * (540/data.length)) + 62
				})
				.attr("y", function(d, i){
					return (h - yScale(d));
				})
				.attr("width", 8.58823552941)
				.attr("height", function(d){
					return yScale(d) - 30

				})
				.on("mouseover", chartFunctions.highlightBar)
				.on("mouseleave", chartFunctions.unhightlightBar)
				
			//meta data for bars
			for (i=0 ; i < states.length ; i++){
				$("#chart rect:eq("+i+")").attr("state", states[i]).attr("clicked","false").attr("data", data[i]);
				xPosition[i] = $("#chart rect:eq("+i+")").attr("x");

			}
			
			//Create Axes				
			chart.append("svg:line")
				.attr("x1", 60)
				.attr("y1", h - 30)
				.attr("x2", 600)
				.attr("y2", h - 30)
				.attr("class", "axis"); //X-Axis
			chart.append("svg:line")
				.attr("x1", 60)
				.attr("y1", yScale(startData))
				.attr("x2", 60)
				.attr("y2", yScale(endData))
				.attr("class", "axis"); //Y-Axis

			//Move Axes to Top//
			$("svg line:eq(0)")
				.add("svg line:eq(1)")
				.detach()
				.insertAfter("#chart svg g");
				
			// Y Axis Labels //
			chart.selectAll(".yLabel")
				.data(yScale.ticks(4))
				.enter().append("svg:text")
				.attr("class", "yLabel")
				.text(String)
				.attr("x", 50)
				.attr("y", function(d) {					
					return h - yScale(d)
			}).attr("text-anchor", "end").attr("dy", 3);

			utilityFunctions.churnLargeNumbers(true);

			// Y Axis Ticks //
			chart.selectAll(".yTicks")
				.data(yScale.ticks(4))
				.enter()
				.append("svg:line")
				.attr("class", "yTicks")
				.attr("y1", function(d) {
					return yScale(d);
			}).attr("x1", 55).attr("y2", function(d) {
					return yScale(d);
			}).attr("x2", 60);
		}

		//sort Bars
		chartFunctions.rankBars(data)
		
	},
	updateLabels:function(){
		for (i = 0 ; i < states.length ; i++){
			//if any state labels are active, move them with data update
			var active = $("#chart span[state='"+ states[i] + "']");

			//determine position
			var whereY = parseInt($("#chart rect[state='" + states[i] + "']").attr("y-update")) - 10;
			var whereX = parseInt($("#chart rect[state='" + states[i] + "']").attr("x")) + 7;
			active.animate({
				top:whereY + "px",
				left:whereX + "px"
				
			}, 100);
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
					var whereY = parseInt($("#chart rect[state='" + thisState + "']").attr("y")) - 10;
					var whereX = parseInt($("#chart rect[state='" + thisState + "']").attr("x")) + 7;
					//background and up front
					$(this).css("background", "#ddd").attr("clicked","true");
					$("#chart rect[state='"+ thisState +"']").css("fill","#4169E1");
					$("#chart rect[state='"+ thisState +"']").attr("clicked", "true");
					
					//toggle layer
					$("#chart").append("<span status=\"on\" class=\"labels\" state=\""+thisState+"\" style=\"left:" + whereX + "px;top:" + whereY + "px\">" + thisState + "</span>");
	
					$(".label[state='"+ thisState +"']").insertBefore("#selection");
				}
				else {
					//background
					$(this).css("background", "#fff").attr("clicked","false");
					$("#chart rect[state='"+ thisState +"']").css("fill","#e2e2e2");
					$("#chart rect[state='"+ thisState +"']").attr("clicked", "false");
					
					//remove label
					$("span[state='"+ thisState +"']").remove();
				}
			});
		}
	},
}

var utilityFunctions = {
	commaSeparateNumber:function(val){
	    while (/(\d+)(\d{3})/.test(val.toString())){
	      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	    }
	    return val;
	},
	updateSlider:function(val){
		var index;
		$("#nav-wrapper h2").text(val); //update slider text
		yearPosition = parseInt(val); //update year position
		for (i=1 ; i < years.length ; i++){ //locate year index
			if (val === years[i]){
				index = _.indexOf(years, val) - 1
				dataPosition = index;
				return chartFunctions.updateChart(index)
			}
		}

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

//determine what chart we're looking at by looking at the meta tag in HTML page
var dataType = $("meta").attr("content");
switch(dataType){
	case "Income":
		startYear = 1970;
		endYear = 2013;
		yearPosition = 1970;
		startData = 0;
		endData = 80000;
		chartFunctions.setDefaults();
		break;
}

//Grab data
switch(dataType){
	case "Income":
		d3.text('data/income.csv', 'text/csv', function(text) {
			var thisData = d3.csv.parseRows(text);
			var tempYears = [];
			
			//grab years
			for (i = 0 ; i < thisData[0].length ; i++){
				years[i] = thisData[0][i]
			}
			
			//populate year slider
			$("#nav-wrapper h2").text(startYear); //default year
			$("#yearSlider").attr("min", startYear).attr("max", endYear).attr("value", startYear);
			
			
			//grab data
			for (i = 1; i < thisData.length; i++) {
				barData[i-1] = thisData[i].slice(1,45);
				
				//populate state labels
				states[i-1] = thisData[i][0];
				firstPlot[i-1] = parseInt(barData[i-1][0]);
			}	
			
			//process charts
			chartFunctions.populateLabels();
			chartFunctions.drawChart(firstPlot);
		});
		break;
}

$(document).ready(function(){
	$("#playMotion").on("click", function(){
		if (fullMotion == false){
			dataPosition = 1;
			fullMotion = true;
			$(this).attr("src","assets/pause.png");
			chartFunctions.updateChart(dataPosition);
		}
		else {
			fullMotion = false;
		}
	}).on("mouseover", function(){
		if (fullMotion == true){
			$(this).attr("src", "assets/pause-hover.png");
		}
		else {
			$(this).attr("src", "assets/play-hover.png");
		}
	}).on("mouseleave", function(){
		if (fullMotion == true){
			$(this).attr("src", "assets/pause.png");
		}
		else {
			$(this).attr("src", "assets/play.png");
		}
	});
	
	$("#reloadChart").on("click", function(){
		if (fullMotion == true){
			fullMotion = false;	
			dataPosition = -1;
			$("#playMotion").attr("src", "assets/play.png");
			setTimeout(function(){
				chartFunctions.updateChart(dataPosition);
			},1000);
		}
		else if (dataPosition > 0){
			dataPosition = 0;
			chartFunctions.updateChart(dataPosition);
		}
	}).on("mouseover", function(){
		$(this).attr("src", "assets/reload-hover.png");
	}).on("mouseleave", function(){
		$(this).attr("src", "assets/reload.png");
		
	});
	

});