function addComment(treeID,comment,emoji){
    $.ajax({
        url: "/ajax-add-comment",
        dataType: "json",
        type: "POST",
        headers: {'CSRF-Token': Cookies.get("XSRF-TOKEN")},
        data: {tree: treeID, text: comment, icon: emoji},
        success: ()=>{
            return true;
        },
        error: (jqXHR,textStatus,errorThrown )=>{
            console.log("Error:"+textStatus);
        }
    });
    return false;
}