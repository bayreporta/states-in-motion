var totalViews = 16;

window.onload = function(){
	//seed click events
	for (i=0; i < totalViews ; i++){
		$('.sim-views:eq('+i+') .data-option:eq(0)').on('click', function(){
			window.location = $(this).attr('href');
		})
	}
}

