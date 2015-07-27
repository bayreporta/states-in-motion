/* GLOBAL CHART FUNCTIONS
===================================================================================*/
var lineFunctions = {
	highlightLine:function(){
		var current = $(this), label = current.attr("label");
				
		/* APPEND LABELS AND HIGHLIGHTS
		------------------------------------*/
		var clicked = $("section[role='line'] #selection p[label='"+label+"']").attr("clicked");
		if (clicked === "false"){
			var where = _.indexOf(lineLabels, label);
			var position = parseFloat(endPoints[where]) + offset;

			/* SPECIAL COLOR RULES
			------------------------------------*/
			if (label==="Average Income"){
				return;
			}	
			else {				
				$("section[role='line'] #main-wrapper").append("<span class=\"labels\" label=\""+label+"\" style=\"top:"+ position + "px;color:"+colors[colorStep]+"\">" + label + "</span>");
				$("section[role='line'] .label[label='"+ label +"']").insertBefore("section[role='line'] #selection");	

				//address color issue
				lineFunctions.processColors('highlight');	
				$("section[role='line'] .label[label='"+ label +"']").insertBefore("section[role='line'] #selection");	

				//highlight and move to highlight group
				current.css("stroke", thisColor).detach().insertAfter("section[role='line'] svg path:last");			
			}	
		}
	},
	unhightlightLine:function(){
		var current = $(this), label = current.attr("label");
		
		/* REMOVE LABELS AND HIGHLIGHTS
		------------------------------*/
		var clicked = $("section[role='line'] #selection p[label='"+label+"']").attr("clicked");
		if (clicked === "false"){

			/* SPECIAL COLOR RULES
			------------------------------------*/
			if (label==="Average Income"){
				return;
			}
			else {
				current.css("stroke", "#e2e2e2");
				$("span[label='"+ label +"']").remove();

				//push to back
				current.detach().insertBefore("section[role='line'] svg path:first");	
			}			
		}		
	},
	setDefaults:function(config){
		startData = config[4];
		endData = config[5];
		dataType = config[3]
		startYear = parseInt(config[6]);
		endYear = parseInt(config[7]);
		yAxisLabel = config[8];
		xTicks = config[10];
		yTicks = config[11];

		var endYearAdj = endYear + 1;

		/* ADJUSTING Y AXIS POSITION */
		if (config[9]){
			$('section[role="line"] #y-axis').css('left', config[9] + 'px');
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

		/* SET SCALE AND GRAB LABELS
		------------------------------*/
		y = d3.scale.linear().domain([endData, startData]).range([0 + margin.top, h - margin.bottom]),
		x = d3.scale.linear().domain([startYear, endYear]).range([0 + margin.left, w - margin.right]),
		years = d3.range(startYear, endYearAdj),
		lineLabels = [], endPoints = [];

		/* DRAW CHART
		------------------------------*/
		lineChart = d3.select("section[role='line'] #chart").append("svg:svg").attr("width", w).attr("height", h).append("svg:g");	
		line = d3.svg.line().x(function(d, i) {return x(d.x);}).y(function(d) {return y(d.y);});
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
		$('section[role="line"] #selection p[clicked="true"]').click();
		toggledLabels = [];
	},
	drawChart:function(){
		/* DRAW AXES
		------------------------------*/
		lineChart.append("svg:line").attr("x1", x(startYear)).attr("y1", h - 30).attr("x2", 586).attr("y2", h - 30).attr("class", "axis"); //X-Axis	
		lineChart.append("svg:line").attr("x1", x(startYear)).attr("y1", y(startData)).attr("x2", x(startYear)).attr("y2", y(endData)).attr("class", "axis"); //Y-Axis


		/* AXES TO TOP
		------------------------------*/
		$("section[role='line'] svg line:eq(0)").add("section[role='line'] svg line:eq(1)").detach().insertAfter("section[role='line'] #chart svg g");	


		/* X-AXIS TICKS
		------------------------------*/
		lineChart.selectAll(".xLabel").data(x.ticks(xTicks)).enter().append("svg:text").attr("class", "xLabel").text(String).attr("x", function(d) {return x(d)}).attr("y", h - 10).attr("text-anchor", "middle");
		lineChart.selectAll(".xTicks").data(x.ticks(xTicks)).enter().append("svg:line").attr("class", "xTicks").attr("x1", function(d) {return x(d);}).attr("y1", y(startData)).attr("x2", function(d) {return x(d);}).attr("y2", y(startData) + 10);
		
		/* Y-AXIS LABELS
		------------------------------*/
		lineChart.selectAll(".yLabel").data(y.ticks(yTicks)).enter().append("svg:text").attr("class", "yLabel").text(String).attr("x", 100).attr("y", function(d) {return y(d)}).attr("text-anchor", "end").attr("dy", 3);
		lineFunctions.churnLargeNumbers(true);

		// SYBMOLS //
		if (dataType === 'Percent' || dataType === 'percent'){
			var labels = $('section[role="line"] .yLabel').size();
			for (var i=0 ; i < labels; i++){
				var text = $('section[role="line"] .yLabel:eq('+i+')').text();
				$('section[role="line"] .yLabel:eq('+i+')').text(text + '%');
			}
		}
		else if (dataType === 'Dollars' || dataType === 'dollars'){
			var labels = $('section[role="line"] .yLabel').size();
			for (var i=0 ; i < labels; i++){
				var text = $('section[role="line"] .yLabel:eq('+i+')').text();
				$('section[role="line"] .yLabel:eq('+i+')').text('$'+ text);
			}
		}

		
		/* Y-AXIS TICKS
		------------------------------*/
		lineChart.selectAll(".yTicks").data(y.ticks(5)).enter().append("svg:line").attr("class", "yTicks").attr("y1", function(d) {return y(d);}).attr("x1", 105).attr("y2", function(d) {return y(d);}).attr("x2", 110); //yticks
	},
	processData:function(d){
		for (i = 1; i < d.length; i++) {
			/* GRAB ROW DATA
			------------------------------*/
			var val = d[i].slice(1), lineData = [], started = false;



			/* CONFIG DATA FOR D3
			------------------------------*/
			for (j = 0; j < val.length; j++) {
				if (val[j] != '') {
					lineData.push({x: years[j],y: val[j]});
					if (!started) {
						startEnd[d[i][0]] = new Object();
						startEnd[d[i][0]]['startYear'] = years[j];
						startEnd[d[i][0]]['startVal'] = val[j];
						started = true;
					} else if (j == val.length - 1) {
						startEnd[d[i][0]]['endYear'] = years[j];
						startEnd[d[i][0]]['endVal'] = val[j];
					}
				}
			}

			/* POPULATE LABELS
			------------------------------*/
			lineLabels[i-1] = d[i][0];
			lineChart.append("svg:path").data([lineData]).attr("label", d[i][0]).attr("d", line).attr("shape-rendering","auto").on("mouseover", lineFunctions.highlightLine).on("mouseleave", lineFunctions.unhightlightLine);

			/* POPULATE END POINTS FOR LINES
			------------------------------------*/
			var ii = i - 1;
			var temp = $("section[role='line'] #chart path:eq("+ii+")").attr("d");
			var split = temp.split(",");
			var end = split.length - 1;
			endPoints[ii] = split[end];
		}
		lineFunctions.populateLabels();
		lineFunctions.drawChart();
	},
	populateLabels:function(){
		/* AXIS LABELS
		------------------------------*/
		$("#y-axis").text(yAxisLabel);

		/* LINE LABELS
		------------------------------*/
		for (i=0 ; i < lineLabels.length ; i++){
			if (lineLabels[i]==="Average Income"){
				$('section[role="line"] path[label="Average Income"]').css('stroke','#666');
			}
			else {
				$("section[role='line'] #selection").append("<p label=\""+lineLabels[i]+"\"clicked=\"false\">" + lineLabels[i] + "</p>");
				$("section[role='line'] #selection p:eq("+i+")").on("click", function(){
					var clicked = $(this).attr("clicked");
					var thisLabel = $(this).text();
					if (clicked === "false"){
						//determine position
						var where = _.indexOf(lineLabels, thisLabel);
						var position = parseFloat(endPoints[where]) + offset;

						//address color issue
						lineFunctions.processColors('add');

						//background and up front
						$(this).css("background", "#ddd").attr({clicked:"true",color:colorStep});
						$("section[role='line'] #chart path[label='"+ thisLabel +"']").css("stroke",thisColor).detach().insertAfter("section[role='line'] svg path:last");
						var index = _.indexOf(lineLabels, thisLabel);
						toggledLabels.push(index); //push to toggled list

						//toggle layer
						$("section[role='line'] #main-wrapper").append("<span class=\"labels\" label=\""+thisLabel+"\" style=\"top:"+ position+ "px;color:"+thisColor+"\">" + thisLabel + "</span>");
						$("section[role='line'] .label[label='"+ thisLabel +"']").insertBefore("section[role='line'] #selection")
					}
					else {
						//address color issue
						lineFunctions.processColors($(this).attr('color'));

						//background
						$(this).css("background", "#fff").attr("clicked","false");
						$("section[role='line'] #chart path[label='"+ thisLabel +"']").css("stroke","#e2e2e2");
						
						//remove label
						$("section[role='line'] span[label='"+ thisLabel +"']").remove();

						//remove from toggled list
						var index = _.indexOf(lineLabels, thisLabel);
						for (i=0;i<toggledLabels.length;i++){
							if (toggledLabels[i] === index){
								delete toggledLabels[i];
								toggledLabels = _.compact(toggledLabels); 
								break;
							}
						}
					}
					lineFunctions.liftHighlighted();
				});
			}
		}
		$('section[role="line"] #main-wrapper').append('<p id="reset-button" type="line" onclick="lineFunctions.resetColors();">RESET</p>');
	},
	executeChart: function(){
		
		/* LOAD CHART DEFAULTS
		===============================*/
		d3.text('data/config.csv', 'text/csv', function(text){
			var config = d3.csv.parseRows(text);
			lineFunctions.setDefaults(config[1]);
		})
		

		/* LOAD CHART DATA
		===============================*/
		jQuery.getJSON('data/data.json', function(d) {
			lineFunctions.processData(d);
		});	
		
	},
	churnLargeNumbers:function(line){
		var countX = $("section[role='line'] .xLabel").length;
		var countY = $("section[role='line'] .yLabel").length;
		var xLabels = [], xTemp = [], yLabels = [], yTemp = [];
		
		if (!line){
			for (i=0 ; i < countX ; i++){
				xTemp[i] = $("section[role='line'] .xLabel:eq("+i+")").text();
				$("section[role='line'] .xLabel:eq("+i+")").text(xLabels[i]);
			}
		}
		
		for (i=0 ; i < countY ; i++){
			yTemp[i] = $("section[role='line'] .yLabel:eq("+i+")").text();

			//Shorten Axis Labels
			switch(yTemp[i].length){
				case 4: yTemp[i] = yTemp[i].slice(0,1); break;
				case 5: yTemp[i] = yTemp[i].slice(0,2); break;
				case 6: yTemp[i] = yTemp[i].slice(0,3); break;
				case 7: yTemp[i] = yTemp[i].slice(0,1); break;
				case 8: yTemp[i] = yTemp[i].slice(0,2); break;
				case 9: yTemp[i] = yTemp[i].slice(0,3); break;
			}
			$("section[role='line'] .yLabel:eq("+i+")").text(yTemp[i]);
		}
	}
}

/* GLOBAL VARIABLES
===================================================================================*/
var lineChart, header, yTicks, xTicks, offset = -10, w = 600, h = 400, startYear, endYear, startData, endData, yAxisLabel, margin = {all:-1,left:110,right:15,top:30,bottom:30}, colors = ["#4169E1","#e14169","#e16941","#41e1b9"], colorsInUse = [0,0,0,0], colorStep = 0, thisColor, colorLoops = 2, line, x, y, startEnd = {}, toggledLabels = [];

window.onload = function(){lineFunctions.executeChart();}
