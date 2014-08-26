function LiveGrid (obj){
	this.sel = obj.sel; 					   // Table selector
	this.colsResize = obj.colsResize || false; // Enable cols resize

	// Add in to <th> "cols resize-handle" elements
	if(this.colsResize){
		var thArr,
			thResizeHandle,
			tableBorderSpacing,
			thBorderRightWidth,
			resizeHandleRightIndent;

		// Calculate border width for resize-handle right aligment(that handle will be on center of border of <th>)
		// Detect border-spacing. Detecting th border-right down on page
		tableBorderSpacing = Number($(this.sel).css('border-collapse') == 'collapse' ? 1 : $(this.sel).css('border-spacing').split(' ')[0].replace('px', ''));

		// Get all <th>
		thArr = document.querySelectorAll(this.sel+' th');
		for(var i = 0; i < thArr.length; i++){

			// If it is not last <th>
			if(i + 1 != thArr.length){

				// Add to <th> our class
				thArr[i].className += 'lg-th';

				// Create a cols resize-handle
				thResizeHandle = document.createElement('div');
				thResizeHandle.className = 'lg-thResizeHandle';

				// Add to <th>
				thArr[i].appendChild(thResizeHandle);	

				// Detect <th> border-right and set right indent
				thBorderRightWidth = Number($(thArr[i]).css('border-right-width').replace('px', '') * 2);
				resizeHandleRightIndent = ((thBorderRightWidth + tableBorderSpacing) / 2) + ($(thResizeHandle).css('width').replace('px', '') / 2);
				resizeHandleRightIndent = resizeHandleRightIndent < 0 ? resizeHandleRightIndent * -1 : resizeHandleRightIndent;
				thResizeHandle.style.right = '-'+ resizeHandleRightIndent +'px';

				// Set height equal a <th>
				thResizeHandle.style.height = $(thArr[i]).css('height');
			}
		}

	}
};