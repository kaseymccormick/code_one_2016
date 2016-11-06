function lastBankingAppUsedCookieExists() {
	var cookieExists = jQuery.cookie('lastBankingApplicationUsed')!=null;
	return cookieExists;
}
function lastBankingAppUsedRelativeUrl() {
	var url = jQuery.cookie('lastBankingApplicationUsed').replace(/\"/g,'')
	return url;
}
jQuery(document).ready(function() {
		if (lastBankingAppUsedCookieExists()) {
			var href = lastBankingAppUsedRelativeUrl(); 
			jQuery('#lastBankingAppLink').attr('href',href);
		}
});
