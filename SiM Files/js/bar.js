/* GLOBAL VARIABLES
===================================================================================*/
var	dataType = $("meta").attr("content"), filename, w = 600, h = 400, barPadding = 2, startYear = 0, endYear = 0, yearPosition = 0, startData, endData, chart, xScale, yScale, line, margin = {top:30,bottom:30}, yAxisLabel, dataPosition = 0, fullMotion = false,	padding = 60, firstRun = true, currentData = [], currentDataChk = false, years = [], barData = [], barLabels = [], endPoints = [], firstPlot = [], xPosition = [], startEnd = {}, colors = ["#4169E1","#e14169","#e16941","#41e1b9"], colorsInUse = [0,0,0,0], colorStep = 0, thisColor, colorLoops = 2,toggledLabels = [], progressBar = 0, progressStep = 2.3255813953;

/* GLOBAL CHART FUNCTIONS
===================================================================================*/
var chartFunctions = {
	highlightBar:function(){
		var current = $(this), label = current.attr("label");

		/* APPEND LABELS AND HIGHLIGHTS
		------------------------------------*/
		var clicked = $("#selection p[label='"+label+"']").attr("clicked");
		if (fullMotion === true){
			return;
		}
		else {
			if (clicked === "false"){
				//determine position
				var whereY = parseInt($("#chart rect[label='" + label + "']").attr("y")) + 50;
				var whereX = parseInt($("#chart rect[label='" + label + "']").attr("x")) + 8;
				
				//address color issue
				chartFunctions.processColors('highlight');

				//toggle layer
				$("#chart").append("<span class=\"labels\" label=\""+label+"\" style=\"left:" + whereX + "px;top:" + whereY + "px;color:"+thisColor+";\">" + label + "</span>");
				$(".label[label='"+ label +"']").insertBefore("#selection");
				
				//color
				current.css("fill", colors[colorStep]);
			}
		}
	},
	unhightlightBar:function(){
		var current = $(this), label = current.attr("label");

		/* REMOVE LABELS AND HIGHLIGHTS
		------------------------------------*/
		var clicked = $("#selection p[label='"+label+"']").attr("clicked");
		if (clicked === "false"){				
			//remove label
			current.css("fill", "#e2e2e2");
			$("span[label='"+ label +"']").remove();
		}
	},
	defaultToggle:function(chart){
		$('#selection p[label="California"]').click();
	},
	grabData:function(){
		switch(dataType){
			case "Income":
				filename = 'data/income.csv';
				startYear = 1970;
				endYear = 2013;
				yAxisLabel = "Income per Capita (in thousands)";
				yearPosition = 1970;
				startData = 0;
				endData = 80000;
				break;
			case "ExpStudent":
				filename = 'data/expendstudent.csv';
				startYear = 1970;
				endYear = 2012;
				yAxisLabel = "State Expenditures per Student (in thousands)";
				yearPosition = 1970;
				startData = 0;
				endData = 30000;
				progressStep = 2.380952381;
				break;
			case "Expend13":
				filename = 'data/expend13.csv';
				startYear = 1982;
				endYear = 2012;
				yAxisLabel = "K-12 Expenditures per Student - 13 Years Cumulative (in thousands)";
				yearPosition = 1982;
				startData = 0;
				endData = 250000;
				progressStep = 3.3333333333;
				break;
			case "Teachers13":
				filename = 'data/teachers13.csv';
				startYear = 1982;
				endYear = 2010;
				yAxisLabel = "Teachers per Student - 13 Years Cumulative";
				yearPosition = 1982;
				startData = 0;
				endData = 1.5;
				progressStep = 3.5714285714;
				break;
		}
		d3.text(filename, 'text/csv', function(text) {
			var thisData = d3.csv.parseRows(text);
			chartFunctions.processData(thisData);
		});
		chartFunctions.setDefaults();
	},
	setDefaults:function(){
		/* DRAW CHART
		------------------------------------*/
		chart = d3.select("#chart").append("svg:svg").attr("width", w).attr("height", h).append("svg:g");
	},
	updateChart:function(position){
		var newData = [];
		
		/* UPDATE BAR LABELS
		------------------------------------*/
		for (i = 0; i < barLabels.length; i++) {
			if (dataType === "TeachStudent" || dataType === "Teachers13"){
				newData[i]  = parseFloat(barData[i][position]);
			}
			else {
				newData[i]  = parseInt(barData[i][position]);
			}
		}	
		
		/* UPDATE YEAR
		------------------------------------*/
		yearPosition = years[position + 1];
		
		/* END MOTION IF END YEAR
		------------------------------------*/
		if (yearPosition == endYear){
			fullMotion = false;
			$('#playMotion').attr("src", "assets/play.png");
			//toggle change in slider
			$('#yearSlider').css('display','block');
			$('.progress').css('display','none');
		}
					
		/* UPDATE CHART DATA
		------------------------------------*/
		chartFunctions.drawChart(newData);
		
		/* RECALC LABEL POSITIONS
		------------------------------------*/
		chartFunctions.updateLabels();
		
		/* UPDATE SLIDER
		------------------------------------*/
		$("#yearSlider").attr("value", yearPosition);
		$("#nav-wrapper h2").text(yearPosition);
		//determine progress bar
		if (dataPosition == 0){
			progressBar = 0;
		}
		else {
			progressBar = (dataPosition + 1) * progressStep;
		}
		$('.progress-bar').css('width', progressBar +'%');



		/* REPEAT IF MOTION TRUE
		------------------------------------*/
		if (fullMotion == true){
			//DO IT AGAIN!
			setTimeout(function(){
				if (dataPosition !== years.length - 2){
					dataPosition = dataPosition + 1;
					chartFunctions.updateChart(dataPosition);
				}
			}, 500);
		}
	},
	rankBars:function(data){
		var thisData = [], rankCheck = [];
		
		/* LAY FOUNDATION FOR RANKING
		------------------------------------*/
		for (i = 0 ; i < barLabels.length ; i++){
			//building data foundation for sorting
			if (currentDataChk == false){
				currentData[i] = new Object;
			}
			currentData[i]["label"] = barLabels[i];
			currentData[i]["data"] = data[i];
			thisData[i] = data[i];
			currentData[i]["rank"] = 0;
			rankCheck[i] = false;
		}
		currentDataChk = true;
				
		/* SORT DATA
		------------------------------------*/
		thisData.sort(function(b, a){return a-b});
		
		/* RANK DATA FOR EACH BAR
		------------------------------------*/
		for (i = 0 ; i < barLabels.length ; i++){
			for (ii = 0 ; ii < barLabels.length ; ii++){
				if (thisData[ii] == currentData[i]["data"] && rankCheck[ii] == false){
					currentData[i]["rank"] = ii;
					rankCheck[ii] = true;
					break;
				}
			}
			$("#chart rect[label='" + currentData[i]["label"] + "']").attr("rank", currentData[i]["rank"]).attr("x", xPosition[currentData[i]["rank"]]);				
		}		
	},
	drawChart:function(data){
		/* INIT CHART STATE
		------------------------------------*/
		if (firstRun == true) {
			/* SET SCALE
			------------------------------------*/
			yScale = d3.scale.linear().domain([startData, endData]).range([0 + margin.top, h - margin.bottom]);

			/* DRAW BARS
			------------------------------------*/
			chart.selectAll("rect").data(data).enter().append("rect").attr("class", "barItem").attr("x", function(d, i){return (i * (540/data.length)) + 62}).attr("y", function(d, i){return (h - yScale(d));}).attr("width", 8.58823552941).attr("height", function(d){return yScale(d) - 30}).on("mouseover", chartFunctions.highlightBar).on("mouseleave", chartFunctions.unhightlightBar);
			for (i=0 ; i < barLabels.length ; i++){
				$("#chart rect:eq("+i+")").attr("label", barLabels[i]).attr("clicked","false").attr("data", data[i]);
				xPosition[i] = $("#chart rect:eq("+i+")").attr("x");
			}			

			/* CREATE AXES
			------------------------------------*/				
			chart.append("svg:line").attr("x1", 60).attr("y1", h - 30).attr("x2", 600).attr("y2", h - 30).attr("class", "axis"); //X-Axis
			chart.append("svg:line").attr("x1", 60).attr("y1", yScale(startData)).attr("x2", 60).attr("y2", yScale(endData)).attr("class", "axis"); //Y-Axis
			$("svg line:eq(0)").add("svg line:eq(1)").detach().insertAfter("#chart svg g"); //move axes to top

			/* Y-AXIS LABELS AND TICKS
			------------------------------------*/
			chart.selectAll(".yLabel").data(yScale.ticks(4)).enter().append("svg:text").attr("class", "yLabel").text(String).attr("x", 50).attr("y", function(d) {return h - yScale(d)}).attr("text-anchor", "end").attr("dy", 3); // ylabels
			utilityFunctions.churnLargeNumbers(true);
			chart.selectAll(".yTicks").data(yScale.ticks(4)).enter().append("svg:line").attr("class", "yTicks").attr("y1", function(d) {return yScale(d);}).attr("x1", 55).attr("y2", function(d) {return yScale(d);}).attr("x2", 60); //yticks
			
			/* DEFAULT TOGGLES
			------------------------------*/
			chartFunctions.defaultToggle(dataType);

			firstRun = false;
		}
		/* ANOTHER OTHER CHART STATE
		------------------------------------*/
		else {
			/* MODIFY BARS
			------------------------------------*/
			chart.selectAll("rect").data(data).attr("x", function(d, i){return (i * (540/data.length)) + 62}).attr("y-update", function(d, i){return (h - yScale(d));}).transition().duration(200).attr("y", function(d, i){return (h - yScale(d));}).attr("height", function(d){return yScale(d) - 30});
			for (i=0 ; i < barLabels.length ; i++){
				$("#chart rect:eq("+i+")").attr("label", barLabels[i]).attr("clicked","false").attr("data", data[i]);
			}
		}

		/* RANK-SORT BARS
		------------------------------------*/
		chartFunctions.rankBars(data);
	},
	updateLabels:function(){
		for (i = 0 ; i < barLabels.length ; i++){
			/* MOVE ACTIVE LABELS WITH BAR MOTION
			------------------------------------------*/
			var active = $("#chart span[label='"+ barLabels[i] + "']");

			//determine position
			var whereY = parseInt($("#chart rect[label='" + barLabels[i] + "']").attr("y-update")) + 50;
			var whereX = parseInt($("#chart rect[label='" + barLabels[i] + "']").attr("x")) + 8;
			active.animate({top:whereY + "px",left:whereX + "px"}, 100);
		}
	},
	processData:function(thisData){
		var tempYears = [];

		/* GRAB YEARS AND ADD TO SLIDER
		------------------------------------*/
		for (i = 0 ; i < thisData[0].length ; i++){
			years[i] = parseInt(thisData[0][i]);
		}
		$("#nav-wrapper h2").text(startYear); //default year
		$("#yearSlider").attr("min", startYear).attr("max", endYear).attr("value", startYear);


		/* GRAB DATA
		------------------------------------*/
		for (i = 1; i < thisData.length; i++) {
			barData[i-1] = thisData[i].slice(1,45);

			//populate state labels
			barLabels[i-1] = thisData[i][0];
			
			//initial plot - dependent on data type (float or int)
			if (dataType === "TeachStudent" || dataType === "Teachers13"){
				firstPlot[i-1] = parseFloat(barData[i-1][0]);
			}
			else {
				firstPlot[i-1] = parseInt(barData[i-1][0]);
			}
			
		}	
		chartFunctions.populateLabels();
		chartFunctions.drawChart(firstPlot);
	},
	processColors:function(direct){
		if (direct === 'add' || direct === 'highlight'){
			var w = 0, whileStatus = true;
			while (w < colorLoops){
				if (whileStatus == true){
					for (i=0 ; i < colors.length ; i++){
						if (colorsInUse[i] == w){
							thisColor = colors[i];
							colorStep = i;
							whileStatus = false;
							if (direct === 'add'){
								colorsInUse[i] += 1;
							}
							break;
						}
					}
					w += 1;
				}
				else {
					break;
				}				
			}
		}
		else {
			colorsInUse[parseInt(direct)] -= 1;
		}
	},
	resetColors:function(){
		$('#selection p[clicked="true"]').click();
		toggledLabels = [];
	},
	populateLabels:function(){
		/* AXIS LABEL
		------------------------------------*/
		$("#bar-y-axis").text(yAxisLabel);

		/* BAR LABELS
		------------------------------------*/
		for (i=0 ; i < barLabels.length ; i++){
			$("#selection").append("<p label=\""+barLabels[i]+"\"clicked=\"false\">" + barLabels[i] + "</p>");			
			$("#selection p:eq("+i+")").on("click", function(){
				var clicked = $(this).attr("clicked"), thisLabel = $(this).text();
				if (fullMotion === true){
					return;
				}
				else {
					if (clicked === "false"){				
						//determine position
						var whereY = parseInt($("#chart rect[label='" + thisLabel + "']").attr("y")) + 50;
						var whereX = parseInt($("#chart rect[label='" + thisLabel + "']").attr("x")) + 8;

						//address color issue
						chartFunctions.processColors('add');
						
						//background and up front
						$(this).css("background", "#ddd").attr({clicked:'true', color:colorStep});
						$("#chart rect[label='"+ thisLabel +"']").css("fill",thisColor).attr("clicked","true");
						var index = _.indexOf(barLabels, thisLabel);
						toggledLabels.push(index); //push to toggled list

						//toggle layer
						$("#chart").append("<span status=\"on\" class=\"labels\" label=\""+thisLabel+"\" style=\"left:" + whereX + "px;top:" + whereY + "px;color:"+thisColor+";\">" + thisLabel + "</span>");
						$(".label[label='"+ thisLabel +"']").insertBefore("#selection");

					}
					else {
						//address color issue
						chartFunctions.processColors($(this).attr('color'));

						//background
						$(this).css("background", "#fff").attr("clicked","false");
						$("#chart rect[label='"+ thisLabel +"']").css("fill","#e2e2e2");
						$("#chart rect[label='"+ thisLabel +"']").attr("clicked", "false");
						//remove label
						$("span[label='"+ thisLabel +"']").remove();	

						//remove from toggled list
						var index = _.indexOf(barLabels, thisLabel);
						for (i=0;i<toggledLabels.length;i++){
							if (toggledLabels[i] === index){
								delete toggledLabels[i];
								toggledLabels = _.compact(toggledLabels); 
								break;
							}
						}		
					}
				}					
			});
		}
		$('#main-wrapper').append('<p id="reset-button" onclick="chartFunctions.resetColors();">RESET</p>');
	},
}

