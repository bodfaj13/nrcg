$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
    
    $('#logout').on('click', function(){
        window.location.assign('/admin/logout');
    });

    $('.refreshbtn').on('click', function(){
        window.location.reload();
    });
});

