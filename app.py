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
		if "demo" == getusername and "demo" == getpassword:
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
		self.redirect(self.get_argument("next", self.reverse_url("login")))


class AdminHandler(tornado.web.RequestHandler):
	def get(self):
		self.write(json.dumps(admin_list()))


class DomainHandler(tornado.web.RequestHandler):
	def get(self):
		self.write(json.dumps(domain_list()))


class DomainOneHandler(tornado.web.RequestHandler):
	def post(self):
		json_obj = json_decode(self.request.body)
		print json_obj
		self.write(json.dumps(domain_list(json_obj['domain'])))


class AdminCreateHandler(tornado.web.RequestHandler):
	def post(self):
		print (self.request.body)
		json_obj = json_decode(self.request.body)
		username = json_obj['mail'].strip()
		password = json_obj['pass'].strip()
		# domain = json_obj['domain'].strip()
		self.write(json.dumps(admin_create(username, password)))


class DomainCreateHandler(tornado.web.RequestHandler):
	def post(self):
		print (self.request.body)
		json_obj = json_decode(self.request.body)
		domain = json_obj['domain'].strip()
		description = json_obj['descr'].strip()
		alias = json_obj['alias'].strip()
		box = json_obj['box'].strip()
		quota = json_obj['quota'].strip()
		self.write(json.dumps(domain_create(domain, description, alias, box, quota)))


class DomainActiveEditHandler(tornado.web.RequestHandler):
	def post(self):
		print self.request.body
		json_obj = json_decode(self.request.body)
		domain_active_edit(json_obj['dom'], json_obj['val'])


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
			tornado.web.url(r'/domain-create', DomainCreateHandler, name="domain-create"),
			tornado.web.url(r'/domain-active-edit', DomainActiveEditHandler, name="domain-active-edit"),
		], **settings)


def main():
	tornado.options.parse_command_line()
	Application().listen(options.port)
	tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
	main()
