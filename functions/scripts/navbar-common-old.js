function addNavbarCommon(currentPage) {
	let fileName = String(currentPage.split("/").slice(-1));

	let pagenames = new Map([
		['index.html', "Home"],
		['profile.html', "Profile"],
		['search.html', "Search"],
		['sessions.html', "Sessions"],
		['tutor-form.html', "Tutor Form"],
		['reviews.html', "Reviews"],
		['sessions-tutor.html', "Accept Session"],
		['login.html', "Login"]
	])

	if (!pagenames.has(fileName)) {
		fileName = 'index.html'
	}

	$("body").prepend(
		'<nav id="navBarCommonBar" class="navbar navbar-expand-xl navbar-dark bg-dark">'
		+	'	<a class="navbar-brand" href="">' + pagenames.get(fileName) + '</a>'
		+	'	<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">'
		+	'		<span class="navbar-toggler-icon"></span>'
		+	'	</button>'
		+	'	<div class="collapse navbar-collapse  " id="navbarNavAltMarkup">'
		+	'		<div class="d-flex justify-content-between">'
		+	'		<div class="navbar-nav d-inline-flex justifiy-content-start">'
		+	'			<a id="navButton_Home" class="nav-item nav-link" href="">Home</a>'
		+	'			<a id="navButton_Search" class="nav-item nav-link" href="search.html">Search</a>'
		+	'			<a id="navButton_Sessions" class="nav-item nav-link" href="sessions.html">Sessions</a>'
		+	'			<a id="navButton_Profile" class="nav-item nav-link" href="profile.html">Profile</a>'
		+	'		</div>'
		+	'		<div class="navbar-nav d-inline-flex">'
		+	'			<a id="navButton_Tutor" class="ml-auto nav-item nav-link" href="tutor-form.html">Tutor Form</a>'
		+	'			<a id="navButton_SessionsTutor" class="ml-auto nav-item nav-link" href="sessions-tutor.html">Tutor Sessions</a>'
		+	'			<a id="navButton_Reviews" class="ml-auto nav-item nav-link" href="reviews.html">Reviews</a>'
		+	'			<a id="navButton_Login"class="ml-auto nav-item nav-link" href="login">Log In</a>'
		+	'		</div>'
		+	'		</div>'
		+	'	</div>'
		+	'</nav>'
		);

		$('a[href="'+fileName+'"').addClass("active")

		$('#navButton_Profile').hide()
		$('#navButton_Sessions').hide()
		$('#navButton_Sessions').hide()
		$('#navButton_SessionsTutor').hide()
		$('#navButton_Reviews').hide()
		$('#navButton_Tutor').hide()

		firebase.auth().onAuthStateChanged(function (user) {
			if (user) {
				$('#navButton_Profile').show()
				$('#navButton_Sessions').show()
				$('#navButton_Tutor').show()
				$("#navButton_Login").text("Log Out")
				$("body").append(
					'<footer class="navbar fa-2x fixed-bottom bg-dark  justify-content-around" style="height: 65px;">'
					+'	<a style="color: #0062cc;" onclick="history.back()"><i class="fas fa-reply"></i></a>'
					+'	<a href="index.html"><i class="fas fa-home "></i></a>'
					+'	<a href="search.html"><i class="fas fa-search "></i></a>'
					+'	<a href="profile.html"><i class="fas fa-user-circle "></i></a>'
					+'	<a href="sessions.html"><i class="fas fa-calendar-week "></i></a>'
					+'</footer>'
					)
				$("#navButton_Login").click(function() {
					logout();
				});
				db.collection("Tutors").doc(user.uid).get()
			    .then(function(docSnapshot) {
					if(docSnapshot.exists) {
						console.log("exists");
						$('#navButton_SessionsTutor').show()
						$('#navButton_Reviews').show()
					}
				});
			}
		}
	)

}

function logout(){ //needed for logout functionality on logout button
    firebase.auth().signOut().then(function () { //if successful
		console.log("user logged out");
		window.location.assign("index.html");
	})
	.catch(function (error) {
		console.log("Error logging out: " + error);
	});

}

