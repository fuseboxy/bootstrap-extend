$(function(){


	/*------------------------+
	|  AUTO AJAX-ERROR ALERT  |
	+-------------------------+

	[Usage]
	I show error dialog whenever there is an ajax error
	===> default showing as modal
	===> simply die() in server-script and error message will auto-show in modal
	===> applicable to whole site

	[Example]
	<body data-bsx-ajax-error="{modal|alert|console}"> ... </body>
	*/
	var ajaxErrorHandler = function(evt, jqXHR, ajaxSettings, errorThrown){
		var $body = $('body');
		// options
		var ajaxErrorMode    = $body.attr('data-bsx-ajax-error')          || 'modal';
		var ajaxErrorTitle   = $body.attr('data-bsx-ajax-error-title')    || 'Error';
		var ajaxErrorShowURL = $body.attr('data-bsx-ajax-error-show-url') || true;
		// display error as flash in an opened modal
		if ( ajaxErrorMode == 'modal' && $('body.modal-open').length ) {
			var $modalVisible = $('.modal.show');
			// create alert box (when necessary)
			if ( !$('#bsx-error-alert').length ) {
				$('<div id="bsx-error-alert" class="alert alert-danger" role="alert"></div>')
					.prependTo( $modalVisible.find('.modal-body') )
					.on('click', function(){ $(this).slideUp(); })
					.hide();
			}
			// show message
			var $errAlert = $('#bsx-error-alert');
			$errAlert.html('');
			if ( ajaxErrorTitle != 'none' ) $errAlert.append('<h3 class="mt-0 text-danger">'+ajaxErrorTitle+'</h3>')
			$errAlert.append('<div class="small text-monospace">'+jqXHR.responseText+'</div>');
			if ( ajaxErrorShowURL != 'none' ) $errAlert.append('<div class="small em text-danger">'+ajaxSettings.url+'</div>')
			$errAlert.filter(':visible').hide().fadeIn().end().filter(':hidden').slideDown();
			// scroll to message
			$modalVisible.find('.modal-body').animate({ scrollTop : 0 });
		// display error in modal
		} else if ( ajaxErrorMode == 'modal' ) {
			// create modal (when necessary)
			if ( !$('#bsx-error-modal').length ) {
				$('body').append(`
					<div id="bsx-error-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="bsx-error-modal" aria-hidden="true">
						<div class="modal-dialog modal-lg">
							<div class="modal-content bg-danger">
								<div class="modal-body"></div>
							</div>
						</div>
					</div>
				`);
			}
			// show message
			var $errModal = $('#bsx-error-modal');
			var $errModalBody = $errModal.find('.modal-body');
			$errModal.modal('show');
			$errModalBody.html('');
			if ( ajaxErrorTitle != 'none' ) $errModalBody.append('<h3 class="mt-0 text-white">'+ajaxErrorTitle+'</h3>');
			$errModalBody.append('<div class="small text-monospace">'+jqXHR.responseText+'</div>')
			if ( ajaxErrorShowURL != 'none' ) $errModalBody.append('<div class="small em text-warning">'+ajaxSettings.url+'</div>');
		// display error as javascript console log
		} else if ( ajaxErrorMode == 'console' ) {
			var errMsg = '';
			if ( ajaxErrorTitle != 'none' ) errMsg += '['+ajaxErrorTitle+'] ';
			errMsg += jqXHR.responseText;
			if ( ajaxErrorShowURL != 'none' ) errMsg += ' ('+ajaxSettings.url+')';
			console.log(errMsg);
		// display error as javascript alert
		} else {
			var errMsg = '';
			if ( ajaxErrorTitle != 'none' ) errMsg += '['+ajaxErrorTitle+']\n';
			errMsg += jqXHR.responseText;
			if ( ajaxErrorShowURL != 'none' ) errMsg += '\n\n'+ajaxSettings.url;
			alert(errMsg);
		}
	};
	// apply to document
	$(document).ajaxError(ajaxErrorHandler);




	/*--------------------------+
	|  MULTIPLE MODALS OVERLAY  |
	+---------------------------+

	[Usage]
	Fix overlay order when multiple modals launched

	[Reference]
	https://stackoverflow.com/questions/19305821/multiple-modals-overlay
	*/
	$(document).on('show.bs.modal', '.modal', function (event) {
		var zIndex = 1040 + (10 * $('.modal:visible').length);
		$(this).css('z-index', zIndex);
		setTimeout(function() {
			$('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
		}, 0);
	});

	$(document).on('hidden.bs.modal', '.modal', () => $('.modal:visible').length && $(document.body).addClass('modal-open'));




	/*--------------------------------+
	|  DATA-BSX-TOGGLE : AUTO-SUBMIT  |
	+---------------------------------+

	[Usage]
	Auto-click corresponding buttons one-by-one (by monitoring the AJAX call progress)
	===> data-bsx-toggle   = {auto-submit}
	===> data-bsx-target   = ~autoClickButtons~
	===> data-bsx-stop     = ~stopButton~
	===> data-bsx-confirm  = ~confirmationMessage~
	===> data-bsx-heading  = ~progressMessagePrefix~
	===> data-bsx-progress = ~progressElements~
	===> data-bsx-callback = ~function|functionName~

	[Event]
	===> autoSubmit.bsx
	===> autoSubmitUpdated.bsx
	===> autoSubmitStopped.bsx
	===> autoSubmitCompleted.bsx

	[Example]
	<div id="row-1"><a href="foo.php?id=1" class="btn-submit" data-bsx-toggle="ajax-load" data-bsx-target="#row-1">...</a></div>
	<div id="row-2"><a href="foo.php?id=2" class="btn-submit" data-bsx-toggle="ajax-load" data-bsx-target="#row-2">...</a></div>
	<div id="row-3"><a href="foo.php?id=3" class="btn-submit" data-bsx-toggle="ajax-load" data-bsx-target="#row-3">...</a></div>
	...
	<button type="button" data-bsx-toggle="auto-submit" data-bsx-target=".btn-submit" data-bsx-progress="html>title>head">...</button>
	*/
	$(document).on('click', '[data-bsx-toggle=auto-submit]', function(evt){
		evt.preventDefault();
		// core element which triggered the auto process
		// ===> all settings specified in this element
		var $btnStart = $(this);
		// target elements to be clicked one-by-one
		// ===> determine before the auto process begins
		// ===> number should be fixed throughout the process
		// ===> mark flag to all target elements to monitor the progress
		var $targetElements = $( $btnStart.attr('data-bsx-target') );
		// options
		var toggleStop     = $btnStart.attr('data-bsx-stop')     || null;
		var toggleConfirm  = $btnStart.attr('data-bsx-confirm')  || null;
		var toggleHeading  = $btnStart.attr('data-bsx-heading')  || null;
		var toggleProgress = $btnStart.attr('data-bsx-progress') || null;
		var toggleCallback = $btnStart.attr('data-bsx-callback') || '';
		// confirmation
		if ( $btnStart.is('[data-bsx-confirm]') ) {
			if ( !confirm(toggleConfirm || 'Are you sure?') ) return false;
		}
		// fire event when started
		$btnStart.trigger('autoSubmit.bsx');
		// mark flag to all target elements to monitor the progress
		$targetElements.addClass('pending-autosubmit');
		// convert [toggle-callback] to function
		if ( toggleCallback.trim() == '' ) {
			// attribute is empty...
			var callbackFunc = function(){};
		} else if ( toggleCallback.trim().replace(/[\W_]+/g, '') == '' ) {
			// attribute is function name...
			eval('var callbackFunc = '+toggleCallback+'();');
		} else if ( toggleCallback.replace(/\s/g, '').indexOf('function(') == 0 ) {
			// attribute is anonymous function...
			eval('var callbackFunc = '+toggleCallback+';');
		} else {
			// attribute is function content...
			eval('var callbackFunc = function(){ '+toggleCallback+' };');
		}
		// other elements
		// ===> element to stop the auto process
		// ===> element to display the progress message
		var $btnStop = $(toggleStop);
		var $progressElements = $(toggleProgress);
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
		var timer = window.setInterval(function(){
			// determine progress
			// ===> count block-overlay to monitor any active item
			// ===> because cannot ensure jQuery properly remove the element after run
			var countTotal      = $targetElements.length;
			var countActive     = $('.blockOverlay').length;
			var countUndone     = $targetElements.filter('.pending-autosubmit').length + countActive;
			var countDone       = countTotal - countUndone;
			var progressRatio   = countDone+'/'+countTotal;
			var progressHeading = toggleHeading;
			var progressMessage = progressHeading ? (progressHeading+' ('+progressRatio+')') : progressRatio;
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
				var $firstPending = $targetElements.filter('.pending-autosubmit:first');
				$firstPending.trigger( $firstPending.is('form') ? 'submit' : 'click' );
				$firstPending.removeClass('pending-autosubmit').addClass('active-autosubmit');
				$btnStart.prop('disabled', true).addClass('disabled');
				$btnStop.prop('disabled', false).removeClass('disabled');
			}
		}, 100);
	});




	/*-------------------------------+
	|  DATA-BSX-TOGGLE : AJAX-MODAL  |
	+--------------------------------+

	[Usage]
	Auto-load remote content into modal
	===> data-bsx-toggle   = {ajax-modal}
	===> data-bsx-target   = ~targetModal~
	===> data-bsx-selector = ~partialResponseToShow~

	[Example]
	<a href="foo.html" data-bsx-toggle="ajax-modal" data-bsx-target="#my-modal">...</div>
	<button data-bsx-href="bar.html" data-bsx-toggle="ajax-modal" data-bsx-target="#my-modal">...</button>
	*/
	// load content to modal
	$(document).on('click', ':not(form)[data-bsx-toggle=ajax-modal]', function(evt){
		evt.preventDefault();
		ajaxModal(this);
	});
	// submit form & show content in modal
	$(document).on('submit', 'form[data-bsx-toggle=ajax-modal]', function(evt){
		evt.preventDefault();
		ajaxModal(this);
	});
	// actual behavior of [ajax-modal]
	var ajaxModal = function(triggerElement) {
		var $triggerElement = $(triggerElement);
		// validation
		if ( !$triggerElement.attr('data-bsx-target') ) {
			console.log('[ERROR] ajaxModal.bsx - Attribute [data-bsx-target] was not specified');
			return false;
		}
		// determine options
		var toggleSelector = $triggerElement.attr('[data-bsx-selector]') || null;
		// determine target element
		var $modal = $( $triggerElement.attr('data-bsx-target') );
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
		var url;
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
		var formData;
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
					ajaxErrorHandler(null, jqXHR, { url : url }, errorThrown);
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
	}; // function-ajaxModal




	/*----------------------------------+
	|  DATA-BSX-TOGGLE : AJAX-DROPDOWN  |
	+-----------------------------------+

	[Usage]
	Auto-load remote content into dropdown (load-once-and-keep)
	===> data-bsx-href     = ~alternativeForElementWithoutHrefAttribute~
	===> data-bsx-toggle   = {ajax-dropdown}
	===> data-bsx-align    = {left*|right}
	===> data-bsx-selector = ~partialResponseToShow~

	[Example]
	<div class="dropdown">
		<a href="my/dropdown/menu.php" class="dropdown-toggle" data-bsx-toggle="ajax-dropdown">...</a>
		<div class="dropdown-menu"></div>
	</div>
	*/
	$(document).on('click', '[href][data-bsx-toggle=ajax-dropdown],[data-bsx-href][data-bsx-toggle=ajax-dropdown]', function(evt){
		evt.preventDefault();
		var $btn = $(this);
		var $parent = $btn.closest('.dropdown,.dropup,.dropstart,.dropend,.dropleft,.dropright');
		var $dropdown = $parent.find('.dropdown-menu').length ? $parent.find('.dropdown-menu:first') : $('<div class="dropdown-menu"></div>').insertAfter($btn);
		// options
		var toggleAlign = $btn.attr('data-bsx-align') || 'left';
		var toggleSelector = $btn.attr('data-bsx-selector') || '';
		// apply alignment
		if ( toggleAlign == 'right' ) $dropdown.addClass('dropdown-menu-end');
		// show loading message
		$dropdown.html('<div class="dropdown-item text-center disabled"><i class="spinner-grow" style="height: .9rem; width: .9rem;" role="status"></i> <small>Loading...</small></div>');
		// transform to standard bootstrap-dropdown & show
		$btn.attr('data-bs-toggle', 'dropdown').dropdown('show');
		// load content remotely
		var url = $btn.attr('href') || $btn.attr('data-bsx-href');
		$.ajax({
			'url' : url,
			'cache' : false,
			'method' : 'get',
			'error' : function(jqXHR, textStatus, errorThrown) {
				window.setTimeout(function(){
					ajaxErrorHandler(null, jqXHR, { 'url' : url }, errorThrown);
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
				// put response to dropdown
				$dropdown.html( toggleSelector ? $(data).find(toggleSelector) : data );
				// clear trigger
				$btn.removeAttr('data-bsx-toggle data-bsx-align');
				// refresh dropdown
				$dropdown.dropdown('update');
			},
		});
	});




	/*--------------------------------------------+
	|  DATA-BSX-TOGGLE : AJAX-LOAD / AJAX-SUBMIT  |
	+---------------------------------------------+

	[Usage]
	I allow ajax-load/ajax-submit content to specific element by defining data attributes
	===> data-bsx-toggle     = {ajax-load|ajax-submit}
	===> data-bsx-target     = ~targetElement|targetForm~
	===> data-bsx-confirm    = ~confirmationMessage~
	===> data-bsx-mode       = {replace*|prepend|append|before|after}
	===> data-bsx-overlay    = {progress*|loading|loading-large|spinner|spinner-large|overlay|gray|grayer|dim|dimmer|white|whiter|light|lighter|none}
	===> data-bsx-transition = {slide*|fade|none}
	===> data-bsx-callback   = ~function|functionName~
	===> data-bsx-selector   = ~partialResponseToShow~

	[Event]
	===> ajaxLoad.bsx
	===> ajaxLoadCallback.bsx
	===> ajaxSubmit.bsx
	===> ajaxSubmitCallback.bsx

	[Example]
	<!-- ajax load -->
	<a href="/url/to/go" class="btn btn-default" data-bsx-toggle="ajax-load" data-bsx-target="#element"> ... </a>
	<!-- ajax submit -->
	<form method="post" action="/url/to/go" data-bsx-toggle="ajax-submit" data-bsx-target="#element"> ... </form>
	*/
	// remote load
	$(document).on('click', '[data-bsx-toggle=ajax-load]', function(evt){
		evt.preventDefault();
		ajaxLoadOrSubmit(this);
	});
	// remote submit
	// ===> [BUG] when pass to custom event
	// ===> element becomes BUTTON (instead of FORM)
	// ===> use closest() as dirty fix
	$(document).on('submit', '[data-bsx-toggle=ajax-submit]', function(evt){
		evt.preventDefault();
		ajaxLoadOrSubmit( $(this).closest('form') );
	});
	// when form is [ajax-submit]
	// ===> update form [action] with button [formaction]
	// ===> because [ajax-submit] relies on the form [action] attribute
	$(document).on('click', ':submit[formaction]', function(evt){
		$(this.form).filter('[data-bsx-toggle=ajax-submit]').attr('action', $(this).attr('formaction'));
	});
	// actual behavior of [ajax-load|ajax-submit]
	var ajaxLoadOrSubmit = function(triggerElement) {
		var $triggerElement = $(triggerElement);
		// determine event type (by camelize [data-bsx-toggle] attribute)
		var eventType = $triggerElement.attr('data-bsx-toggle').split('-').map(function(word,index){
			if(index == 0) return word.toLowerCase();
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		}).join('');
		// fire event
		$triggerElement.trigger(eventType+'.bsx');
		// confirmation
		if ( $triggerElement.is('[data-bsx-confirm]') ) {
			var msg = $triggerElement.attr('data-bsx-confirm') || 'Are you sure?';
			if ( !confirm(msg) ) return false;
		}
		// options
		var toggleTarget     = $triggerElement.attr('data-bsx-target');
		var toggleMode       = $triggerElement.attr('data-bsx-mode')       || 'replace';
		var toggleTransition = $triggerElement.attr('data-bsx-transition') || 'slide';
		var toggleCallback   = $triggerElement.attr('data-bsx-callback')   || '';
		var toggleOverlay    = $triggerElement.attr('data-bsx-loading')    || $triggerElement.attr('data-bsx-overlay') || 'progress';
		var toggleSelector   = $triggerElement.attr('data-bsx-selector')   || '';
		// apply block-ui when ajax load (if any)
		var configBlockUI;
		if ( $.fn.block ) {
			// default loading style (progress)
			configBlockUI = {
				'message'     : false,
				'css'         : { 'background-color' : 'none', 'border' : 'none' },
				'fadeIn'      : 0,
				'showOverlay' : true
			};
			// overlay style : none
			if ( toggleOverlay == 'none' ) {
				configBlockUI['overlayCSS'] = { 'background-color' : 'white', 'opacity' : 0 };
			// overlay style : loading
			} else if ( toggleOverlay == 'loading' || toggleOverlay == 'spinner' ) {
				configBlockUI['message'] = '<i class="fa fa-spin fa-spinner text-muted"></i>';
				configBlockUI['overlayCSS'] = { 'background-color'  : 'gray', 'opacity' : .1 };
			} else if ( toggleOverlay == 'loading-large' || toggleOverlay == 'spinner-large' ) {
				configBlockUI['message'] = '<i class="fa fa-spin fa-spinner fa-4x text-muted"></i>';
				configBlockUI['overlayCSS'] = { 'background-color'  : 'gray', 'opacity' : .1 };
			// overlay style : dim
			} else if ( toggleOverlay == 'gray' || toggleOverlay == 'dim' || toggleOverlay == 'overlay' ) {
				configBlockUI['overlayCSS'] = { 'background-color'  : 'gray', 'opacity' : .1 };
			} else if ( toggleOverlay == 'grayer' || toggleOverlay == 'dimmer' ) {
				configBlockUI['overlayCSS'] = { 'background-color'  : 'gray', 'opacity' : .4 };
			// overlay style : light
			} else if ( toggleOverlay == 'white' || toggleOverlay == 'light' ) {
				configBlockUI['overlayCSS'] = { 'background-color'  : 'white', 'opacity' : .3 };
			} else if ( toggleOverlay == 'whiter' || toggleOverlay == 'lighter' ) {
				configBlockUI['overlayCSS'] = { 'background-color'  : 'white', 'opacity' : .6 };
			// overlay style : progress (default)
			} else {
				configBlockUI['overlayCSS'] = {
					'-webkit-animation' : 'progress-bar-stripes 1s linear infinite',
					'animation'         : 'progress-bar-stripes 1s linear infinite',
					'background-color'  : '#bbb',
					'background-image'  : '-webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent)',
					'background-image'  : 'linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent)',
					'background-size'   : '1rem 1rem',
				};
			}
		}
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
			var $targetElement = $(toggleTarget);
			var url;
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
			var formData;
			if ( $triggerElement.is('form') && $triggerElement.attr('enctype') == 'multipart/form-data' ) {
				formData = new FormData( $triggerElement[0] );
			} else if ( $triggerElement.is('form') ) {
				formData = $triggerElement.serialize();
			} else {
				formData = {};
			}
			// block
			if ( $triggerElement.is('form') ) {
				if ( configBlockUI ) {
					$triggerElement.block( configBlockUI );
				}
				$triggerElement.find('[type=submit]').attr('disabled', true);
			} else {
				$triggerElement.attr('disabled', true);
			}
			if ( configBlockUI ) {
				$targetElement.block( configBlockUI );
			}
			// load result remotely
			$.ajax({
				'url' : url,
				'data' : formData,
				'cache' : false,
				'processData' : ( $triggerElement.attr('enctype') != 'multipart/form-data' ),
				'contentType' : ( $triggerElement.attr('enctype') != 'multipart/form-data' ) ? 'application/x-www-form-urlencoded; charset=UTF-8' : false,
				'method' : $triggerElement.is('form[method]') ? $triggerElement.attr('method') : 'get',
				'success' : function(data, textStatus, jqXHR){
					// avoid response is full html document
					data = $(new DOMParser().parseFromString(data, 'text/html')).find('body').html();
					// wrap by dummy element (when necessary)
					// ===> avoid multiple elements
					// ===> avoid response is plain text
					// ===> avoid selector find against base element
					if ( $(data).length != 1 || toggleSelector ) data = '<div>'+data+'</div>';
					// show full response or specific element only
					var $newElement = toggleSelector ? $(data).find(toggleSelector) : $(data);
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
					if ( toggleCallback.trim() == '' ) {
						// attribute is empty...
						var callbackFunc = function(){};
					} else if ( toggleCallback.trim().replace(/[\W_]+/g, '') == '' ) {
						// attribute is function name...
						eval('var callbackFunc = '+toggleCallback+'();');
					} else if ( toggleCallback.replace(/\s/g, '').indexOf('function(') == 0 ) {
						// attribute is anonymous function...
						eval('var callbackFunc = '+toggleCallback+';');
					} else {
						// attribute is function content...
						eval('var callbackFunc = function(){ '+toggleCallback+' };');
					}
					// show new element with effect
					// ===> fire event after new element shown
					var callbackEvent = eventType + 'Callback.bsx';
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
					// unblock trigger element
					if ( $triggerElement.is('form') ) {
						if ( configBlockUI ) $triggerElement.unblock();
						$triggerElement.find('[type=submit]').attr('disabled', false);
					} else {
						$triggerElement.attr('disabled', false);
					}
					// unblock old element
					if ( configBlockUI ) $targetElement.unblock();
				}
			});
		}
	}; // function-ajaxLoadOrSubmit


}); // document-ready




/*-----------+
|  BLOCK-UI  |
+------------+

[Usage]
Overlay UI element by a layer to and prevent user click the UI element multiple times mistakenly
Used by {ajax-load} and {ajax-submit} and such
*/

function bsxBlockUI(action, element){

}




/*!
 * jQuery blockUI plugin
 * Version 2.70.0-2014.11.23
 * Requires jQuery v1.7 or later
 *
 * Examples at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2013 M. Alsup
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
 */
!function(){"use strict";function e(e){e.fn._fadeIn=e.fn.fadeIn;var o=e.noop||function(){},t=/MSIE/.test(navigator.userAgent),i=/MSIE 6.0/.test(navigator.userAgent)&&!/MSIE 8.0/.test(navigator.userAgent),n=(document.documentMode,e.isFunction(document.createElement("div").style.setExpression));e.blockUI=function(e){a(window,e)},e.unblockUI=function(e){d(window,e)},e.growlUI=function(o,t,i,n){var s=e('<div class="growlUI"></div>');o&&s.append("<h1>"+o+"</h1>"),t&&s.append("<h2>"+t+"</h2>"),void 0===i&&(i=3e3);var l=function(o){o=o||{},e.blockUI({message:s,fadeIn:void 0!==o.fadeIn?o.fadeIn:700,fadeOut:void 0!==o.fadeOut?o.fadeOut:1e3,timeout:void 0!==o.timeout?o.timeout:i,centerY:!1,showOverlay:!1,onUnblock:n,css:e.blockUI.defaults.growlCSS})};l();s.css("opacity");s.mouseover(function(){l({fadeIn:0,timeout:3e4});var o=e(".blockMsg");o.stop(),o.fadeTo(300,1)}).mouseout(function(){e(".blockMsg").fadeOut(1e3)})},e.fn.block=function(o){if(this[0]===window)return e.blockUI(o),this;var t=e.extend({},e.blockUI.defaults,o||{});return this.each(function(){var o=e(this);t.ignoreIfBlocked&&o.data("blockUI.isBlocked")||o.unblock({fadeOut:0})}),this.each(function(){"static"==e.css(this,"position")&&(this.style.position="relative",e(this).data("blockUI.static",!0)),this.style.zoom=1,a(this,o)})},e.fn.unblock=function(o){return this[0]===window?(e.unblockUI(o),this):this.each(function(){d(this,o)})},e.blockUI.version=2.7,e.blockUI.defaults={message:"<h1>Please wait...</h1>",title:null,draggable:!0,theme:!1,css:{padding:0,margin:0,width:"30%",top:"40%",left:"35%",textAlign:"center",color:"#000",border:"3px solid #aaa",backgroundColor:"#fff",cursor:"wait"},themedCSS:{width:"30%",top:"40%",left:"35%"},overlayCSS:{backgroundColor:"#000",opacity:.6,cursor:"wait"},cursorReset:"default",growlCSS:{width:"350px",top:"10px",left:"",right:"10px",border:"none",padding:"5px",opacity:.6,cursor:"default",color:"#fff",backgroundColor:"#000","-webkit-border-radius":"10px","-moz-border-radius":"10px","border-radius":"10px"},iframeSrc:/^https/i.test(window.location.href||"")?"javascript:false":"about:blank",forceIframe:!1,baseZ:1e3,centerX:!0,centerY:!0,allowBodyStretch:!0,bindEvents:!0,constrainTabKey:!0,fadeIn:200,fadeOut:400,timeout:0,showOverlay:!0,focusInput:!0,focusableElements:":input:enabled:visible",onBlock:null,onUnblock:null,onOverlayClick:null,quirksmodeOffsetHack:4,blockMsgClass:"blockMsg",ignoreIfBlocked:!1};var s=null,l=[];function a(a,c){var u,p,h=a==window,k=c&&void 0!==c.message?c.message:void 0;if(!(c=e.extend({},e.blockUI.defaults,c||{})).ignoreIfBlocked||!e(a).data("blockUI.isBlocked")){if(c.overlayCSS=e.extend({},e.blockUI.defaults.overlayCSS,c.overlayCSS||{}),u=e.extend({},e.blockUI.defaults.css,c.css||{}),c.onOverlayClick&&(c.overlayCSS.cursor="pointer"),p=e.extend({},e.blockUI.defaults.themedCSS,c.themedCSS||{}),k=void 0===k?c.message:k,h&&s&&d(window,{fadeOut:0}),k&&"string"!=typeof k&&(k.parentNode||k.jquery)){var y=k.jquery?k[0]:k,v={};e(a).data("blockUI.history",v),v.el=y,v.parent=y.parentNode,v.display=y.style.display,v.position=y.style.position,v.parent&&v.parent.removeChild(y)}e(a).data("blockUI.onUnblock",c.onUnblock);var m,g,I,w,U=c.baseZ;m=t||c.forceIframe?e('<iframe class="blockUI" style="z-index:'+U+++';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+c.iframeSrc+'"></iframe>'):e('<div class="blockUI" style="display:none"></div>'),g=c.theme?e('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:'+U+++';display:none"></div>'):e('<div class="blockUI blockOverlay" style="z-index:'+U+++';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>'),c.theme&&h?(w='<div class="blockUI '+c.blockMsgClass+' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:'+(U+10)+';display:none;position:fixed">',c.title&&(w+='<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(c.title||"&nbsp;")+"</div>"),w+='<div class="ui-widget-content ui-dialog-content"></div>',w+="</div>"):c.theme?(w='<div class="blockUI '+c.blockMsgClass+' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:'+(U+10)+';display:none;position:absolute">',c.title&&(w+='<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(c.title||"&nbsp;")+"</div>"),w+='<div class="ui-widget-content ui-dialog-content"></div>',w+="</div>"):w=h?'<div class="blockUI '+c.blockMsgClass+' blockPage" style="z-index:'+(U+10)+';display:none;position:fixed"></div>':'<div class="blockUI '+c.blockMsgClass+' blockElement" style="z-index:'+(U+10)+';display:none;position:absolute"></div>',I=e(w),k&&(c.theme?(I.css(p),I.addClass("ui-widget-content")):I.css(u)),c.theme||g.css(c.overlayCSS),g.css("position",h?"fixed":"absolute"),(t||c.forceIframe)&&m.css("opacity",0);var x=[m,g,I],C=e(h?"body":a);e.each(x,function(){this.appendTo(C)}),c.theme&&c.draggable&&e.fn.draggable&&I.draggable({handle:".ui-dialog-titlebar",cancel:"li"});var S=n&&(!e.support.boxModel||e("object,embed",h?null:a).length>0);if(i||S){if(h&&c.allowBodyStretch&&e.support.boxModel&&e("html,body").css("height","100%"),(i||!e.support.boxModel)&&!h)var O=b(a,"borderTopWidth"),E=b(a,"borderLeftWidth"),T=O?"(0 - "+O+")":0,M=E?"(0 - "+E+")":0;e.each(x,function(e,o){var t=o[0].style;if(t.position="absolute",e<2)h?t.setExpression("height","Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:"+c.quirksmodeOffsetHack+') + "px"'):t.setExpression("height",'this.parentNode.offsetHeight + "px"'),h?t.setExpression("width",'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"'):t.setExpression("width",'this.parentNode.offsetWidth + "px"'),M&&t.setExpression("left",M),T&&t.setExpression("top",T);else if(c.centerY)h&&t.setExpression("top",'(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"'),t.marginTop=0;else if(!c.centerY&&h){var i="((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "+(c.css&&c.css.top?parseInt(c.css.top,10):0)+') + "px"';t.setExpression("top",i)}})}if(k&&(c.theme?I.find(".ui-widget-content").append(k):I.append(k),(k.jquery||k.nodeType)&&e(k).show()),(t||c.forceIframe)&&c.showOverlay&&m.show(),c.fadeIn){var B=c.onBlock?c.onBlock:o,j=c.showOverlay&&!k?B:o,H=k?B:o;c.showOverlay&&g._fadeIn(c.fadeIn,j),k&&I._fadeIn(c.fadeIn,H)}else c.showOverlay&&g.show(),k&&I.show(),c.onBlock&&c.onBlock.bind(I)();if(r(1,a,c),h?(s=I[0],l=e(c.focusableElements,s),c.focusInput&&setTimeout(f,20)):function(e,o,t){var i=e.parentNode,n=e.style,s=(i.offsetWidth-e.offsetWidth)/2-b(i,"borderLeftWidth"),l=(i.offsetHeight-e.offsetHeight)/2-b(i,"borderTopWidth");o&&(n.left=s>0?s+"px":"0");t&&(n.top=l>0?l+"px":"0")}(I[0],c.centerX,c.centerY),c.timeout){var z=setTimeout(function(){h?e.unblockUI(c):e(a).unblock(c)},c.timeout);e(a).data("blockUI.timeout",z)}}}function d(o,t){var i,n,a=o==window,d=e(o),u=d.data("blockUI.history"),f=d.data("blockUI.timeout");f&&(clearTimeout(f),d.removeData("blockUI.timeout")),t=e.extend({},e.blockUI.defaults,t||{}),r(0,o,t),null===t.onUnblock&&(t.onUnblock=d.data("blockUI.onUnblock"),d.removeData("blockUI.onUnblock")),n=a?e("body").children().filter(".blockUI").add("body > .blockUI"):d.find(">.blockUI"),t.cursorReset&&(n.length>1&&(n[1].style.cursor=t.cursorReset),n.length>2&&(n[2].style.cursor=t.cursorReset)),a&&(s=l=null),t.fadeOut?(i=n.length,n.stop().fadeOut(t.fadeOut,function(){0==--i&&c(n,u,t,o)})):c(n,u,t,o)}function c(o,t,i,n){var s=e(n);if(!s.data("blockUI.isBlocked")){o.each(function(e,o){this.parentNode&&this.parentNode.removeChild(this)}),t&&t.el&&(t.el.style.display=t.display,t.el.style.position=t.position,t.el.style.cursor="default",t.parent&&t.parent.appendChild(t.el),s.removeData("blockUI.history")),s.data("blockUI.static")&&s.css("position","static"),"function"==typeof i.onUnblock&&i.onUnblock(n,i);var l=e(document.body),a=l.width(),d=l[0].style.width;l.width(a-1).width(a),l[0].style.width=d}}function r(o,t,i){var n=t==window,l=e(t);if((o||(!n||s)&&(n||l.data("blockUI.isBlocked")))&&(l.data("blockUI.isBlocked",o),n&&i.bindEvents&&(!o||i.showOverlay))){var a="mousedown mouseup keydown keypress keyup touchstart touchend touchmove";o?e(document).bind(a,i,u):e(document).unbind(a,u)}}function u(o){if("keydown"===o.type&&o.keyCode&&9==o.keyCode&&s&&o.data.constrainTabKey){var t=l,i=!o.shiftKey&&o.target===t[t.length-1],n=o.shiftKey&&o.target===t[0];if(i||n)return setTimeout(function(){f(n)},10),!1}var a=o.data,d=e(o.target);return d.hasClass("blockOverlay")&&a.onOverlayClick&&a.onOverlayClick(o),d.parents("div."+a.blockMsgClass).length>0||0===d.parents().children().filter("div.blockUI").length}function f(e){if(l){var o=l[!0===e?l.length-1:0];o&&o.focus()}}function b(o,t){return parseInt(e.css(o,t),10)||0}}"function"==typeof define&&define.amd&&define.amd.jQuery?define(["jquery"],e):e(jQuery)}();