// Global params
var liveGrid = {

	// For cols resize
	colsResizeActivated: false,
	activeResizeHandle: undefined,
	activeResizeHandleRightIndent: 0
};


// LiveGrid
jQuery.fn.liveGrid = function(params){
	if(typeof params == 'object'){

		// Cols resize
		if(params.colsResize){

			// Add to all <th> resize-handle elements
			$(this.selector +' th').each(function(index){

				// Add class to each <th>
				$(this).addClass('lg-th');

				// Create a resize-handle element
				var resizeHandle = $('<div class="lg-resizeHandle">');

				// And append resize-handle element
				$(this).append(resizeHandle)
				
				// Calculate right and top indent
				var borderSpace = 0,
					borderWidth = 0,
					rightIndent = 0,
					topIndent = 0,
					height = 0;

				// Get a table border spacing
				borderSpace = Number( $(this).css('border-collapse') == 'collapse' ? 1 : $(this).css('border-spacing').split(' ')[0].replace('px', '') );

				// Get a <th> border width
				borderWidth = Number( $(this).css('border-left-width').replace('px', '') ) + Number( $(this).css('border-right-width').replace('px', '') );

				// Calculate right indent
				rightIndent = ( (borderSpace + borderWidth) / 2 ) + ( $(resizeHandle).width() / 2 );

				// Calculate top indent(table border space + <th> border top width)
				topIndent = Number(borderSpace) + Number( $(this).css('border-top-width').replace('px', '') );				

				// Calculate height
				height = $(this).parent().parent().height();

				// Set right, top indent and height to resize-handle element
				$(resizeHandle).css({'right': '-'+ rightIndent +'px', 'top': '-'+ topIndent +'px', 'height': height +'px'});

				// Add event to resize-handle element
				$(resizeHandle).on('mousedown', function(e){
					$(this).css('opacity', 1);
					liveGrid.colsResizeActivated = true;
					liveGrid.activeResizeHandle = this;
					liveGrid.activeResizeHandleRightIndent = $(this).css('right');
					$(this).css('right', 0);
				});
			});

			// Add events to table
			$(this).on('mousemove', function(e){

				// If cols resize activated
				if(liveGrid.colsResizeActivated){					
					$(liveGrid.activeResizeHandle).css('left', e.clientX - $(liveGrid.activeResizeHandle).parent().offset().left);
				}
			});

			// Add events to table
			$(this).on('mouseup', function(e){

				// If cols resize activated
				if(liveGrid.colsResizeActivated){
					liveGrid.colsResizeActivated = false;						

					// Set a new width to <th>					
					var difference = Number( $(liveGrid.activeResizeHandle).css('left').replace('px', '') - $(liveGrid.activeResizeHandle).parent().width() );					
					$(liveGrid.activeResizeHandle).parent().width( $(liveGrid.activeResizeHandle).parent().width() + difference );

					// Return old opacity, left and right indent
					$(liveGrid.activeResizeHandle).css({'opacity': 0, 'left': 'inherit', 'right': liveGrid.activeResizeHandleRightIndent});
				}
			});
		}
	}	
}