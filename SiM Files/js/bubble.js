/* GLOBAL VARIABLES
===================================================================================*/
var	dataType = $("meta").attr("content"), filename, w = 600, h = 400, barPadding = 2, startYear = 0, endYear = 0, yearPosition = 0, chart, xScale, yScale, line, maxX, maxY, xAdjust, margin = {all:-1,left:70,right:15,top:30,bottom:30}, axisLabels = {x:"",y:""}, dataPosition = 0, fullMotion = false, padding = 20,	firstRun = true, totalPoints = 0, updatedPointData = [], initReprocess = false, currentData = [], curElemPos = [], years = [], plotData = [], points = [], endPoints = [], startEnd = {}, colors = ["#4169E1","#e14169","#e16941","#41e1b9"], colorStep = 0;

/* GLOABL UTILITY FUNCTIONS
===================================================================================*/
var utilityFunctions = {
	updateSlider:function(val){
		var index;

		//stop motion if in motion
		if (fullMotion == true){
			$("#playMotion").attr("src", "assets/play.png");
			fullMotion = false;
		}
		$("#nav-wrapper h2").text(val); //update slider text
		yearPosition = parseInt(val); //update year position
		for (i=0 ; i < years._wrapped.length ; i++){ //locate year index
			if (yearPosition === years._wrapped[i]){
				index = _.indexOf(years._wrapped, val);					
				dataPosition = index;
				return chartFunctions.updateChart(index)
			}
		}
	},
	churnLargeNumbers:function(){
		var temp = [];

		var totalLabels = $("text:not(.plotLabels)").length;

		for (i=0 ; i < totalLabels ; i++){
			temp[i] = $("text:not(.plotLabels):eq("+i+")").text();
			//Shorten Axis Labels
			switch(temp[i].length){
				case 5: temp[i] = temp[i].slice(0,1); break;
				case 6: temp[i] = temp[i].slice(0,2); break;
				case 7: temp[i] = temp[i].slice(0,3); break;
				case 9: temp[i] = temp[i].slice(0,1); break;
				case 10: temp[i] = temp[i].slice(0,2); break;
				case 11: temp[i] = temp[i].slice(0,3); break;
			}
			$("text:not(.plotLabels):eq("+i+")").text(temp[i]);
		}
	}
}

