from sqlalchemy import create_engine
from sqlalchemy import Table, MetaData
from datetime import datetime
from functions import pass_crypt
from sqlalchemy.exc import IntegrityError

engine = create_engine('mysql://root:@localhost/exim_admin')
meta = MetaData(bind=engine, reflect=True)


def admin_list():
	return [dict(row) for row in engine.execute('select A.username, A.active, UNIX_TIMESTAMP(A.modified) as modified, D.domain from admin as A, domain_admins as D where A.username=D.username')]


def domain_list():
	return [dict(row) for row in engine.execute('select D.domain, D.description, D.aliases, D.mailboxes, D.backupmx, UNIX_TIMESTAMP(D.modified) as modified, D.active,   coalesce(A.cnt, 0) as aliases_used, coalesce(M.cnt, 0) as mailbox_used   from  domain as D   left join   (select count(*) as cnt ,domain from alias where address != goto group by domain) as A on A.domain = D.domain   left join   (select count(*) as cnt ,domain from mailbox group by domain) as M on D.domain = M.domain;')]


def admin_create(username, password, domain):
	admin = meta.tables['admin']
	domain_admins = meta.tables['domain_admins']
	try:
		engine.execute(admin.insert(), username=username, active=1, created=datetime.now(), modified=datetime.now(), password=pass_crypt(password))
	except IntegrityError as e:
		return e.orig[1]
	try:
		engine.execute(domain_admins.insert(), username=username, domain=domain, created=datetime.now(), active=1)
	except IntegrityError as e:
		return e.orig[1]
	return 'Admin added'
