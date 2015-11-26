# -*- coding:utf-8 -*-
from sqlalchemy import create_engine
from sqlalchemy import MetaData
from datetime import datetime
from functions import pass_crypt
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from sqlalchemy.sql import func
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import and_

engine = create_engine('mysql://root:@localhost/exim_2?charset=utf8')
meta = MetaData(bind=engine, reflect=True)


def admin_list():
	admin = meta.tables['admin']
	return [dict(row) for row in engine.execute(select([admin.c.username,
														admin.c.active,
														func.unix_timestamp(admin.c.modified).label('modified')]))]


def domain_list(domain_name=''):
	Session = sessionmaker(autoflush=False)
	Session.configure(bind=engine)
	session = Session()
	domain = meta.tables['domain']
	alias = meta.tables['alias']
	mailbox = meta.tables['mailbox']
	msubq = session.query(func.count(mailbox.c.domain).label('mailbox_count'), mailbox.c.domain).group_by(mailbox.c.domain).subquery()
	asubq = session.query(func.count(alias.c.domain).label('alias_count'), alias.c.domain).filter(alias.c.address != alias.c.goto).group_by(alias.c.domain).subquery()
	query = session.query(domain.c.domain,
						  domain.c.description,
						  domain.c.aliases,
						  domain.c.mailboxes,
						  domain.c.active,
						  domain.c.quota,
						  func.unix_timestamp(domain.c.modified).label('modified'),
						  func.coalesce(msubq.c.mailbox_count, 0),
						  func.coalesce(asubq.c.alias_count, 0)).\
		outerjoin(msubq, domain.c.domain == msubq.c.domain).\
		outerjoin(asubq, domain.c.domain == asubq.c.domain).filter(domain.c.domain.like('%' + domain_name))
	out = []
	for dom, descr, alias, box, active, quota, modif, m_count, a_count in query:
		out.append(dict(domain=dom,
						description=descr,
						aliases=alias,
						mailboxes=box,
						active=active,
						modified=modif,
						mailbox_used=m_count,
						alias_used=a_count,
						quota=quota))
	session.close()
	return out


def admin_create(username, password):
	admin = meta.tables['admin']
	try:
		engine.execute(admin.insert(), username=username,
					   active=1,
					   created=datetime.now(),
					   modified=datetime.now(),
					   password=pass_crypt(password))
	except IntegrityError as e:
		return e.orig[1]
	return 'Admin added'


def domain_create(domain, description, aliases, boxes, quota):
	domain_t = meta.tables['domain']
	try:
		engine.execute(domain_t.insert(), domain=domain,
					   description=description,
					   aliases=aliases,
					   mailboxes=boxes,
					   quota=quota,
					   created=datetime.now(),
					   modified=datetime.now(),
					   active=1)
	except IntegrityError as e:
		return e.orig[1]
	return 'Domain added'


def domain_active_edit(domain, active):
	domain_t = meta.tables['domain']
	engine.execute(domain_t.update().where(domain_t.c.domain == domain).values(active=active, modified=datetime.now()))


def domain_edit(domain, description, aliases, boxes, quota):
	domain_t = meta.tables['domain']
	engine.execute(domain_t.update().where(domain_t.c.domain == domain).values(description=description,
																			   aliases=aliases,
																			   mailboxes=boxes,
																			   quota=quota,
																			   modified=datetime.now()))


def domain_remove(domain):
	domain_t = meta.tables['domain']
	engine.execute(domain_t.delete().where(domain_t.c.domain == domain))


def admin_remove(admin):
	admin_t = meta.tables['admin']
	engine.execute(admin_t.delete().where(admin_t.c.username == admin))


def black_list():
	blacklist = meta.tables['blacklist']
	return [dict(row) for row in engine.execute(select([blacklist.c.senders,
														func.unix_timestamp(blacklist.c.when_added).label('when_add')]))]


def white_list():
	whitelist = meta.tables['whitelist']
	return [dict(row) for row in engine.execute(select([whitelist.c.senders,
														func.unix_timestamp(whitelist.c.when_added).label('when_add')]))]


def b_remove(sender):
	blacklist = meta.tables['blacklist']
	engine.execute(blacklist.delete().where(blacklist.c.senders == sender))


