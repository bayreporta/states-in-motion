/* COMMON GLOBAL VARIABLES
===============================================*/
var dataType = $("meta").attr("content");
var thisConfig;

/* LOAD CHART CONFIGURATION
===============================================*/
d3.text('data/config.csv', 'text/csv', function(text) {
	var thisData = d3.csv.parseRows(text);
	
	/* PARSING CSV FILE
	------------------------------*/
	for (i=1 ; i < thisData.length ; i++){
		if (dataType == thisData[i][0]){
			thisConfig = thisData[i].slice(2,5);
			break;
		}
	}

	/* SET CONFIG
	------------------------------*/
	$('#header h2').text(thisConfig[0]); //header
	$('#header p').text(thisConfig[1]) //source
});	










