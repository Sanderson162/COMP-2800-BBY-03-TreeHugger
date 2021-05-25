//displays the "history" page when url argument p = history
//otherwise it displays the saved tree
window.addEventListener("DOMContentLoaded",() => {
    firebase.auth().onAuthStateChanged(() => {
        if (getUrlVars()["p"]=="history"){
            showHistory();
        } else {
            $("#profile").hide();
            $("#profileContainer").hide();
            $("#title").html("Your Trees");
            showComments();
        }

    });
});

//displays user history
function showHistory() {
    var user = firebase.auth().currentUser;
    if (user) {
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
            $.ajax({
                url: "/ajax-get-history-user",
                dataType: "json",
                type: "POST",
                data: {idToken: idToken},
                success: (data) => {
                    spliceHistory(data);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.log("Error:" + textStatus);
                    return null;
                }
            });
        });
    } else {
        //user is nott logged in
        // should not be here.
        console.log("Not signed in");
        $("#results").html("");
    }
}

//shows the saved trees
function showComments() {
    var user = firebase.auth().currentUser;
    if (user) {
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
            $.ajax({
                url: "/ajax-get-comment-user",
                dataType: "json",
                type: "POST",
                data: {idToken: idToken},
                success: (data) => {
                    spliceComments(data);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.log("Error:" + textStatus);
                    return null;
                }
            });
        });
    } else {
        //user should not be here
        console.log("Not signed in");

    }
}

//displays all results if there are results
//otherwise displays "no results found"
function spliceComments(data){
    if (data.length == 0){
        $("#results").html("<i>No results found</i>");
    } else {
        $("#results").html("");
        data.forEach(element => {
            $("#results").append(displayComment(element));
        });
    }
}

//displays a comment
function displayComment(comment){
    let elem = $("<div class='card'>");
    elem.append($("<div class='emoji'>").html(comment.Icon))
    elem.append($("<div class='message'>").html(comment.Comment))
    elem.click(() =>{
        window.location = "./searchMap?id=" + comment.Tree;
    })
    
    let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.recordid=" + comment.Tree;
    $.getJSON(query, (tree) => {
        let t = $("<div class='tree'>");
        t.append($("<p class='common-name'></p>").html(tree.records[0].fields.common_name));
        t.append($("<p class='species-name'></p>").html(tree.records[0].fields.genus_name+" "+tree.records[0].fields.species_name));
        t.append($("<p class='street-name'></p>").html(tree.records[0].fields.on_street_block+" "+tree.records[0].fields.on_street+" "+tree.records[0].fields.neighbourhood_name));
    
        elem.append(t);
    })
    return elem;
}

//displays all results if there are results for history
//otherwise displays "no results found"
function spliceHistory(data){
    if (data.length == 0){
        $("#results").html("<i>No results found</i>");
    } else {
        $("#results").html("");
        data.forEach(element => {
            $("#results").append(displayHistory(element));
        });
    }
}

//displays one elemement of history
function displayHistory(comment){
    //console.log(comment);
    let elem = $("<div class='card history'>");
    let date = comment.date;
    console.log(JSON.stringify(date));
    elem.append($("<div class='message'>").html(date));
    elem.click(() =>{
        window.location = "./searchMap?id=" + comment.tree;
    })

    let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.recordid=" + comment.tree;
    $.getJSON(query, (tree) => {
        let t = $("<div class='tree'>");
        t.append($("<p class='common-name'></p>").html(tree.records[0].fields.common_name));
        t.append($("<p class='species-name'></p>").html(tree.records[0].fields.genus_name+" "+tree.records[0].fields.species_name));
        t.append($("<p class='street-name'></p>").html(tree.records[0].fields.on_street_block+" "+tree.records[0].fields.on_street+" "+tree.records[0].fields.neighbourhood_name));
    
        elem.append(t);
    })
    return elem;
}

// Url parsing function. Source: https://html-online.com/articles/get-url-parameters-javascript/
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}