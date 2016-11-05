$(document).ready(function() {
	setupAgreementLinks();
	setupAgreementCheckboxes();
	if (jQuery().amounts) setupAmounts();
	if (jQuery().autoshow) setupAutoshow();
	if (jQuery().autotab) setupAutotab();
	setupButtons();
	if (jQuery().customMessages) setupCustomMessages();
	if (jQuery().datepicker) setupDatepickers();
	if (jQuery().placeholders) setupPlaceholders();
	if (jQuery.sections) setupSections();	
	setupSessionSync();
	setupTabIndex();
	if (jQuery().tabs) setupTabs();
	setupTimeout();
	if (jQuery().toggles) setupToggles();
	if (jQuery().tooltip) setupTooltips();
	setupWidgets();
	focusOnFirstField();
	applyFirstLast();	
}); 

$(document).ajaxStop(function() {
	applyFirstLast();	
});

if (typeof jQuery != "undefined") {
	(function($) {
		// Functions
		$.extend({
			amounts: {
				enforceDollars: function(amountOld, amountNew) {
					// If all numeric:
					if (amountNew.match(/^[\d\,]*$/)) return amountNew;
					return amountOld;
				},
				enforceCents: function(amountOld, amountNew) {
					// If not all numeric, with one optional decimal point:
					if ( ! amountNew.match(/^[\d\,]*\.?\d*$/)) return amountOld;

					var decimalPointIndex = amountNew.indexOf(".");
					var newLength = amountNew.length;
					var finalAmount = amountNew; // Default
					if (decimalPointIndex == -1) {
						// Disallow the user from deleting the decimal point:
						if (amountOld.indexOf(".") != -1) return amountOld;
						
						finalAmount = amountNew + ".00";
					} else if (decimalPointIndex == newLength - 1) finalAmount = amountNew + "00";
					else if (decimalPointIndex == newLength - 2) finalAmount = amountNew + "0";
					else if (decimalPointIndex < newLength - 2) finalAmount = amountNew.substring(0, decimalPointIndex + 3);
					
					return finalAmount;
				},
				allowCents: function(amountOld, amountNew) {
					// If not all numeric, with one optional decimal point and up to two decimal digits:
					if ( ! amountNew.match(/^[\d\,]*\.?\d{0,2}$/)) return amountOld;			
					return amountNew;
				}
			}, // amounts Object
			/** Copy token from frame, to any parent forms */
			promoteSessionSyncToken: function() {
				// Only run in iframes with forms
				if (self == top || $("form").length == 0) return;
				
				top.updateSessionSyncTokensFromAjaxResponse(self.document);
			}, // promoteSessionSyncToken Function
			sections: function(sectionKeyword, sectionId, updateCallback) {
				if (!sectionKeyword) sectionKeyword = "section";
				$(document).on("click", "." + sectionKeyword + "-edit", function() {
					var currentId = $(this).whatFor();
					if (currentId != null) {
						$("#" + sectionKeyword + "-view-" + currentId + ",." + sectionKeyword + "-edit").hide();
						$("#" + sectionKeyword + "-edit-" + currentId).show();
					}
				}).on("click", "." + sectionKeyword + "-update", function() {
					var currentId = $(this).whatFor();
					if (typeof updateCallback == "function") {
						updateCallback(currentId);
					}
				}).on("click", "." + sectionKeyword + "-cancel", function() {
					var currentId = $(this).whatFor();
					if (currentId != null) {
						$("#" + sectionKeyword + "-view-" + currentId + ",." + sectionKeyword + "-edit").show();
						$("#" + sectionKeyword + "-edit-" + currentId).hide();
					}
				});
				$("." + sectionKeyword + "-to-edit").hide();
				if (sectionId) $("." + sectionKeyword + "-edit.for-" + sectionId).click();
			}, // sections Function
			toggles: {
				selector: "",
				target: "",
				toggle: function(trigger) {
					trigger.toggleClass("expand collapse");
					trigger.find(".icon.expand, .icon.collapse").toggleClass("expand collapse");
					trigger.find(this.target + "-more, " + this.target + "-less").toggle();	
				}
			}, // toggles Object
			trackCursor: function(selector) {
				$(document).on("keyup mouseup", selector, function() {
					var $field = $(this);
					// Save cursor position so change-handlers may use it later:
					$field.data("trackCursorPosition", $field.getCursorPosition());
				});
				// Store initial "old" value
				return $(selector).each(function() {
					var $field = $(this);
					$field.data("trackCursorPosition", $field.getCursorPosition());
				});				
			}, // trackCursor Function
			/** Trigger a change event the instant a change occurs, instead of just after the field loses focus */
			instantChange: function(selector) {
				$(document).on("blur drop keyup paste", selector, function() {
					var $field = $(this);
					window.setTimeout($.proxy(function() {
						var oldValue = $field.data("instantChangeOldValue");
						if ($field.val() != oldValue) $field.trigger('change');
						// Still different? Then store *new* "old" value.
						if ($field.val() != oldValue) $field.data("instantChangeOldValue", $field.val());
					}, $field), 0);
				});
				// Store initial "old" value
				return $(selector).each(function() {
					var $field = $(this);
					$field.data("instantChangeOldValue", $field.val());
				});
			} // instantChange Function
		}); // Functions

		$.fn.extend({
			amounts: function() {
				$(document).on("change", this.selector, function() {
					var $field = $(this);
					var amountNew = $field.val();
					
					// Always allow user to set field contents to none
					if (amountNew.length == 0) return true;
					
					var amountOld = $field.data("instantChangeOldValue");
					
					var finalAmount;
					
					if ($field.hasClass("dollar")) finalAmount = $.amounts.enforceDollars(amountOld, amountNew);
					else if ($field.hasClass("cent")) finalAmount = $.amounts.enforceCents(amountOld, amountNew);
					else finalAmount = $.amounts.allowCents(amountOld, amountNew);

					// Disallow adjusted amount from over-running maxlength:
					if (finalAmount.length > $field.prop("maxLength")) finalAmount = amountOld;
					
					if (finalAmount != amountNew) {
						$field.val(finalAmount);
						// Restore cursor position:
						$field.setCursorPosition($field.data("trackCursorPosition") - 1);
					}
				});
				
				// Setup field to trigger change event instantly, on change, instead of after losing focus:
				$.instantChange(this.selector);
				
				// Stores required data to restore the correct cursor positions:
				$.trackCursor(this.selector);
				
				// If the initial value is invalid, set it to be reverted to an empty string:
				this.each(function() {
					$(this).data("instantChangeOldValue", "");
				});
				this.trigger("change");
				
				// For chaining:
				return this;
			}, // Amounts Method
			/** Automatically trigger a click on elements specified in the URL */
			autoshow: function() {
				var hash = window.location.hash;
				if (hash.length > 1) $(this).filter(hash).click();
				return this;
			}, // Autoshow Method
			/** Automatically adjust the height of the iFrame to fit its content */
			autoSizeFrames: function() {
				return $(this).load(function() {
					var $frame = $(this);
					var $parent = $frame.parent();
					var visibilityHack = $parent.css("display") == "none";					
					
					if (visibilityHack) $parent.css({'position':'absolute','visibility':'hidden','display':'block'});
					
					var theHeight = $frame.contents().height();
					
					//I.E7 fix if height == 0 use the following 					
					if (theHeight == 0) theHeight = $frame.contents().find("body").attr("scrollHeight");
					
					if (visibilityHack) $parent.css({'position':'static','visibility':'visible','display':'none'});
					
					$frame.css({height: theHeight - 1 + "px"});
				});
			}, // autoSizeFrames Method
			/** Automatically adjust the height of the iFrame for PopUps to fit its content */
			autoSizeIFrames: function() {

				return $(this).load(function() {
					
					//set $frame to current iFrame object
					var $frame = $(this);
					
					//Filter for the First Parent with an Display attribute of 'none'
					$invisibleParent = $frame.parents().filter(function() {					
						return $frame.css("display") == "none";
					}).first();
					
					//If Parent from above is found set useInvisibilityHack(boolean) for later use
					if ($invisibleParent) useInvisibilityHack = true;
					else  useInvisibilityHack = false;
															
					//If useInvisibilityHack is true set parent css attributes
					if (useInvisibilityHack) $invisibleParent.css({'position':'absolute','visibility':'hidden','display':'block'});
					
					//Get the iFrames content height 
					var theHeight = $frame.contents().height();
					
					//I.E7 fix if height == 0 use the following 
					if (theHeight == 0) theHeight = $frame.contents().find("body").attr("scrollHeight");
					
					//If useInvisibilityHack is true set Parent css attributes back to original values
					if (useInvisibilityHack) $invisibleParent.css({'position':'static','visibility':'visible','display':'none'});																							

					//Set the iFrame height
					$frame.css({height: theHeight - 1 + "px"});
				});
								
			}, // autoSizeIFrames Method			
			/**  Find out if an iframe does not have its own history yet */
			isFirstPage: function() {
				return this[0].contentWindow.location.href == this.attr("src");
			}, // isFirstPage Method
			/** http://stackoverflow.com/questions/2897155/get-caret-position-within-an-text-input-field */
			getCursorPosition: function() {
		        var input = this.get(0);
		        // No (input) element found:
		        if (!input) return;
		        // Standards-compliant browsers:
		        if ('selectionStart' in input) return input.selectionStart;
		        // IE:
		        else if (document.selection) {
		            //input.focus();
		            var sel = document.selection.createRange();
		            var selLen = document.selection.createRange().text.length;
		            sel.moveStart('character', -input.value.length);
		            return sel.text.length - selLen;
		        }
		    }, // getCursorPosition Method
			setCursorPosition: function(pos) {
				return this.each(function() {
					$field = $(this)[0];
					if ($field.setSelectionRange) {
						$field.setSelectionRange(pos, pos);
					} else if ($field.createTextRange) {
						var range = $field.createTextRange();
						range.collapse(true);
						range.moveEnd('character', pos);
						range.moveStart('character', pos);
						range.select();
					}
				});
			}, // setCursorPosition Method
			customMessages: function(uri) {
				this.load(uri, function(response, status, xhr) {
					if (status == "error" || $.trim(response).length == 0) {
						$(this).hide();
					}
				});
			},
			toggles: function(toggleTarget) {
				var toggles = $.toggles;
				toggles.selector = this.selector;
				toggles.target = toggleTarget;
				
				$(document).on("click", this.selector, function() {
					var toggles = $.toggles;
					var $trigger = $(this);
					if ($trigger.is(".expand")) {
						var $togglePanel = $trigger.closest(".toggle-panel");
						if ($togglePanel.hasClass("accordion"))
								$togglePanel.find(toggles.selector + ".collapse").filter(":visible").click();
					}
					var toggleId = null;
					$.each(this.className.split(/\s+/), function (index, className) {
						if (className.indexOf("for-") == 0) {
							toggleId = className.substr(4);
							if (toggleId == "")	toggleId = null;
							return false;
						}
					});
					if (toggleId != null) {
						$("#" + toggleId).filter(toggles.target).slideToggle();
						$(toggles.selector + ".for-" + toggleId).each(function() {
							toggles.toggle($(this));
						});
					} else {
						$trigger.next().slideToggle();
						toggles.toggle($trigger);
					}
				});
				return this;
			}, // Toggles Method
			whatFor: function() {
				var answer = null;
				$.each(this[0].className.split(/\s+/), function (index, className) {
					if (className.indexOf("for-") == 0) {
						var current = className.substr(4);
						if (current != "") {
							answer = current;
							return false;
						}
					}
				});
				return answer;
			},
			widgets: function() {
				// Reinitialize scripts for the new page content in the widget
				return this.ajaxComplete(function() {
					setupPlaceholders();
					reattachScripts();
				});
			} // Widgets Method
		}); // Methods
		
		// Placeholders
		if (typeof $.InFieldLabels != "undefined") {
			$.fn.extend({
				placeholders: function(options) {
					this.css({cursor: "text", position: "absolute", top: 0, left: 0, width: "auto"})
						.parent().css({position: "relative"});
					
			        return this.each(function() {
			        	var $placeholder = $(this);
						// Find the referenced input or textarea element
						var $field = $placeholder.prevAll(
									"input[type='text'], input[type='password'], select, textarea").first();
							
						if ($field.length == 0) return; // Nothing to attach
						
						if ($placeholder.not("label[for]")) {
							$placeholder.on("click", function() {
								$(this).prevAll(
										"input[type='text'], input[type='password'], select, textarea"
										).first().focus();
							});
						}
						
						var fieldLeft = $field.position().left;
						if (fieldLeft > 0) $placeholder.css({left: fieldLeft});
						
						$placeholder.css({fontSize: $field.css("fontSize")});
						
						// Only create object for input[text], input[password], or textarea
			            (new $.InFieldLabels(this, $field[0], options));
			        });
			    } // Placeholders Function
			});
		} // Placeholders

		// Pop-ups
		if (window.top.TopUp != "undefined") {
			$.extend({
				popups: {
					api: window.top.TopUp,
					close: function() {
						this.api.close();
					},
					confirm: function() {
						window.top.location = window.top.$.popups.confirmHref;
					},
					init: function() {
						$(".te_title").css({cursor: "default", fontSize: "14px"});
						$.popups.api.defaultPreset({
							effect: "transform",
							type: "iframe",
							scrolling: 0,
							shaded: 1//,
							
							//Comment to disable iFrame autosizing
							//ondisplay: window.top.setupIFrames
						});
					}, // init()
					presets: {
						"agreement": {
							width: 700,
							height: 490,
							resizable: 0
						},
						"agreement-scroller": {
							resizable: 0,
							scrolling: 1,
							width: 700,
							height: 490
						},						
						"call-out": {
							shaded: 0,
							overlayClose: 1
						},
						"confirm": {
							allowCancel: 0,
							width: 300,
							height: 150,
							resizable: 0
						},
						"pdf": {
							resizable: 1,
							scrolling: 1,
							width: "700px",
							height: "550px"
						},
						"content": {
							resizable: 0,
							scrolling: 1,
							width: "700px",
							height: "550px"
						}
					}
				}
			}); // Pop-ups Function
			$.fn.extend({
				popups: function(options, preset) {
					var popups = $.popups;
					if (preset in $.popups.presets) $.extend(options, $.popups.presets[preset]);
					// The "transform" effect does not work from within iframes.
					if (window.top !== window.self) {
						if($.browser.msie){
							options.effect = "show";
						}else{
							options.effect = "appear";
						}
					}
					popups.options = options;
					popups.withinPopUp = $("body").hasClass("pop-up");
					$(document).on("click", this.selector, function(event) {
						if ($.popups.withinPopUp) {
							//If anything needs to be performed within a popup nested in another popup
						}
						
						$trigger = $(this);
						event.preventDefault();
						var options = $trigger.data("popUpOptions");
						options.topUp = this;
						var popups = window.top.$.popups;
						
						if ($trigger.is("a[href]")) {
							popups.confirmHref = $trigger.prop("href");
							if (typeof options.href == "undefined") {
								popups.api.display(popups.confirmHref, options);
								return;
							}
						}
						popups.api.display(options.href, options);
					});
					return this.each(function() {
						// Copy options for trigger
						var options = $.extend({}, $.popups.options);
						$(this).data("popUpOptions", options);
					});
				}
			}); // Pop-ups Method
			TopUp.images_path = "/ConsumerStatic/default/img/top_up/";
			$(document).ready($.popups.init);
		} // Pop-ups
		
	})(jQuery);
}

