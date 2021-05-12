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

async function getComments(){
    await $.ajax({
        url: "/ajax-get-comment-user",
        dataType: "json",
        type: "GET",
        headers: {'CSRF-Token': Cookies.get("XSRF-TOKEN")},
        success: (data)=>{
            spliceComments(data);
        },
        error: (jqXHR,textStatus,errorThrown )=>{
            console.log("Error:"+textStatus);
            return null;
        }
    });
}

function spliceComments(data){
    if (data.length == 0){
        $("#results").html("<i>No results found</i>");
    } else {
        if (data.length > 10){
            let remainder = data.splice(11);
        }
        $("#results").html("");
    }
}