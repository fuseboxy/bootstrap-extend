Bootstrap-Extend (4.x)
======================

Extend CSS & JS Features of Twitter Bootstrap 4.x


-----


## Dependencies
* Bootstrap 4.x
* jQuery 1.9.x (or above)


## CDN
* https://cdn.jsdelivr.net/gh/fuseboxy/bootstrap-extend@{VERSION}/bootstrap.extend.css
* https://cdn.jsdelivr.net/gh/fuseboxy/bootstrap-extend@{VERSION}/bootstrap.extend.js


-----


## CSS Features

### MODAL NEW SIZES

#### Example

```
<div class="modal fade">
	<div class="modal-dialog {modal-xs|modal-sm|modal-lg|modal-xl|modal-xxl|modal-max}">
		<div class="modal-content"> ... </div>
	</div>
</div>
```

|  Size        |  Class             |  Modal max-width           |
|--------------|--------------------|----------------------------|
|  Extra Small |  .modal-xs         |  300px                     |
|  Small       |  .modal-sm         |  500px (originally 300px)  |
|  Default     |  (None)            |  800px (originally 500px)  |
|  Large       |  .modal-lg         |  960px (originally 800px)  |
|  Extra Large |  .modal-xl         |  1140px                    |
|  XXL / Max   |  .modal-{xxl/max}  |  (almost fullscreen)       |


### BUTTON NEW SIZES

#### Example

```
<!-- button -->
<button type="button" class="btn btn-primary btn-xs">Extra small button</button>
<!-- button group -->
<div class="btn-group btn-group-xs" role="group" aria-label="Extra small button group example">
    <button type="button" class="btn btn-primary">Left</button>
    <button type="button" class="btn btn-primary">Middle</button>
    <button type="button" class="btn btn-primary">Right</button>
</div>
```


### FORM CONTROL & INPUT GROUP NEW SIZES

#### Example

```
<!-- form control -->
<input type="text" class="form-control form-control-xs" value="small" />
<!-- input-group -->
<div class="input-group input-group-xs">
	<div class="input-group-prepend">
		<span class="input-group-text">Label</span>
	</div>
	<input type="text" class="form-control" value="Extra small field" />
</div>
```


### MULTILEVEL DROPDOWN

#### Reference

https://bootstrapious.com/p/bootstrap-multilevel-dropdown

#### Example

```
<nav class="navbar navbar-expand-lg navbar-light">
    <ul class="navbar-nav">
		<li class="nav-item dropdown">
			<a href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="nav-link dropdown-toggle">Level 1</a>
			<ul class="dropdown-menu">
				<li><a href="#" class="dropdown-item">Level 2</a></li>
				<li class="dropdown-submenu">
					<a href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="dropdown-item dropdown-toggle">Level 2</a>
					<ul class="dropdown-menu">
						<li><a href="#" class="dropdown-item">level 3</a></li>
						<li class="dropdown-submenu">
							<a href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="dropdown-item dropdown-toggle">Level 3</a>
							<ul class="dropdown-menu">
								<li><a href="#" class="dropdown-item">Level 4</a></li>
								<li><a href="#" class="dropdown-item">Level 4</a></li>
							</ul><!--/.dropdown-menu-lv4-->
						</li>
					</ul><!--/.dropdown-menu-lv3-->
				</li>
			</ul><!--/.dropdown-menu-lv2-->
		</li>
	</ul><!--/.navbar-nav-lv1-->
</nav>
```


### TAB VERTICAL & BOTTOM

#### Reference

https://codepen.io/jasongardner/pen/gxprVQ

#### Example

```
<!-- left / right -->
<ul class="nav nav-tabs nav-tabs--{left|right} flex-column">
	<li class="nav-item"><a class="nav-link" href="...">...</a></li>
	<li class="nav-item"><a class="nav-link" href="...">...</a></li>
</ul>
<!-- bottom -->
<ul class="nav nav-tabs nav-tabs--bottom">
	<li class="nav-item"><a class="nav-link" href="...">...</a></li>
	<li class="nav-item"><a class="nav-link" href="...">...</a></li>
</ul>
```


### UTILITY CLASSES FOR STYLING

#### styling

* .em
* .del
* .sub
* .sup
* .strong

#### border

* .b-{0|1|2|3|4|5}
* .bx-{0|1|2|3|4|5}
* .by-{0|1|2|3|4|5}
* .bt-{0|1|2|3|4|5}
* .bb-{0|1|2|3|4|5}
* .bl-{0|1|2|3|4|5}
* .br-{0|1|2|3|4|5}

#### border color

* .b-{primary|secondary|success|info|warning|danger|light|dark|white|transparent}
* .bx-{primary|secondary|success|info|warning|danger|light|dark|white|transparent}
* .by-{primary|secondary|success|info|warning|danger|light|dark|white|transparent}
* .bt-{primary|secondary|success|info|warning|danger|light|dark|white|transparent}
* .bb-{primary|secondary|success|info|warning|danger|light|dark|white|transparent}
* .bl-{primary|secondary|success|info|warning|danger|light|dark|white|transparent}
* .br-{primary|secondary|success|info|warning|danger|light|dark|white|transparent}

#### shadow

* .shadow-{xs|sm|lg|xl}

#### opacity

* .op-{100|95|90|..|10|5|0}

