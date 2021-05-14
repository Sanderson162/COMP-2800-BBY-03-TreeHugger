$(() => {
    $("#history").click(() => {
        selectCard("#history");
        showHistory();
    });
    $("#comments").click(() => {
        selectCard("#comments");
        showComments();
    });
});

function selectCard(target) {
    $(".selected").removeClass("selected")
    $(target).addClass("selected")
}

function showHistory() {

}

function showComments() {
    getComments();
}

function getComments() {
    if (user) {
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
            $.ajax({
                url: "/ajax-get-comment-user",
                dataType: "json",
                type: "GET",
                headers: { 'CSRF-Token': Cookies.get("XSRF-TOKEN") },
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
        console.log("Not signed in");
    }
}

function spliceComments(data){
    if (data.length == 0){
        $("#results").html("<i>No results found</i>");
    } else {
        if (data.length > 10){
            let remainder = data.splice(11);
        }
        $("#results").html("");
        data.forEach(element => {
            $("#results").append(displayComment(element));
        });
    }
}
function displayComment(comment){
    //console.log(comment);
    let elem = $("<div class='card'>");
    elem.append($("<div class='emoji'>").html(comment.Icon))
    elem.append($("<div class='message'>").html(comment.Comment))
        
    let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.recordid=" + comment.Tree;
    $.getJSON(query, (tree) => {
        let t = $("<div class='tree'>");
        t.append($("<p></p>").html(tree.records[0].fields.genus_name+" "+tree.records[0].fields.species_name));
        t.append($("<p></p>").html(tree.records[0].fields.common_name));
        t.append($("<p></p>").html(tree.records[0].fields.on_street_block+" "+tree.records[0].fields.on_street+" "+tree.records[0].fields.neighbourhood_name));
    
        elem.append(t);
    })
    return elem;
}