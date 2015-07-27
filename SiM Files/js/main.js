/* COMMON GLOBAL VARIABLES
===============================================*/
var dataType = $("meta").attr("content"), thisConfig = [];

/* LOAD CHART CONFIGURATION
===============================================*/
d3.text('data/config.csv', 'text/csv', function(text) {
	var thisData = d3.csv.parseRows(text);

	/* LOCATE WHICH CHART 
	------------------------------*/
	for (i=1 ; i < thisData.length ; i++){
		if (dataType == thisData[i][0]){
			thisConfig = thisData[i];
			break;
		}
	}
	/* SET CONFIG
	------------------------------*/
	$('#header h2').text(thisConfig[2]); //header
	$('#header p').text(thisConfig[3]) //source

	/* FIRE MASTER FUNCTIONS
	------------------------------*/
	var isBar = $('meta[bar="true"]'), isLine = $('meta[line="true"]'), isBubble = $('meta[bubble="true"]');
	if (isLine.length > 0){lineFunctions.executeChart(thisConfig);}
	if (isBar.length > 0){barFunctions.executeChart(thisConfig);}
	if (isBubble.length > 0){bubbleFunctions.executeChart(thisConfig);}	

	/* STATES IN MOTION DISCLAIMER
	------------------------------*/
	jQuery('.sim-content').append('<p><em>Chart by John C. Osborn, <a href="http://edsource.org/author/josborn">EdSource</a>. <a href="mailto:josborn@edsource.org">Contact him with any questions</a>.</em></p>');

});	