/* GLOBAL CHART FUNCTIONS
===================================================================================*/
var chartFunctions = {
	setDefaults:function(){
		chart = d3.select("#chart").append("svg:svg").attr("width", w).attr("height", h);
	},
	grabData:function(){
		switch(dataType){
			case "IncomeExpendStudent":
				filename = 'data/income-expendstudent.csv';
				startYear = 1970;
				endYear = 2012;
				yearPosition = 1970;
				maxX = 25000;
				maxY = 80000;
				axisLabels.x = "K-12 Expenditures per Student (in thousands)";
				axisLabels.y = "Income per Capita (in thousands)";
				xAdjust = 4;
				break;
			case "TeacherPayStudents":
				filename = 'data/teacherpaystudents.csv';
				startYear = 1970;
				endYear = 2011;
				yearPosition = 1970;
				maxX = 30;
				maxY = 100000;
				axisLabels.x = "K-12 Students per Teacher";
				axisLabels.y = "Median Teacher Salary (in thousands)";
				$("#y-axis").css("left", "-50px");
				xAdjust = -10;
				break;
			case "TeacherStudents":
				filename = 'data/teacherstudents.csv';
				startYear = 1970;
				endYear = 2011;
				yearPosition = 1970;
				axisLabels.x = "K-12 Teachers (in thousands)";
				axisLabels.y = "K-12 Students (in millions)";
				$("#y-axis").css("left", "15px");
				maxX = 400000;
				maxY = 8000000;
				xAdjust = -20;
				break;
			case "PovertyIncome":
				filename = 'data/povertyincome.csv';
				startYear = 1977;
				endYear = 2013;
				yearPosition = 1977;
				maxX = 60;
				maxY = 80000;
				axisLabels.x = "Percentage of 6-17 Year Olds in Poverty";
				axisLabels.y = "Income per Capita (in thousands)";
				xAdjust = -10;
				break;
			case "NAEPexpend":
				filename = 'data/NAEPexpend.csv';
				startYear = 2003;
				endYear = 2011;
				yearPosition = 2003;
				maxX = 60;
				maxY = 20000;
				axisLabels.x = "Average NAEP Proficency in Math and Reading, 4th and 8th Grades";
				axisLabels.y = "K-12 Expenditures per Student (in thousands)";
				$("#y-axis").css("left", "-65px");
				xAdjust = -10;
				$("#yearSlider").attr("step", 2);
				break;
			case "NAEPincome":
				filename = 'data/NAEPincome.csv';
				startYear = 2003;
				endYear = 2013;
				yearPosition = 2003;
				maxX = 60;
				maxY = 80000;
				axisLabels.x = "Average NAEP Proficency in Math and Reading, 4th and 8th Grades";
				axisLabels.y = "Income per Capita (in thousands)";
				xAdjust = -10;
				$("#yearSlider").attr("step", 2);
				break;
			case "NAEPpoverty":
				filename = 'data/NAEPpoverty.csv';
				startYear = 2003;
				endYear = 2013;
				yearPosition = 2003;
				maxX = 60;
				maxY = 60;
				axisLabels.x = "Average NAEP Proficency in Math and Reading, 4th and 8th Grades";
				axisLabels.y = "Percentage of 6-17 Year Olds in Poverty";
				xAdjust = -10;
				$("#y-axis").css("left", "-50px");
				$("#yearSlider").attr("step", 2);
				break;
		}
		d3.text(filename, 'text/csv', function(text) {
			var thisData = d3.csv.parseRows(text);
			chartFunctions.processData(thisData);		
		});
		chartFunctions.setDefaults();
	},
	highlightPoint:function(){
		var current = $(this); 
		var state = current.attr("state");
		if (fullMotion === true){
			return;
		}
		else {	
			//append label
			var clicked = $("#selection p[state='"+state+"']").attr("clicked");
			if (clicked === "false"){
				//animation
				var $point = $(this);
				var $text = $("#chart text[state='"+ state +"']");
				var point = d3.select(this)
				point.transition()
					.duration(800)
					.attr("r", 8)
					.ease("elastic");
				
				//X Line Data
				chart.append("g")
					.attr("class", "guide")					
				.append("line")
					.attr("x1", point.attr("cx"))
					.attr("x2", 60)
					.attr("y1", point.attr("cy"))
					.attr("y2", point.attr("cy"))
					.style("stroke", colors[colorStep])
					.transition().delay(200).duration(400).styleTween("opacity", 
								function() { return d3.interpolate(0, .5); });
				//Y Line Data
				chart.append("g")
					.attr("class", "guide")
				.append("line")
					.attr("x1", point.attr("cx"))
					.attr("x2", point.attr("cx"))
					.attr("y1", point.attr("cy"))
					.attr("y2", h - 20)
					.style("stroke", colors[colorStep])
					.transition().delay(200).duration(400).styleTween("opacity", 
								function() { return d3.interpolate(0, .5); })
				
				//reorder to front	
				$point.insertBefore(".axis:eq(0)")

				//toggle text
				$text.css({
					visibility:"visible",
					fill:colors[colorStep]
				});
				//$text.insertBefore(".axis:eq(0)")

				current.css("fill", colors[colorStep]);

			}
			//reorganize data based on new positions
			chartFunctions.reprocessData();
		}
	},
	unhightlightPoint:function(){
		var current = $(this); 
		var state = current.attr("state");

		//remove label abd highlight
		var clicked = $("#selection p[state='"+state+"']").attr("clicked");
		if (clicked === "false"){				
			//remove label
			current.css("fill", "#e2e2e2");
			//toggle text
			var $text = $("#chart text[state='"+ state +"']");
			$text.css("visibility","hidden");

			//animations
			var point = d3.select(this);
				
			//remove tooltip and lines
			$(".guide").remove();
			
			//restore circle			
			point.transition()
				.duration(800)
				.attr("r", 5)
				.ease("elastic");

			//update positioning
			current.detach().insertBefore("circle:first");
			chartFunctions.reprocessData();
		}			
	},
	updateChart:function(position){	
		currentData = [];
		for (i = 0; i < points._wrapped.length; i++) {
			//update plot
			if (initReprocess == false){
				if (dataType === "TeachStudent"){
					currentData[i] = new Array();
					currentData[i][0]  = parseFloat(plotData[i][position][0]);
					currentData[i][1]  = parseFloat(plotData[i][position][1]);
					currentData[i][2]  = plotData[i][position][2];	
				}
				else {		
					currentData[i] = new Array();			
					currentData[i][0]  = parseInt(plotData[i][position][0]);
					currentData[i][1]  = parseInt(plotData[i][position][1]);
					currentData[i][2]  = plotData[i][position][2];					
				}
			}
			else {
				 if (dataType === "TeachStudent"){
					currentData[i] = new Array();
					currentData[i][0]  = parseFloat(updatedPointData[i][position][0]);
					currentData[i][1]  = parseFloat(updatedPointData[i][position][1]);
					currentData[i][2]  = updatedPointData[i][position][2];	
				}
				else {		
					currentData[i] = new Array();			
					currentData[i][0]  = parseInt(updatedPointData[i][position][0]);
					currentData[i][1]  = parseInt(updatedPointData[i][position][1]);
					currentData[i][2]  = updatedPointData[i][position][2];					
				}
			}
		}	
		//change year position
		yearPosition = years._wrapped[position];

		//check to see if last loop in motion
		if (yearPosition == endYear){
			fullMotion = false;
		}

		//update chart
		chartFunctions.drawChart(currentData);

		//re-calc label positions
		chartFunctions.updateLabels(currentData);

		//update slider
		$("#yearSlider").attr("value", yearPosition);
		$("#nav-wrapper h2").text(yearPosition);

		if (fullMotion == true){
			//DO IT AGAIN!
			if (dataType === "NAEPexpend" || dataType === "NAEPincome" || dataType === "NAEPpoverty"){
				if (yearPosition === endYear - 2){
					$("#playMotion").attr("src", "assets/play.png");
				}
			}
			else if (yearPosition === endYear - 1){
				$("#playMotion").attr("src", "assets/play.png");
			}

			setTimeout(function(){
				if (dataPosition !== years.length - 1){
					dataPosition = dataPosition + 1;
					chartFunctions.updateChart(dataPosition);
				}
			}, 200)
		}
	},
	updateLabels:function(data){
		chart.selectAll("text")
		   .data(data)
		   .attr("x", function(d) {
		   		return xScale(d[0]) + 5;
		   })
		   .attr("y", function(d) {
		   		return yScale(d[1]) - 5;
		   })
	},
	populateLabels:function(){
		//axis labels
		$("#x-axis").text(axisLabels.x);
		$("#y-axis").text(axisLabels.y);

		//point labels
		for (i=0 ; i < points._wrapped.length ; i++){
			$("#selection").append("<p state=\""+points._wrapped[i]+"\"clicked=\"false\">" + points._wrapped[i] + "</p>");

			$("#selection p:eq("+i+")").on("click", function(){
				var clicked = $(this).attr("clicked");
				var thisState = $(this).text();

				if(fullMotion === true){
					return;
				}
				else{							
					if (clicked === "false"){	
						//unhide text
						var $text = $("#chart text[state='"+ thisState +"']");
						$text.css({
							visibility:"visible",
							fill:colors[colorStep]
						});
						$text.insertBefore(".axis:eq(0)")
									
						//background and up front
						$(this).css("background", "#ddd").attr("clicked","true");
						$("#chart circle[state='"+ thisState +"']").css("fill",colors[colorStep]);
						$("#chart circle[state='"+ thisState +"']").attr("clicked", "true");
						
						//reorder to front	
						var $point = $("#chart circle[state='"+ thisState +"']");
						$point.insertBefore(".axis:eq(0)")

						//add to color step
						if (colorStep != 3){
							colorStep += 1;
						}
						else {
							colorStep = 0;
						}
					}
					else {
						//background
						$(this).css("background", "#fff").attr("clicked","false");
						$("#chart circle[state='"+ thisState +"']").css("fill","#e2e2e2");
						$("#chart circle[state='"+ thisState +"']").attr("clicked", "false");

						//remove label
						var $text = $("#chart text[state='"+ thisState +"']");
						$text.css("visibility","hidden");

						//remove to color step
						if (colorStep != 0){
							colorStep -= 1;
						}
						else {
							colorStep = 3;
						}
					}
					//reorganize data based on new positions
					chartFunctions.reprocessData();
				}
			});
		}
	},
	reprocessData:function(){
		var curPos = [];
		var tempData = [];

		if (initReprocess == false){
			for (i=0 ; i < totalPoints ; i++) {
				// GRAB CURRENT ELEM POSITION
				curElemPos[i] = $("svg circle:eq("+i+")").attr("elem-pos");

				// UPDATE DATA BASED ON CURRENT ELEM POSITION
				tempData[i] = plotData[curElemPos[i]]; 
				updatedPointData[i] = tempData[i];
			};
			initReprocess = true;
		}
		else {
			for (i=0 ; i < totalPoints ; i++) {

				// GRAB CURRENT ELEM POSITION
				curElemPos[i] = $("svg circle:eq("+i+")").attr("elem-pos");

				// UPDATE DATA BASED ON CURRENT ELEM POSITION
				tempData[i] = updatedPointData[curElemPos[i]]; 
			};
			updatedPointData = tempData;
		}

		//UPDATE ELEM POSITIONS
		for(i=0 ; i < totalPoints ; i++){
			$("svg circle:eq("+i+")").attr("elem-pos", i);
		}
	},
	processData:function(thisData){
		var tempYears = [], tempStates = [];
		
		//grab Years and States
		for (i = 1 ; i < thisData.length ; i++){
			tempYears[i] = parseInt(thisData[i][1]);
			tempStates[i] = thisData[i][0];
		}
		years = _.chain(tempYears).uniq().compact();
		points = _.chain(tempStates).uniq().compact();
							
		//populate year slider
		$("#nav-wrapper h2").text(startYear); //default year
		$("#yearSlider").attr("min", startYear).attr("max", endYear).attr("value", startYear);

		//grab data
		totalPoints = points._wrapped.length;
		for (i = 0 ; i < points._wrapped.length ; i++){
			plotData[i] = new Array();
			var iii = 1 + i;
			for (ii = 0 ; ii < years._wrapped.length ; ii++){
				plotData[i][ii] = new Array();
				plotData[i][ii][0] = thisData[iii][2];
				plotData[i][ii][1] = thisData[iii][3];
				plotData[i][ii][2] = thisData[iii][0];
				iii = iii + totalPoints;
			}
		}
		
		//grab first year
		for (i = 0 ; i < totalPoints ; i++){
			currentData.push(plotData[i][0])
		}
		
		//process charts
		chartFunctions.populateLabels();
		chartFunctions.drawChart(currentData);
	},
	drawChart:function(data){
		if (firstRun == true) {
			//Set Scales
			xScale = d3.scale.linear()
				.domain([0, maxX])
				.range([60, w+xAdjust])
				.clamp(true)
				.nice();
				
			yScale = d3.scale.linear()
				.domain([0, maxY])
				.range([h-padding,padding])
				.clamp(true)
				.nice();
				
			
			//plot data
			chart.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("class", "plotPoint")
				.attr("cx", function(d){
					return xScale(d[0]);
				})
				.attr("cy", function(d){
					return yScale(d[1]);
				})
				.attr("data-x", function(d){
					return d[0];
				})
				.attr("data-y", function(d){
					return d[1];
				})
				.attr("r", 5)
				.attr("clicked","false")
				.on("mouseover", chartFunctions.highlightPoint)
				.on("mouseleave", chartFunctions.unhightlightPoint)	

			//Add Initial Element Position
			for (i = 0 ; i < totalPoints ; i++){
				$("svg circle:eq("+i+")").attr("elem-pos", i);
			}
			
			//Plot Point Label	
			chart.selectAll("text")
			   .data(data)
			   .enter()
			   .append("text")
			   .text(function(d) {
			   		return d[2];
			   })
			   .attr("x", function(d) {
			   		return xScale(d[0]) + 5;
			   })
			   .attr("y", function(d) {
			   		return yScale(d[1]) - 5;
			   })
			   .attr("class", "plotLabels")		
			   .attr("state", function(d){
					return d[2];
			   })
			//meta data for bars
			for (i=0 ; i < totalPoints ; i++){
				$("#chart circle:eq("+i+")").attr("state", points._wrapped[i]);
			}
			
			//Define X axis
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				.ticks(5)
				
			//Define X axis
			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("left")
				.ticks(5)
							
			//Create X axis
			chart.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + (h - padding) + ")")
				.call(xAxis);
				
			//Create Y axis
			chart.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(" + 60 + ",0)")
				.call(yAxis);
			
			//Chrun larger numbers
			utilityFunctions.churnLargeNumbers();

			firstRun = false
		}
		else {
			//plot data
			chart.selectAll("circle")
				.data(data)
				.attr("class", "plotPoint")
				.transition()
				.attr("cx", function(d){
					return xScale(d[0]);
				})
				.attr("cy", function(d){
					return yScale(d[1]);
				})
				.attr("data-x", function(d){
					return d[0];
				})
				.attr("data-y", function(d){
					return d[1];
				})
				.attr("r", 5)
								
			//meta data for bars
			for (i=0 ; i < totalPoints ; i++){
				$("#chart circle:eq("+i+")").attr("state", points._wrapped[i]);
			}
		}
	}
}

/* DETERMINES SPECIFIC CHART ONLOAD AND ADDS CUSTOMIZATION
===================================================================================*/
chartFunctions.grabData();


/* ADDRESS CHART MOTION
===================================================================================*/
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
			fullMotion = false;	//stops motion				
			$("#playMotion").attr("src", "assets/play.png");
			setTimeout(function(){
				dataPosition = 0
				chartFunctions.updateChart(dataPosition);
			},500);	
		}
		else if (dataPosition > 0){
			dataPosition = 0
			chartFunctions.updateChart(dataPosition);
		}
	}).on("mouseover", function(){
		$(this).attr("src", "assets/reload-hover.png");
	}).on("mouseleave", function(){
		$(this).attr("src", "assets/reload.png");

	});
});