/* Nymbus Site Content: English / French tabs of the editor screens. Without JavaScript both languages stay visible. */
( function () {
	'use strict';
	function init( root ) {
		var tabs = root.querySelectorAll( '.nymbus-sc-tab' );
		var panels = root.querySelectorAll( '.nymbus-sc-panel' );
		if ( ! tabs.length ) {
			return;
		}
		function show( lang ) {
			tabs.forEach( function ( t ) {
				var on = t.getAttribute( 'data-lang' ) === lang;
				t.setAttribute( 'aria-selected', on ? 'true' : 'false' );
				t.classList.toggle( 'button-primary', on );
			} );
			panels.forEach( function ( p ) {
				p.hidden = p.getAttribute( 'data-lang' ) !== lang;
			} );
		}
		tabs.forEach( function ( t ) {
			t.addEventListener( 'click', function () {
				show( t.getAttribute( 'data-lang' ) );
			} );
		} );
		show( 'en' );
	}
	document.addEventListener( 'DOMContentLoaded', function () {
		document.querySelectorAll( '.nymbus-sc' ).forEach( init );
	} );
} )();
