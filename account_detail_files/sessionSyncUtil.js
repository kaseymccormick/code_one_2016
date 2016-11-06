function updateSessionSyncTokensFromAjaxResponse(html) {
	var newTokenValueFromHtmlResponse = $(html).find('input[name="sessionSync"]').val();				
	setSessionSyncValueInAllForms(newTokenValueFromHtmlResponse);
}

function setSessionSyncValueInAllForms(inValue){
	if (inValue != null) {
		$("input[name='sessionSync']").not("form#signOffForm input").val(inValue);
	}
}