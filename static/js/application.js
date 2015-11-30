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
                        table += '<thead><tr class = "success">' +
                            '<td>Админ</td>' +
                            '<td>Последнее изменение</td>' +
                            '<td>Активен</td>' +
                            '<td colspan="1">&nbsp;</td></thead>';
                        $.each(objAdminList, function (index, value) {
                            var timeStamp = new Date(value.modified * 1000);
                            table += '<tr class="hilightoff" onmouseover="className= \'hilighton\';" onmouseout="className=\'hilightoff\';">' +
                                     '<td>' + value.username + '</td>' +
                                     '<td>' + timeStamp.toLocaleString() + '</td>' +
                                     '<td>' + (value.active == 1 ? 'Да' : 'Нет') + '</td>' +
                                     '<td><a href="#admin-remove" admin-remove="' + value.username + '">Удалить</td></tr>';
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
                            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
                            data: JSON.stringify(data),
                            success: function () {
                                $('#admin-list').click();
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

     $('body').on('click', '[admin-remove]', function(e) {
        e.preventDefault();
        var el = $(this);
        var admin = el.attr('admin-remove');
        console.log(admin);
        $.ajax({
            url: '/admin-remove',
            type: 'POST',
            cache: false,
            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
            data: JSON.stringify({admin: admin}),
            success: function(){
                $('#admin-list').click();
            },
            error: function(){
                $('#result').text('Error, something wrong');
            }
        });
    });

    $('#domain-list').click(function(event) {
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
                        table += '<thead><tr class = "success">' +
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
                            table += '<tr class="hilightoff" onmouseover="className= \'hilighton\';" onmouseout="className=\'hilightoff\';">' +
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
                                $('#domain-list').click();
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
        });
    });

    $('body').on('click', '[data-edit]', function(e) {
        e.preventDefault();
        $('#result').empty();
        var el = $(this);
        var domain = el.attr('data-edit');
        $.ajax({
                url: '/domain-one',
                type: 'POST',
                cache: false,
                headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
                data: JSON.stringify({domain: domain}),
                success: function (jsDomainList) {
                    var objDomainList = JSON.parse(jsDomainList);
                    var form = '<form class="form-horizontal">';
                    form += '<div class="form-group">' +
                        '<label for="domain" class="col-sm-2 control-label">Домен:</label>' +
                        '<div class="col-sm-4">' +
                        '<p class="form-control-static">' + domain + '</p>' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<label for="descr" class="col-sm-2 control-label">Описание:</label>' +
                        '<div class="col-sm-4">' +
                        '<input type="text" class="form-control" id="descr" value="' + objDomainList[0]['description'] + '">' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<label for="alias" class="col-sm-2 control-label">Алиасы:</label>' +
                        '<div class="col-sm-4">' +
                        '<input type="text" class="form-control" id="alias" value="' + objDomainList[0]['aliases'] + '">' +
                        '</div>' +
                        '<div class="col-sm-4" id="alias_error"><span>-1 = отключить | 0 = неограниченное</span>' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<label for="box" class="col-sm-2 control-label">Ящики:</label>' +
                        '<div class="col-sm-4">' +
                        '<input type="text" class="form-control" id="box" value="' + objDomainList[0]['mailboxes'] + '">' +
                        '</div>' +
                        '<div class="col-sm-4" id="box_error"><span>-1 = отключить | 0 = неограниченное</span>' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<label for="quota" class="col-sm-2 control-label">Квота:</label>' +
                        '<div class="col-sm-4">' +
                        '<input type="text" class="form-control" id="quota" value="' + objDomainList[0]['quota'] + '">' +
                        '</div>' +
                        '<div class="col-sm-4" id="quota_error"><span>-1 = отключить | 0 = неограниченное</span>' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<div class="col-sm-offset-2 col-sm-10">' +
                        '<button class="btn btn-success" id="domain-edit-submit">Редактировать</button>' +
                        '</div></div>' +
                        '</form>';
                    $('#result').append(form);
                            $('#domain-edit-submit').click(function(event) {
                                var descr = $('#descr').val();
                                var alias = $('#alias').val();
                                var box = $('#box').val();
                                var quota = $('#quota').val();
                                var re_digit = /\b\d+\b/;
                                var error = false;

                                if (alias === '') {
                                    $('#alias_error').empty();
                                    $('#alias_error').append('<span class="error_msg">Поле не может быть пустым! </span>');
                                    error = true;
                                } else if (!re_digit.exec(alias)) {
                                    $('#alias_error').empty();
                                    $('#alias_error').append('<span class="error_msg">Это должны быть цифры! </span>');
                                    error = true;
                                }
                                if (box === '') {
                                    $('#box_error').empty();
                                    $('#box_error').append('<span class="error_msg">Поле не может быть пустым! </span>');
                                    error = true;
                                } else if (!re_digit.exec(box)) {
                                    $('#box_error').empty();
                                    $('#box_error').append('<span class="error_msg">Это должны быть цифры! </span>');
                                    error = true;
                                }
                                if (quota === '') {
                                    $('#quota_error').empty();
                                    $('#quota_error').append('<span class="quota_msg">Поле не может быть пустым! </span>');
                                    error = true;
                                } else if (!re_digit.exec(box)) {
                                    $('#quota_error').empty();
                                    $('#quota_error').append('<span class="quota_msg">Это должны быть цифры! </span>');
                                    error = true;
                                }
                                var data = {
                                    description: descr,
                                    aliases: alias,
                                    boxes: box,
                                    quota: quota,
                                    domain: domain
                                };
                                if (!error) {
                                    $.ajax({
                                        url: '/domain-edit',
                                        headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
                                        type: 'POST',
                                        cache: false,
                                        data: JSON.stringify(data),
                                        success: function () {
                                            $('#domain-list').click();
                                        },
                                        error: function () {
                                            $('#result').text('Error, something wrong');
                                        }
                                    });
                                }
                                event.preventDefault();
                            });
                },
                error: function () {
                    $('#result').text('Error, something wrong');
                }
            });
    });

    $('body').on('click', '[data-remove]', function(e) {
        e.preventDefault();
        var el = $(this);
        var domain = el.attr('data-remove');
        console.log(domain);
        $.ajax({
            url: '/domain-remove',
            type: 'POST',
            cache: false,
            headers: {
                "X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]
            },
            data: JSON.stringify({domain: domain}),
            success: function(){
                $('#domain-list').click();
            },
            error: function(){
                $('#result').text('Error, something wrong');
            }
        });
    });

    $('#blacklist').click(function(event){
        $('#result').empty();
        $.ajax({
            url: '/blacklist',
            type: 'GET',
            cache: false,
            success: function(jsBlackList){
                var objBlackList = JSON.parse(jsBlackList);
                if (objBlackList.length > 0) {
                    var table = '<table class="table-bordered table">';
                    table += '<thead><tr class = "success">' +
                        '<td>Адрес</td>' +
                        '<td>Добавлен</td>' +
                        '<td colspan="1">&nbsp;</td></thead>';
                    $.each(objBlackList, function (index, value) {
                        var timeStamp = new Date(value.when_add * 1000);
                        table += '<tr class="hilightoff" onmouseover="className= \'hilighton\';" onmouseout="className=\'hilightoff\';">' +
                            '<td>' + value.senders + '</td>' +
                            '<td>' + timeStamp.toLocaleDateString() + '</td>' +
                            '<td><a href="#b-remove" b-remove="' + value.senders + '">Удалить</td></tr>';
                    });
                    table += '</table>';
                }
                $('#result').append(table);
            },
            error: function(){
                $('#result').text('Error, something wrong');
            }
        });
        event.preventDefault();
    });

    $('#whitelist').click(function(event){
        $('#result').empty();
        $.ajax({
            url: '/whitelist',
            type: 'GET',
            cache: false,
            success: function(jsWhiteList){
                var objWhiteList = JSON.parse(jsWhiteList);
                if (objWhiteList.length > 0) {
                    var table = '<table class="table-bordered table">';
                    table += '<thead><tr class = "success">' +
                        '<td>Адрес</td>' +
                        '<td>Добавлен</td>' +
                        '<td colspan="1">&nbsp;</td></thead>';
                    $.each(objWhiteList, function (index, value) {
                        var timeStamp = new Date(value.when_add * 1000);
                        table += '<tr class="hilightoff" onmouseover="className= \'hilighton\';" onmouseout="className=\'hilightoff\';">' +
                            '<td>' + value.senders + '</td>' +
                            '<td>' + timeStamp.toLocaleDateString() + '</td>' +
                            '<td><a href="#w-remove" w-remove="' + value.senders + '">Удалить</td></tr>';
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

    $('body').on('click', '[b-remove]', function(e) {
        e.preventDefault();
        var el = $(this);
        var sender = el.attr('b-remove');
        console.log(sender);
        $.ajax({
            url: '/b-remove',
            type: 'POST',
            cache: false,
            headers: {
                "X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]
            },
            data: JSON.stringify({sender: sender}),
            success: function(){
                $('#blacklist').click();
            },
            error: function(){
                $('#result').text('Error, something wrong');
            }
        });
    });

    $('body').on('click', '[w-remove]', function(e) {
        e.preventDefault();
        var el = $(this);
        var sender = el.attr('w-remove');
        console.log(sender);
        $.ajax({
            url: '/w-remove',
            type: 'POST',
            cache: false,
            headers: {
                "X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]
            },
            data: JSON.stringify({sender: sender}),
            success: function(){
                $('#whitelist').click();
            },
            error: function(){
                $('#result').text('Error, something wrong');
            }
        });
    });

    $('#add-blacklist').click(function (event) {
        $('#result').empty();
        var form = '<form class="form-horizontal">';
            form += '<div class="form-group">' +
                    '<label for="mail" class="col-sm-2 control-label">Адрес:</label>' +
                    '<div class="col-sm-4">' +
                    '<input type="text" class="form-control" id="email" placeholder="Email или Host">' +
                    '</div>' +
                    '<div class="col-sm-4" id="email_error">' +
                    '</div></div>' +
                    '<div class="form-group">' +
                    '<div class="col-sm-offset-2 col-sm-10">' +
                    '<button class="btn btn-success" id="b-submit">Добавить</button>' +
                    '</div></div>' +
                    '</form>';
        $('#result').append(form);

        $('#b-submit').click(function (event) {
            $('#email_error').empty();
            var error = false;
            var valueMail = $('#email').val();

                if (valueMail === '') {
                    $('#email_error').append('<span class="error_msg">Поле не может быть пустым! </span>');
                    error = true;
                }

                if (!error) {
                    $.ajax(
                        {
                            url: '/b-add',
                            type: 'POST',
                            cache: false,
                            headers: {
                                "X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]
                            },
                            data: JSON.stringify({email: valueMail}),
                            success: function () {
                                $('#blacklist').click();
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

    $('#add-whitelist').click(function (event) {
        $('#result').empty();
        var form = '<form class="form-horizontal">';
            form += '<div class="form-group">' +
                    '<label for="mail" class="col-sm-2 control-label">Адрес:</label>' +
                    '<div class="col-sm-4">' +
                    '<input type="text" class="form-control" id="email" placeholder="Email или Host">' +
                    '</div>' +
                    '<div class="col-sm-4" id="email_error">' +
                    '</div></div>' +
                    '<div class="form-group">' +
                    '<div class="col-sm-offset-2 col-sm-10">' +
                    '<button class="btn btn-success" id="w-submit">Добавить</button>' +
                    '</div></div>' +
                    '</form>';
        $('#result').append(form);

        $('#w-submit').click(function (event) {
            $('#email_error').empty();
            var error = false;
            var valueMail = $('#email').val();

                if (valueMail === '') {
                    $('#email_error').append('<span class="error_msg">Поле не может быть пустым! </span>');
                    error = true;
                }

                if (!error) {
                    $.ajax(
                        {
                            url: '/w-add',
                            type: 'POST',
                            cache: false,
                            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
                            data: JSON.stringify({email: valueMail}),
                            success: function () {
                                $('#whitelist').click();
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

    $('#boxes').click(function(event){
        $('#result').empty();
        $.ajax(
            {
                url: '/boxes',
                type: 'GET',
                cache: false,
                success: function (jsBoxes) {
                    var objBoxes = JSON.parse(jsBoxes);
                    if (objBoxes.length > 0) {
                        var mtable = '<table class="table-bordered table table-condensed">';
                        mtable += '<thead><tr class = "success">' +
                            '<td>Ящик</td>' +
                            '<td>Имя</td>' +
                            '<td>Последнее изменение</td>' +
                            '<td>Активен</td>' +
                            '<td colspan="2">&nbsp;</td></thead>';

                        $.each(objBoxes, function (index, value) {
                            var timeStamp = new Date(value.modified * 1000);
                            mtable += '<tr class="hilightoff" onmouseover="className= \'hilighton\';" onmouseout="className=\'hilightoff\';">' +
                                     '<td>' + value.username + '</td>' +
                                     '<td>' + value.name + '</td>' +
                                     '<td>' + timeStamp.toLocaleString() + '</td>' +
                                     '<td><a href="#box-active" box-active="' + value.username + '">' + (value.active == 1 ? 'Да' : 'Нет') + '</td>' +
                                     '<td><a href="#box-edit" box-edit="' + value.username + '">Реактировать</a></td>' +
                                     '<td><a href="#box-remove" box-remove="' + value.username + '">Удалить</td></tr>';
                        });
                        mtable += '</table>';
                        $('#result').append(mtable);
                    }
                },
                error: function () {
                    $('#result').text('Error, something wrong');
                }
        });
        $.ajax(
            {
                url: '/aliases',
                type: 'GET',
                cache: false,
                success: function (jsAliases) {
                    var objAliases = JSON.parse(jsAliases);
                    if (objAliases.length > 0) {
                        var atable = '<table class="table-bordered table table-condensed">';
                        atable += '<thead><tr class = "success">' +
                            '<td>От</td>' +
                            '<td>Кому</td>' +
                            '<td>Последнее изменение</td>' +
                            '<td>Активен</td>' +
                            '<td colspan="2">&nbsp;</td></thead>';
                        $.each(objAliases, function (index, value) {
                            var timeStamp = new Date(value.modified * 1000);
                            atable += '<tr class="hilightoff" onmouseover="className= \'hilighton\';" onmouseout="className=\'hilightoff\';">' +
                                     '<td>' + value.address + '</td>' +
                                     '<td>' + value.goto.replace(',', '<br>') + '</td>' +
                                     '<td>' + timeStamp.toLocaleString() + '</td>' +
                                     '<td><a href="#alias-active" alias-active="' + value.address + '">' + (value.active == 1 ? 'Да' : 'Нет') + '</td>' +
                                     '<td><a href="#alias-edit" alias-edit="' + value.address + '">Реактировать</a></td>' +
                                     '<td><a href="#alias-remove" alias-remove="' + value.address + '">Удалить</td></tr>';
                        });
                        atable += '</table>';
                        $('#result').append(atable);
                    }
                },
                error: function () {
                    $('#result').text('Error, something wrong');
                }
        });
        event.preventDefault();
    });

    $('body').on('click','[box-active]',function(e){
        e.preventDefault();
        var el = $(this);
        var current = el.text();
        if (current === 'Да') {
            el.text('Нет');
        } else if (current === 'Нет') {
            el.text('Да');
        }
        var dsend = current === 'Да' ? 0 : 1;
        var box = el.attr('box-active');
        $.ajax({
            url: '/box-active',
            type: 'POST',
            cache:  false,
            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
            data: JSON.stringify({val: dsend,
                                  box: box
                                })
        });
    });

    $('body').on('click','[alias-active]',function(e){
        e.preventDefault();
        var el = $(this);
        var current = el.text();
        if (current === 'Да') {
            el.text('Нет');
        } else if (current === 'Нет') {
            el.text('Да');
        }
        var dsend = current === 'Да' ? 0 : 1;
        var address = el.attr('alias-active');
        $.ajax({
            url: '/alias-active',
            type: 'POST',
            cache:  false,
            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
            data: JSON.stringify({val: dsend,
                                  address: address
                                })
        });
    });

    $('#add-box').click(function(event){
        $('#result').empty();
        $.ajax({
                url: '/domain-list',
                type: 'GET',
                cache: false,
                success: function (jsDomainList) {
                    var objDomainList = JSON.parse(jsDomainList);
                    var options ='';
                    $.each(objDomainList, function (index, value) {
                        if (value.domain === 'ALL') {
                            return true;
                        }
                        options += '<option>' + value.domain + '</option>';
                    });
                    var form = '<form class="form-horizontal">';
                    form += '<div class="form-group">' +
                        '<label for="domain" class="col-sm-2 control-label">Название:</label>' +
                        '<div class="col-sm-4">' +
                        '<input type="text" class="form-control" id="mail" placeholder="Название">' +
                        '</div>' +
                        '<div class="col-sm-2">' +
                        '<select class="form-control" id="domain">' +
                        options +
                        '</select>' +
                        '</div>' +
                        '<div class="col-sm-4" id="mail_error">' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<label for="pass" class="col-sm-2 control-label">Пароль:</label>' +
                        '<div class="col-sm-4">' +
                        '<input type="password" class="form-control" id="pass" placeholder="Пароль">' +
                         '</div>' +
                        '<div class="col-sm-4" id="pass_error">' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<label for="pass2" class="col-sm-2 control-label">Пароль (еще раз):</label>' +
                        '<div class="col-sm-4">' +
                        '<input type="password" class="form-control" id="pass2" placeholder="Пароль">' +
                        '</div>' +
                        '<div class="col-sm-4" id="pass2_error">' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<label for="name" class="col-sm-2 control-label">Имя:</label>' +
                        '<div class="col-sm-4">' +
                        '<input type="text" class="form-control" id="name" placeholder="Имя владельца">' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<div class="col-sm-offset-2 col-sm-10">' +
                        '<button class="btn btn-success" id="box-submit">Добавить</button>' +
                        '</div></div>' +
                        '</form>';
                    $('#result').append(form);
                    $('#box-submit').click(function(event){
                        $('#pass_error').empty();
                        $('#pass2_error').empty();
                        var error = false;
                        var mail = $('#mail').val() + '@' + $('#domain').val();
                        var pass = $('#pass').val();
                        var pass2 = $('#pass2').val();
                        var name = $('#name').val();

                        if (pass != pass2) {
                            $('#pass2_error').append('<span class="error_msg">Пароли не совпадают! </span>');
                            error = true;
                        }
                        if (pass === '' || pass2 === '') {
                            $('#pass_error').append('<span class="error_msg">Пароль не может быть пустым! </span>');
                            error = true;
                        }
                        var data = {
                            mail: mail,
                            pass: pass,
                            name: name};
                        if (!error){
                            $.ajax(
                            {
                                url: '/box-create',
                                type: 'POST',
                                cache: false,
                                headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
                                data: JSON.stringify(data),
                                success: function (message) {
                                    var text = message.indexOf('Duplicate entry') + 1 > 0 ? 'Такой ящик существует': 'Ящик создан';
                                    //alert(text);
                                    $('#boxes').click();
                                },
                                error: function () {
                                    $('#result').text('Error, something wrong');
                                }
                            });
                        }
                    event.preventDefault();
                    });
                }
            });
    event.preventDefault();
    });

    $('body').on('click', '[box-edit]', function(e){
        e.preventDefault();
        $('#result').empty();
        var el = $(this);
        var box = el.attr('box-edit');
        $.ajax({
            url: '/box-one',
            type: 'POST',
            cache: false,
            data: JSON.stringify({username: box}),
            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
            success: function(box){
                var obj_box = JSON.parse(box);
                var form = '<form class="form-horizontal">';
                    form += '<div class="form-group">' +
                        '<label for="domain" class="col-sm-2 control-label">Название:</label>' +
                        '<div class="col-sm-4">' +
                        '<p class="form-control-static">' + obj_box[0].username + '</p>' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<label for="pass" class="col-sm-2 control-label">Пароль:</label>' +
                        '<div class="col-sm-4">' +
                        '<input type="password" class="form-control" id="pass" placeholder="Пароль">' +
                         '</div>' +
                        '<div class="col-sm-4" id="pass_error">' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<label for="pass2" class="col-sm-2 control-label">Пароль (еще раз):</label>' +
                        '<div class="col-sm-4">' +
                        '<input type="password" class="form-control" id="pass2" placeholder="Пароль">' +
                        '</div>' +
                        '<div class="col-sm-4" id="pass2_error">' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<label for="name" class="col-sm-2 control-label">Имя:</label>' +
                        '<div class="col-sm-4">' +
                        '<input type="text" class="form-control" id="name" value="' + obj_box[0].name + '">' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<div class="col-sm-offset-2 col-sm-10">' +
                        '<button class="btn btn-success" id="box-submit">Редактировать</button>' +
                        '</div></div>' +
                        '</form>';
                $('#result').append(form);
                $('#box-submit').click(function(event){
                    var error = false;
                    var pass = $('#pass').val();
                    var pass2 = $('#pass2').val();
                    var name = $('#name').val();
                    if (pass != pass2) {
                        $('#pass2_error').append('<span class="error_msg">Пароли не совпадают! </span>');
                        error = true;
                    }
                    if (!error) {
                        $.ajax({
                            url: '/box-edit',
                            type: 'POST',
                            cache: false,
                            data: JSON.stringify({
                                pass: pass,
                                name: name,
                                username: obj_box[0].username
                            }),
                            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
                            success: function(){
                                $('#boxes').click();
                            },
                            error: function(){
                                $('#result').text('Error, something wrong');
                            }
                        });
                    }
                    event.preventDefault();
                });
            }
        });
    });

    $('body').on('click', '[box-remove]', function(e){
        e.preventDefault();
        $('#result').empty();
        var el = $(this);
        var box = el.attr('box-remove');
        $.ajax({
            url: '/box-remove',
            type: 'POST',
            cache: false,
            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
            data: JSON.stringify({username: box}),
            success: function(){
                $('#boxes').click();
            },
            error: function(){
                $('#result').text('Error, something wrong');
            }
        });
    });

    $('#add-alias').click(function(event){
        $('#result').empty();
        $.ajax({
            url: '/domain-list',
            type: 'GET',
            cache: false,
            success: function (jsDomainList) {
                var objDomainList = JSON.parse(jsDomainList);
                var options = '';
                $.each(objDomainList, function (index, value) {
                    if (value.domain === 'ALL') {
                        return true;
                    }
                    options += '<option>' + value.domain + '</option>';
                });
                var form = '<form class="form-horizontal">';
                    form += '<div class="form-group">' +
                        '<label for="domain" class="col-sm-2 control-label">Алиас:</label>' +
                        '<div class="col-sm-4">' +
                        '<input type="text" class="form-control" id="mail" placeholder="Название">' +
                        '</div>' +
                        '<div class="col-sm-2">' +
                        '<select class="form-control" id="domain">' +
                         options +
                        '</select>' +
                        '</div>' +
                        '<div class="col-sm-4" id="mail_error">' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<label for="goto" class="col-sm-2 control-label">Кому:</label>' +
                        '<div class="col-sm-6">' +
                        '<textarea id="aliases" rows="10" cols="67" placeholder="Ящики, по одному на строку"></textarea>' +
                        '</div>' +
                        '<div class="col-sm-4" id="aliases_error">' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<div class="col-sm-offset-2 col-sm-10">' +
                        '<button class="btn btn-success" id="alias-submit">Добавить</button>' +
                        '</div></div>' +
                        '</form>';
                $('#result').append(form);
                $('#alias-submit').click(function(event){
                    $('#mail_error').empty();
                    $('#aliases_error').empty();
                    var error = false;
                    var address = $('#mail').val() + '@' + $('#domain').val();
                    var goto = $('#aliases').val();
                    if ($('#mail').val() === ''){
                        $('#mail_error').append('<span class="error_msg">Поле не может быть пустым! </span>');
                            error = true;
                    }
                    if (goto === ''){
                        $('#aliases_error').append('<span class="error_msg">Поле не может быть пустым! </span>');
                            error = true;
                    }
                    if (!error){
                        $.ajax({
                            url: '/alias-create',
                            type: 'POST',
                            cache: false,
                            data: JSON.stringify({
                                address: address,
                                goto: goto
                            }),
                            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
                            success: function(){
                                $('#boxes').click();
                            },
                            error: function(){
                                $('#result').text('Error, something wrong');
                            }
                        });
                    }
                event.preventDefault();
                });
            }
        });
        event.preventDefault();
    });

    $('body').on('click', '[alias-edit]', function(e){
        e.preventDefault();
        $('#result').empty();
        var el = $(this);
        var address = el.attr('alias-edit');
        $.ajax({
            url: '/alias-one',
            type: 'POST',
            cache: false,
            data: JSON.stringify({address: address}),
            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
            success: function (alias) {
                var obj_alias = JSON.parse(alias);
                var form = '<form class="form-horizontal">';
                    form += '<div class="form-group">' +
                        '<label for="domain" class="col-sm-2 control-label">Алиас:</label>' +
                        '<div class="col-sm-4">' +
                        '<p class="form-control-static">' + obj_alias[0].address + '</p>' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<label for="goto" class="col-sm-2 control-label">Кому:</label>' +
                        '<div class="col-sm-6">' +
                        '<textarea id="aliases" rows="10" cols="67">' + obj_alias[0].goto.replace(',', '\n') + '</textarea>' +
                        '</div>' +
                        '<div class="col-sm-4" id="aliases_error">' +
                        '</div></div>' +
                        '<div class="form-group">' +
                        '<div class="col-sm-offset-2 col-sm-10">' +
                        '<button class="btn btn-success" id="alias-submit">Редактировать</button>' +
                        '</div></div>' +
                        '</form>';
                $('#result').append(form);
                $('#alias-submit').click(function(event){
                    var error = false;
                    var goto = $('#aliases').val();
                    if (goto === '') {
                        $('#alias_error').append('<span class="error_msg">Поле не может быть пустым! </span>');
                        error = true;
                    }
                    if (!error) {
                        $.ajax({
                            url: '/alias-edit',
                            type: 'POST',
                            cache: false,
                            data: JSON.stringify({
                                goto: goto,
                                address: address
                            }),
                            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
                            success: function(){
                                $('#boxes').click();
                            },
                            error: function(){
                                $('#result').text('Error, something wrong');
                            }
                        });
                    }
                    event.preventDefault();
                });
            }
        });
    });

    $('body').on('click', '[alias-remove]', function(e){
        e.preventDefault();
        $('#result').empty();
        var el = $(this);
        var address = el.attr('alias-remove');
        $.ajax({
            url: '/alias-remove',
            type: 'POST',
            cache: false,
            headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
            data: JSON.stringify({address: address}),
            success: function(){
                $('#boxes').click();
            },
            error: function(){
                $('#result').text('Error, something wrong');
            }
        });
    });

    $('#ch_pass').click(function(event){
        $('#result').empty();
        var form = '<form class="form-horizontal">';
            form += '<div class="form-group">' +
                    '<label for="mail" class="col-sm-3 control-label">Имя для входа:</label>' +
                    '<div class="col-sm-4">' +
                    '<p class="form-control-static">' + $('[val_username]').attr('val_username') + '</p>' +
                    '</div></div>' +
                    '<div class="form-group">' +
                    '<label for="mail" class="col-sm-3 control-label">Текущий пароль:</label>' +
                    '<div class="col-sm-4">' +
                    '<input type="password" class="form-control" id="old_pass" placeholder="Пароль">' +
                    '</div>' +
                    '<div class="col-sm-4" id="old_pass_error">' +
                    '</div></div>' +
                    '<div class="form-group">' +
                    '<label for="pass" class="col-sm-3 control-label">Новый пароль:</label>' +
                    '<div class="col-sm-4">' +
                    '<input type="password" class="form-control" id="top_pass" placeholder="Пароль">' +
                    '</div>' +
                    '<div class="col-sm-4" id="top_pass_error">' +
                    '</div></div>' +
                    '<div class="form-group">' +
                    '<label for="pass" class="col-sm-3 control-label">Новый пароль (еще раз):</label>' +
                    '<div class="col-sm-4">' +
                    '<input type="password" class="form-control" id="top_pass2" placeholder="Пароль">' +
                    '</div>' +
                    '<div class="col-sm-4" id="top_pass2_error">' +
                    '</div></div>' +
                    '<div class="form-group">' +
                    '<div class="col-sm-offset-3 col-sm-10">' +
                    '<button class="btn btn-success" id="top_pass-submit">Изменить</button>' +
                    '</div></div>' +
                    '</form>';
        $('#result').append(form);
        $('#top_pass-submit').click(function(event){
            $('#top_pass2_error').empty();
            $('#top_pass_error').empty();
            $('#old_pass_error').empty();
            var error;
            var oldpass = $('#old_pass').val();
            var newpass = $('#top_pass').val();
            var newpass2 = $('#top_pass2').val();
            if (newpass != newpass2) {
                $('#top_pass2_error').append('<span class="error_msg">Пароли не совпадают! </span>');
                error = true;
            }
            if (newpass === '' || newpass2 === '') {
                $('#top_pass_error').append('<span class="error_msg">Пароль не может быть пустым! </span>');
                error = true;
            }
            if (!error) {
                $.ajax({
                    url: '/pass-check',
                    type: 'POST',
                    cache: false,
                    data: JSON.stringify({
                        pass: oldpass,
                        username: $('[val_username]').attr('val_username')
                    }),
                    headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
                    success: function (msg) {
                        if (msg === 'true') {
                            $.ajax({
                                url: '/pass-update',
                                type: 'POST',
                                cache: false,
                                headers: {"X-Xsrftoken": document.cookie.split(';')[0].split('=')[1]},
                                data: JSON.stringify({
                                    username: $('[val_username]').attr('val_username'),
                                    pass: newpass
                                }),
                                success: function(){
                                    $('#result').empty();
                                    alert('Пароль изменен');
                                },
                                error: function(){
                                    $('#result').text('Error, something wrong');
                                }
                            });
                        }else if (msg === 'false'){
                            $('#old_pass_error').append('<span class="error_msg">Пароль не верный! </span>');
                        }
                    },
                    error: function () {
                        $('#result').text('Error, something wrong');
                    }
                });
            }
            event.preventDefault();
        });
        event.preventDefault();
    });

    $('#f_ch_pass').click(function(e){
        e.preventDefault();
        $('#ch_pass').click();
    });

    $('#f_add-alias').click(function(e){
        e.preventDefault();
        $('#add-alias').click();
    });

    $('#f_add-box').click(function(e){
        e.preventDefault();
        $('#add-box').click();
    });

    $('#f_boxes').click(function(e){
        e.preventDefault();
        $('#boxes').click();
    });
});
