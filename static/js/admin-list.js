/**
 * Created by bender on 12.11.15.
 */

$(function() {
    $('#admin-list').click(function (event) {
        $('#result').empty();
        $.ajax(
            {
                url: '/admin-list',
                type: 'GET',
                cache: false,
                success: function (jsAdminList) {
                    var objAdminList = JSON.parse(jsAdminList);
                    if (objAdminList.length > 0) {
                        var table = '<table class="table-bordered table">';
                        table += '<thead><tr>' +
                            '<td>Админ</td>' +
                            '<td>Домены</td>' +
                            '<td>Последнее изменение</td>' +
                            '<td>Активен</td>';
                        $.each(objAdminList, function (index, value) {
                            var timeStamp = new Date(value.modified * 1000);
                            table += '<tr>' +
                                     '<td>' + value.username + '</td>' +
                                     '<td>' + (value.domain == 'ALL' ? 'Супер админ' : value.domain) + '</td>' +
                                     '<td>' + timeStamp.toLocaleString() + '</td>' +
                                     '<td>' + (value.active == 1 ? 'Да' : 'Нет') + '</td></tr>';
                        });
                        table += '</table>';
                        $('#result').append(table);
                    }
                },
                error: function () {
                    $('#result').text('Error, something wrong');
                }
            });
        event.preventDefault();
    });

    $('#admin-create').click(function (event) {
        $('#result').empty();
        $.ajax(
            {
                url: '/domain-list',
                type: 'GET',
                cache: false,
                success: function (jsDomainList) {
                    var objDomainList = JSON.parse(jsDomainList);
                    var options = '';
                    if (objDomainList.length > 0) {
                        $.each(objDomainList, function (index, value) {
                            options += '<option>' + value.domain + '</option>';
                        });

                        var form = '<form class="form-horizontal">';
                        form += '<div class="form-group">' +
                                '<label for="mail" class="col-sm-2 control-label">Администратор:</label>' +
                                '<div class="col-sm-4">' +
                                '<input type="email" class="form-control" id="mail" placeholder="Email">' +
                                '</div>' +
                                '<div class="col-sm-4" id="emailerror">' +
                                '</div></div>' +
                                '<div class="form-group">' +
                                '<label for="pass" class="col-sm-2 control-label">Пароль:</label>' +
                                '<div class="col-sm-4">' +
                                '<input type="password" class="form-control" id="pass" placeholder="Пароль">' +
                                '</div></div>' +
                                '<div class="form-group">' +
                                '<label for="pass" class="col-sm-2 control-label">Пароль (еще раз):</label>' +
                                '<div class="col-sm-4">' +
                                '<input type="password" class="form-control" id="pass2" placeholder="Пароль">' +
                                '</div>' +
                                '<div class="col-sm-4" id="passerror">' +
                                '</div></div>' +
                                '<div class="form-group">' +
                                '<label class="col-sm-2 control-label">Домен:</label>' +
                                '<div class="col-sm-4">' +
                                '<select class="form-control" id="domain">' +
                                 options +
                                '</select>' +
                                '</div></div>' +
                                '<div class="form-group">' +
                                '<div class="col-sm-offset-2 col-sm-10">' +
                                '<button class="btn btn-success" id="admin-submit">Добавить</button>' +
                                '</div></div>' +
                                '</form>';
                    }
                    $('#result').append(form);

                    $('#admin-submit').click(function (event) {
                        $('#passerror').empty();
                        $('#emailerror').empty();
                        var error = false;
                        var valueMail = $('#mail').val();
                        var valuePass = $('#pass').val();
                        var valuePass2 = $('#pass2').val();
                        var valueDomain= $('#domain').val();
                        var re = /(?:\w+)?[-_.]?\w+@(?:\w+)?[-_.]?\w+\.\w+/;

                        if (valuePass != valuePass2) {
                            $('#passerror').append('<span class="error_msg">Пароли не совпадают! </span>');
                            error = true;
                        }
                        if (valuePass === '' || valuePass2 === '') {
                            $('#passerror').append('<span class="error_msg">Пароль не может быть пустым! </span>');
                            error = true;
                        }
                        if (valueMail === '') {
                            $('#emailerror').append('<span class="error_msg">Email не может быть пустым! </span>');
                            error = true;
                        } else if (!re.exec(valueMail)){
                                $('#emailerror').append('<span class="error_msg">Email не похож на правду! </span>');
                                error = true;
                        }

                        var data = {
                                mail: valueMail,
                                pass: valuePass,
                                domain: valueDomain
                        };

                        if (!error) {
                            $.ajax(
                                {
                                    url: '/admin-create',
                                    type: 'POST',
                                    cache: false,
                                    headers: {
                                        "X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]
                                    },
                                    data: JSON.stringify(data),
                                    success: function (jsResponse) {
                                        $('#result').text(jsResponse);
                                    },
                                    error: function () {
                                        $('#result').text('Error, something wrong');
                                    }
                                }
                            );
                        }
                        event.preventDefault();
                    });
                },
                error: function(){
                    $('#result').text('Error, something wrong');
                }
            });
        event.preventDefault();
    });



    $('#domain-list').click(function (event) {
        $('#result').empty();
        $.ajax(
            {
                url:    '/domain-list',
                type:   'GET',
                cache:  false,
                success: function(jsDomainList){
                    var objDomainList = JSON.parse(jsDomainList);
                    if (objDomainList.length > 0) {
                        var table = '<table class="table-bordered table">';
                        table += '<thead><tr>' +
                                 '<td>Домен</td>' +
                                 '<td>Описание</td>' +
                                 '<td>Алиасы</td>' +
                                 '<td>Ящики</td>' +
                                 '<td>Резервный МХ</td>' +
                                 '<td>Последнее изменение</td>' +
                                 '<td>Активен</td>';
                        $.each(objDomainList, function (index, value) {
                            if (value.domain == 'ALL') return true;
                            var timeStamp = new Date(value.modified*1000);
                            table += '<tr>' +
                                     '<td>' + value.domain + '</td>' +
                                     '<td>' + value.description + '</td>' +
                                     '<td>' + value.aliases_used + ' / ' + value.aliases + '</td>' +
                                     '<td>' + value.mailbox_used + ' / ' + value.mailboxes + '</td>' +
                                     '<td>' + (value.backupmx == 0 ? 'Нет' : 'Да' ) + '</td>' +
                                     '<td>' + timeStamp.toLocaleString() + '</td>' +
                                     '<td>' + (value.active == 1 ? 'Да' : 'Нет') + '</td></tr>';
                        });
                        table += '</table>';
                        $('#result').append(table);
                    }
                },
                error: function(){
                    $('#result').text('Error, something wrong');
                }
            });
        event.preventDefault();
    });
});