function setupAmounts() {
	$("input.amount").amounts();
}

/** Apply autoshow plugin to tabs and toggles */
function setupAutoshow() {
	$(".toggle-trigger, .tabs").autoshow();
}

/** Setup Autotab JQuery Plugin to automatically move cursor between fields */
function setupAutotab(){
	$('form,input.phone-number').autotab_magic();
	$('input.social-security-number').autotab_filter("numeric");
	$('input.social-security-number').autotab_magic();
	$('#homePhone.areaCode').autotab_filter("numeric");
	$('input.card-expiration-date').autotab_filter("numeric");
	$('input.card-expiration-date').autotab_magic();
	$('input.date-of-birth').autotab_filter("numeric");
	$('input.enrollment').autotab_magic();
	
}

// Buttons:
function setupButtons() {
	$.fn.extend({
		enableButtonIf : function(determinant) {
			return $(this).prop("disabled", ! determinant)
					.toggleClass("brand", determinant)
					.toggleClass("disabled", ! determinant);
		},
		
		disableButtonIf : function(determinant) {
			return $(this).prop("disabled", determinant)
					.toggleClass("brand", ! determinant)
					.toggleClass("disabled", determinant);
		}
	});
	
	$(document).on("click", ".print-button", printPage)
			.on("click", ".clear-button", clearForm)
			.on("click", ".reset-button", resetForm);
	
	preventDoubleSubmit();
}

