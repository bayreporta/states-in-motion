var totalViews = 13;

function statesInMotion(){
	for (var i=0 ; i < totalViews; i++){
		
		jQuery('.data-option').on('click', function(i){
			var type = jQuery(this).attr('type'); 
			var state = jQuery('.sr-embed[type='+type+']').attr('state');
			
			if (state === 'false'){
				jQuery('.sr-embed[type='+type+']').css('display', 'block');
				jQuery('.sr-embed[type='+type+']').attr('state', 'true');
			}
			else {
				jQuery('.sr-embed[type='+type+']').css('display', 'none');
				jQuery('.sr-embed[type='+type+']').attr('state', 'false');
			}
		})
	}

}

statesInMotion();
