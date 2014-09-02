
// Global params
var liveGrid = {
	tableHandle: undefined,

	// For cols resize
	colsResizeActivated: false,
	activeResizeHandle: undefined,
	activeResizeHandleRightIndent: 0,

	// For save cols size
	saveColsSizeActivated: false,
	uniqUserID: '',
	uniqTableID: '',
	colsSize: {}
};


// LiveGrid
jQuery.fn.liveGrid = function(params){
	if(typeof params == 'object'){

		// Remember table handle
		liveGrid.tableHandle = this;

		// Add uniq ID to <th>
		$(this.selector +' th').each(function(index){
			$(this).attr('lg-th-id', 'th'+index);
		});

		// Cols resize
		if(params.colsResize){

			// Add to all <th> resize-handle elements
			var len = $(this.selector +' th').length; 
			$(this.selector +' th').each(function(index){

				// All elements except last
				if(index < len - 1){

					// Add class to each <th>
					$(this).addClass('lg-th');

					// Set a width
					$(this).css('width', $(this).width());

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

						// Set params
						$(this).css('opacity', 1);						
						liveGrid.colsResizeActivated = true;
						liveGrid.activeResizeHandle = this;
						liveGrid.activeResizeHandleRightIndent = $(this).css('right');

						// Add temporary class to table
						$(this).parent().parent().parent().addClass('lg-noselect');
					});
				}
			});

			// Add events to table
			$(this).on('mousemove', function(e){

				// If cols resize activated
				if( liveGrid.colsResizeActivated && (e.toElement.nodeName == 'TH' || e.toElement.nodeName == 'TD') ){
					$(liveGrid.activeResizeHandle).css('right', 'inherit');

					// Calculate left indent. 5 it's a cursor half width
					$(liveGrid.activeResizeHandle).css('left', e.clientX - $(liveGrid.activeResizeHandle).parent().offset().left - 5);
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

					// Set a new width to table
					$(liveGrid.tableHandle).width( $(liveGrid.tableHandle).width() + difference );

					// Increment or decrement table width on difference var

					// Return old opacity, left and right indent
					$(liveGrid.activeResizeHandle).css({'opacity': 0, 'left': 'inherit', 'right': liveGrid.activeResizeHandleRightIndent});

					// Remove temporary class from table
					$(liveGrid.activeResizeHandle).parent().parent().parent().removeClass('lg-noselect');
				}
			});
		}

		// Save cols size
		if(typeof params.saveColsSize == 'object'){
			if(params.saveColsSize.uniqUserID && params.saveColsSize.uniqTableID){
				liveGrid.saveColsSizeActivated = true;
				liveGrid.uniqUserID = params.saveColsSize.uniqUserID;
				liveGrid.uniqTableID = params.saveColsSize.uniqTableID;				

				// If user does not exists...
				if( localStorage.getItem(liveGrid.uniqUserID) == null ){

					// ...then create a user and fill colsSize object
					$(liveGrid.tableHandle).find('th').each(function(index){
						liveGrid.colsSize[$(this).attr('lg-th-id')] = $(this).width();
					});

					// Create a user params object
					var userParams = {};
					userParams[liveGrid.uniqTableID] = { tableWidth: $(liveGrid.tableHandle).width(),  colsSize: liveGrid.colsSize };
					localStorage.setItem( liveGrid.uniqUserID, JSON.stringify(userParams) );
				}

				// If user exists then load user params (cols size, table width, etc.)
				else{
					var userParams = JSON.parse(localStorage.getItem(liveGrid.uniqUserID));

					// Are looking for, whether there is a our table
					for( key in userParams ){

						// If there is a math
						if( $(key).get(0) == $(liveGrid.tableHandle.selector).get(0) ){

							// Load a table width
							$(liveGrid.tableHandle).width( userParams[key].tableWidth );

							// Load a cols width
							liveGrid.colsSize = userParams[key].colsSize;

							// Set a cols width
							$(liveGrid.tableHandle).find('th').each(function(index){							
								$(this).width( liveGrid.colsSize[$(this).attr('lg-th-id')] );
							});

							break;
						}
					}
				}

				// Save the cols size
				$(liveGrid.tableHandle).on('mouseup', function(){

					// If cols resize activated
					if(!liveGrid.colsResizeActivated && liveGrid.saveColsSizeActivated){

						// Save new sizes
						liveGrid.colsSize[$(liveGrid.activeResizeHandle).parent().attr('lg-th-id')] = $(liveGrid.activeResizeHandle).parent().width();

						// Create a object
						var userParams = {};
						userParams[liveGrid.uniqTableID] = { tableWidth: $(liveGrid.tableHandle).width(),  colsSize: liveGrid.colsSize };
						localStorage.setItem( liveGrid.uniqUserID, JSON.stringify(userParams) );

						// Save						
						localStorage.setItem( liveGrid.uniqUserID, JSON.stringify(userParams) );
					}
				});
			}
		}
	}	
}