function printPage() {
	window.print();
}

// Setup agreement links:
function setupAgreementLinks() {
	$(document).on("click", ".agreement-link", function() {
		$(this).prevAll(":checkbox").prop("disabled", false);			
	});
}
  
//Setup agreement/terms&conditions checkboxes:
function setupAgreementCheckboxes() {
	$(".agreement-checkbox").each( function(){
		var $checkBox = $(this);
		if($checkBox.is(':checked'))$checkBox.prop('disabled',false);
	});
}


/** Preserve the value of hidden fields */
function clearForm() {
	// Use a whitelist of fields to minimize unintended side effects.
	$(':text, :password, :file, SELECT', this.form).val('');  
	// De-select any checkboxes, radios and drop-down menus
	$(':input', this.form).removeAttr('checked').removeAttr('selected');
}

/** Preserve value of sessionSync  */
function resetForm() {
	var field = $("input[name='sessionSync']", this.form);
	var sessionSync = "";
	if (field.length > 0)
		sessionSync = field.val();
	
	this.form.reset();
	
	if (field.length > 0)
		field.val(sessionSync);
}

function preventDoubleSubmit() {
	window.formSubmitCount = 0;
	
	$("form").submit(function() {
		formSubmitCount++;
		if ( formSubmitCount > 1 ) { 
			return false; 
		}
	});
}
// End of Buttons

