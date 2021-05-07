$(document).ready(()=>{
    $("#date").click(()=>{
        window.location = "./searchDate";
    });
    $("#genus").click(()=>{
        window.location = "./findtree";
    });
    $("#species").click(()=>{
        window.location = "./findtree?q=species";
    });
    $("#common").click(()=>{
        window.location = "./findtree?q=common";
    });

});