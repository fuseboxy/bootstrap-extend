$(function(){


	/*--------------------------+
	|  MULTIPLE MODALS OVERLAY  |
	+--------------------------*/
	// fix overlay order when multiple modals launched
	// ===> https://stackoverflow.com/questions/19305821/multiple-modals-overlay
	$(document).on('show.bs.modal', '.modal', function(){
		const zIndex = 1040 + 10 * $('.modal:visible').length;
		$(this).css('z-index', zIndex);
		setTimeout(() => $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack'));
	});
	$(document).on('hidden.bs.modal', '.modal', function(){
		$('.modal:visible').length && $(document.body).addClass('modal-open');
	});


	/*--------------------------------+
	|  DATA-BSX-TOGGLE : AUTO-SUBMIT  |
	+--------------------------------*/
	$(document).on('click', '[data-bsx-toggle=auto-submit]', function(evt){
		evt.preventDefault();
		bsxAutoSubmit(this);
	});


	/*-------------------------------+
	|  DATA-BSX-TOGGLE : AJAX-MODAL  |
	+-------------------------------*/
	// load content to modal
	$(document).on('click', ':not(form)[data-bsx-toggle=ajax-modal]', function(evt){
		evt.preventDefault();
		bsxAjaxModal(this);
	});
	// submit form & show content in modal
	$(document).on('submit', 'form[data-bsx-toggle=ajax-modal]', function(evt){
		evt.preventDefault();
		bsxAjaxModal(this);
	});


	/*----------------------------------+
	|  DATA-BSX-TOGGLE : AJAX-DROPDOWN  |
	+----------------------------------*/
	$(document).on('click', '[data-bsx-toggle=ajax-dropdown][href],[data-bsx-toggle=ajax-dropdown][data-bsx-href]', function(evt){
		evt.preventDefault();
		bsxAjaxDropdown(this);
	});


	/*--------------------------------------------+
	|  DATA-BSX-TOGGLE : AJAX-LOAD / AJAX-SUBMIT  |
	+--------------------------------------------*/
	// remote load
	$(document).on('click', '[data-bsx-toggle=ajax-load]', function(evt){
		evt.preventDefault();
		bsxAjaxLoadOrSubmit(this);
	});
	// remote submit
	// ===> [BUG] when pass to custom event
	// ===> element becomes BUTTON (instead of FORM)
	// ===> use closest() as dirty fix
	$(document).on('submit', '[data-bsx-toggle=ajax-submit]', function(evt){
		evt.preventDefault();
		bsxAjaxLoadOrSubmit( $(this).closest('form') );
	});
	// when form is [ajax-submit]
	// ===> dynamically update form [action] by button [formaction]
	// ===> because [ajax-submit] relies on the form [action] attribute
	$(document).on('click', ':submit[formaction]', function(evt){
		$(this.form).filter('[data-bsx-toggle=ajax-submit]').attr('action', $(this).attr('formaction'));
	});


}); // document-ready




/*----------------+
|  AJAX-DROPDOWN  |
+-----------------+

[Usage]
Auto-load remote content into dropdown (load-once-and-keep)

[Data Attributes]
- data-bsx-href     = ~alternativeForElementWithoutHrefAttribute~
- data-bsx-toggle   = {ajax-dropdown}
- data-bsx-align    = {left*|right}
- data-bsx-selector = ~partialResponseToShow~

[Example]
<div class="dropdown">
	<a href="my/dropdown/menu.php" class="dropdown-toggle" data-bsx-toggle="ajax-dropdown">...</a>
	<div class="dropdown-menu"></div>
</div>
*/
function bsxAjaxDropdown(triggerElement) {
	let $btn = $(triggerElement);
	let $parent = $btn.closest('.dropdown,.dropup,.dropstart,.dropend,.dropleft,.dropright');
	let $dropdown = $parent.find('.dropdown-menu').length ? $parent.find('.dropdown-menu:first') : $('<div class="dropdown-menu"></div>').insertAfter($btn);
	// options
	let toggleAlign = $btn.attr('data-bsx-align') || 'left';
	let toggleSelector = $btn.attr('data-bsx-selector') || '';
	// apply alignment
	if ( toggleAlign == 'right' ) $dropdown.addClass('dropdown-menu-end');
	// show loading message
	$dropdown.html('<div class="dropdown-item text-center disabled"><i class="spinner-grow" style="height: .9rem; width: .9rem;" role="status"></i> <small>Loading...</small></div>');
	// transform to standard bootstrap-dropdown & show
	$btn.attr('data-bs-toggle', 'dropdown').dropdown('show');
	// load content remotely
	let url = $btn.attr('href') || $btn.attr('data-bsx-href');
	$.ajax({
		'url' : url,
		'cache' : false,
		'method' : 'get',
		'error' : function(jqXHR, textStatus, errorThrown) {
			bsxAjaxErrorHandler($dropdown, jqXHR, { 'url' : url }, errorThrown);
		},
		'success' : function(data, textStatus, jqXHR){
			// avoid response is full html document
			data = $(new DOMParser().parseFromString(data, 'text/html')).find('body').html();
			// wrap by dummy element (when necessary)
			// ===> avoid multiple elements
			// ===> avoid response is plain text
			// ===> avoid selector find against base element
			if ( $(data).length != 1 || toggleSelector ) data = '<div>'+data+'</div>';
			// put response to dropdown
			$dropdown.html( toggleSelector ? $(data).find(toggleSelector) : data );
			// clear trigger
			$btn.removeAttr('data-bsx-toggle data-bsx-align');
			// refresh dropdown
			$dropdown.dropdown('update');
		},
	});
} // bsxAjaxDropdown




/*------------------------+
|  AUTO AJAX-ERROR ALERT  |
+-------------------------+

[Usage]
show error dialog for {ajax-load|ajax-submit|ajax-modal|ajax-dropdown}
===> simply die() in server-script and error message will auto-show in modal
===> define [data-bsx-ajax-error] at <body> to style of error to whole site
===> define [data-bsx-ajax-error] at element to show error differently
===> show ajax-error as {modal} when not specified

[Example]
<body data-bsx-ajax-error="{modal|alert}">
	...
	<a href="..." data-bsx-toggle="ajax-load">...</a>
	<a href="..." data-bsx-toggle="ajax-load" data-bsx-ajax-error="{modal|alert}">...</a>
	...
</body>
*/
function bsxAjaxErrorHandler($triggerElement, jqXHR, ajaxSettings, errorThrown) {
	let $body = $('body');
	// default options
	let ajaxErrorMode    = $triggerElement.attr('data-bsx-ajax-error')          || $body.attr('data-bsx-ajax-error')          || 'modal';
	let ajaxErrorTitle   = $triggerElement.attr('data-bsx-ajax-error-title')    || $body.attr('data-bsx-ajax-error-title')    || 'Error';
	let ajaxErrorShowURL = $triggerElement.attr('data-bsx-ajax-error-show-url') || $body.attr('data-bsx-ajax-error-show-url') || true;
	// fix false-equivalent
	if ( ['false','none','no'].includes(ajaxErrorTitle) ) ajaxErrorTitle = '';
	if ( ['false','none','no'].includes(ajaxErrorShowURL) ) ajaxErrorShowURL = '';
	// error @ alert
	if ( ajaxErrorMode == 'alert' ) {
		alert(jqXHR.responseText);
	// error @ modal-flash (if any opened modal)
	} else if ( $('.modal.show .modal-body').length ) {
		let $visibleModal = $('.modal.show');
		let $visibleModalBody = $visibleModal.find('.modal-body');
		// create flash container at modal (when not available)
		let errFlashID = 'bsx-error-flash';
		let $errFlash = $('#'+errFlashID).length ? $('#'+errFlashID) : $(`
			<div id="bsx-error-flash" class="alert alert-danger" style="display: none;"></div>
		`).prependTo($visibleModalBody).on('click', function(){ $(this).slideUp(); });
		// show message
		$errFlash.html('');
		if ( ajaxErrorTitle ) $errFlash.append('<h3 class="mt-0 text-danger">'+ajaxErrorTitle+'</h3>')
		$errFlash.append('<div class="small text-monospace">'+jqXHR.responseText+'</div>');
		if ( ajaxErrorShowURL ) $errFlash.append('<div class="small em text-danger">'+ajaxSettings.url+'</div>')
		// slide-down (when first shown)
		// ===> fade-in (when refresh message)
		$errFlash.filter(':visible').hide().fadeIn().end().filter(':hidden').slideDown();
		// scroll to message
		$visibleModal.find('.modal-body').animate({ scrollTop : 0 });
	// error @ modal
	} else {
		// create modal (when not available)
		let errModalID = 'bsx-error-modal';
		let $errModal = $('#'+errModalID).length ? $('#'+errModalID) : $(`
			<div id="${errModalID}" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="${errModalID}" aria-hidden="true">
				<div class="modal-dialog modal-lg">
					<div class="modal-content bg-danger">
						<div class="modal-header text-white h2 b-0 pb-0 mb-0"></div>
						<div class="modal-body small font-monospace"></div>
						<div class="modal-footer justify-content-start text-warning smaller b-0"></div>
					</div>
				</div>
			</div>
		`).appendTo('body');
		// show message
		let $errModalBody = $errModal.find('.modal-body');
		let $errModalHeader = $errModal.find('.modal-header');
		let $errModalFooter = $errModal.find('.modal-footer');
		$errModal.modal('show');
		$errModalBody.html(jqXHR.responseText);
		$errModalHeader.html(ajaxErrorTitle).toggle(Boolean(ajaxErrorTitle));
		$errModalFooter.html(ajaxSettings.url).toggle(Boolean(ajaxErrorShowURL));
	}
} // bsxAjaxErrorHandler




/*--------------------------+
|  AJAX-LOAD / AJAX-SUBMIT  |
+---------------------------+

[Usage]
I allow ajax-load/ajax-submit content to specific element by defining data attributes

[Data Attributes]
- data-bsx-toggle     = {ajax-load|ajax-submit}
- data-bsx-target     = ~targetElement|targetForm~
- data-bsx-confirm    = ~confirmationMessage~
- data-bsx-mode       = {replace*|prepend|append|before|after}
- data-bsx-overlay    = {progress*|dim|dimmer|dimmest|light|lighter|lightest|none}
- data-bsx-transition = {slide*|fade|none}
- data-bsx-callback   = ~function|functionName~
- data-bsx-selector   = ~partialResponseToShow~

[Events]
- ajaxLoad.bsx
- ajaxLoadCallback.bsx
- ajaxSubmit.bsx
- ajaxSubmitCallback.bsx

[Examples]
<!-- ajax load -->
<a href="/url/to/go" class="btn btn-default" data-bsx-toggle="ajax-load" data-bsx-target="#element"> ... </a>
<!-- ajax submit -->
<form method="post" action="/url/to/go" data-bsx-toggle="ajax-submit" data-bsx-target="#element"> ... </form>
*/
function bsxAjaxLoadOrSubmit(triggerElement) {
	let $triggerElement = $(triggerElement);
	// determine event type (by camelize [data-bsx-toggle] attribute)
	let eventType = $triggerElement.attr('data-bsx-toggle').split('-').map(function(word,index){
		if(index == 0) return word.toLowerCase();
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}).join('');
	// fire event
	$triggerElement.trigger(eventType+'.bsx');
	// confirmation
	if ( $triggerElement.is('[data-bsx-confirm]') ) {
		let msg = $triggerElement.attr('data-bsx-confirm') || 'Are you sure?';
		if ( !confirm(msg) ) return false;
	}
	// options
	let toggleTarget     = $triggerElement.attr('data-bsx-target');
	let toggleMode       = $triggerElement.attr('data-bsx-mode')       || 'replace';
	let toggleTransition = $triggerElement.attr('data-bsx-transition') || 'slide';
	let toggleCallback   = $triggerElement.attr('data-bsx-callback')   || '';
	let toggleOverlay    = $triggerElement.attr('data-bsx-overlay')    || 'progress';
	let toggleSelector   = $triggerElement.attr('data-bsx-selector')   || '';
	// check target
	if ( !toggleTarget ) {
		console.log('[Error] '+eventType+'.bsx - Attribute [data-bsx-target] was not specified');
	} else if ( !$(toggleTarget).length ) {
		console.log('[Error] '+eventType+'.bsx - Target not found ('+toggleTarget+')');
	}
	// normal redirect or submit when target element was not properly specified
	if ( !toggleTarget || !$(toggleTarget).length ) {
		$triggerElement.removeAttr('data-bsx-toggle');
		if ( eventType == 'ajaxSubmit' ) {
			$triggerElement.submit();
		} else {
			document.location.href = $triggerElement.attr('href') || $triggerElement.attr('data-bsx-href');
		}
	// proceed...
	} else {
		let $targetElement = $(toggleTarget);
		let url;
		if ( $triggerElement.is('form') ) {
			url = $triggerElement.attr('action');
		} else if ( $triggerElement.is('[type=button]') ) {
			url = $triggerElement.attr('href') || $triggerElement.attr('data-bsx-href');
		} else if ( $triggerElement.is('a') ) {
			url = $triggerElement.attr('href');
		} else {
			console.log('[Error] '+eventType+'.bsx - Type of trigger element not support');
		}
		// serialize form data (when necessary)
		let formData;
		if ( $triggerElement.is('form') && $triggerElement.attr('enctype') == 'multipart/form-data' ) {
			formData = new FormData( $triggerElement[0] );
		} else if ( $triggerElement.is('form') ) {
			formData = $triggerElement.serialize();
		} else {
			formData = {};
		}
		// block trigger element
		// ===> avoid double-clicking the button and submit the form multiple times
		if ( eventType == 'ajaxSubmit' ) {
			$triggerElement.bsxBlockUI({ 'overlay' : $triggerElement.attr('data-bsx-overlay') });
			$triggerElement.find('[type=submit]').attr('disabled', true);
		} else if ( $triggerElement.is('a,[type=button]') ) {
			$triggerElement.addClass('disabled').attr('disabled', true);
		} else {
			$triggerElement.bsxBlockUI({ 'overlay' : $triggerElement.attr('data-bsx-overlay') });
		}
		// block target element
		$targetElement.bsxBlockUI({ 'overlay' : $triggerElement.attr('data-bsx-overlay') });
		// load result remotely
		$.ajax({
			'url' : url,
			'data' : formData,
			'cache' : false,
			'processData' : ( $triggerElement.attr('enctype') != 'multipart/form-data' ),
			'contentType' : ( $triggerElement.attr('enctype') != 'multipart/form-data' ) ? 'application/x-www-form-urlencoded; charset=UTF-8' : false,
			'method' : $triggerElement.is('form[method]') ? $triggerElement.attr('method') : 'get',
			'error' : function(jqXHR, textStatus, errorThrown) {
				bsxAjaxErrorHandler($triggerElement, jqXHR, { 'url' : url }, errorThrown);
			},
			'success' : function(data, textStatus, jqXHR){
				// avoid response is full html document
				data = $(new DOMParser().parseFromString(data, 'text/html')).find('body').html();
				// wrap by dummy element (when necessary)
				// ===> avoid multiple elements
				// ===> avoid response is plain text
				// ===> avoid selector find against base element
				if ( $(data).length != 1 || toggleSelector ) data = '<div>'+data+'</div>';
				// show full response or specific element only
				let $newElement = toggleSelector ? $(data).find(toggleSelector) : $(data);
				// determine position of new element
				if ( toggleMode == 'prepend' ) {
					$newElement.prependTo( $targetElement );
				} else if ( toggleMode == 'append' ) {
					$newElement.appendTo( $targetElement );
				} else if ( toggleMode == 'before' ) {
					$newElement.insertBefore( $targetElement );
				} else {
					// current element will be hidden later (when [replace] mode)
					$newElement.insertAfter( $targetElement );
				}
				// turn [toggle-callback] attribute to function
				let callbackFunc;
				if ( toggleCallback.trim() == '' ) {
					// attribute is empty...
					callbackFunc = function(){};
				} else if ( toggleCallback.trim().replace(/[\W_]+/g, '') == '' ) {
					// attribute is function name...
					eval('callbackFunc = '+toggleCallback+'();');
				} else if ( toggleCallback.replace(/\s/g, '').indexOf('function(') == 0 ) {
					// attribute is anonymous function...
					eval('callbackFunc = '+toggleCallback+';');
				} else {
					// attribute is function content...
					eval('callbackFunc = function(){ '+toggleCallback+' };');
				}
				// show new element with effect
				// ===> fire event after new element shown
				let callbackEvent = eventType + 'Callback.bsx';
				if ( toggleTransition == 'fade' ) {
					// fade effect...
					$newElement.hide().fadeIn(400, function(){
						callbackFunc();
						$triggerElement.trigger(callbackEvent);
					});
				} else if ( toggleTransition == 'slide' ) {
					// slide effect...
					$newElement.hide().slideDown(400, function(){
						callbackFunc();
						$triggerElement.trigger(callbackEvent);
					});
				} else {
					// no effect...
					$newElement.hide().show();
					callbackFunc();
					$triggerElement.trigger(callbackEvent);
				}
				// hide current element (when necessary)
				if ( toggleMode == 'replace' ) {
					if ( toggleTransition == 'slide' ) {
						// make sure element totally removed (tiny bit) later than callback fired
						$targetElement.slideUp(401, function(){ $targetElement.remove(); });
					} else {
						$targetElement.hide().remove();
					}
				}
			},
			'complete' : function(){
				// until new element shown
				window.setTimeout(function(){
					// unblock trigger element
					$triggerElement.find('[type=submit]').attr('disabled', false);
					$triggerElement.removeClass('disabled').attr('disabled', false).bsxBlockUI('hide');
					// unblock target element
					$targetElement.bsxBlockUI('hide');
				}, ['fade','slide'].includes(toggleTransition) ? 400 : 0);
			}
		});
	}
} // bsxAjaxLoadOrSubmit




/*-------------------------------+
|  DATA-BSX-TOGGLE : AJAX-MODAL  |
+--------------------------------+

[Usage]
Auto-load remote content into modal

[Data Attributes]
- data-bsx-toggle   = {ajax-modal}
- data-bsx-target   = ~targetModal~
- data-bsx-selector = ~partialResponseToShow~

[Examples]
<a href="foo.html" data-bsx-toggle="ajax-modal" data-bsx-target="#my-modal">...</div>
<button data-bsx-href="bar.html" data-bsx-toggle="ajax-modal" data-bsx-target="#my-modal">...</button>
*/
function bsxAjaxModal(triggerElement) {
	let $triggerElement = $(triggerElement);
	// validation
	if ( !$triggerElement.attr('data-bsx-target') ) {
		console.log('[ERROR] ajaxModal.bsx - Attribute [data-bsx-target] was not specified');
		return false;
	}
	// determine options
	let toggleSelector = $triggerElement.attr('[data-bsx-selector]') || null;
	// determine target element
	let $modal = $( $triggerElement.attr('data-bsx-target') );
	if ( !$modal.length ) {
		console.log('[ERROR] ajaxModal.bsx - Target modal not found ('+$triggerElement.attr('data-bsx-target')+')');
		return false;
	} else if ( !$modal.is('.modal') ) {
		console.log('[ERROR] ajaxModal.bsx - Target modal does not have <.modal> class ('+$triggerElement.attr('data-bsx-target')+')');
		return false;
	} else if ( !$modal.find('.modal-dialog').length ) {
		console.log('[ERROR] ajaxModal.bsx - Target modal does not have <.modal-dialog> child element ('+$triggerElement.attr('data-bsx-target')+')');
		return false;
	}
	// determine target url
	let url;
	if ( $triggerElement.is('form') ) {
		url = $triggerElement.attr('action');
	} else if ( $triggerElement.is('[type=button]') ) {
		url = $triggerElement.attr('href') || $triggerElement.attr('data-bsx-href');
	} else if ( $triggerElement.is('a') ) {
		url = $triggerElement.attr('href');
	} else {
		console.log('[Error] ajaxModal.bsx - Type of trigger element not support');
	}
	// serialize form data (when necessary)
	let formData;
	if ( $triggerElement.is('form') && $triggerElement.attr('enctype') == 'multipart/form-data' ) {
		formData = new FormData( $triggerElement[0] );
	} else if ( $triggerElement.is('form') ) {
		formData = $triggerElement.serialize();
	} else {
		formData = {};
	}
	// create essential modal structure (when necessary)
	if ( !$modal.find('.modal-content').length ) {
		$modal.find('.modal-dialog').append('<div class="modal-content"></div>');
	}
	// clear modal content first (when necessary)
	$modal.find('.modal-content').html(`
		<div class="modal-header">
			<div class="modal-title text-muted"><i class="spinner-grow" style="height: .9rem; width: .9rem;" role="status"></i> <span class="ml-2">Loading...</span></div>
		</div>
		<div class="modal-body">
		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
		</div>
	`);
	// show modal
	$modal.modal('show');
	// load or submit
	$.ajax({
		'url' : url,
		'data' : formData,
		'cache' : false,
		'processData' : ( $triggerElement.attr('enctype') != 'multipart/form-data' ),
		'contentType' : ( $triggerElement.attr('enctype') != 'multipart/form-data' ) ? 'application/x-www-form-urlencoded; charset=UTF-8' : false,
		'method' : $triggerElement.is('form[method]') ? $triggerElement.attr('method') : 'get',
		'error' : function(jqXHR, textStatus, errorThrown) {
			window.setTimeout(function(){
				bsxAjaxErrorHandler($triggerElement, jqXHR, { 'url' : url }, errorThrown);
			}, 1000);
		},
		'success' : function(data, textStatus, jqXHR){
			// avoid response is full html document
			data = $(new DOMParser().parseFromString(data, 'text/html')).find('body').html();
			// wrap by dummy element (when necessary)
			// ===> avoid multiple elements
			// ===> avoid response is plain text
			// ===> avoid selector find against base element
			if ( $(data).length != 1 || toggleSelector ) data = '<div>'+data+'</div>';
			// show full response or specific element only
			$modal.find('.modal-content').html( toggleSelector ? $(data).find(toggleSelector) : data );
		},
	});
} // bsxAjaxModal




/*--------------+
|  AUTO-SUBMIT  |
+---------------+

[Usage]
Auto-click corresponding buttons one-by-one (by monitoring the AJAX call progress)

[Data Attributes]
- data-bsx-toggle   = {auto-submit}
- data-bsx-target   = ~autoClickButtons~
- data-bsx-stop     = ~stopButton~
- data-bsx-confirm  = ~confirmationMessage~
- data-bsx-heading  = ~progressMessagePrefix~
- data-bsx-progress = ~progressElements~
- data-bsx-callback = ~function|functionName~

[Events]
- autoSubmit.bsx
- autoSubmitUpdated.bsx
- autoSubmitStopped.bsx
- autoSubmitCompleted.bsx

[Example]
<div id="row-1"><a href="foo.php?id=1" class="btn-submit" data-bsx-toggle="ajax-load" data-bsx-target="#row-1">...</a></div>
<div id="row-2"><a href="foo.php?id=2" class="btn-submit" data-bsx-toggle="ajax-load" data-bsx-target="#row-2">...</a></div>
<div id="row-3"><a href="foo.php?id=3" class="btn-submit" data-bsx-toggle="ajax-load" data-bsx-target="#row-3">...</a></div>
...
<button type="button" data-bsx-toggle="auto-submit" data-bsx-target=".btn-submit" data-bsx-progress="html>title>head">...</button>
*/
function bsxAutoSubmit(triggerElement) {
	// core element which triggered the auto process
	// ===> all settings specified in this element
	let $btnStart = $(triggerElement);
	// target elements to be clicked one-by-one
	// ===> determine before the auto process begins
	// ===> number should be fixed throughout the process
	// ===> mark flag to all target elements to monitor the progress
	let $targetElements = $( $btnStart.attr('data-bsx-target') );
	// options
	let toggleStop     = $btnStart.attr('data-bsx-stop')     || null;
	let toggleConfirm  = $btnStart.attr('data-bsx-confirm')  || null;
	let toggleHeading  = $btnStart.attr('data-bsx-heading')  || null;
	let toggleProgress = $btnStart.attr('data-bsx-progress') || null;
	let toggleCallback = $btnStart.attr('data-bsx-callback') || '';
	// confirmation
	if ( $btnStart.is('[data-bsx-confirm]') ) {
		if ( !confirm(toggleConfirm || 'Are you sure?') ) return false;
	}
	// fire event when started
	$btnStart.trigger('autoSubmit.bsx');
	// mark flag to all target elements to monitor the progress
	$targetElements.addClass('pending-autosubmit');
	// convert [toggle-callback] to function
	let callbackFunc;
	if ( toggleCallback.trim() == '' ) {
		// attribute is empty...
		callbackFunc = function(){};
	} else if ( toggleCallback.trim().replace(/[\W_]+/g, '') == '' ) {
		// attribute is function name...
		eval('callbackFunc = '+toggleCallback+'();');
	} else if ( toggleCallback.replace(/\s/g, '').indexOf('function(') == 0 ) {
		// attribute is anonymous function...
		eval('callbackFunc = '+toggleCallback+';');
	} else {
		// attribute is function content...
		eval('callbackFunc = function(){ '+toggleCallback+' };');
	}
	// other elements
	// ===> element to stop the auto process
	// ===> element to display the progress message
	let $btnStop = $(toggleStop);
	let $progressElements = $(toggleProgress);
	// remember original content (before any progress update)
	$progressElements.each(function(){ $(this).attr('data-bsx-original', $(this).html()); });
	// stop button behavior
	// ===> mark flag to avoid assigning the behavior again
	// ===> mark flag to instruct the timer to kill itself
	$btnStop.not('.stop-button-ready').on('click', function(evt){
		evt.preventDefault();
		$btnStop.addClass('stop-button-ready');
		$btnStart.addClass('stopped');
	});
	// create timer
	// ===> keep repeating until all done
	let timer = window.setInterval(function(){
		// determine progress
		// ===> count block-overlay to monitor any active item
		// ===> because cannot ensure jQuery properly remove the element after run
		let countTotal      = $targetElements.length;
		let countActive     = $('.blockOverlay').length;
		let countUndone     = $targetElements.filter('.pending-autosubmit').length + countActive;
		let countDone       = countTotal - countUndone;
		let progressRatio   = countDone+'/'+countTotal;
		let progressHeading = toggleHeading;
		let progressMessage = progressHeading ? (progressHeading+' ('+progressRatio+')') : progressRatio;
		// when repeat again
		// ===> update progress
		// ===> trigger event
		$progressElements.html(progressMessage);
		$btnStart.trigger('autoSubmitUpdated.bsx');
		// when stopped
		// ===> kill timer to stop repeating
		// ===> clear flag
		// ===> restore to original content
		// ===> unblock start & block stop
		// ===> trigger event
		if ( $btnStart.is('.stopped') ) {
			window.clearInterval(timer);
			$btnStart.removeClass('stopped');
			$progressElements.each(function(){ $(this).html( $(this).attr('data-bsx-original') ).removeAttr('data-bsx-original'); });
			$btnStart.prop('disabled', false).removeClass('disabled');
			$btnStop.prop('disabled', true).addClass('disabled');
			$btnStart.trigger('autoSubmitStopped.bsx');
		// when no more pending (considered as completed)
		// ===> kill timer to stop repeating
		// ===> restore to original content
		// ===> unblock start & block stop
		// ===> trigger callback & event
		} else if ( !countUndone ) {
			window.clearInterval(timer);
			$progressElements.each(function(){ $(this).html( $(this).attr('data-bsx-original') ).removeAttr('data-bsx-original'); });
			$btnStart.prop('disabled', false).removeClass('disabled');
			$btnStop.prop('disabled', true).addClass('disabled');
			callbackFunc();
			$btnStart.trigger('autoSubmitCompleted.bsx');
		// when has pending & no item is running
		// ===> invoke first pending item
		// ===> mark running item as active
		// ===> block start button & unblock stop button
		} else if ( !countActive ) {
			let $firstPending = $targetElements.filter('.pending-autosubmit:first');
			$firstPending.trigger( $firstPending.is('form') ? 'submit' : 'click' );
			$firstPending.removeClass('pending-autosubmit').addClass('active-autosubmit');
			$btnStart.prop('disabled', true).addClass('disabled');
			$btnStop.prop('disabled', false).removeClass('disabled');
		}
	}, 100);
} // bsxAutoSubmit




/*-----------+
|  BLOCK-UI  |
+------------+

[Usage]
Overlay UI element by a layer to & prevent further interaction to the element
===> (e.g.) avoid clicking submit button multiple times mistakenly
===> used by {ajax-load} and {ajax-submit} and such

[Data Attributes] (or by function options)
- data-bsx-blockui-class   = (e.g.) "bg-primary op-50"
- data-bsx-blockui-style   = (e.g.) "border: dashed 3px blue;"
- data-bsx-blockui-overlay = {progress*|dim|dimmer|dimmest|light|lighter|lightest|none}

[Examples]
// block element
// ===> with default style
// ===> with pre-defined style
// ===> with user-defined style
$('#div1').bsxBlockUI();
$('#div2').bsxBlockUI({ overlay : 'lighter' });
$('#div3').bsxBlockUI({ class : 'bg-white op-50', style : 'border: dashed 3px silver;' });

// unblock element...
$('#div1,#div2,#div').bsxBlockUI('hide');
*/
(function($){
	$.fn.bsxBlockUI = function(actionOrOptions) {
		$element = $(this);
		// fix param
		let action  = ( typeof actionOrOptions === 'string' ) ? actionOrOptions : '';
		let options = ( typeof actionOrOptions === 'object' ) ? actionOrOptions : {};
		// when no element
		// ===> simply quit
		if ( !$element.length ) return;
		// when multi-elements
		// ===> loop over & quit
		if ( $element.length > 1 ) {
			$element.each(function(){ $(this).bsxBlockUI(actionOrOptions); });
			return $element.length;
		}
		// when unblock
		// ===> restore element style
		// ===> remove overlay & quit
		if ( action == 'hide' ) {
			const originalPosition = $element.data('bsx-blockui-original-position');
			if ( originalPosition ) $element.css('position', originalPosition);
			$element.removeData('bsx-blockui-original-position');
			$element.find('.bsx-blockui-overlay').remove();
			$element.removeClass('blocking');
			return;
		}
		// proceed to block element
		// ===> check whether element is blockable
		// ===> only allow tags which could have children
		const elementTag = $element.prop('tagName').toLowerCase();
		const voidElements = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
		if ( voidElements.includes(elementTag) ) {
			console.error('[Error] bsxBlockUI does not work on void element <'+elementTag+'>');
			return;
		}
		//  when already blocking
		// ===> simply quit
		if ( $element.is('.blocking') ) return;
		// default value of options
		options['style'] ??= $element.attr('data-bsx-blockui-style') || '';
		options['overlay'] ??= $element.attr('data-bsx-blockui-overlay') || 'progress';
		// when custom [class] not specified
		// ===> use pre-defined class derived from [overlay]
		options['class'] ??= $element.attr('data-bsx-blockui-class') || {
			'progress' : 'progress h-auto r-0 progress-bar progress-bar-striped progress-bar-animated bg-dark op-15',
			'none'     : 'op-0',
			'dim'      : 'bg-dark op-20',
			'dimmer'   : 'bg-dark op-50',
			'dimmest'  : 'bg-dark op-70',
			'light'    : 'bg-white op-30',
			'lighter'  : 'bg-white op-60',
			'lightest' : 'bg-white op-80',
		}[ options['overlay'] ] || '';
		// calculate position & z-index for overlay
const overlayZIndex = 1;
//let $parentElement = $element.parent();
/*
		const $firstElement = ( $element.length > 1 ) ? $element[0] : $element;
		if ( $firstElement ) {

		}
		let $current = $element;
		let zIndex = 1;
		while ( $current.length ) {
			zIndex = $current.css('z-index');
			if ( zIndex != 'auto' && !isNaN(parseInt(zIndex, 10)) ) zIndex = parseInt(zIndex, 10) + 1;
		}
*/
		// create overlay
		let $overlay = $('<div class="bsx-blockui-overlay"></div>');
		$overlay.addClass(options['class']).attr('style', options['style']);
		// prevent all interaction (e.g. click, scroll, ...)
		$overlay.on([
			'click',
			'contextmenu',
			'dblclick',
			'keydown',
			'keyup',
			'mousedown',
			'mousemove',
			'mouseup',
			'touchend',
			'touchmove',
			'touchstart',
			'wheel',
		].join(' '), function(e){
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
		// adjust {position} style of element
		const originalPosition = $element.css('position');
		if ( originalPosition === 'static') {
			$element.data('bsx-blockui-original-position', originalPosition);
			$element.css('position', 'relative');
		}
		// put overlay into target element & stretch it over
		$overlay.css({
			alignItems     : 'center',
			cursor         : 'wait',
			display        : 'flex',
			inset          : 0,
			justifyContent : 'center',
			position       : 'absolute',
			zIndex         : overlayZIndex,
		});
		$element.addClass('blocking').append($overlay);
		// done!
		return this;
	}; // bsxBlockUI
}(jQuery));