#!/usr/bin/env python
# -*- coding:utf-8 -*-

import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.options
import os.path
import json
from tornado.escape import json_decode
from tornado.options import define, options
from getFromDataBase import *

define("port", default=8002, help="run on the given port", type=int)


class BaseHandler(tornado.web.RequestHandler):
	def get_current_user(self):
		return self.get_secure_cookie("user")


class MainHandler(BaseHandler):
	@tornado.web.authenticated
	def get(self):
		self.render('index.html', user=self.current_user)


class LoginHandler(BaseHandler):
	def get(self):
		self.render('login.html')

	def post(self):
		getusername = self.get_argument("username")
		getpassword = self.get_argument("password")
		# TODO : Check data from DB
		if check_username(getusername) and check_password(getusername, getpassword):
			self.set_secure_cookie("user", self.get_argument("username"))
			self.redirect(self.reverse_url("main"))
		else:
			wrong = self.get_secure_cookie("wrong")
			if not wrong:
				wrong = 0
			self.set_secure_cookie("wrong", str(int(wrong) + 1))
			self.write('Something Wrong With Your Data <a href="/login">Back</a> ' + str(wrong))


class LogoutHandler(BaseHandler):
	def get(self):
		self.clear_cookie("user")
		self.clear_cookie("_xsrf")
		self.redirect(self.get_argument("next", self.reverse_url("login")))


class AdminHandler(BaseHandler):
	@tornado.web.authenticated
	def get(self):
		self.write(json.dumps(admin_list()))


class DomainHandler(BaseHandler):
	@tornado.web.authenticated
	def get(self):
		self.write(json.dumps(domain_list()))


class DomainOneHandler(BaseHandler):
	@tornado.web.authenticated
	def post(self):
		json_obj = json_decode(self.request.body)
		self.write(json.dumps(domain_list(json_obj['domain'])))


class DomainEditHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		domain_edit(json_obj['domain'], json_obj['description'], json_obj['aliases'], json_obj['boxes'], json_obj['quota'])


class AdminCreateHandler(BaseHandler):
	def post(self):
		print (self.request.body)
		json_obj = json_decode(self.request.body)
		username = json_obj['mail'].strip()
		password = json_obj['pass'].strip()
		self.write(json.dumps(admin_create(username, password)))


class DomainCreateHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		domain = json_obj['domain'].strip()
		description = json_obj['descr'].strip()
		alias = json_obj['alias'].strip()
		box = json_obj['box'].strip()
		quota = json_obj['quota'].strip()
		self.write(json.dumps(domain_create(domain, description, alias, box, quota)))


class DomainActiveEditHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		domain_active_edit(json_obj['dom'], json_obj['val'])


class DomainRemoveHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		domain_remove(json_obj['domain'])


class AdminRemoveHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		admin_remove(json_obj['admin'])


class BlacklistHandler(BaseHandler):
	@tornado.web.authenticated
	def get(self):
		self.write(json.dumps(black_list()))


class WhitelistHandler(BaseHandler):
	@tornado.web.authenticated
	def get(self):
		self.write(json.dumps(white_list()))


class BRemoveHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		b_remove(json_obj['sender'])


class WRemoveHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		w_remove(json_obj['sender'])


class BAddHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		b_add(json_obj['email'])


class WAddHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		w_add(json_obj['email'])


class BoxesHandler(BaseHandler):
	@tornado.web.authenticated
	def get(self):
		self.write(json.dumps(boxes()))


class AliasHandler(BaseHandler):
	@tornado.web.authenticated
	def get(self):
		self.write(json.dumps(aliases()))


class MailBoxActiveEditHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		box_active_edit(json_obj['box'], json_obj['val'])


class AliasActiveEditHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		alias_active_edit(json_obj['address'], json_obj['val'])


class BoxCreateHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		self.write(json.dumps(box_create(json_obj['mail'], json_obj['pass'], json_obj['name'])))


class BoxOneHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		self.write(json.dumps(boxes(json_obj['username'])))


class BoxEditHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		box_update(json_obj['username'], json_obj['pass'], json_obj['name'])


class BoxRemoveHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		box_remove(json_obj['username'])


class AliasCreateHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		self.write(json.dumps(alias_create(json_obj['address'], json_obj['goto'])))


class AliasOneHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		self.write(json.dumps(aliases(json_obj['address'])))


class AliasEditHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		alias_update(json_obj['address'], json_obj['goto'])


class AliasRemoveHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		alias_remove(json_obj['address'])


class PassCheckHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		self.write(pass_check(json_obj['username'], json_obj['pass']))


class PassUpdateHandler(BaseHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		pass_update(json_obj['username'], json_obj['pass'])


class Application(tornado.web.Application):
	def __init__(self):
		base_dir = os.path.dirname(__file__)
		settings = {
			"cookie_secret": "bZJc2sWbQLKos6GkHn2/VB9oXwQt8S0R0kRvJ5/xJ89E=",
			"login_url": "/login",
			'template_path': os.path.join(base_dir, "templates"),
			'static_path': os.path.join(base_dir, "static"),
			'debug': True,
			"xsrf_cookies": True,
		}

		tornado.web.Application.__init__(self, [
			tornado.web.url(r'/', MainHandler, name="main"),
			tornado.web.url(r'/login', LoginHandler, name="login"),
			tornado.web.url(r'/logout', LogoutHandler, name="logout"),
			tornado.web.url(r'/static/(.*)', tornado.web.StaticFileHandler),
			tornado.web.url(r'/admin-list', AdminHandler, name="admin-list"),
			tornado.web.url(r'/domain-list', DomainHandler, name="domain-list"),
			tornado.web.url(r'/domain-one', DomainOneHandler, name="domain-one"),
			tornado.web.url(r'/admin-create', AdminCreateHandler, name="admin-create"),
			tornado.web.url(r'/admin-remove', AdminRemoveHandler, name="admin-remove"),
			tornado.web.url(r'/domain-create', DomainCreateHandler, name="domain-create"),
			tornado.web.url(r'/domain-edit', DomainEditHandler, name="domain-edit"),
			tornado.web.url(r'/domain-remove', DomainRemoveHandler, name="domain-remove"),
			tornado.web.url(r'/b-remove', BRemoveHandler, name="b-remove"),
			tornado.web.url(r'/w-remove', WRemoveHandler, name="w-remove"),
			tornado.web.url(r'/b-add', BAddHandler, name="b-add"),
			tornado.web.url(r'/w-add', WAddHandler, name="w-add"),
			tornado.web.url(r'/domain-active-edit', DomainActiveEditHandler, name="domain-active-edit"),
			tornado.web.url(r'/blacklist', BlacklistHandler, name="blacklist"),
			tornado.web.url(r'/whitelist', WhitelistHandler, name="whitelist"),
			tornado.web.url(r'/boxes', BoxesHandler, name="boxes"),
			tornado.web.url(r'/aliases', AliasHandler, name="aliases"),
			tornado.web.url(r'/box-active', MailBoxActiveEditHandler, name="box-active"),
			tornado.web.url(r'/alias-active', AliasActiveEditHandler, name="alias-active"),
			tornado.web.url(r'/box-create', BoxCreateHandler, name="box-create"),
			tornado.web.url(r'/box-one', BoxOneHandler, name="box-one"),
			tornado.web.url(r'/box-edit', BoxEditHandler, name="box-edit"),
			tornado.web.url(r'/box-remove', BoxRemoveHandler, name="box-remove"),
			tornado.web.url(r'/alias-create', AliasCreateHandler, name="alias-create"),
			tornado.web.url(r'/alias-one', AliasOneHandler, name="alias-one"),
			tornado.web.url(r'/alias-edit', AliasEditHandler, name="alias-edit"),
			tornado.web.url(r'/alias-remove', AliasRemoveHandler, name="alias-remove"),
			tornado.web.url(r'/pass-check', PassCheckHandler, name="pass-check"),
			tornado.web.url(r'/pass-update', PassUpdateHandler, name="pass-update"),
		], **settings)


def main():
	tornado.options.parse_command_line()
	Application().listen(options.port)
	tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
	main()
