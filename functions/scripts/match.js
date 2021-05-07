$(document).ready(()=>{
    $("#birth").click(()=>{
        selectCard("#birth");
        loadBirthForm();
    });
    $("#anniversary").click(()=>{
        selectCard("#anniversary");
        loadAnniversaryForm()
    });
    $("#event").click(()=>{
        selectCard("#event");
        loadEventForm()
    });
});
function selectCard(target){
    $(".selected").removeClass("selected")
    $(target).addClass("selected")
}
function loadBirthForm(){
    $("#result").html("");
    let f = $("#form").html("");
    f.append($("<input id='name'>"));
    f.append("'s birthday ");
    f.append($("<input type='date' id='date'>"));
    f.append($("<button type='button' id='loadmore'>Search</button>").click(()=>{submit("birthday")}));
}
function loadAnniversaryForm(){
    $("#result").html("");
    let f = $("#form").html("");
    f.append($("<input id='name1'>"));
    f.append(" and ");
    f.append($("<input id='name2'>"));
    f.append("'s anniversary ");
    f.append($("<input type='date' id='date'>"));
    f.append($("<button type='button' id='loadmore'>Search</button>").click(()=>{submit("anniversary")}));
}
function loadEventForm(){
    $("#result").html("");
    let f = $("#form").html("");
    f.append("Event:");
    f.append($("<input id='name'>"));
    f.append($("<input type='date' id='date'>"));
    f.append($("<button type='button' id='loadmore'>Search</button>").click(()=>{submit("event")}));
}
function submit(type){
    let q = $("#date").val();
    console.log(q.toString());
    let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.date_planted="+q.toString(); 
    console.log(query);
    $.getJSON(query, (data) => {
        console.log(data);
        if (data.records.length>0){
            let x = data.records[Math.floor(Math.random() * data.records.length)]
            $("#result").html("")
            $("#result").append(displayTree(x));
        } else {
            query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.date_planted="+q.toString().substring(0,7); 
            console.log(query);
            $.getJSON(query, (data) => {
                if(data.records.length>0){
                    let x = data.records[Math.floor(Math.random() * data.records.length)]
                    $("#result").html("")
                    $("#result").append(displayTree(x));
                }
            });
        }
    });
}
function displayTree(entry){
    let elem = $("<div></div>").addClass("card");
    elem.append($("<p></p>").html(entry.fields.genus_name+" "+entry.fields.species_name));
    elem.append($("<p></p>").html(entry.fields.common_name));
    elem.append($("<p></p>").html(entry.fields.on_street_block+" "+entry.fields.on_street+" "+entry.fields.neighbourhood_name));
    elem.append($("<p></p>").html("Planted on: " + entry.fields.date_planted));

    return elem;
}