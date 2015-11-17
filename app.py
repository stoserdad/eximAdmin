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
from getFromDataBase import admin_list, domain_list, admin_create

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


class AdminCreateHandler(tornado.web.RequestHandler):
	def post(self):
		print (self.request.body)
		json_obj = json_decode(self.request.body)
		username = json_obj['mail'].strip()
		password = json_obj['pass'].strip()
		domain = json_obj['domain'].strip()
		self.write(json.dumps(admin_create(username, password, domain)))


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
			tornado.web.url(r'/admin-create', AdminCreateHandler, name="admin-create"),
		], **settings)


def main():
	tornado.options.parse_command_line()
	Application().listen(options.port)
	tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
	main()
