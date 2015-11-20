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
                            '<td>Последнее изменение</td>' +
                            '<td>Активен</td></thead>';
                        $.each(objAdminList, function (index, value) {
                            var timeStamp = new Date(value.modified * 1000);
                            table += '<tr>' +
                                     '<td>' + value.username + '</td>' +
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
                    '<div class="form-group">' +
                    '<div class="col-sm-offset-2 col-sm-10">' +
                    '<button class="btn btn-success" id="admin-submit">Добавить</button>' +
                    '</div></div>' +
                    '</form>';
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
                                 '<td>Последнее изменение</td>' +
                                 '<td>Активен</td>' +
                                 '<td colspan="2">&nbsp;</td></thead>';
                        $.each(objDomainList, function (index, value) {
                            if (value.domain == 'ALL') return true;
                            var timeStamp = new Date(value.modified*1000);
                            table += '<tr>' +
                                     '<td>' + value.domain + '</td>' +
                                     '<td>' + value.description + '</td>' +
                                     '<td>' + value.alias_used + ' / ' + value.aliases + '</td>' +
                                     '<td>' + value.mailbox_used + ' / ' + value.mailboxes + '</td>' +
                                     '<td>' + timeStamp.toLocaleString() + '</td>' +
                                     '<td><a href="#domain-active" data-server="' + value.domain + '">' + (value.active == 1 ? 'Да' : 'Нет') + '</a></td>' +
                                     '<td><a href="#domain-edit" data-edit="' + value.domain + '">Реактировать</a></td>' +
                                     '<td><a href="#domain-remove" data-remove="' + value.domain + '">Удалить</td></tr>';
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

    $('#domain-create').click(function(event){
        $('#result').empty();
        var form = '<form class="form-horizontal">';
                    form += '<div class="form-group">' +
                            '<label for="domain" class="col-sm-2 control-label">Домен:</label>' +
                            '<div class="col-sm-4">' +
                            '<input type="text" class="form-control" id="domain" placeholder="Домен">' +
                            '</div>' +
                            '<div class="col-sm-4" id="dom_error">' +
                            '</div></div>' +
                            '<div class="form-group">' +
                            '<label for="descr" class="col-sm-2 control-label">Описание:</label>' +
                            '<div class="col-sm-4">' +
                            '<input type="text" class="form-control" id="descr" placeholder="Описание">' +
                            '</div></div>' +
                            '<div class="form-group">' +
                            '<label for="alias" class="col-sm-2 control-label">Алиасы:</label>' +
                            '<div class="col-sm-4">' +
                            '<input type="text" class="form-control" id="alias" placeholder="-1 = отключить | 0 = неограниченное">' +
                            '</div>' +
                            '<div class="col-sm-4" id="alias_error">' +
                            '</div></div>' +
                            '<div class="form-group">' +
                            '<label for="box" class="col-sm-2 control-label">Ящики:</label>' +
                            '<div class="col-sm-4">' +
                            '<input type="text" class="form-control" id="box" placeholder="-1 = отключить | 0 = неограниченное">' +
                            '</div>' +
                            '<div class="col-sm-4" id="box_error">' +
                            '</div></div>' +
                            '<div class="form-group">' +
                            '<label for="quota" class="col-sm-2 control-label">Квота:</label>' +
                            '<div class="col-sm-4">' +
                            '<input type="text" class="form-control" id="quota" placeholder="0 = неограничено">' +
                            '</div>' +
                            '<div class="col-sm-4" id="quota_error">' +
                            '</div></div>' +
                            '<div class="form-group">' +
                            '<div class="col-sm-offset-2 col-sm-10">' +
                            '<button class="btn btn-success" id="domain-submit">Добавить</button>' +
                            '</div></div>' +
                            '</form>';
        $('#result').append(form);

        $('#domain-submit').click(function(event){
            $('#dom_error').empty();
            $('#alias_error').empty();
            $('#box_error').empty();
            $('#quota_error').empty();
            var error = false;
            var valueDomain = $('#domain').val();
            var valueDescr = $('#descr').val();
            var valueAlias = $('#alias').val();
            var valueBox= $('#box').val();
            var valueQuota= $('#quota').val();
            var re_dom = /\w+[-_.]?\w+\.\w+/;
            var re_digit = /\b\d+\b/;


                if (valueDomain === '') {
                    $('#dom_error').append('<span class="error_msg">Поле не может быть пустым! </span>');
                    error = true;
                } else if (!re_dom.exec(valueDomain)){
                        $('#dom_error').append('<span class="error_msg">Домен не похож на правду! </span>');
                        error = true;
                }
                if (valueAlias === '') {
                    $('#alias_error').append('<span class="error_msg">Поле не может быть пустым! </span>');
                    error = true;
                } else if (!re_digit.exec(valueAlias)){
                        $('#alias_error').append('<span class="error_msg">Это должны быть цифры! </span>');
                        error = true;
                }
                if (valueBox === '') {
                    $('#box_error').append('<span class="error_msg">Поле не может быть пустым! </span>');
                    error = true;
                } else if (!re_digit.exec(valueBox)){
                        $('#box_error').append('<span class="error_msg">Это должны быть цифры! </span>');
                        error = true;
                }
                if (valueQuota === '') {
                    $('#quota_error').append('<span class="error_msg">Поле не может быть пустым! </span>');
                    error = true;
                } else if (!re_digit.exec(valueQuota)){
                        $('#quota_error').append('<span class="error_msg">Это должны быть цифры! </span>');
                        error = true;
                }


                var data = {
                        domain: valueDomain,
                        descr: valueDescr,
                        alias: valueAlias,
                        box: valueBox,
                        quota: valueQuota
                };

                if (!error) {
                    $.ajax(
                        {
                            url: '/domain-create',
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
        event.preventDefault();
    });

    $('body').on('click','[data-server]',function(e){
        e.preventDefault();
        var el = $(this);
        var current = el.text();
        if (current === 'Да') {
            el.text('Нет');
        } else if (current === 'Нет') {
            el.text('Да');
        }
        var dsend = current === 'Да' ? 0 : 1;
        var domain = el.attr('data-server');
        $.ajax({
            url: '/domain-active-edit',
            type: 'POST',
            cache:  false,
            headers: {
                "X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]
            },
            data: JSON.stringify({val: dsend,
                                  dom: domain
                                })
        })
    });

    $('body').on('click', '[data-edit]', function(e){
        e.preventDefault();
        var el = $(this);
        var domain = el.attr('data-edit');
        $.ajax(
            {
                url:    '/domain-one',
                type:   'POST',
                cache:  false,
                headers: {
                    "X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]
                },
                data: JSON.stringify({domain: domain}),
                success: function(jsDomainList) {
                    var objDomainList = JSON.parse(jsDomainList);
                    console.log(objDomainList[0]['domain']);
                },
                error: function() {
                    $('#result').text('Error, something wrong');
                }
        });


        var form = '<form class="form-horizontal">';
                    form += '<div class="form-group">' +
                            '<label for="domain" class="col-sm-2 control-label">Домен:</label>' +
                            '<div class="col-sm-4">' +
                            '<span>' + domain + '</span>' +
                            '</div></div>' +
                            '<div class="form-group">' +
                            '<label for="descr" class="col-sm-2 control-label">Описание:</label>' +
                            '<div class="col-sm-4">' +
                            '<input type="text" class="form-control" id="descr" placeholder="Описание">' +
                            '</div></div>' +
                            '<div class="form-group">' +
                            '<label for="alias" class="col-sm-2 control-label">Алиасы:</label>' +
                            '<div class="col-sm-4">' +
                            '<input type="text" class="form-control" id="alias" placeholder="-1 = отключить | 0 = неограниченное">' +
                            '</div>' +
                            '<div class="col-sm-4" id="alias_error">' +
                            '</div></div>' +
                            '<div class="form-group">' +
                            '<label for="box" class="col-sm-2 control-label">Ящики:</label>' +
                            '<div class="col-sm-4">' +
                            '<input type="text" class="form-control" id="box" placeholder="-1 = отключить | 0 = неограниченное">' +
                            '</div>' +
                            '<div class="col-sm-4" id="box_error">' +
                            '</div></div>' +
                            '<div class="form-group">' +
                            '<label for="quota" class="col-sm-2 control-label">Квота:</label>' +
                            '<div class="col-sm-4">' +
                            '<input type="text" class="form-control" id="quota" placeholder="0 = неограничено">' +
                            '</div>' +
                            '<div class="col-sm-4" id="quota_error">' +
                            '</div></div>' +
                            '<div class="form-group">' +
                            '<div class="col-sm-offset-2 col-sm-10">' +
                            '<button class="btn btn-success" id="domain-submit">Добавить</button>' +
                            '</div></div>' +
                            '</form>';
        //$('#result').append(form);

    });

});