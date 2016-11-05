function popPDFWin(url, pdfName) {
	
	// Set up the site catalyst object
	s=s_gi(s_account);

	// define all vars to be tracked
	s.linkTrackVars='prop17,prop24,eVar16,events';

	// define all props to be tracked
	s.linkTrackEvents='event13';
	
	// define any props used
	s.prop17='D=v16';
	if(typeof scatalyst.pageName !== 'undefined'){
		s.prop24=scatalyst.pageName;
	}
	
	// define eVars used
	s.eVar16=pdfName;

	// define any events used
	s.events='event13';
	
	// tl is the track link function
	s.tl(this,'d',pdfName);
	
	var win = window.open("","_blank", "scrollbars=yes,menubar=no,resizable=1,copyhistory=1,width=700, height=550");
	win.document.title = "Loading";
	win.location.href = url;
}
function popWin(url,width,height) {
	var isPDF = url.indexOf(".pdf");
	if (isPDF!=-1){
		var pdfName = url.split('/').pop().split('#')[0].split('?')[0];

		// Set up the site catalyst object
		s=s_gi(s_account);
		
		// define all vars to be tracked
		s.linkTrackVars='prop17,prop24,eVar16,events';

		// define all props to be tracked
		s.linkTrackEvents='event13';
		
		// define any props used
		s.prop17='D=v16';
		if(typeof scatalyst.pageName !== 'undefined'){
			s.prop24=scatalyst.pageName;
		}
		
		// define eVars used
		s.eVar16=pdfName;

		// define any events used
		s.events='event13';
		
		// tl is the track link function
		s.tl(this,'d',pdfName);
	}
	open (url,"NewWindow", "scrollbars=yes,menubar=no,resizable=1,copyhistory=1,width=" + width + ",height=" + height);
}
function getSSL(page) {
	return "https://" + window.location.hostname + page;
}
function getSSLOpen(page) {
	window.location=("https://" + window.location.hostname + page);
}
function getSSLPop(page) {
	window.open("https://" + window.location.hostname + page);
}
function siteDisclosure( linktype, ourSite, newSite, newSiteURL, newWindow ){
	var confirmValue;
	// Submit information to Site Catalyst regarding the exit link for accurate reporting
	// example of parameters passed
	// 'website', '${brands.bankFullName}', 'LinkedIn', '${brands.urlLinkedin}', 'yes'
	
	// Set up the site catalyst object
	s=s_gi(s_account);
	
	// Tracking variables
	s.linkTrackVars = 'campaign';
	
	// Create a variable to be used as a unique page identifier
	var siteCatalystReference = scatalyst.pageName+":"+newSite;
	
	// event98 defines this as an exit link
	s.events='event98';
	
	// Pulling the URL for the exit link and pass it to getQueryVariable to extract the tracking ID
	s.campaign=getQueryVariable(newSiteURL,"ecid");
	
	// tl is the track link function
	s.tl(this,'e',siteCatalystReference);
	// End of Site Catalyst code
	
	switch ( linktype ) {
		// Linking to an FNNI family site
		case "website":
			//extended copy (removed)
			//confirmValue = confirm( "Thanks for visiting " + ourSite + ". You are now leaving our website. Please be aware that any products and services accessed through this website are not provided by " + ourSite + ". " + newSite + " may have a privacy policy and security policy that are different from " + ourSite + ". Please review " + newSite + "'s privacy and security policies. For your convenience, " + ourSite + "'s web site will remain active, but for security purposes you will automatically be logged off after 10 minutes." );
			//abreviated copy (live)
			confirmValue = leaveSiteConfirmation(ourSite, newSite);
			break;
		default:
			confirmValue = 1;
	}//end switch
	if ( confirmValue ) {
		if (newWindow != "yes") {
			document.location=newSiteURL;
		}//end nested if
		else {
			window.open(newSiteURL);
		}//end else
	}//end if
}//end siteDisclosure
function leaveSiteConfirmation(ourSite, newSite) {
	return confirm("Thanks for visiting " + ourSite + ". You are now leaving our website. Please be aware that any products and services accessed through this website are not provided by " + ourSite + ". " + newSite + " may have a privacy policy and security policy that are different from " + ourSite + ". Please review " + newSite + "'s privacy and security policies.");
}
function siteDisclosureRewards( linktype, ourSite, newSite, newSiteURL, newWindow ){
	switch ( linktype ) {
		// Linking to an FNNI family site
		case "website":
			confirmValue = leaveSiteConfirmationRewards(ourSite, newSite, newSiteURL);
			break;
	}//end switch
	if ( confirmValue ) {
		if (newWindow != "yes") {
			document.location=newSiteURL;
		}//end nested if
		else {
			window.open("http://" + newSiteURL);
		}//end else
	}//end if
}//end siteDisclosure
function leaveSiteConfirmationRewards(ourSite, newSite, newSiteURL) {
	var confirmValue = confirm( "Please visit " + newSiteURL + "* for rewards information by clicking the OK button below.\n\n*Please be aware that any products and services accessed through this website are not provided by " +  ourSite + ". " + unescapeName(newSite) + " may have a privacy policy and security policy that are different from First National Bank of Omaha." );
	return confirmValue;
}

function unescapeName(newSite) {
	var newName = newSite.replace("&apos;", "'");
	return newName;
}

function getQueryVariable(url,variable)
{
	var queryString;
		
	if(url){
		queryString = url.substring( url.indexOf('?') + 1 );		
	}else{
		queryString = window.location.search.substring(1);
	}
	
	var vars = queryString.split("&");
	
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if(pair[0] == variable){return pair[1];}
	}
	
	return(false);
}
function FooterDate()
{
	var ftrDate=new Date();
	var ftrYear=ftrDate.getYear();
	if (ftrYear < 1000) {
	ftrYear = ftrYear + 1900;
}
	document.write(ftrYear);
}//end FooterDate
sendAjaxRequestForRatesData=function(getOrPost, urlToAccess, dataType, isCache, date_id, successFunction, failureFunction) {
	$.ajax({
		type: getOrPost,
		url: urlToAccess,
		dataType: dataType,
		cache:isCache,
		success:function(xml){
			//alert(successFunction);
			successFunction(xml,date_id);
		},
		error:function(jqXHR, textStatus, errorThrown){
			if((jqXHR.status == 404)&&(! typeof failureFunction==='undefined')){
				//XML file not found. Move to build next rates table if there are any.
				failureFunction;
			}
			else
				//unexpected error. Do not proceed to build more tables.
				return;
		}
	});
};

function ratesDateSuccess(xml,date_id){
	$(date_id).html($(xml).find("RATE_UPLOAD_DATE").text().split(" ")[0]);
}

function ratesAPYSuccess(xml,field_id){
	field_name=field_id.substring(1);
	
	$(xml).find("PRODUCT").each(function () {
		if(field_name=="cd-apy"){
			if($(this).find("ACCT_TYPE").text()=="60 Month"){
				$(field_id).html($(this).find("APY").text().slice(0,-1));
			}
		}else if(field_name=="savings-apy"){
			$(field_id).html($(this).find("APY").text().slice(0,-1));
		}else if(field_name=="checking-apy"){
			$(field_id).html($(this).find("APY").text().slice(0,-1));
		}
	});
}