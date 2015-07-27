/* GLOBAL VARIABLES
===================================================================================*/
var	barChart, dataType, dataFormat, xOffset = 0, yOffset = -25,filename, w = 600, h = 400, barPadding = 2, startYear, endYear, yearPosition, startData, endData, xScale, yScale, line, margin = {top:30,bottom:30}, yAxisLabel, dataPosition = 0, fullMotion = false,	padding = 60, firstRun = true, currentData = [], currentDataChk = false, years = [], barData = [], barLabels = [], endPoints = [], firstPlot = [], xPosition = [], startEnd = {}, colors = ["#4169E1","#e14169","#e16941","#41e1b9"], colorsInUse = [0,0,0,0], colorStep = 0, thisColor, colorLoops = 2,toggledLabels = [], progressBar = 0, progressStep;


/* GLOBAL CHART FUNCTIONS
===================================================================================*/
var barFunctions = {
	setDefaults:function(config){
		startData = config[4];
		endData = config[5];
		dataType = config[3]
		startYear = parseInt(config[6]);
		endYear = parseInt(config[7]);
		yAxisLabel = config[8];
		xTicks = config[10];
		yTicks = config[11];
		progressStep = config[12]
		dataFormat = config[3];
		dataType = config[13];
		yearPosition = startYear;

		/* ADJUSTING Y AXIS POSITION */
		if (config[9]){
			$('#bar-y-axis').css('left', config[9] + 'px');
		}

		/* APPEND CONTENT */
		$('#header h2').text(config[0]);
		$('#header p').text(config[2]);

		var content = config[1].split('|');
		$('body').append('<div class="sim-content"></div>');
		
		$('.sim-content').detach().insertAfter('section:last-of-type');
					
		for (var i=0; i < content.length; i++){
			$('.sim-content').append('<p>'+content[i]+'</p>');
		}

		/* SELECTION ADJUST */
		$('section[role="bar-motion"] #selection').css('left','40px');

		/* DRAW CHART
		------------------------------------*/
		barChart = d3.select("section[role='bar-motion'] #chart").append("svg:svg").attr("width", w).attr("height", h).append("svg:g");
		console.log(barChart)
	},
	updateChart:function(position){
		var newData = [];
		
		/* UPDATE BAR LABELS
		------------------------------------*/
		for (i = 0; i < barLabels.length; i++) {
			if (dataType === "float"){
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
		barFunctions.drawChart(newData);
		
		/* RECALC LABEL POSITIONS
		------------------------------------*/
		barFunctions.updateLabels();
		
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
					barFunctions.updateChart(dataPosition);
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
			$("section[role='bar-motion'] #chart rect[label='" + currentData[i]["label"] + "']").attr("rank", currentData[i]["rank"]).attr("x", xPosition[currentData[i]["rank"]]);				
		}		
	},
	drawChart:function(data){
		/* INIT CHART STATE
		------------------------------------*/
		if (firstRun == true) {
			
			//TOGGLE FIRST COLOR IN SEQUENCE
			barFunctions.processColors('add');

			/* TOOLTIP
			------------------------------------*/
			var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
				var clicked = $(this).attr('clicked');
				var hover = $(this).attr('hover');
				var name = $(this).attr('label');

				if (hover !== 'true'){
					$(this).attr('hover', 'true');
				}
				else {
					$(this).attr('hover', 'false');
				}

				if (clicked !== 'true' && hover !== 'true'){
					$(this).css('fill', thisColor);
					$('.d3-tip').css('display', 'block');

				}
				else if (clicked !== 'true' && hover !== 'false'){
					$(this).css('fill', '#e2e2e2');
					$('.d3-tip').css('display', 'none');
				}
				else if (clicked === 'true' && hover !== 'true'){
					$('.d3-tip').css('display', 'block');
				}
				else if (clicked === 'true' && hover !== 'false'){
					$('.d3-tip').css('display', 'none');
				}
 			   	
 			   	return "<p>"+name+"</p><p>" + barFunctions.commaSeparateNumber(d) + "</p>";
			})
			barChart.call(tip);


			/* SET SCALE
			------------------------------------*/
			yScale = d3.scale.linear().domain([startData, endData]).range([0 + margin.top, h - margin.bottom]);

			/* DRAW BARS
			------------------------------------*/
			barChart.selectAll("rect").data(data).enter().append("rect").attr("class", "barItem").attr("x", function(d, i){return (i * (540/data.length)) + 62}).attr("y", function(d, i){return (h - yScale(d));}).attr("width", 8.58823552941).attr("height", function(d){return yScale(d) - 30}).on("mouseover", tip.show).on("mouseleave", tip.show);
			for (i=0 ; i < barLabels.length ; i++){
				$("section[role='bar-motion'] #chart rect:eq("+i+")").attr("label", barLabels[i]).attr("clicked","false").attr("data", data[i]);
				xPosition[i] = $("section[role='bar-motion'] #chart rect:eq("+i+")").attr("x");
			}			

			/* CREATE AXES
			------------------------------------*/				
			barChart.append("svg:line").attr("x1", 60).attr("y1", h - 30).attr("x2", 600).attr("y2", h - 30).attr("class", "axis"); //X-Axis
			barChart.append("svg:line").attr("x1", 60).attr("y1", yScale(startData)).attr("x2", 60).attr("y2", yScale(endData)).attr("class", "axis"); //Y-Axis
			$("section[role='bar-motion'] svg line:eq(0)").add("section[role='bar-motion'] svg line:eq(1)").detach().insertAfter("section[role='bar-motion'] #chart svg g"); //move axes to top

			/* Y-AXIS LABELS AND TICKS
			------------------------------------*/
			barChart.selectAll(".yLabel").data(yScale.ticks(8)).enter().append("svg:text").attr("class", "yLabel").text(String).attr("x", 50).attr("y", function(d) {return h - yScale(d)}).attr("text-anchor", "end").attr("dy", 3); // ylabels
			barFunctions.churnLargeNumbers(true);
			barChart.selectAll(".yTicks").data(yScale.ticks(8)).enter().append("svg:line").attr("class", "yTicks").attr("y1", function(d) {return yScale(d);}).attr("x1", 55).attr("y2", function(d) {return yScale(d);}).attr("x2", 60); //yticks
			
			// SYBMOLS //
			if (dataFormat === 'Percent'){
				var labels = $('section[role="bar-motion"] .yLabel').size();
				for (var i=0 ; i < labels; i++){
					var text = $('section[role="bar-motion"] .yLabel:eq('+i+')').text();
					$('section[role="bar-motion"] .yLabel:eq('+i+')').text(text + '%');
				}
			}
			else if (dataFormat === 'Dollars'){
				var labels = $('section[role="bar-motion"] .yLabel').size();
				for (var i=0 ; i < labels; i++){
					var text = $('section[role="bar-motion"] .yLabel:eq('+i+')').text();
					$('section[role="bar-motion"] .yLabel:eq('+i+')').text('$'+ text);
				}
			}

			firstRun = false;
		}
		/* ANOTHER OTHER CHART STATE
		------------------------------------*/
		else {
			/* MODIFY BARS
			------------------------------------*/
			barChart.selectAll("rect").data(data).attr("x", function(d, i){return (i * (540/data.length)) + 62}).attr("y-update", function(d, i){return (h - yScale(d));}).transition().duration(200).attr("y", function(d, i){return (h - yScale(d));}).attr("height", function(d){return yScale(d) - 30});
			for (i=0 ; i < barLabels.length ; i++){
				$("section[role='bar-motion'] #chart rect:eq("+i+")").attr("label", barLabels[i]).attr("data", data[i]);
			}
		}

		/* RANK-SORT BARS
		------------------------------------*/
		barFunctions.rankBars(data);
	},
	updateLabels:function(){
		for (i = 0 ; i < barLabels.length ; i++){
			/* MOVE ACTIVE LABELS WITH BAR MOTION
			------------------------------------------*/
			var active = $("section[role='bar-motion'] #chart span[label='"+ barLabels[i] + "']");

			//determine position
			var whereY = parseInt($("section[role='bar-motion'] #chart rect[label='" + barLabels[i] + "']").attr("y-update")) + yOffset;
			var whereX = parseInt($("section[role='bar-motion'] #chart rect[label='" + barLabels[i] + "']").attr("x")) + xOffset;
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
			if (dataType === 'float'){
				firstPlot[i-1] = parseFloat(barData[i-1][0]);
			}
			else {
				firstPlot[i-1] = parseInt(barData[i-1][0]);
			}
			
		}	
		barFunctions.populateLabels();
		barFunctions.drawChart(firstPlot);
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
		$('section[role="bar-motion"] #selection p[clicked="true"]').click();
		toggledLabels = [];
	},
	populateLabels:function(){
		/* AXIS LABEL
		------------------------------------*/
		$("#bar-y-axis").text(yAxisLabel);

		/* BAR LABELS
		------------------------------------*/
		for (i=0 ; i < barLabels.length ; i++){
			$("section[role='bar-motion'] #selection").append("<p label=\""+barLabels[i]+"\"clicked=\"false\">" + barLabels[i] + "</p>");			
			$("section[role='bar-motion'] #selection p:eq("+i+")").on("click", function(){
				var clicked = $(this).attr("clicked"), thisLabel = $(this).text();
				if (fullMotion === true){
					return;
				}
				else {
					if (clicked === "false"){				
						//determine position
						var whereY = parseInt($("section[role='bar-motion'] #chart rect[label='" + thisLabel + "']").attr("y")) + yOffset;
						var whereX = parseInt($("section[role='bar-motion'] #chart rect[label='" + thisLabel + "']").attr("x")) + xOffset;

						//address color issue
						barFunctions.processColors('add');
						
						//background and up front
						$(this).css("background", "#ddd").attr({clicked:'true', color:colorStep});
						$("section[role='bar-motion'] #chart rect[label='"+ thisLabel +"']").css("fill",thisColor).attr("clicked","true");
						var index = _.indexOf(barLabels, thisLabel);
						toggledLabels.push(index); //push to toggled list

						//toggle layer
						$("section[role='bar-motion'] #chart").append("<span status=\"on\" class=\"labels\" label=\""+thisLabel+"\" style=\"left:" + whereX + "px;top:" + whereY + "px;color:"+thisColor+";\">" + thisLabel + "</span>");
						$("section[role='bar-motion'] .label[label='"+ thisLabel +"']").insertBefore("section[role='bar-motion'] #selection");

					}
					else {
						//address color issue
						barFunctions.processColors($(this).attr('color'));

						//background
						$(this).css("background", "#fff").attr("clicked","false");
						$("section[role='bar-motion'] #chart rect[label='"+ thisLabel +"']").css("fill","#e2e2e2");
						$("section[role='bar-motion'] #chart rect[label='"+ thisLabel +"']").attr("clicked", "false");
						//remove label
						$("section[role='bar-motion'] span[label='"+ thisLabel +"']").remove();	

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
		$('section[role="bar-motion"] #main-wrapper').append('<p id="reset-button" onclick="barFunctions.resetColors();">RESET</p>');
	},
	executeChart: function(config){
		/* LOAD CHART DEFAULTS
		===============================*/
		d3.text('data/config.csv', 'text/csv', function(text){
			var config = d3.csv.parseRows(text);
			barFunctions.setDefaults(config[1]);
		})
		

		/* LOAD CHART DATA
		===============================*/
		jQuery.getJSON('data/data.json', function(d) {
			barFunctions.processData(d);
		});	
	},
	churnLargeNumbers:function(bar){
		var countX = $("section[role='bar-motion'] .xLabel").length, countY = $("section[role='bar-motion'] .yLabel").length, xLabels = [], xTemp = [], yLabels = [], yTemp = [];

		for (i=0 ; i < countY ; i++){
			yTemp[i] = $("section[role='bar-motion'] .yLabel:eq("+i+")").text();
			//Shorten Axis Labels
			switch(yTemp[i].length){
				case 4: yTemp[i] = yTemp[i].slice(0,1); break;
				case 5: yTemp[i] = yTemp[i].slice(0,2); break;
				case 6: yTemp[i] = yTemp[i].slice(0,3); break;
				case 7: yTemp[i] = yTemp[i].slice(0,1); break;
				case 8: yTemp[i] = yTemp[i].slice(0,2); break;
				case 9: yTemp[i] = yTemp[i].slice(0,3); break;
			}
			$("section[role='bar-motion'] .yLabel:eq("+i+")").text(yTemp[i]);
		}
	},
	updateSlider:function(val){
		/* HANDLING INTERACTIONS W SLIDER
		------------------------------------*/
		var index;
		if (fullMotion == true){ //stops motion
			$("section[role='bar-motion'] #playMotion").attr("src", "assets/play.png");
			fullMotion = false;
		}
		$("section[role='bar-motion'] #nav-wrapper h2").text(val); //update slider text
		yearPosition = parseInt(val); //update year position

		for (i=1 ; i < years.length ; i++){ //locate year index
			if (yearPosition === years[i]){
				index = _.indexOf(years, yearPosition) - 1
				dataPosition = index;
				return barFunctions.updateChart(index);
			}
		}
	},
	commaSeparateNumber:function(val){
	    while (/(\d+)(\d{3})/.test(val.toString())){
	      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	    }
	    return val;
	}
}


/* ADDRESS CHART MOTION
===================================================================================*/
$(document).ready(function(){
	$("section[role='bar-motion'] #playMotion").on("click", function(){
		if (fullMotion == false){
			if (yearPosition == endYear){
				dataPosition = 0;
			}
			fullMotion = true;
			$(this).attr("src","assets/pause.png");
			barFunctions.updateChart(dataPosition);

			//toggle change in slider
			$('section[role="bar-motion"] #yearSlider').css('display','none');
			$('section[role="bar-motion"] .progress').css('display','block');
		}
		else {
			fullMotion = false; //pause motion

			//toggle change in slider
			$('section[role="bar-motion"] #yearSlider').css('display','block');
			$('section[role="bar-motion"] .progress').css('display','none');
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
			$("section[role='bar-motion'] #playMotion").attr("src", "assets/play.png");
			setTimeout(function(){
				barFunctions.updateChart(dataPosition);
			},500);	
		}
		else if (dataPosition > 0){
			dataPosition = 0;
			barFunctions.updateChart(dataPosition);
		}
	}).on("mouseover", function(){
		$(this).attr("src", "assets/reload-hover.png");
	}).on("mouseleave", function(){
		$(this).attr("src", "assets/reload.png");
		
	});
});

window.onload = function(){barFunctions.executeChart();}