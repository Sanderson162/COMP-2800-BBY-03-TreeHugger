$(document).ready(()=>{
    setHeader();
    loadOptions();
    $("#query").change(()=>{
        search($("#query").val());
    });
});

function setHeader(){
    $("#main").prepend($("<h1></h1>").html("Search by Genus"));
}

function loadOptions(){
    let query = "https://opendata.vancouver.ca/api/v2/catalog/datasets/street-trees/facets?facet=genus_name&timezone=UTC"
    $.getJSON(query, (data) => {
        $.each(data.facets[0].facets, function (i, entry) {
            $("#data").append($("<option></option>").val(entry.name));
        });
        
    })
    
}

function search(q){
    if (q.length>3){
        let results = $("#searchResults");
        results.html("");
        console.log(q);
        q = q.toUpperCase();
        let query = "https://opendata.vancouver.ca/api/records/1.0/search/?dataset=street-trees&q=&facet=genus_name&facet=species_name&facet=common_name&facet=assigned&facet=root_barrier&facet=plant_area&facet=on_street&facet=neighbourhood_name&facet=street_side_name&facet=height_range_id&facet=curb&facet=date_planted&refine.genus_name="+q 
        $.getJSON(query, (data) => {
            if (data.records.length == 0){
                results.html("<i>No results found...</i>");
            }
            $.each(data.records, function (i, entry) {
                console.log(entry);
                results.append(displayTree(entry))
            });
        });
    }

}
function displayTree(entry){
    let elem = $("<div></div>");
    elem.append($("<p></p>").html(entry.fields.genus_name+" "+entry.fields.species_name));
    elem.append($("<p></p>").html(entry.fields.common_name));
    elem.append($("<p></p>").html(entry.fields.on_street_block+" "+entry.fields.on_street+" "+entry.fields.neighbourhood_name));
    return elem;
}