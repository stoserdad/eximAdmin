# -*- coding:utf-8 -*-
from sqlalchemy import create_engine
from sqlalchemy import MetaData
from datetime import datetime
from functions import pass_crypt
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from sqlalchemy.sql import func
from sqlalchemy.orm import sessionmaker

engine = create_engine('mysql://root:@localhost/exim_2?charset=utf8')
meta = MetaData(bind=engine, reflect=True)


def admin_list():
	admin = meta.tables['admin']
	return [dict(row) for row in engine.execute(select([admin.c.username, admin.c.active, func.unix_timestamp(admin.c.modified).label('modified')]))]


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
		out.append(dict(domain=dom, description=descr, aliases=alias, mailboxes=box, active=active, modified=modif, mailbox_used=m_count, alias_used=a_count, quota=quota))
	session.close()
	return out


def admin_create(username, password):
	admin = meta.tables['admin']
	try:
		engine.execute(admin.insert(), username=username, active=1, created=datetime.now(), modified=datetime.now(), password=pass_crypt(password))
	except IntegrityError as e:
		return e.orig[1]
	return 'Admin added'


def domain_create(domain, description, aliases, boxes, quota):
	domain_t = meta.tables['domain']
	try:
		engine.execute(domain_t.insert(), domain=domain, description=description, aliases=aliases, mailboxes=boxes, quota=quota, created=datetime.now(), modified=datetime.now(), active=1)
	except IntegrityError as e:
		return e.orig[1]
	return 'Domain added'


def domain_active_edit(domain, active):
	domain_t = meta.tables['domain']
	engine.execute(domain_t.update().where(domain_t.c.domain == domain).values(active=active, modified=datetime.now()))


def domain_edit(domain, description, aliases, boxes, quota):
	domain_t = meta.tables['domain']
	engine.execute(domain_t.update().where(domain_t.c.domain == domain).values(description=description, aliases=aliases, mailboxes=boxes, quota=quota, modified=datetime.now()))


def domain_remove(domain):
	domain_t = meta.tables['domain']
	engine.execute(domain_t.delete().where(domain_t.c.domain == domain))


def admin_remove(admin):
	admin_t = meta.tables['admin']
	engine.execute(admin_t.delete().where(admin_t.c.username == admin))


def black_list():
	blacklist = meta.tables['blacklist']
	return [dict(row) for row in engine.execute(select([blacklist.c.senders, func.unix_timestamp(blacklist.c.when_added).label('when_add')]))]


def white_list():
	whitelist = meta.tables['whitelist']
	return [dict(row) for row in engine.execute(select([whitelist.c.senders, func.unix_timestamp(whitelist.c.when_added).label('when_add')]))]


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


def boxes():
	mailbox = meta.tables['mailbox']
	return [dict(row) for row in engine.execute(select([mailbox.c.username, mailbox.c.name, func.unix_timestamp(mailbox.c.modified).label('modified'), mailbox.c.active]))]


def aliases():
	alias = meta.tables['alias']
	return [dict(row) for row in engine.execute(select([alias.c.address, alias.c.goto, func.unix_timestamp(alias.c.modified).label('modified'), alias.c.active]))]

