"use strict";
addNavbarCommon();
/**
 * Displays the nav bar with the correct selected menu item highlighted. 
 * @see Stirling Anderson
 */
function addNavbarCommon() {
	let currentPage = window.location.pathname;
	let directory = String(currentPage.split("/").slice(-1));
	let pagenames = new Map([
		['treefind', "Find Tree"],
		['profile', "Profile"],
		['login', "Profile"],
		['search', "Search"],
		['home', "Home"],
		['aboutus', "Home"]
	])
	let indexLink = "home";
	let profileLink = "profile";
	let searchLink = "search";
	let treeFindLink = "treefind";
	if (!pagenames.has(directory)) {
		directory = '/'
	}
	if (directory == "login") {
		directory = 'profile';
	}
	wrapBody();
	$("body").append('    <div class="nav-bar">        <div class="mb1">            <a href="'+ indexLink +'">                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    <path d="M9 22V12H15V22" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                </svg>                                                                   </a>        </div>        <div class="mb2">            <a href="'+ treeFindLink +'">                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    </svg>                                                  </a>        </div>        <div class="mb3">            <a href="'+ searchLink +'">                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">                    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    <path d="M20.9999 21L16.6499 16.65" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    </svg>                                               </a>        </div>        <div class="mb4">            <a href="'+ profileLink +'">                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                    </svg>                                                 </a>        </div>    </div>');
	$('a[href="' + directory + '"').addClass("highlight")
}
/** 
 * Wraps the body in a main-container div. 
 * @see https://stackoverflow.com/questions/1577814/wrapping-a-div-around-the-document-body-contents
 */
function wrapBody() {
	let mainContainer = document.createElement("div");
	mainContainer.className = "main-container";
	while (document.body.firstChild)
	{
		mainContainer.appendChild(document.body.firstChild);
	}
	document.body.appendChild(mainContainer);
}
