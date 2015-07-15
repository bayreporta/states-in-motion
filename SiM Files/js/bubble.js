/* GLOBAL VARIABLES
===================================================================================*/
var	dataType, speed, filename, w = 600, h = 400, barPadding, startYear, endYear, yearPosition, chart, xScale, yScale, line, maxX, maxY, xAdjust, margin = {all:-1,left:70,right:15,top:30,bottom:30}, axisLabels = {x:"",y:""}, dataPosition = 0, fullMotion = false, padding = 20,	firstRun = true, totalPoints = 0, updatedPointData = [], initReprocess = false, currentData = [], curElemPos = [], years = [], plotData = [], points = [], endPoints = [], startEnd = {}, colors = ["#4169E1","#e14169","#e16941","#41e1b9"], colorsInUse = [0,0,0,0], colorStep = 0, thisColor, colorLoops = 2,toggledLabels = [],progressBar = 0, progressStep = 2.3255813953;

/* GLOBAL CHART FUNCTIONS
===================================================================================*/
var bubbleFunctions = {
	updateSlider:function(val){
		/* HANDLING INTERACTIONS W SLIDER
		------------------------------------*/
		var index;
		//stop motion if in motion
		if (fullMotion == true){
			$("section[role='bubble'] #playMotion").attr("src", "assets/play.png");
			fullMotion = false;
		}
		$("section[role='bubble'] #nav-wrapper h2").text(val); //update slider text
		yearPosition = parseInt(val); //update year position
		for (i=0 ; i < years._wrapped.length ; i++){ //locate year index
			if (yearPosition === years._wrapped[i]){
				index = _.indexOf(years._wrapped, yearPosition);					
				dataPosition = index;
				return bubbleFunctions.updateChart(index)
			}
		}
	},
	churnLargeNumbers:function(){
		var temp = [];
		var totalLabels = $("section[role='bubble'] text:not(.plotLabels)").length;
		for (i=0 ; i < totalLabels ; i++){
			temp[i] = $("section[role='bubble'] text:not(.plotLabels):eq("+i+")").text();
			//Shorten Axis Labels
			switch(temp[i].length){
				case 5: temp[i] = temp[i].slice(0,1); break;
				case 6: temp[i] = temp[i].slice(0,2); break;
				case 7: temp[i] = temp[i].slice(0,3); break;
				case 9: temp[i] = temp[i].slice(0,1); break;
				case 10: temp[i] = temp[i].slice(0,2); break;
				case 11: temp[i] = temp[i].slice(0,3); break;
			}
			$("section[role='bubble'] text:not(.plotLabels):eq("+i+")").text(temp[i]);
		}
	},
	setDefaults:function(config){
		dataType = config[0];
		startYear = config[8];
		endYear = config[9];
		axisLabels.y  = config[10]
		axisLabels.x = config[11]
		progressStep = config[12];
		maxX = parseInt(config[13]);
		maxY = parseInt(config[14]);
		xAdjust = parseInt(config[15]);
		$("section[role='bubble'] #y-axis").css("left", config[16] + 'px');
		$("section[role='bubble'] #yearSlider").attr("step", config[17]);
		speed = parseInt(config[18]);
		yearPosition = startYear;

		/* APPEND CONTENT */
		var content = config[20].split('|');
		$('body').append('<div class="sim-content"></div>');
		$('.sim-content').detach().insertAfter('section[role="bubble"] #nav-wrapper');

		for (var i=0; i < content.length; i++){
			$('.sim-content').append('<p>'+content[i]+'</p>');
		}

		/* DRAW CHART
		------------------------------------*/
		bubbleChart = d3.select("section[role='bubble'] #chart").append("svg:svg").attr("width", w).attr("height", h);
	},
	defaultToggle:function(){
		$('#selection p[label="California"]').click();
	},
	highlightPoint:function(){
		var current = $(this), label = current.attr("label");

		/* DISBALES HOVER OVER IN MOTION
		------------------------------------*/
		if (fullMotion === true){
			return;
		}
		else {	
			/* APPEND LABELS AND HIGHLIGHTS
			------------------------------------*/
			var clicked = $("section[role='bubble'] #selection p[label='"+label+"']").attr("clicked");
			var thisPoint = label;

			if (clicked === "false"){
				//text
				var $text = $("section[role='bubble'] #chart text[label='"+ thisPoint +"']");
				$text.insertBefore("section[role='bubble'] .axis:eq(0)");

				//animation
				var $point = $(this), $text = $("section[role='bubble'] #chart text[label='"+ label +"']"), point = d3.select(this);
				point.transition().duration(800).attr("r", 8).ease("elastic");

				/* ADD GUIDING LINES ON HOVER
				------------------------------------*/
				bubbleChart.append("g").attr("class", "guide").append("line").attr("x1", point.attr("cx")).attr("x2", 60).attr("y1", point.attr("cy")).attr("y2", point.attr("cy")).style("stroke", colors[colorStep]).transition().delay(200).duration(400).styleTween("opacity",function() { return d3.interpolate(0, .5); }); //x-axis
				bubbleChart.append("g").attr("class", "guide").append("line").attr("x1", point.attr("cx")).attr("x2", point.attr("cx")).attr("y1", point.attr("cy")).attr("y2", h - 20).style("stroke", colors[colorStep]).transition().delay(200).duration(400).styleTween("opacity", function() { return d3.interpolate(0, .5); }); //y-axis		
				$point.insertBefore("section[role='bubble'] .axis:eq(0)"); //reorder to front

				//address color issue
				bubbleFunctions.processColors('highlight');

				//fill point
				current.css("fill", thisColor);
				$text.css({visibility:"visible",fill:thisColor});
			}
			//reorganize data based on new positions
			bubbleFunctions.reprocessData();
		}
	},
	unhightlightPoint:function(){
		var current = $(this), label = current.attr("label");

		/* REMOVE LABELS AND HIGHLIGHTS
		------------------------------------*/
		var clicked = $("section[role='bubble'] #selection p[label='"+label+"']").attr("clicked");
		if (clicked === "false"){				
			//remove label
				current.css("fill", "#e2e2e2");
			//toggle text
				var $text = $("section[role='bubble'] #chart text[label='"+ label +"']");
				$text.detach().insertBefore("section[role='bubble'] text:first").css("visibility","hidden");
			//animations
				var point = d3.select(this);	
			//remove tooltip and lines
				$("section[role='bubble'] .guide").remove();
			//restore circle			
				point.transition().duration(800).attr("r", 5).ease("elastic");
			//update positioning
				current.detach().insertBefore("section[role='bubble'] circle:first");
				bubbleFunctions.reprocessData();
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

		/* UPDATE YEAR
		------------------------------------*/
		yearPosition = years._wrapped[position];

		/* END MOTION IF END YEAR
		------------------------------------*/
		if (yearPosition == endYear){
			fullMotion = false;
			$('#playMotion').attr("src", "assets/play.png");
			//toggle change in slider
			$('#yearSlider').css('display','block');
			$('.progress').css('display','none');
		}

		/* RECALC LABEL POSITIONS
		------------------------------------*/
		bubbleFunctions.updateLabels(currentData);

		/* UPDATE CHART DATA
		------------------------------------*/
		bubbleFunctions.drawChart(currentData);

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
					bubbleFunctions.updateChart(dataPosition);
				}
			}, speed)
		}
	},
	updateLabels:function(data){
		/* UPDATE LABEL POSITIONS
		------------------------------------*/	
		bubbleChart.selectAll("text").data(data).attr("x", function(d) {return xScale(d[0]) + 5;}).attr("y", function(d) {return yScale(d[1]) - 5;});

		/* UPDATE LABELS
		------------------------------------*/	
		for (i=0 ; i < data.length ; i++){
			points._wrapped[i] = data[i][2];
		}
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
		$('section[role="bubble"] #selection p[clicked="true"]').click();
		toggledLabels = [];
	},
	populateLabels:function(){
		/* AXIS LABELS
		------------------------------------*/
		$("section[role='bubble'] #x-axis").text(axisLabels.x);
		$("section[role='bubble'] #y-axis").text(axisLabels.y);

		/* POINT LABELS
		------------------------------------*/
		for (i=0 ; i < points._wrapped.length ; i++){
			$("section[role='bubble'] #selection").append("<p label=\""+points._wrapped[i]+"\"clicked=\"false\">" + points._wrapped[i] + "</p>");
			$("section[role='bubble'] #selection p:eq("+i+")").on("click", function(){
				var clicked = $(this).attr("clicked");
				var thisPoint = $(this).text();

				/* PREVENT LABEL CLICK ON MOTION
				------------------------------------*/
				if(fullMotion === true){
					return;
				}
				else{		
					/* TOGGLE LABEL BEHAVIOR
					------------------------------------*/					
					if (clicked === "false"){	
						//address color issue
						bubbleFunctions.processColors('add');

						//unhide text
						var $text = $("section[role='bubble'] #chart text[label='"+ thisPoint +"']");
						$text.css({visibility:"visible",fill:thisColor});
						$text.insertBefore("section[role='bubble'] .axis:eq(0)");
											
						//background and up front
						$(this).css("background", "#ddd").attr({clicked:"true",color:colorStep});
						$("section[role='bubble'] #chart circle[label='"+ thisPoint +"']").css("fill",thisColor).attr("clicked", "true");
						var index = _.indexOf(points._wrapped, thisPoint);
						toggledLabels.push(index); //push to toggled list
						
						//reorder to front	
						var $point = $("section[role='bubble'] #chart circle[label='"+ thisPoint +"']");
						$point.insertBefore("section[role='bubble'] .axis:eq(0)");
					}
					else {
						//address color issue
						bubbleFunctions.processColors($(this).attr('color'));

						//background
						$(this).css("background", "#fff").attr("clicked","false");
						$("section[role='bubble'] #chart circle[label='"+ thisPoint +"']").css("fill","#e2e2e2");
						$("section[role='bubble'] #chart circle[label='"+ thisPoint +"']").attr("clicked", "false");

						//remove label
						var $text = $("section[role='bubble'] #chart text[label='"+ thisPoint +"']");
						$text.css("visibility","hidden");

						//remove from toggled list
						var index = _.indexOf(points._wrapped, thisPoint);
						for (i=0;i<toggledLabels.length;i++){
							if (toggledLabels[i] === index){
								delete toggledLabels[i];
								toggledLabels = _.compact(toggledLabels); 
								break;
						}
					}
					}
					//reorganize data based on new positions
					bubbleFunctions.reprocessData();
				}
			});
		}
		$('section[role="bubble"] #main-wrapper').append('<p id="reset-button" onclick="bubbleFunctions.resetColors();">RESET</p>');
	},
	reprocessData:function(){
		var curPos = [], tempData = [];

		/* THIS ADDRESSES MOTION ISSUES WHEN MOVING POINTS TO TOP
		-----------------------------------------------------------------*/
		if (initReprocess == false){
			for (i=0 ; i < totalPoints ; i++) {
				// GRAB CURRENT ELEM POSITION
				curElemPos[i] = $("section[role='bubble'] svg circle:eq("+i+")").attr("elem-pos");

				// UPDATE DATA BASED ON CURRENT ELEM POSITION
				tempData[i] = plotData[curElemPos[i]]; 
				updatedPointData[i] = tempData[i];
			};
			initReprocess = true;
		}
		else {
			for (i=0 ; i < totalPoints ; i++) {

				// GRAB CURRENT ELEM POSITION
				curElemPos[i] = $("section[role='bubble'] svg circle:eq("+i+")").attr("elem-pos");

				// UPDATE DATA BASED ON CURRENT ELEM POSITION
				tempData[i] = updatedPointData[curElemPos[i]]; 
			};
			updatedPointData = tempData;
		}

		/* UPDATE POSITION OF ALL ELEMENTS
		------------------------------------*/
		for(i=0 ; i < totalPoints ; i++){
			$("section[role='bubble'] svg circle:eq("+i+")").attr("elem-pos", i);
		}
	},
	processData:function(thisData){
		var tempYears = [], tempLabels = [];
		/* GRAB YEARS AND LABELS
		------------------------------------*/
		for (i = 1 ; i < thisData.length ; i++){
			tempYears[i] = parseInt(thisData[i][1]);
			tempLabels[i] = thisData[i][0];
		}
		years = _.chain(tempYears).uniq().compact();
		points = _.chain(tempLabels).uniq().compact();
							
		/* POPULATE SLIDER
		------------------------------------*/
		$("section[role='bubble'] #nav-wrapper h2").text(startYear); //default year
		$("section[role='bubble'] #yearSlider").attr("min", startYear).attr("max", endYear).attr("value", startYear);

		/* GRAB DATA
		------------------------------------*/
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
		
		/* GRAB FIRST YEAR IN DATA
		------------------------------------*/
		for (i = 0 ; i < totalPoints ; i++){
			currentData.push(plotData[i][0])
		}
		
		bubbleFunctions.drawChart(currentData);
		bubbleFunctions.populateLabels();
		bubbleFunctions.defaultToggle();

	},
	drawChart:function(data){
		/* INIT CHART POSITION
		------------------------------------*/
		if (firstRun == true) {

			/* TOOLTIP
			------------------------------------*/
			var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
				var clicked = $(this).attr('clicked');
				var hover = $(this).attr('hover');

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
 			   	
 			   	return "<p>"+d[2]+"</p><p>x: " + bubbleFunctions.commaSeparateNumber(d[0]) + "</p><p>y: " + bubbleFunctions.commaSeparateNumber(d[1]) + "</p>";
			})
			bubbleChart.call(tip);

			/* SET SCALES
			------------------------------------*/
			xScale = d3.scale.linear().domain([0, maxX]).range([60, w+xAdjust]).clamp(true).nice(); //xscale				
			yScale = d3.scale.linear().domain([0, maxY]).range([h-padding,padding]).clamp(true).nice(); //yscale

			/* DEFINE AXES
			------------------------------------*/	
			var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10);//.innerTickSize(-360).outerTickSize(0); //xaxis
			var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);//.innerTickSize(-450).outerTickSize(0);//yaxis

			/* DRAW PLOTS
			------------------------------------*/
			bubbleChart.selectAll("circle").data(data).enter().append("circle").attr("class", "plotPoint").attr("cx", function(d){return xScale(d[0]);}).attr("cy", function(d){return yScale(d[1]);}).attr("data-x", function(d){return d[0];}).attr("data-y", function(d){return d[1];}).attr("r", 5).attr("clicked","false").on("mouseover", tip.show).on("mouseleave", tip.show);
			
			/* ADD INIT ELEMENT POSITIONS
			------------------------------------*/
			for (i = 0 ; i < totalPoints ; i++){
				$("section[role='bubble'] svg circle:eq("+i+")").attr("elem-pos", i);
			}
			
			/* DRAW LABELS
			------------------------------------*/	
			bubbleChart.selectAll("text").data(data).enter().append("text").text(function(d) {return d[2];}).attr("x", function(d) {return xScale(d[0]) + 5;}).attr("y", function(d) {return yScale(d[1]) - 5;}).attr("class", "plotLabels").attr("label", function(d){return d[2];}) //meta data for bars
			for (i=0 ; i < totalPoints ; i++){
				$("section[role='bubble'] #chart circle:eq("+i+")").attr("label", points._wrapped[i]);
			}
			
			/* CREATE AXES
			------------------------------------*/	
			bubbleChart.append("g").attr("class", "axis").attr("transform", "translate(0," + (h - padding) + ")").call(xAxis); //xaxis
			bubbleChart.append("g").attr("class", "axis").attr("transform", "translate(" + 60 + ",0)").call(yAxis); //yaxis
			
			/* MOVE AXES BACK
			------------------------------------*/	
			//$('.axis').detach().insertBefore('circle:eq(0)');

			bubbleFunctions.churnLargeNumbers();
			bubbleFunctions.tickSymbols();

			firstRun = false;
		}
		/* ALL OTHER CHART POSITIONS
		------------------------------------*/
		else {

			/* MODIFY PLOTS
			------------------------------------*/	
			bubbleChart.selectAll("circle").data(data).attr("class", "plotPoint").transition().attr("cx", function(d){return xScale(d[0]);}).attr("cy", function(d){return yScale(d[1]);}).attr("data-x", function(d){return d[0];}).attr("data-y", function(d){return d[1];}).attr("r", 5);
			for (i=0 ; i < totalPoints ; i++){
				$("#chart circle:eq("+i+")").attr("label", points._wrapped[i]);
			}
		}
	},
	executeChart: function(config){
		bubbleFunctions.setDefaults(config);

		/* LOAD CHART DATA
		===============================*/
		d3.text('data/' + config[5] + '.csv', 'text/csv', function(text) {
			var d = d3.csv.parseRows(text);
			bubbleFunctions.processData(d);
		});	
	},
	tickSymbols: function(){
		// SYBMOLS //
		if (dataType === 'IncomeExpendStudent'){
			var xlabels = $('section[role="bubble"] .axis:eq(0) g').size();
			var ylabels = $('section[role="bubble"] .axis:eq(1) g').size();

			for (var i=0 ; i < xlabels; i++){
				var text = $('section[role="bubble"] .axis:eq(0) g:eq('+i+') text').text();
				$('section[role="bubble"] .axis:eq(0) g:eq('+i+') text').text('$' + text);
			}

			for (var i=0 ; i < ylabels; i++){
				var text = $('section[role="bubble"] .axis:eq(1) g:eq('+i+') text').text();
				$('section[role="bubble"] .axis:eq(1) g:eq('+i+') text').text('$' + text);
			}
		}
		else if (dataType === 'NAEPpoverty'){
			var xlabels = $('section[role="bubble"] .axis:eq(0) g').size();
			var ylabels = $('section[role="bubble"] .axis:eq(1) g').size();

			for (var i=0 ; i < xlabels; i++){
				var text = $('section[role="bubble"] .axis:eq(0) g:eq('+i+') text').text();
				$('section[role="bubble"] .axis:eq(0) g:eq('+i+') text').text(text + '%');
			}

			for (var i=0 ; i < ylabels; i++){
				var text = $('section[role="bubble"] .axis:eq(1) g:eq('+i+') text').text();
				$('section[role="bubble"] .axis:eq(1) g:eq('+i+') text').text(text + '%');
			}
		}
		else if (dataType === 'NAEPexpend'){
			var xlabels = $('section[role="bubble"] .axis:eq(0) g').size();
			var ylabels = $('section[role="bubble"] .axis:eq(1) g').size();

			for (var i=0 ; i < xlabels; i++){
				var text = $('section[role="bubble"] .axis:eq(0) g:eq('+i+') text').text();
				$('section[role="bubble"] .axis:eq(0) g:eq('+i+') text').text('$' + text);
			}

			for (var i=0 ; i < ylabels; i++){
				var text = $('section[role="bubble"] .axis:eq(1) g:eq('+i+') text').text();
				$('section[role="bubble"] .axis:eq(1) g:eq('+i+') text').text(text + '%');
			}
		}
		else if (dataType === 'TeacherPayStudents'){
			var xlabels = $('section[role="bubble"] .axis:eq(0) g').size();
			var ylabels = $('section[role="bubble"] .axis:eq(1) g').size();

			for (var i=0 ; i < xlabels; i++){
				var text = $('section[role="bubble"] .axis:eq(0) g:eq('+i+') text').text();
				$('section[role="bubble"] .axis:eq(0) g:eq('+i+') text').text('$' + text);
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
	$("section[role='bubble'] #playMotion").on("click", function(){
		if (fullMotion == false){
			if (yearPosition == endYear){
				dataPosition = 0;
			}
			fullMotion = true;
			$(this).attr("src","assets/pause.png");
			bubbleFunctions.updateChart(dataPosition);
			//toggle change in slider
			$('section[role="bubble"] #yearSlider').css('display','none');
			$('section[role="bubble"] .progress').css('display','block');
		}
		else {
			fullMotion = false; //pause motion
			//toggle change in slider
			$('section[role="bubble"] #yearSlider').css('display','block');
			$('section[role="bubble"] .progress').css('display','none');
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
			$("section[role='bubble'] #playMotion").attr("src", "assets/play.png");
			setTimeout(function(){
				dataPosition = 0
				bubbleFunctions.updateChart(dataPosition);
			},500);	
		}
		else if (dataPosition > 0){
			dataPosition = 0
			bubbleFunctions.updateChart(dataPosition);
		}
	}).on("mouseover", function(){
		$(this).attr("src", "assets/reload-hover.png");
	}).on("mouseleave", function(){
		$(this).attr("src", "assets/reload.png");

	});
});