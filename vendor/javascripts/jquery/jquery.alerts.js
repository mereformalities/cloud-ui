// jQuery Alert Dialogs Plugin
//
// Version 1.1
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 14 May 2009
//
// Website: http://abeautifulsite.net/blog/2008/12/jquery-alert-dialogs/
//
// Usage:
//		jAlert( message, [title, callback] )
//		jConfirm( message, [title, callback] )
//		jPrompt( message, [value, title, callback] )
// 
// History:
//
//		1.00 - Released (29 December 2008)
//
//		1.01 - Fixed bug where unbinding would destroy all resize events
//
// License:
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 
//
(function($) {
	
	$.alerts = {
		
		// These properties can be read/written by accessing $.alerts.propertyName from your scripts at any time
		
		//verticalOffset: -80,              // vertical offset of the dialog from center screen, in pixels
		//horizontalOffset: 0,              // horizontal offset of the dialog from center screen, in pixels/
		repositionOnResize: true,           // re-centers the dialog on window resize
		//overlayOpacity: .5,               // transparency level of overlay
		//overlayColor: '#fff',             // base color of overlay
		draggable: true,                    // make the dialogs draggable (requires UI Draggables plugin)
		okButton: 'Done',       			// text for the OK button
		cancelButton: 'Cancel', 			// text for the Cancel button
		alertTitle: 'Alert',				// text for default alert title
		confirmTitle: 'Confirm',			// text for default confirm title
		promptTitle: 'Prompt',				// text for default prompt title
		dialogClass: null,                  // if specified, this class will be applied to all dialogs
		
		// Public methods
		
		alert: function (message, title, callback) {
			if( title == null ) title = $.alerts.alertTitle;
			$.alerts._show(title, message, null, 'alert', function (result) {
				if( callback ) callback(result);
			});
		},
		
		confirm: function (message, title, callback) {
			if( title == null ) title = $.alerts.confirmTitle;
			$.alerts._show(title, message, null, 'confirm', function (result) {
				if( callback ) callback(result);
			});
		},
			
		prompt: function (message, value, title, callback) {
			if( title == null ) title = $.alerts.promptTitle;
			$.alerts._show(title, message, value, 'prompt', function (result) {
				if( callback ) callback(result);
			});
		},
		
		// Private methods
		
		_show: function(title, msg, value, type, callback) {
			
			$.alerts._hide();
			$.alerts._overlay('show');
			
			$("body").append(
			  '<div id="alert-container">' +
			    '<h1 id="alert-title"></h1>' +
			    '<div id="alert-content">' +
			      '<div id="alert-message"></div>' +
				'</div>' +
			  '</div>');
			
			if( $.alerts.dialogClass ) $("#alert-container").addClass($.alerts.dialogClass);
			
			// IE6 Fix
			var pos = ($.browser.msie && parseInt($.browser.version) <= 6 ) ? 'absolute' : 'fixed'; 
			
			$("#alert-container").css({
				position: pos,
				zIndex: 99999,
				//padding: 0,
				margin: 0
			});
			
			$("#alert-title").text(title);
			$("#alert-content").addClass(type);
			$("#alert-message").text(msg);
			$("#alert-message").html( $("#alert-message").text().replace(/\n/g, '<br />') );
			
			$("#alert-container").css({
				//minWidth: $("#alert-container").outerWidth(),
				//maxWidth: $("#alert-container").outerWidth()
			});
			
			$.alerts._reposition();
			$.alerts._maintainPosition(true);
			
			switch( type ) {
				case 'alert':
					$("#alert-message").after('<div id="alert-panel"><input type="button" value="' + $.alerts.okButton + '" id="alert-ok" class="btn-primary" /></div>');
					$("#alert-ok").click( function() {
						$.alerts._hide();
						callback(true);
					});
					$("#alert-ok").focus().keypress( function(e) {
						if( e.keyCode == 13 || e.keyCode == 27 ) $("#alert-ok").trigger('click');
					});
				break;
				case 'confirm':
					$("#alert-message").after('<div id="alert-panel"><input type="button" value="' + $.alerts.okButton + '" id="alert-ok" class="btn-primary" /> <input type="button" value="' + $.alerts.cancelButton + '" id="alert-cancel" class="btn" /></div>');
					$("#alert-ok").click( function() {
						$.alerts._hide();
						if( callback ) callback(true);
					});
					$("#alert-cancel").click( function() {
						$.alerts._hide();
						if( callback ) callback(false);
					});
					$("#alert-ok").focus();
					$("#alert-ok, #alert-cancel").keypress( function(e) {
						if( e.keyCode == 13 ) $("#alert-ok").trigger('click');
						if( e.keyCode == 27 ) $("#alert-cancel").trigger('click');
					});
				break;
				case 'prompt':
					$("#alert-message").append('<br /><input type="text" size="30" id="alert-prompt" />').after('<div id="alert-panel"><input type="button" value="' + $.alerts.okButton + '" id="alert-ok" class="btn-primary" /> <input type="button" value="' + $.alerts.cancelButton + '" id="alert-cancel" class="btn" /></div>');
					$("#alert-prompt").width( $("#alert-message").width() );
					$("#alert-ok").click( function() {
						var val = $("#alert-prompt").val();
						$.alerts._hide();
						if( callback ) callback( val );
					});
					$("#alert-cancel").click( function() {
						$.alerts._hide();
						if( callback ) callback( null );
					});
					$("#alert-prompt, #alert-ok, #alert-cancel").keypress( function(e) {
						if( e.keyCode == 13 ) $("#alert-ok").trigger('click');
						if( e.keyCode == 27 ) $("#alert-cancel").trigger('click');
					});
					if( value ) $("#alert-prompt").val(value);
					$("#alert-prompt").focus().select();
				break;
			}
			
			// Make draggable
			if( $.alerts.draggable ) {
				try {
					$("#alert-container").draggable(/*{ handle: $("#alert-title") }*/);
					$("#alert-container").css({ cursor: 'move' });
				} catch(e) { /* requires jQuery UI draggables */ }
			}
		},
		
		_hide: function() {
			$("#alert-container").remove();
			$.alerts._overlay('hide');
			$.alerts._maintainPosition(false);
		},
		
		_overlay: function(status) {
			switch( status ) {
				case 'show':
					$.alerts._overlay('hide');
					$("body").append('<div id="alert-overlay"></div>');
					$("#alert-overlay").css({
						position: 'fixed',
						zIndex: 99998,
						top: '0',
						left: '0',
						right: '0',
						bottom: '0'
						//width: '100%',
						//height: $(document).height(),
						//background: $.alerts.overlayColor,
						//opacity: $.alerts.overlayOpacity
					});
				break;
				case 'hide':
					$("#alert-overlay").remove();
				break;
			}
		},
		
		_reposition: function() {
			var offset = $(window).height() / 4;
			var top = (($(window).height() / 2) - ($("#alert-container").outerHeight() / 2)) - offset; //+ $.alerts.verticalOffset;
			var left = (($(window).width() / 2) - ($("#alert-container").outerWidth() / 2)); //+ $.alerts.horizontalOffset;
			if( top < 0 ) top = 0;
			if( left < 0 ) left = 0;
			
			// IE6 fix
			if( $.browser.msie && parseInt($.browser.version) <= 6 ) top = top + $(window).scrollTop();
			
			$("#alert-container").css({
				top: top + 'px',
				left: left + 'px'
			});
			$("#alert-overlay").height( $(document).height() );
		},
		
		_maintainPosition: function(status) {
			if( $.alerts.repositionOnResize ) {
				switch(status) {
					case true:
						$(window).bind('resize', $.alerts._reposition);
					break;
					case false:
						$(window).unbind('resize', $.alerts._reposition);
					break;
				}
			}
		}
		
	}
	
	// Shortuct functions
	window.modalAlert = function(message, title, callback) {
		$.alerts.alert(message, title, callback);
	}
	
	window.modalConfirm = function(message, title, callback) {
		$.alerts.confirm(message, title, callback);
	};
		
	window.modalPrompt = function(message, value, title, callback) {
		$.alerts.prompt(message, value, title, callback);
	};
	
})(jQuery); // TODO: Zepto