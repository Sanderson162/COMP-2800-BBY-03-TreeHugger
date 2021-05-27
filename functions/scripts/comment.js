<<<<<<< HEAD
"use strict";
=======
'use strict'

>>>>>>> 7a5b4bae169c54be762a0a8b0f3baf6a231526c4
/**
 * Calls the server to add a comment (saved tree)
 * @param {String} treeID
 * @param {String} comment
 * @param {String} emoji
 * @author Aidan
 */
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
                error: (jqXHR,textStatus,errorThrown )=>{}
            });
        });
    }
}