/**
 * Loads the event listeners for the menu buttons.
 * @author Aidan 
 */ 
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
    $("#birth").click();
});

//highlights a selected card, unhighlights the others
function selectCard(target) {
    $(".selected").removeClass("selected")
    $(target).addClass("selected")
}

/**
 * loads the form for birth tree
 * @author Aidan
 */
function loadBirthForm() {
    $("#result").html("");
    let f = $("#form").html("");
    f.append($("<span id='logo'>🎁</span>"))
    f.append($("<br><input id='name' placeholder='Name'>"));
    f.append("");
    f.append($("<br><span></span><input type='date' id='date'>"));
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

/** 
 * loads the form for the anniversary tree
 * @author Aidan
 */
function loadAnniversaryForm() {
    $("#result").html("");
    let f = $("#form").html("");
    f.append($("<span id='logo'>💕</span>"))
    f.append($("<br><input id='name1' placeholder='Name'>"));
    f.append("");
    f.append($("<input id='name2' placeholder='Partners Name'>"));
    f.append("");
    f.append($("<br><span></span><input type='date' id='date'>"));
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

/**
 * Loads the event form
 * @author Aidan
 */
function loadEventForm() {
    $("#result").html("");
    let f = $("#form").html("");
    f.append($("<span id='logo'>🎉</span>"))
    f.append("<br>");
    f.append($("<input id='name' placeholder='Event Name'>"));
    f.append($("<br><span></span><input type='date' id='date' placeholder='YYYY-MM-DD'>"));
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

/**
 * click event for form submission
 * @param {Object} type 
 * @returns null
 * @author Aidan
 */
function submit(type) {
    //form validation
    if (!validForm()){
        $("#formmsg").html("Invalid input, try again");
        return;
    }
    $("#formmsg").html("")

    //query by date (find exact match)
    let q = $("#date").val();
    console.log(q.toString());
    let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.date_planted=" + q.toString();
    $.getJSON(query, (data) => {
        console.log(data);
        removeNoGeom(data.records);
        console.log(data);
        if (data.records.length > 0) {
            let x = data.records[Math.floor(Math.random() * data.records.length)]
            $("#result").html("")
            $("#result").append(displayTree(x,type.match,saveButton(x, type.message, type.emoji)));
        } else {
            // no exact match
            alternateTree(q, type);

        }
    });
}

/**
 * performs form validation to ensure name and date fields are filled in correctly
 * @returns boolean
 * @author Aidan
 */
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
    //checks for ####-##-##
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!($("#date").val().match(regex))){
        console.log($("#date").val())
        console.log("invalid date")
        return false;
    }
    return true;
}

//looks for an alternate tree if there is no exact match
async function alternateTree(q, type){
    //find one in the same month
    let x = await findClosest(q, type);
    console.log(x);
    if (x) {
        return;
    }
    //find with a different year but the same day and month
    x = await differentYear(q, type)
    if (x){
        return;
    }
    //no result found
    $("#result").html("");
    $("#result").append($("<div class='card'>)").append(type.fail));
}

/**
 * inds a tree between 1989 and 2022 with the same day and month
 * @param {String} date 
 * @param {Object} type 
 * @returns Obejct the first tree it finds. 
 * @author Aidan
 */
async function differentYear(date, type){
    let monthDay = date.toString().substring(4);
    let x = [];
    for (year = 1989; year <= 2022; year++){
        let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.date_planted="
        await $.getJSON(query+year+monthDay, (data) => {
            removeNoGeom(data.records);
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

/**
 * finds the trees in the same month
 * @param {String} date 
 * @param {Object} type 
 * @returns boolean
 */
async function findClosest(date, type) {
    let month = date.toString().substring(0, 7);
    let day = date.toString().substring(8);
    let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.date_planted=" + month;
    let x;
    await $.getJSON(query, (data) => {
        removeNoGeom(data.records);
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



/**
 * given trees in the same month, finds the closest. 
 * @param {*} data 
 * @param {*} month 
 * @param {*} day 
 * @returns returns a tree
 * @author Aidan
 */
function closestTree(data, month, day) {
    let d = parseInt(day);
    let x = [];
    for (let i = 1; i <= 31; i++) {
        data.records.forEach((entry) => {
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

/**
 * displays the tree
 * @param {Object} entry 
 * @param {String} message 
 * @param {Object} saveBtn 
 * @returns a dom element
 */
function displayTree(entry,message,saveBtn) {
    let elem = $("<div></div>").addClass("card");
    elem.append($("<span style='color:darkgray;text-align:left;font-size:80%;'></span>").html(message + "<br><br>"));
    elem.append($("<p class='common-name' style='text-align:left'></p>").html(entry.fields.common_name +"<br><br>"));
    elem.append($("<p class='species-name' style='text-align:left'></p>").html(entry.fields.genus_name + " " + entry.fields.species_name +"<br><br>"));
    elem.append($("<p class='street-name' style='text-align:left'></p>").html(entry.fields.on_street_block + " " + entry.fields.on_street + " " + entry.fields.neighbourhood_name +"<br><br>"));
    elem.append($("<p  style='text-align:left;color:darkgray;'></p>").html("Planted on " + entry.fields.date_planted));
    elem.append(saveBtn);
    elem.append(viewButton(entry.recordid));


    return elem;
}

/**
 * returns a button with a link to the tree
 * @param {object} tree 
 * @returns a dom element
 * @author Aidan
 */
function viewButton(tree){
    let btn = $("<button id='viewbtn'>View</button>");
    btn.click(() =>{
        window.open("./searchMap?id=" + tree);
    })
    return btn
}

/**
 * Generates the save button
 * if the user is not logged in it displays a warning
 * @param {*} tree 
 * @param {*} message 
 * @param {*} emoji 
 * @returns returns a dom element
 */
function saveButton(tree, message, emoji) {
    let btn = $("<button id='save'>Save</button>");
    btn.on("click", (elem) => {
        var user = firebase.auth().currentUser;
        if (user) {
            let elem = $("#save");
            elem.attr("disabled", true);
            elem.html("Saved");
            console.log(tree);
            addComment(tree.recordid, message, emoji);
        } else {
            alert("Must be logged in to save")
        }

    });
    return btn;
}

/**
 * In-place removal of objects in the array without geometry data.
 * @param {Array} a 
 */
function removeNoGeom(a) {
    if (a.length>0){
        for(i=0;i<a.length;i++){
            console.log(a);
            console.log(i);
            console.log(a[i])
            if (a[i].fields.geom==undefined){
                a.splice(i,1);
                i = i - 1;
            }
        }
    }
}