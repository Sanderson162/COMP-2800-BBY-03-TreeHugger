$(document).ready(() => {
    $("#form").hide();
    $("#birth").click(() => {
        $("#form").show();
        selectCard("#birth");
        loadBirthForm();
    });
    $("#anniversary").click(() => {
        $("#form").show();
        selectCard("#anniversary");
        loadAnniversaryForm()
    });
    $("#event").click(() => {
        $("#form").show();
        selectCard("#event");
        loadEventForm()
    });
});
function selectCard(target) {
    $(".selected").removeClass("selected")
    $(target).addClass("selected")
}
function loadBirthForm() {
    $("#result").html("");
    let f = $("#form").html("");
    f.append($("<span id='logo'>🎁</span>"))
    f.append($("<br><input id='name' placeholder='name'>"));
    f.append("'s birthday ");
    f.append($("<br><span>on </span><input type='date' id='date'>"));
    f.append($("<br><button type='button' id='loadmore'>Search</button>").click(() => {
        submit({
            match: "Found " + $("#name").val() + "'s birth tree"+":",
            close: "Here's the closest match for " + $("#name").val() + "'s birth tree"+":",
            fail: "Sorry, we couldn't find a tree for " + $("#name").val() + "😥",
            emoji: "🎁",
            message: $("#name").val() + "'s birth tree"
        });
    }));
    f.append($("<span id='formmsg'>"));
}
function loadAnniversaryForm() {
    $("#result").html("");
    let f = $("#form").html("");
    f.append($("<span id='logo'>💕</span>"))
    f.append($("<br><input id='name1' placeholder='name'>"));
    f.append(" and ");
    f.append($("<input id='name2' placeholder='name'>"));
    f.append("'s anniversary ");
    f.append($("<br><span>on </span><input type='date' id='date'>"));
    f.append($("<br><button type='button' id='loadmore'>Search</button>").click(() => {
        submit({
            match: "Found a tree for " + $("#name1").val() + " and " + $("#name2").val()+":",
            close: "Here's the closest match for " + $("#name1").val() + " and " + $("#name2").val()+":",
            fail: "Sorry, we couldn't find a tree for " + $("#name1").val() + " and " + $("#name2").val(),
            emoji: "💕",
            message: $("#name1").val() + " and " + $("#name2").val() + "'s anniversary tree"
        });
    }));
    f.append($("<span id='formmsg'>"));
}
function loadEventForm() {
    $("#result").html("");
    let f = $("#form").html("");
    f.append($("<span id='logo'>🎉</span>"))
    f.append("<br>");
    f.append($("<input id='name' placeholder='name of event'>"));
    f.append($("<br><span>on </span><input type='date' id='date'>"));
    f.append($("<br><button type='button' id='loadmore'>Search</button>").click(() => {
        submit({
            match: "Found a tree for " + $("#name").val()+":",
            close: "Here's the closest match for " + $("#name").val()+":",
            fail: "Sorry, we couldn't find a tree for " + $("#name").val(),
            emoji: "🎉",
            message: $("#name").val()
        });
    }));
    f.append($("<span id='formmsg'>"));
}
function submit(type) {
    if (!validForm()){
        $("#formmsg").html("Invalid input, try again");
        return;
    }
    $("#formmsg").html("")
    let q = $("#date").val();
    console.log(q.toString());
    let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.date_planted=" + q.toString();
    $.getJSON(query, (data) => {
        console.log(data);
        if (data.records.length > 0) {
            let x = data.records[Math.floor(Math.random() * data.records.length)]
            $("#result").html("")
            $("#result").append(displayTree(x,type.match,saveButton(x, type.message, type.emoji)));
        } else {
            alternateTree(q, type);

        }
    });
}

function validForm(){
    if ($("#name").length && !($("#name").val())){
        console.log("invalid name")
        return false;
    }
    if ($("#name1").length && !($("#name1").val())){
        console.log("invalid name1")
        return false;
    }
    if ($("#name2").length && !($("#name2").val())){
        console.log("invalid name2")
        return false;
    }
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!($("#date").val().match(regex))){
        console.log($("#date").val())
        console.log("invalid date")
        return false;
    }
    return true;
}

async function alternateTree(q, type){
    let x = await findClosest(q, type);
    console.log(x);
    if (x) {
        return;
    }
    x = await differentYear(q, type)
    if (x){
        return;
    }
    $("#result").html("");
    $("#result").append($("<div class='card'>)").append(type.fail));
}


async function differentYear(date, type){
    let monthDay = date.toString().substring(4);
    let x = [];
    for (year = 1989; year <= 2022; year++){
        let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.date_planted="
        await $.getJSON(query+year+monthDay, (data) => {
            if (data.records.length > 0){
                data.records.forEach((entry)=>{
                    x.push(entry)
                });
            }
        })
        if (x.length>0){
            let tree = x[Math.floor(Math.random() * x.length)]
            $("#result").html("");
            $("#result").append(displayTree(tree,type.close,saveButton(tree, type.message, type.emoji)));
            return true;
        } 
    }
    return false;
    

}
async function findClosest(date, type) {
    let month = date.toString().substring(0, 7);
    let day = date.toString().substring(8);
    let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.date_planted=" + month;
    console.log(query);
    let x;
    await $.getJSON(query, (data) => {
        console.log(data.records.length);
        if (data.records.length > 0) {
            let x = closestTree(data, month, day);
            $("#result").html("");
            $("#result").append(displayTree(x, type.close,saveButton(x, type.message, type.emoji)));
            x = true;
            return;
        }
        x = false;
    });
    return x;
}

function closestTree(data, month, day) {
    let d = parseInt(day);
    let x = [];
    for (let i = 1; i <= 31; i++) {
        console.log("" + (d-i)+(d+i));
        data.records.forEach((entry) => {
            console.log(entry.fields.date_planted.toString());
            if ((entry.fields.date_planted.toString() == month + "-" + (d - i)) || (entry.fields.date_planted.toString() == month + "-" + (d + i))) {
                x.push(entry);
            } else if ((entry.fields.date_planted.toString() == month + "-0" + (d - i)) || (entry.fields.date_planted.toString() == month + "-0" + (d + i))) {
                x.push(entry);
            }
        });
        if (x.length > 0) {
            console.log(x);
            return x[Math.floor(Math.random() * x.length)];
        }
    }
    console.log("error");
}

function displayTree(entry,message,saveBtn) {
    let elem = $("<div></div>").addClass("card");
    elem.append(message);
    elem.append($("<p></p>").html(entry.fields.genus_name + " " + entry.fields.species_name));
    elem.append($("<p></p>").html(entry.fields.common_name));
    elem.append($("<p></p>").html(entry.fields.on_street_block + " " + entry.fields.on_street + " " + entry.fields.neighbourhood_name));
    elem.append($("<p></p>").html("Planted on: " + entry.fields.date_planted));
    elem.append(saveBtn);

    return elem;
}

function saveButton(tree, message, emoji) {
    let btn = $("<button id='save'>Save</button>");
    btn.on("click", () => {
        var user = firebase.auth().currentUser;
        if (user) {
            let elem = $("#save");
            elem.attr("disabled", true);
            elem.html("saved");
            console.log(tree);
            addComment(tree.recordid, message, emoji);
        } else {
            alert("Must be logged in to save")
        }

    });
    return btn;
}