"use strict";

(function($) {
	//specify oldest version of the browser supported here
	//browser older than the version specified will display the alert
	var chromeVersion = 30;
	var safariVersion = 7;
	var firefoxVersion = 27;
	var operaVersion = 12;
	var ieVersion = 11;
		
	$.fn.add_browser_classes = function() {
		// Begin with the negation classes
		$(this).addClass('javascript not-webkit not-firefox not-opera not-ie');

		if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && ((navigator.userAgent.match(/Opera|OPR\//) ? true : false)==false) && !navigator.userAgent.match(/Edge/)) {
			$(this).removeClass('not-webkit').addClass('webkit chrome');
			is_browser_supported(this, chromeVersion);
		} else if (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
			$(this).removeClass('not-webkit').addClass('webkit safari');
			is_browser_supported(this, safariVersion);
		} else if (/Firefox/.test(navigator.userAgent)) {
			$(this).removeClass('not-firefox').addClass('firefox');
			is_browser_supported(this, firefoxVersion);
		} else if ((navigator.userAgent.match(/Opera|OPR\//) ? true : false)) {
			$(this).removeClass('not-opera').addClass('opera');
			is_browser_supported(this, operaVersion);
		}  else if (!document.querySelector) {
			$(this).removeClass('not-ie');
			$(this).addClass('ie ie7 lt-ie11 lt-ie10 lt-ie9 lt-ie8');
			is_browser_supported(this, ieVersion);
		} else if (!document.addEventListener) {
			$(this).removeClass('not-ie');
			$(this).addClass('ie ie8 lt-ie11 lt-ie10 lt-ie9');
			is_browser_supported(this, ieVersion);
		} else if (!window.atob) {
			$(this).removeClass('not-ie');
			$(this).addClass('ie ie9 lt-ie11 lt-ie10');
			is_browser_supported(this, ieVersion);
		} else if (!document.__proto__) {
			$(this).removeClass('not-ie');
			$(this).removeClass('not-ie').addClass('ie ie10 lt-ie11');
			is_browser_supported(this, ieVersion);
		} else if (!!(navigator.userAgent.match(/Trident/) && !navigator.userAgent.match(/MSIE/))){			
			//This condition checks to see if the browser is IE 11 or greater
			//If we need to test for specific versions of IE 11 and above replace the above else if conditional to this -
			//!!(navigator.userAgent.match(/Trident/) && navigator.userAgent.match(/rv[ :]11/))
			//if it isnt obvious change the 11 in the conditional to the version you are looking for
			$(this).removeClass('not-ie');
			$(this).addClass('ie ie11');			
			is_browser_supported(this, ieVersion);
		} else if (!!(navigator.userAgent.match(/Edge/) && !navigator.userAgent.match(/MSIE/))){
			$(this).removeClass('not-ie');
			$(this).addClass('ie edge');				
		}
		return this;
	};

	//This function returns the browser name and version from the browsers userAgent string
	function get_browser_info (){
		var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
		if(/trident/i.test(M[1])){
			tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
			return {name:'IE',version:(tem[1]||'')};
		}   
		if(M[1]==='Chrome'){
			tem=ua.match(/\bOPR\/(\d+)/)
			if(tem!=null)   {return {name:'Opera', version:tem[1]};}
		}   
		M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
		if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
		return {
		  name: M[0],
		  version: M[1]
		};		
	}		

	function is_browser_supported (currentElement, supportedVersion) {				
		var browser_info = get_browser_info();

		if(browser_info.version < supportedVersion){
			$(currentElement).addClass('browser-unsupported');
		}
	}	
})(jQuery);

// Detect browser and add appropriate classes to calling element, typically 'html'
// Usage: $('html').add_browser_classes();
// Test function: alert('html classes: ' + jQuery('html').attr('class'));
$(document).ready(function() {
	$('html').add_browser_classes();
});	