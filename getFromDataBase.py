from sqlalchemy import create_engine

engine = create_engine('mysql://root:@localhost/exim_admin')


def admin_list():
	return [dict(row) for row in engine.execute('select username, active, UNIX_TIMESTAMP(modified) as modified from admin')]


def domain_list():
	return [dict(row) for row in engine.execute('select D.domain, D.description, D.aliases, D.mailboxes, D.backupmx, UNIX_TIMESTAMP(D.modified) as modified, D.active,   coalesce(A.cnt, 0) as aliases_used, coalesce(M.cnt, 0) as mailbox_used   from  domain as D   left join   (select count(*) as cnt ,domain from alias where address != goto group by domain) as A on A.domain = D.domain   left join   (select count(*) as cnt ,domain from mailbox group by domain) as M on D.domain = M.domain;')]