function setupCustomMessages() {
	$("#custom-messages").customMessages("/site/custom-messages/retail/custom-messages.fhtml");
}

function setupDatepickers() {
	$("input.date-picker").datepicker({
		changeMonth:true,
		changeYear: true,
		gotoCurrent: true
	});
	$("input.time-picker").timepicker({
		addSliderAccess: true,
		ampm: true,
		dateFormat: $.datepicker.RFC_2822,
		hourGrid: 8,
		minuteGrid: 15,
		showTimezone: true,
	    sliderAccessArgs: { touchonly: false },
		timeFormat: 'h:mm tt z'
	});
	// Set to current: .datetimepicker("setDate", new Date());
	$("input.date-time-picker").datetimepicker({
		changeMonth:true,
		changeYear: true,
		gotoCurrent: true,
		addSliderAccess: true,
		ampm: true,
		dateFormat: 'm/d/yy',
		hourGrid: 8,
		minuteGrid: 15,
		showTimezone: true,
	    sliderAccessArgs: { touchonly: false },
		timeFormat: 'h:mm tt z'
	});
	if ($().MonthPicker) {
		var monthPickerField = $(".month-picker-field").MonthPicker({ShowIcon: false});
		
		// When the user clicks on the corresponding placeholder text, transfer the click event to the field:
		monthPickerField.next(".example").click(function() {
			monthPickerField.click();
			// Stop propagation so the picker doesn't close again as soon as it opens
			return false;
		});
	}
}

