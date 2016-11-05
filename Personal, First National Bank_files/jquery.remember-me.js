(function($){
	$.fn.rememberme = function(options) {
      
		var defaults = {
			rememberMeCheckboxId: "remember-id",
			cookieKey: "remembered-uids"
		};
		var options = $.extend(defaults, options);
		
		return this.each(function() {
			var userField = this;
			
			buildRememberedUsersDiv();
			
			$(userField).focus(function(){
				if (getCurrentUidArray().length > 0){
					$("#remembered-div").css('display', 'inline');
				}
			});
			
			//Register on Form Submit event to trigger saving UserId if Remember Me Checked
			$(userField).parents("form").submit(function(){
				var rememberMeCheckbox = $("#" + options.rememberMeCheckboxId);
				if (rememberMeCheckbox.attr("checked") && $.trim($(userField).val()).length > 0 ){
					addUid( $(userField).val() );
				}
				else {
					removeUid( $(userField).val() );
				}
			});
			
			function buildRememberedUsersDiv(){
				var linksHtml = "<div id='remembered-div'>"; 
				linksHtml += "<table id='remembered-table'><tr class='title'><th>My User IDs</th>";
				linksHtml += "<td class='right'><a href='#' id='hide-uid-link'>close</a></td></tr>";
				linksHtml += "";
				var uidArray = getCurrentUidArray();
				for (var i=0; i < uidArray.length; i++){
					linksHtml += buildUidLink(uidArray[i]);
				}
				linksHtml += "</table>";
				linksHtml += "</div>";
				
				$("#remembered-div").remove(); //remove the old div from the DOM
				$(userField).after(linksHtml); //attach the new div right after the user field
				
				setPositionToBelowUserField();
				
				registerEventHandlersOnNewDiv();
			}
			
			function htmlEncode(value){
				  return $('<div/>').text(value).html();
			}
			
			function buildUidLink(uid){
				if (isAlphaNumericOnly(uid)) {
					var linkText = "<tr>";
					linkText += "<td><a href='#' class='select-userlink' id='c_" + uid + "'>" + uid + "</a></td>";
					linkText += "<td class='right'><a href='#' class='remove-userlink' id='d_" + uid + "'>remove</a></td>";
					linkText += "</tr>";
					return linkText;
				} else {
					return "";
				}
			}
			
			function registerEventHandlersOnNewDiv(){
				$("a.select-userlink").click(function(){
					var chosenValue = $(this).attr("id");
					$(userField).val(chosenValue.substring(2)); //remove prefix "c_"
					$("#" + options.rememberMeCheckboxId).attr("checked", "checked");
					$("#remembered-div").hide();
				});
				
				$("a.remove-userlink").click(function(){
					var chosenValue = $(this).attr("id");
					removeUid(chosenValue.substring(2)); //remove prefix "d_"
					$("#remembered-div").hide();
				});
				
				$("#hide-uid-link").click(function(){
					$("#remembered-div").hide();
				});
			}
			
			function setPositionToBelowUserField(){
				var userFieldPosition = $(userField).position();
				var userFieldLeft = userFieldPosition.left;
				var userFieldBottom = userFieldPosition.top + $(userField).outerHeight();
				$("#remembered-div").css('top', userFieldBottom).css('left', userFieldLeft);
			}
			
			function getCurrentUidArray(){
				var uidArray = new Array();
				var pipedNamesStored = $.cookie(options.cookieKey);
				if (pipedNamesStored != null && pipedNamesStored != ''){
					uidArray = pipedNamesStored.split("|");
				}
				return uidArray;
			}
			
			function addUid(newValue){
				if (isAlphaNumericOnly(newValue)) {
					newValue = htmlEncode(newValue);
					var uidArray = getCurrentUidArray();
					var valueCurIndex = $.inArray(newValue, uidArray);
					if (valueCurIndex == -1){
						uidArray.push(newValue);
						saveArrayToCookie(uidArray);
					}
				}
			}
			
			function removeUid(removeValue){
				removeValue = htmlEncode(removeValue);
				var newArray = new Array();
				var uidArray = getCurrentUidArray();
				if (uidArray && uidArray[0] != ''){
					for (var i=0; i < uidArray.length; i++){
						if (uidArray[i] != removeValue){
							newArray.push(uidArray[i]);
						}
					}
				}
				saveArrayToCookie(newArray);
			}
			
			function isAlphaNumericOnly(value) {
				var exp = /^[0-9a-zA-Z]+$/;
				if (value.match(exp)) {
					return true;
				}
				return false;
			}
			
			function saveArrayToCookie(uidArray){
				$.cookie(options.cookieKey, uidArray.join("|"), {path: '/', expires:3650});
				buildRememberedUsersDiv();
			}
		});  
	};
})(jQuery);