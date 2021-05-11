$(document).ready(() => {
    $("#birth").click(() => {
        selectCard("#birth");
        loadBirthForm();
    });
    $("#anniversary").click(() => {
        selectCard("#anniversary");
        loadAnniversaryForm()
    });
    $("#event").click(() => {
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
    f.append($("<br><span>on <span><input type='date' id='date'>"));
    f.append($("<br><button type='button' id='loadmore'>Search</button>").click(() => {
        submit({
            match: "Found " + $("#name").val() + "'s birth tree",
            close: "Here's the closest match for " + $("#name").val() + "'s birth tree",
            fail: "Sorry, we couldn't find a tree for " + $("#name").val(),
            emoji: "🎁",
            message: $("#name").val() + "'s birth tree"
        });
    }));
}
function loadAnniversaryForm() {
    $("#result").html("");
    let f = $("#form").html("");
    f.append($("<input id='name1'>"));
    f.append(" and ");
    f.append($("<input id='name2'>"));
    f.append("'s anniversary ");
    f.append($("<input type='date' id='date'>"));
    f.append($("<button type='button' id='loadmore'>Search</button>").click(() => {
        submit({
            match: () => {
                return "Found a tree for " + $("#name1").val() + " and " + $("#name2").val();
            },
            close: () => {
                return "Here's the closest match for " + $("#name1").val() + " and " + $("#name2").val();
            },
            fail: () => {
                return "Sorry, we couldn't find a tree for " + $("#name1").val() + " and " + $("#name2").val();
            }
        });
    }));
}
function loadEventForm() {
    $("#result").html("");
    let f = $("#form").html("");
    f.append("Event:");
    f.append($("<input id='name'>"));
    f.append($("<input type='date' id='date'>"));
    f.append($("<button type='button' id='loadmore'>Search</button>").click(() => {
        submit({
            match: () => {
                return "Found a tree for " + $("#name").val();
            },
            close: () => {
                return "Here's the closest match for " + $("#name").val();
            },
            fail: () => {
                return "Sorry, we couldn't find a tree for " + $("#name").val();
            }
        });
    }));
}
function submit(type) {
    let q = $("#date").val();
    console.log(q.toString());
    let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.date_planted=" + q.toString();
    $.getJSON(query, (data) => {
        console.log(data);
        if (data.records.length > 0) {
            let x = data.records[Math.floor(Math.random() * data.records.length)]
            $("#result").html("")
            $("#result").append(type.match);
            $("#result").append(displayTree(x));
            $("#result").append(saveButton(x,type.message,type.emoji))
        } else {
            if (!findClosest(q, type)) {
                $("#result").html("");
                $("#result").append(type.fail);
            }

        }
    });
}
function findClosest(date, type) {
    let month = date.toString().substring(0, 7);
    let day = date.toString().substring(8);
    let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.date_planted=" + month;
    console.log(query);
    $.getJSON(query, (data) => {
        if (data.records.length > 0) {
            let x = closestTree(data, month, day);
            $("#result").html("");
            $("#result").append(type.close);
            $("#result").append(displayTree(x));
            $("#result").append(saveButton(x,type.message,type.emoji))
            return true;
        }
        return false;
    });
}

function closestTree(data, month, day) {
    let d = parseInt(day);
    let x = [];
    for (let i = 1; i <= 31; i++) {
        data.records.forEach((entry) => {
            if ((entry.fields.date_planted.toString() == month + "-" + (d - i)) || (entry.fields.date_planted.toString() == month + "-" + (d + i))) {
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

function displayTree(entry) {
    let elem = $("<div></div>").addClass("card");
    elem.append($("<p></p>").html(entry.fields.genus_name + " " + entry.fields.species_name));
    elem.append($("<p></p>").html(entry.fields.common_name));
    elem.append($("<p></p>").html(entry.fields.on_street_block + " " + entry.fields.on_street + " " + entry.fields.neighbourhood_name));
    elem.append($("<p></p>").html("Planted on: " + entry.fields.date_planted));

    return elem;
}

function saveButton(tree,message,emoji) {
    let btn = $("<button id='save'>save</button>");
    btn.on("click",()=>{
        let elem = $("#save");
        elem.attr("disabled", true);
        elem.html("saved");
        console.log(tree);
        addComment(tree.recordid,message,emoji);
    });
    return btn;
}