/**
 * Created by bender on 25.11.15.
 */
$(function(){
    $('#login_form').click(function(e){
        e.preventDefault();
        var name = $('#username').val();
        var pass = $('#password').val();
        $.ajax({
            url: '/check-login',
            type: 'POST',
            cache: false,
            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
            data: JSON.stringify({
                name: name,
                pass: pass
            }),
            success: function(data){
                console.log(data);
                window.location.href = '/login'
            },
            error: function(){
                console.log('error')
            }
        });
    });
});