/* GLOBAL UTILITY FUNCTIONS
===================================================================================*/
var utilityFunctions = {
	updateSlider:function(val){
		/* HANDLING INTERACTIONS W SLIDER
		------------------------------------*/
		var index;
		if (fullMotion == true){ //stops motion
			$("#playMotion").attr("src", "assets/play.png");
			fullMotion = false;
		}
		$("#nav-wrapper h2").text(val); //update slider text
		yearPosition = parseInt(val); //update year position

		for (i=1 ; i < years.length ; i++){ //locate year index
			if (yearPosition === years[i]){
				index = _.indexOf(years, yearPosition) - 1
				dataPosition = index;
				return chartFunctions.updateChart(index);
			}
		}
	},
	churnLargeNumbers:function(bar){
		var countX = $(".xLabel").length, countY = $(".yLabel").length, xLabels = [], xTemp = [], yLabels = [], yTemp = [];

		for (i=0 ; i < countY ; i++){
			yTemp[i] = $(".yLabel:eq("+i+")").text();
			//Shorten Axis Labels
			switch(yTemp[i].length){
				case 4: yTemp[i] = yTemp[i].slice(0,1); break;
				case 5: yTemp[i] = yTemp[i].slice(0,2); break;
				case 6: yTemp[i] = yTemp[i].slice(0,3); break;
				case 7: yTemp[i] = yTemp[i].slice(0,1); break;
				case 8: yTemp[i] = yTemp[i].slice(0,2); break;
				case 9: yTemp[i] = yTemp[i].slice(0,3); break;
			}
			$(".yLabel:eq("+i+")").text(yTemp[i]);
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
			if (yearPosition == endYear){
				dataPosition = 0;
			}
			fullMotion = true;
			$(this).attr("src","assets/pause.png");
			chartFunctions.updateChart(dataPosition);

			//toggle change in slider
			$('#yearSlider').css('display','none');
			$('.progress').css('display','block');
		}
		else {
			fullMotion = false; //pause motion

			//toggle change in slider
			$('#yearSlider').css('display','block');
			$('.progress').css('display','none');
		}
	}).on("mouseover", function(){ //change graphic
		if (fullMotion == true){
			$(this).attr("src", "assets/pause-hover.png");
		}
		else {
			$(this).attr("src", "assets/play-hover.png");
		}
	}).on("mouseleave", function(){ //change graphic
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
			dataPosition = -1;
			$("#playMotion").attr("src", "assets/play.png");
			setTimeout(function(){
				chartFunctions.updateChart(dataPosition);
			},500);	
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