def w_remove(sender):
	whitelist = meta.tables['whitelist']
	engine.execute(whitelist.delete().where(whitelist.c.senders == sender))


def b_add(email):
	blacklist = meta.tables['blacklist']
	try:
		engine.execute(blacklist.insert(), senders=email, when_added=datetime.now())
	except IntegrityError as e:
		return e.orig[1]
	return 'Host/email added'


def w_add(email):
	whitelist = meta.tables['whitelist']
	try:
		engine.execute(whitelist.insert(), senders=email, when_added=datetime.now())
	except IntegrityError as e:
		return e.orig[1]
	return 'Host/email added'


def boxes(username=''):
	mailbox = meta.tables['mailbox']
	return [dict(row) for row in engine.execute(select([mailbox.c.username,
														mailbox.c.name,
														func.unix_timestamp(mailbox.c.modified).label('modified'),
														mailbox.c.active]).where(mailbox.c.username.like('%' + username)))]


def aliases(address=''):
	alias = meta.tables['alias']
	return [dict(row) for row in engine.execute(select([alias.c.address,
														alias.c.goto,
														func.unix_timestamp(alias.c.modified).label('modified'),
														alias.c.active]).where(alias.c.address.like('%' + address)))]


def box_active_edit(box, active):
	mailbox = meta.tables['mailbox']
	engine.execute(mailbox.update().where(mailbox.c.username == box).values(active=active, modified=datetime.now()))


def alias_active_edit(address, active):
	alias = meta.tables['alias']
	engine.execute(alias.update().where(alias.c.address == address).values(active=active, modified=datetime.now()))


def box_create(mail, password, name):
	mailbox = meta.tables['mailbox']
	try:
		engine.execute(mailbox.insert(), username=mail,
					   password=pass_crypt(password),
					   name=name,
					   maildir=mail,
					   quota=0,
					   local_part=mail.split('@')[0],
					   domain=mail.split('@')[-1],
					   created=datetime.now(), modified=datetime.now(), active=1)
	except IntegrityError as e:
		return e.orig[1]
	return 'Host/email added'


def box_update(username, password, name):
	mailbox = meta.tables['mailbox']
	if password:
		engine.execute(mailbox.update().where(mailbox.c.username == username).values(password=pass_crypt(password),
																				 name=name,
																				 modified=datetime.now()))
	else:
		engine.execute(mailbox.update().where(mailbox.c.username == username).values(name=name,
																				 modified=datetime.now()))


def box_remove(username):
	mailbox = meta.tables['mailbox']
	engine.execute(mailbox.delete().where(mailbox.c.username == username))


def alias_create(address, goto):
	alias = meta.tables['alias']
	try:
		engine.execute(alias.insert(), address=address,
					   goto=goto.replace('\n', ','),
					   domain=address.split('@')[-1],
					   created=datetime.now(),
					   modified=datetime.now(),
					   active=1)
	except IntegrityError as e:
		return e.orig[1]
	return 'Alias added'


def alias_update(address, goto):
	alias = meta.tables['alias']
	engine.execute(alias.update().where(alias.c.address == address).values(goto=goto, modified=datetime.now()))


def alias_remove(address):
	alias = meta.tables['alias']
	engine.execute(alias.delete().where(alias.c.address == address))


def check_username(username):
	admin = meta.tables['admin']
	if [dict(row) for row in engine.execute(select([admin.c.username]).where(and_(admin.c.username == username,
																				 	  admin.c.active == 1)))]:
		return True


def check_password(username, password):
	admin = meta.tables['admin']
	data = [dict(row) for row in engine.execute(select([admin.c.password]).where(and_(admin.c.username == username,
																				 	  admin.c.active == 1)))]
	if pass_crypt(password, data[0]['password']):
		return True


def pass_check(username, password):
	admin = meta.tables['admin']
	data = [dict(row) for row in engine.execute(select([admin.c.password]).where(and_(admin.c.username == username,
																				 	  admin.c.active == 1)))]
	if pass_crypt(password, data[0]['password']):
		return 'true'
	else:
		return 'false'


def pass_update(username, password):
	admin = meta.tables['admin']
	engine.execute(admin.update().where(admin.c.username == username).values(password=pass_crypt(password),
																			 modified=datetime.now()))
