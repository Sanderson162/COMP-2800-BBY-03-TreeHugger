var searchType = "genus";

var page=0;

$(document).ready(()=>{
    setSearchType();
    setHeader();
    loadOptions();
    $("#query").change(()=>{
        page = 0;
        let results = $("#searchResults");
        results.html("");
        search();
    });
});

function setSearchType(){
    let type = getUrlVars().q;
    if (type == "common" || type == "species") {
        searchType = type;
    }
}

function setHeader(){
    $("#main").prepend($("<h1></h1>").html("Search by " + searchType + " name"));
}

function loadOptions(){
    let query = "https://opendata.vancouver.ca/api/v2/catalog/datasets/street-trees/facets?facet="+searchType+"_name&timezone=UTC"
    $.getJSON(query, (data) => {
        $.each(data.facets[0].facets, function (i, entry) {
            
            $("#data").append($("<option></option>").val(entry.name));
        });
        
    })
    
}

function search(){
    let q = $("#query").val()
    if (q.length>3){
        $("#loadmore").remove();
        let results = $("#searchResults");
        console.log(q);
        q = q.toUpperCase();
        let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine."+searchType+"_name="+q+"&start="+page*10 
        $.getJSON(query, (data) => {
            if (data.records.length == 0){
                results.html("<i>No results found...</i>");
            }
            $.each(data.records, function (i, entry) {
                console.log(entry);
                results.append(displayTree(entry))
            });
            if (data.records.length==10){
                results.append(loadMoreButton());
            }
        });
    }
}

function loadMoreButton(){
    let b = $("<button type='button' id='loadmore'>Load more</button>") ;
    b.click(()=>{
        page+=1;
        search()
    });
    return b;
}

function displayTree(entry){
    let elem = $("<div></div>").addClass("card");
    elem.append($("<p></p>").html(entry.fields.genus_name+" "+entry.fields.species_name));
    elem.append($("<p></p>").html(entry.fields.common_name));
    elem.append($("<p></p>").html(entry.fields.on_street_block+" "+entry.fields.on_street+" "+entry.fields.neighbourhood_name));
    return elem;
}

// Source: https://html-online.com/articles/get-url-parameters-javascript/
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}