function setupPlaceholders() {    
	$(".example").placeholders();
}

function setupSections() {
	var $sectionId = $("#section-id");
	if ($sectionId.length) {
		$.sections("section", $sectionId.val(), function(sectionId) {
			$sectionId.val(sectionId);
		});
	}
}

function setupIFrames() {
	$(".te_content>iframe").autoSizeIFrames();
}

function setupSessionSync() {
	$.promoteSessionSyncToken();
}

function setupTabIndex() {
	var tabindex = 1;
	// On Non-Hidden Form Fields
	$("input,select,textarea,a.btn,button").not(":hidden, .no-tabindex").each(function() {
		$(this).attr("tabindex", tabindex);
		tabindex++;
	});
}

function setupTabs() {
	$(".tabs").tabs(".panes > .pane", {history: true});
	$(".pane>iframe").autoSizeFrames();
}

function setupTimeout() {
	//Set on Click event for all documents to run resetTimeout()
	$(document).on("click keypress", function () {
		resetTimeout();
	});
}

function resetTimeout() {
	if (typeof StopTimers == 'function'
		&& typeof StartTimers == 'function') {
		StopTimers();
        StartTimers();
	}
}

function setupToggles() {
	$(".toggle-trigger").toggles(".toggle");
}
function reattachScripts() {
	//Tooltips are hidden due to artifact tooltip being left on screen after ajax call
	$(".tooltip").hide();	

	setupTooltips();
}

