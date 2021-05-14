function addComment(treeID,comment,emoji){
    var user = firebase.auth().currentUser;
    if (user) {
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
            $.ajax({
                url: "/ajax-add-comment",
                dataType: "json",
                type: "POST",
                data: {tree: treeID, text: comment, icon: emoji, idToken: idToken},
                success: ()=>{},
                error: (jqXHR,textStatus,errorThrown )=>{
                    console.log("Error:"+textStatus);
                }
            });
        });
    } else {
        console.log("Not signed in");
    }
    
}