#### width

* .w-{100|95|90|...|10|5|0}

#### cursor

* .cursor-alias
* .cursor-all-scroll
* .cursor-auto
* .cursor-cell
* .cursor-context-menu
* .cursor-col-resize
* .cursor-copy
* .cursor-crosshair
* .cursor-default
* .cursor-e-resize
* .cursor-ew-resize
* .cursor-grab
* .cursor-grabbing
* .cursor-help
* .cursor-move
* .cursor-n-resize
* .cursor-ne-resize
* .cursor-nesw-resize
* .cursor-ns-resize
* .cursor-nw-resize
* .cursor-nwse-resize
* .cursor-no-drop
* .cursor-none
* .cursor-not-allowed
* .cursor-pointer
* .cursor-progress
* .cursor-row-resize
* .cursor-s-resize
* .cursor-se-resize
* .cursor-sw-resize
* .cursor-text
* .cursor-w-resize
* .cursor-wait
* .cursor-zoom-in
* .cursor-zoom-out

#### others

* .transition-none


-----


## JS Features

### AUTO AJAX-ERROR ALERT

#### Usage

* show error dialog whenever there is an ajax error
* default showing as modal
* provide attribute to control show/hide of title and URL
* simply die() in server-script and error message will auto-show in modal
* applicable to whole site

#### Attributes

* data-ajax-error = {modal|alert|console}
* data-ajax-error-url = {none}
* data-ajax-error-title = {~titleText~|none} (default="Error")

#### Example

```
<body data-ajax-error="alert" data-ajax-error-title="Caution" data-ajax-error-url="none"> ... </body>
```


### MULTIPLE MODALS OVERLAY

#### Usage

* Fix overlay order when multiple modals launched
* [Reference] https://stackoverflow.com/questions/19305821/multiple-modals-overlay


### DATA-TOGGLE : AUTO-SUBMIT

#### Usage

* Auto-click corresponding buttons one-by-one (by monitoring the AJAX call progress)

#### Attributes

* data-toggle = {auto-submit}
* data-target = ~buttonsToClick~
* data-confirm = ~confirmationMessage~
* data-(toggle-)stop = ~stopButton~
* data-(toggle-)progress = ~progressElement~
* data-(toggle-)callback = ~function|functionName~

#### Events

* autoSubmit.bsx
* autoSubmitStopped.bsx
* autoSubmitCallback.bsx

#### Example

```
<div id="row-1"><a href="foo.php?id=1" class="btn-submit" data-toggle="ajax-load" data-target="#row-1">...</a></div>
<div id="row-2"><a href="foo.php?id=2" class="btn-submit" data-toggle="ajax-load" data-target="#row-2">...</a></div>
<div id="row-3"><a href="foo.php?id=3" class="btn-submit" data-toggle="ajax-load" data-target="#row-3">...</a></div>
...
<button type="button" data-toggle="auto-submit" data-target=".btn-submit">...</button>
```


### DATA-TOGGLE : AJAX-MODAL

#### Usage

* Auto-load remote content into modal

#### Attributes

* data-toggle = {ajax-modal}
* data-target = ~targetModal~
* data-(toggle-)selector = ~partialResponseToShow~

#### Example

```
<a href="foo.html" data-toggle="ajax-modal" data-target="#my-modal">...</div>
<button data-href="bar.html" data-toggle="ajax-modal" data-target="#my-modal">...</button>
```


### DATA-TOGGLE : AJAX-DROPDOWN

#### Usage

* Auto-load remote content into dropdown (load-once-and-keep)

#### Attributes

* data-toggle = {ajax-dropdown}
* data-target = ~targetDropdown~
* data-(toggle-)align = {left*|right}
* data-(toggle-)selector = ~partialResponseToShow~

#### Example

```
<div class="dropdown">
	<a href="my/dropdown/menu.php" class="dropdown-toggle" data-toggle="ajax-dropdown">...</a>
	<div class="dropdown-menu"></div>
</div>
```


### DATA-TOGGLE : AJAX-LOAD / AJAX-SUBMIT

#### Usage

* I allow ajax-load/ajax-submit content to specific element by defining data attributes

#### Attributes

* data-toggle = {ajax-load|ajax-submit}
* data-target = ~targetElement|targetForm~
* data-confirm = ~confirmationMessage~
* data-(toggle-)mode = {replace*|prepend|append|before|after}
* data-(toggle-)overlay = {progress*|loading|loading-large|spinner|spinner-large|overlay|gray|grayer|dim|dimmer|white|whiter|light|lighter|none}
* data-(toggle-)transition = {slide*|fade|none}
* data-(toggle-)callback = ~function|functionName~
* data-(toggle-)selector = ~partialResponseToShow~

#### Events

* ajaxLoad.bsx
* ajaxLoadCallback.bsx
* ajaxSubmit.bsx
* ajaxSubmitCallback.bsx

#### Example

```
<!-- ajax load -->
<a href="/url/to/go" class="btn btn-default" data-toggle="ajax-load" data-target="#element"> ... </a>
<!-- ajax submit -->
<form method="post" action="/url/to/go" data-toggle="ajax-submit" data-target="#element"> ... </form>
```







Off-Canvas
https://as-tx.github.io/bootstrap-off-canvas-sidebar/