function setupTooltips() {
	
	/** Save off the old width to prevent resizing during repositioning */
	var onBeforeShow = function(evt, pos) {		
		var $tip = this.getTip();
		$tip.data("tooltip_width", $tip.width());
	};

	/** Move the tooltip to keep from running over the side of the document */ 
	var onShow = function(evt, pos) {
		var tip = this.getTip();

		var oldWidth = tip.data("tooltip_width");
		var tipWidth;
		if (oldWidth) {
			tipWidth = oldWidth;
			tip.width(tipWidth);
		} else tipWidth = tip.width();
		
		var tipLeft = tip.offset().left;
		var tipRight = tipLeft + tip.outerWidth();
		if (tipRight - $(window).scrollLeft() > $(window).width()) {
			
			var trigger = this.getTrigger();		
			
			if(this.getConf().position=="center right"){
				tip.offset({top: trigger.offset().top + trigger.height(), left: tipLeft - tipWidth});
			}else{
				tip.offset({top: trigger.offset().top - (tip.height() + trigger.height()), left: tipLeft - (tipWidth+trigger.width())});
			}
		}
	};
	
	$(".tooltip-trigger-beside, img.error.icon").tooltip({
		
		position: "center right",
		
		onBeforeShow: onBeforeShow,
		
		onShow: onShow

	});
	
	$("img.quickhelp[title], .icons img[title], .icon[title], .tooltip-trigger[title]").tooltip({
		
		position: "top right",

		onBeforeShow: onBeforeShow,

		onShow: onShow
	
	});
}

function setupWidgets() {
	if($(".widget").length){
		$(document).widgets();
	}
}

function focusOnFirstField(){
	if ($(document.body).hasClass("suppress-auto-focus")) return;
	
	$field = $(".first-field:enabled").not(":hidden");
	if ($field.length == 0) $field = $(":input:enabled").not(":hidden");
	$field.first().focus();
}

//Apply first and last
function applyFirstLast() {
	$('ul li:last-child').addClass('last');
	$('.main-content table').addClass('last');
	$('.main-content table tr:last-child').addClass('last');
	$('.main-content table tr td:last-child').addClass('last');
	$('.main-content table tr th:last-child').addClass('last');
	$('.main-content div:last-child').addClass('last');
	$('span:last-child').addClass('last');
	
	$('.main-content table tr td:first-child').addClass('first');
	$('.main-content table tr th:first-child').addClass('first');
};


// Cleanup Offers list
/* 
 
$(".product").each(function() {
 $("li", this).each(function() {
  var $currentTile = $(this);
 });
});

 */
function cleanupOffersList(){
	$('.product-spotlight').each (function(){
		var $items = $('li', this);
		if ($items.length > 1) {
			//apply "odd" to jquery's even, which is actually odd
			$items.filter(':even').addClass('odd');
		}
		//if more than two offers 
		if ($items.length > 2) {
			$items.parent().addClass('borders');
			//and if there is an odd amount
			if ($items.length %2 != 0){
				$items.filter(':last-child').addClass('no-border');
			}
			// or if even amount
			else {
				$items.filter(':last-child').prev('li').andSelf().addClass("no-border");
			}
		}
	});
}