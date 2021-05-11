
addNavbarCommon();
/**
 * @see Stirling Anderson
 */
function addNavbarCommon() {
	currentPage = window.location.pathname;
	let fileName = String(currentPage.split("/").slice(-1));

	let pagenames = new Map([
		['treefind.html', "Find Tree"],
		['profile.html', "Profile"],
		['about.html', "About"],
		['search.html', "Search"],
		['index.html', "Home"],
	])
	if (!pagenames.has(fileName)) {
		fileName = 'index.html'
	}
	//https://stackoverflow.com/questions/1577814/wrapping-a-div-around-the-document-body-contents
	var mainContainer = document.createElement("div");
	mainContainer.className = "main-container";
	
	// Move the body's children into this wrapper
	while (document.body.firstChild)
	{
		mainContainer.appendChild(document.body.firstChild);
	}
	document.body.appendChild(mainContainer);

	$("body").append('  <div class="nav-bar">        <div class="mb1">            <a href="index.html">                <svg class="list-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">                    <path d="M9 11L12 14L22 4" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    </svg>                                    </svg>            </a>        </div>        <div class="mb2">            <svg class="order-icon" width="24" height="24" viewBox="0 0 24 24" fill="none"                xmlns="http://www.w3.org/2000/svg">                <path                    d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"                    stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />                <path d="M3 6H21" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />                <path                    d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"                    stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />            </svg>        </div>        <div class="mb3">            <a href="profile.html">                <svg class="profile-icon" width="24" height="24" viewBox="0 0 24 24" fill="none"                    xmlns="http://www.w3.org/2000/svg">                    <path                        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"                        stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />                    <path                        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"                        stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />                </svg>            </a>        </div>    </div>');
	// $('a[href="' + fileName + '"').addClass("active")
}

