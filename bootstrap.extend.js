$(function(){


/*----------------------+
| AUTO AJAX-ERROR ALERT |
+-----------------------+

[Usage]
I show error dialog whenever there is an ajax error
===> default showing as modal
===> simply die() in server-script and error message will auto-show in modal
===> applicable to whole site

[Example]
<body data-ajax-error="{modal|alert|console}"> ... </body>

*/
var ajaxErrorHandler = function(evt, jqXHR, ajaxSettings, errorThrown){
	// set default mode
	if ( !$('body[data-ajax-error]').length || !$('body').attr('data-ajax-error').length ) {
		$('body').attr('data-ajax-error', 'modal');
	}
	// display error as modal
	if ( $('body').attr('data-ajax-error') == 'modal' && $('body.modal-open').length ) {
		var $modalVisible = $('.modal.show');
		// create alert box (when necessary)
		if ( !$('#bsx-error-alert').length ) {
			$('<div id="bsx-error-alert" class="alert alert-danger" role="alert"></div>')
				.prependTo( $modalVisible.find('.modal-body') )
				.on('click', function(){ $(this).slideUp(); })
				.hide();
		}
		// show message
		$('#bsx-error-alert')
			.html('')
			.append('<h3 class="mt-0 text-danger">Error</h3>')
			.append('<div class="small text-monospace">'+jqXHR.responseText+'</div>')
			.append('<div class="small em text-danger">'+ajaxSettings.url+'</div>')
			.filter(':visible').hide().fadeIn().end()
			.filter(':hidden').slideDown();
		// scroll to message
		$modalVisible.animate({ scrollTop : 0 });
	// display error as alert box in modal
	} else if ( $('body').attr('data-ajax-error') == 'modal' ) {
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
		$('#bsx-error-modal')
			.modal('show')
			.find('.modal-body').html('')
			.append('<h3 class="mt-0 text-white">Error</h3>')
			.append('<div class="small text-monospace">'+jqXHR.responseText+'</div>')
			.append('<div class="small em text-warning">'+ajaxSettings.url+'</div>');
	// display error as browser alert
	} else if ( $('body').attr('data-ajax-error') == 'alert' ) {
		alert('[Error]\n'+jqXHR.responseText+'\n\n'+ajaxSettings.url);
	// display error as console log
	} else {
		console.log('[Error] '+jqXHR.responseText+' ('+ajaxSettings.url+')');
	}
};
// apply to document
$(document).ajaxError(ajaxErrorHandler);




/*------------------------+
| MULTIPLE MODALS OVERLAY |
+-------------------------+

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




/*--------------------------+
| DATA-TOGGLE : AUTO-SUBMIT |
+---------------------------+

[Usage]
Auto-click corresponding buttons one-by-one (by monitoring the AJAX call progress)
===> data-toggle = {auto-submit}
===> data-target = ~buttonsToClick~
===> data-confirm = ~confirmationMessage~
===> data-meta-title = ~metaTitleMessage~
===> data-(toggle-)stop = ~stopButton~
===> data-(toggle-)progress = ~progressElement~
===> data-(toggle-)callback = ~function|functionName~

[Event]
===> autoSubmit.bsx
===> autoSubmitStopped.bsx
===> autoSubmitCallback.bsx

[Example]
<div id="row-1"><a href="foo.php?id=1" class="btn-submit" data-toggle="ajax-load" data-target="#row-1">...</a></div>
<div id="row-2"><a href="foo.php?id=2" class="btn-submit" data-toggle="ajax-load" data-target="#row-2">...</a></div>
<div id="row-3"><a href="foo.php?id=3" class="btn-submit" data-toggle="ajax-load" data-target="#row-3">...</a></div>
...
<button type="button" data-toggle="auto-submit" data-target=".btn-submit">...</button>

*/
$(document).on('click', '[data-toggle=auto-submit]', function(evt){
	evt.preventDefault();
	// core elements
	var $btnStart = $(this);
	var $targetElements = $( $btnStart.attr('data-target') );
	// fire event
	$btnStart.trigger('autoSubmit.bsx');
	// confirmation
	if ( $btnStart.is('[data-confirm]') ) {
		var msg = $btnStart.attr('data-confirm').length ? $btnStart.attr('data-confirm') : 'Are you sure?';
		if ( !confirm(msg) ) return false;
	}
	// options
	var toggleStop = function(){
		if ( $btnStart.is('[data-toggle-stop]') ) return $btnStart.attr('data-toggle-stop');
		if ( $btnStart.is('[data-stop]')        ) return $btnStart.attr('data-stop');
		return null;
	}();
	var toggleProgress = function(){
		if ( $btnStart.is('[data-toggle-progress]') ) return $btnStart.attr('data-toggle-progress');
		if ( $btnStart.is('[data-progress]')        ) return $btnStart.attr('data-progress');
		return null;
	}();
	var toggleCallback = function(){
		if ( $btnStart.is('[data-toggle-callback]') ) return $btnStart.attr('data-toggle-callback');
		if ( $btnStart.is('[data-callback]')        ) return $btnStart.attr('data-callback');
		return '';
	}();
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
	var $btnStop = $(toggleStop);
	var $progress = $(toggleProgress);
	var $metaTitle = $('html > head > title');
	// remember original meta title
	$metaTitle.attr('data-original', $metaTitle.text());
	// assign tag to all target elements
	$targetElements.addClass('pending-autosubmit');
	// stop button behavior
	$btnStop.filter(':not(.stop-button-ready)').on('click', function(evt){
		evt.preventDefault();
		// mark flag to avoid assign the same behavior again (when stop & restart)
		$btnStop.addClass('stop-button-ready');
		// mark flag to instruct the timer to kill itself
		$btnStart.addClass('stopped');
		// restore to original meta title
		$metaTitle.html( $metaTitle.attr('data-original') ).removeAttr('data-original');
		// (un)block buttons
		$btnStart.prop('disabled', false).removeClass('disabled');
		$btnStop.prop('disabled', true).addClass('disabled');
		// trigger event
		$btnStart.trigger('autoSubmitStopped.bsx');
	});
	// create timer
	// ===> monitor each target element
	// ===> keep repeating until all done
	var timer = window.setInterval(function(){
		// NOTE : cannot remove (invisible) after-run-item 
		// ===> below script didn't work (jQuery bug?)
		// ===> $targetElements.filter('.active-autosubmit:not(:visible)'').remove();
		// ===> apply [:visible] when counting undone items
		var countTotal   = $targetElements.length;
		var countUndone  = $targetElements.filter('.pending-autosubmit,.active-autosubmit:visible').length;
		var countDone    = countTotal - countUndone;
		var progressText = countDone+'/'+countTotal;
		// update progress & meta title (when necessary)
		$progress.html(progressText);
		if ( $btnStart.attr('data-meta-title') ) $metaTitle.html($btnStart.attr('data-meta-title')+' ('+progressText+')');
		// when stopped
		if ( $btnStart.is('.stopped') ) {
			// kill the timer abruptly
			window.clearInterval(timer);
			// clear flag
			$btnStart.removeClass('stopped');
		// when no more outstanding item
		// ===> considered as finished
		} else if ( !countUndone ) {
			// stop repeating
			window.clearInterval(timer);
			// restore to original meta title (when necessary)
			if ( $metaTitle.attr('data-original') ) $metaTitle.html( $metaTitle.attr('data-original') ).removeAttr('data-original');
			// (un)block buttons
			$btnStart.prop('disabled', false).removeClass('disabled');
			$btnStop.prop('disabled', true).addClass('disabled');
			// trigger callback & event
			callbackFunc();
			$btnStart.trigger('autoSubmitCallback.bsx');
		// when no active item
		// ===> still in progress
		} else if ( !$targetElements.filter('.active-autosubmit:visible').length ) {
			var $firstPending = $targetElements.filter('.pending-autosubmit:first');
			// invoke first pending element & mark active
			$firstPending.removeClass('pending-autosubmit').addClass('active-autosubmit');
			$firstPending.trigger( $firstPending.is('form') ? 'submit' : 'click' );
			// (un)block buttons
			$btnStart.prop('disabled', true).addClass('disabled');
			$btnStop.prop('disabled', false).removeClass('disabled');
		}
	}, 100);
});




/*-------------------------+
| DATA-TOGGLE : AJAX-MODAL |
+--------------------------+

[Usage]
Auto-load remote content into modal
===> data-toggle = {ajax-modal}
===> data-target = ~targetModal~
===> data-(toggle-)selector = ~partialResponseToShow~

[Example]
<a href="foo.html" data-toggle="ajax-modal" data-target="#my-modal">...</div>
<button data-href="bar.html" data-toggle="ajax-modal" data-target="#my-modal">...</button>

*/
// load content to modal
$(document).on('click', ':not(form)[data-toggle=ajax-modal]', function(evt){
	evt.preventDefault();
	ajaxModal(this);
});
// submit form & show content in modal
$(document).on('submit', 'form[data-toggle=ajax-modal]', function(evt){
	evt.preventDefault();
	ajaxModal(this);
});
// actual behavior of [ajax-modal]
var ajaxModal = function(triggerElement) {
	var $triggerElement = $(triggerElement);
	// validation
	if ( !$triggerElement.attr('data-target') ) {
		console.log('[ERROR] ajaxModal.bsx - Attribute [data-target] was not specified');
		return false;
	}
	// determine options
	var toggleSelector = function(){
		if ( $triggerElement.is('[data-toggle-selector]') ) return $btn.attr('data-toggle-selector');
		else if ( $triggerElement.is('[data-selector]'  ) ) return $btn.attr('data-selector');
		else return '';
	}();
	// determine target element
	var $modal = $( $triggerElement.attr('data-target') );
	if ( !$modal.length ) {
		console.log('[ERROR] ajaxModal.bsx - Target modal not found ('+$triggerElement.attr('data-target')+')');
		return false;
	} else if ( !$modal.is('.modal') ) {
		console.log('[ERROR] ajaxModal.bsx - Target modal does not have <.modal> class ('+$triggerElement.attr('data-target')+')');
		return false;
	} else if ( !$modal.find('.modal-dialog').length ) {
		console.log('[ERROR] ajaxModal.bsx - Target modal does not have <.modal-dialog> child element ('+$triggerElement.attr('data-target')+')');
		return false;
	}
	// determine target url
	var url;
	if ( $triggerElement.is('form') ) {
		url = $triggerElement.attr('action');
	} else if ( $triggerElement.is('[type=button]') ) {
		url = $triggerElement.is('[href]') ? $triggerElement.attr('href') : $triggerElement.attr('data-href');
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
			<div class="modal-title text-muted"><i class="fa fa-spinner fa-pulse"></i><span class="ml-2">Loading...</span></div>
		</div>
		<div class="modal-body">
		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-light" data-dismiss="modal">Close</button>
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




/*----------------------------+
| DATA-TOGGLE : AJAX-DROPDOWN |
+-----------------------------+

[Usage]
Auto-load remote content into dropdown (load-once-and-keep)
===> data-toggle = {ajax-dropdown}
===> data-target = ~targetDropdown~
===> data-(toggle-)align = {left*|right}
===> data-(toggle-)selector = ~partialResponseToShow~

[Example]
<div class="dropdown">
	<a href="my/dropdown/menu.php" class="dropdown-toggle" data-toggle="ajax-dropdown">...</a>
	<div class="dropdown-menu"></div>
</div>

*/
$(document).on('click', '[href][data-toggle=ajax-dropdown],[data-href][data-toggle=ajax-dropdown]', function(evt){
	evt.preventDefault();
	var $btn = $(this);
	var $parent = $btn.closest('.dropdown,.dropup,.dropleft,.dropright');
	var $target = $parent.find('.dropdown-menu').length ? $parent.find('.dropdown-menu:first') : $('<div class="dropdown-menu"></div>').insertAfter($btn);
	// options
	var toggleAlign = function(){
		if ( $btn.is('[data-toggle-align]') ) return $btn.attr('data-toggle-align');
		else if ( $btn.is('[data-align]'  ) ) return $btn.attr('data-align');
		else return 'left';
	}();
	var toggleSelector = function(){
		if ( $btn.is('[data-toggle-selector]') ) return $btn.attr('data-toggle-selector');
		else if ( $btn.is('[data-selector]'  ) ) return $btn.attr('data-selector');
		else return '';
	}();
	// apply alignment
	if ( toggleAlign == 'right' ) $target.addClass('dropdown-menu-right');
	// show loading message
	$target.html('<div class="dropdown-item text-muted"><i class="fa fa-spinner fa-pulse"></i><em class="ml-2">Loading</em></div>');
	// load content remotely
	var url = $btn.attr( $btn.is('[href]') ? 'href' : 'data-href' );
	$.ajax({
		'url' : url,
		'cache' : false,
		'method' : 'get',
		'error' : function(jqXHR, textStatus, errorThrown) {
			window.setTimeout(function(){
				ajaxErrorHandler(null, jqXHR, { url : url }, errorThrown);
			}, 1000);
		},
		'success' : function(data, textStatus, jqXHR){
			// wrap by dummy element (when necessary)
			// ===> avoid multiple elements
			// ===> avoid response is plain text
			// ===> avoid selector find against base element
			if ( $(data).length != 1 || toggleSelector ) data = '<div>'+data+'</div>';
			// show full response or specific element only
			$target.html( toggleSelector ? $(data).find(toggleSelector) : data );
			// refresh
			$btn.dropdown('update');
		},
	});
	// transform to standard bootstrap-dropdown
	$btn.attr('data-toggle', 'dropdown');
	// show dropdown (after dropdown constructed)
	window.setTimeout(function(){ $btn.click(); }, 0);
});




/*--------------------------------------+
| DATA-TOGGLE : AJAX-LOAD / AJAX-SUBMIT |
+---------------------------------------+

[Usage]
I allow ajax-load/ajax-submit content to specific element by defining data attributes
===> data-toggle = {ajax-load|ajax-submit}
===> data-target = ~targetElement|targetForm~
===> data-confirm = ~confirmationMessage~
===> data-(toggle-)mode = {replace*|prepend|append|before|after}
===> data-(toggle-)overlay = {progress*|loading|loading-large|spinner|spinner-large|overlay|gray|grayer|dim|dimmer|white|whiter|light|lighter|none}
===> data-(toggle-)transition = {slide*|fade|none}
===> data-(toggle-)callback = ~function|functionName~
===> data-(toggle-)selector = ~partialResponseToShow~

[Event]
===> ajaxLoad.bsx
===> ajaxLoadCallback.bsx
===> ajaxSubmit.bsx
===> ajaxSubmitCallback.bsx

[Example]
<!-- ajax load -->
<a href="/url/to/go" class="btn btn-default" data-toggle="ajax-load" data-target="#element"> ... </a>
<!-- ajax submit -->
<form method="post" action="/url/to/go" data-toggle="ajax-submit" data-target="#element"> ... </form>

*/
// remote load
$(document).on('click', '[data-toggle=ajax-load]', function(evt){
	evt.preventDefault();
	ajaxLoadOrSubmit(this);
});
// remote submit
// ===> [BUG] when pass to custom event
// ===> element becomes BUTTON (instead of FORM)
// ===> use closest() as dirty fix
$(document).on('submit', '[data-toggle=ajax-submit]', function(evt){
	evt.preventDefault();
	ajaxLoadOrSubmit( $(this).closest('form') );
});
// when form is [ajax-submit]
// ===> update form [action] with button [formaction]
// ===> because [ajax-submit] relies on the form [action] attribute
$(document).on('click', ':submit[formaction]', function(evt){
	$(this.form).filter('[data-toggle=ajax-submit]').attr('action', $(this).attr('formaction'));
});
// actual behavior of [ajax-load|ajax-submit]
var ajaxLoadOrSubmit = function(triggerElement) {
	var $triggerElement = $(triggerElement);
	// determine event type (by camelize [data-toggle] attribute)
	var eventType = $triggerElement.attr('data-toggle').split('-').map(function(word,index){
		if(index == 0) return word.toLowerCase();
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}).join('');
	// fire event
	$triggerElement.trigger(eventType+'.bsx');
	// confirmation
	if ( $triggerElement.is('[data-confirm]') ) {
		var msg = $triggerElement.attr('data-confirm').length ? $triggerElement.attr('data-confirm') : 'Are you sure?';
		if ( !confirm(msg) ) return false;
	}
	// options
	var toggleTarget = $triggerElement.attr('data-target');
	var toggleMode = function(){
		if ( $triggerElement.is('[data-toggle-mode]') ) return $triggerElement.attr('data-toggle-mode');
		if ( $triggerElement.is('[data-mode]')        ) return $triggerElement.attr('data-mode');
		return 'replace';
	}();
	var toggleTransition = function(){
		if ( $triggerElement.is('[data-toggle-transition]') ) return $triggerElement.attr('data-toggle-transition');
		if ( $triggerElement.is('[data-transition]')        ) return $triggerElement.attr('data-transition');
		return 'slide';
	}();
	var toggleCallback = function(){
		if ( $triggerElement.is('[data-toggle-callback]') ) return $triggerElement.attr('data-toggle-callback');
		if ( $triggerElement.is('[data-callback]')        ) return $triggerElement.attr('data-callback');
		return '';
	}();
	var toggleOverlay = function(){
		if ( $triggerElement.is('[data-toggle-loading]')      ) return $triggerElement.attr('data-toggle-loading');
		if ( $triggerElement.is('[data-toggle-overlay]')      ) return $triggerElement.attr('data-toggle-overlay');
		if ( $triggerElement.is('[data-loading]')             ) return $triggerElement.attr('data-loading');
		if ( $triggerElement.is('[data-overlay]')             ) return $triggerElement.attr('data-overlay');
		return 'progress';
	}();
	var toggleSelector = function(){
		if ( $triggerElement.is('[data-toggle-selector]') ) return $triggerElement.attr('data-toggle-selector');
		if ( $triggerElement.is('[data-selector]')        ) return $triggerElement.attr('data-selector');
		return '';
	}();
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
		console.log('[Error] '+eventType+'.bsx - Attribute [data-target] was not specified');
	} else if ( !$(toggleTarget).length ) {
		console.log('[Error] '+eventType+'.bsx - Target not found ('+toggleTarget+')');
	}
	// normal redirect or submit when target element was not properly specified
	if ( !toggleTarget || !$(toggleTarget).length ) {
		$triggerElement.removeAttr('data-toggle');
		if ( eventType == 'ajaxSubmit' ) {
			$triggerElement.submit();
		} else {
			document.location.href = $triggerElement.is('[href]') ? $triggerElement.attr('href') : $triggerElement.attr('data-href');
		}
	// proceed...
	} else {
		var $targetElement = $(toggleTarget);
		var url;
		if ( $triggerElement.is('form') ) {
			url = $triggerElement.attr('action');
		} else if ( $triggerElement.is('[type=button]') ) {
			url = $triggerElement.is('[href]') ? $triggerElement.attr('href') : $triggerElement.attr('data-href');
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


}); // function-$




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