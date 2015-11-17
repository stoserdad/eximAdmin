# coding: utf-8
from sqlalchemy import BigInteger, Column, DateTime, Enum, ForeignKey, Integer, String, Table, Text, text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()
metadata = Base.metadata


class Admin(Base):
    __tablename__ = 'admin'

    username = Column(String(255), primary_key=True)
    password = Column(String(255), nullable=False)
    created = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    modified = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    active = Column(Integer, nullable=False, server_default=text("'1'"))


class Alias(Base):
    __tablename__ = 'alias'

    address = Column(String(255), primary_key=True)
    goto = Column(Text, nullable=False)
    domain = Column(String(255), nullable=False, index=True)
    created = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    modified = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    active = Column(Integer, nullable=False, server_default=text("'1'"))


class AliasDomain(Base):
    __tablename__ = 'alias_domain'

    alias_domain = Column(String(255), primary_key=True)
    target_domain = Column(String(255), nullable=False, index=True)
    created = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    modified = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    active = Column(Integer, nullable=False, index=True, server_default=text("'1'"))


class Config(Base):
    __tablename__ = 'config'

    id = Column(Integer, primary_key=True)
    name = Column(String(20), nullable=False, unique=True, server_default=text("''"))
    value = Column(String(20), nullable=False, server_default=text("''"))


class Domain(Base):
    __tablename__ = 'domain'

    domain = Column(String(255), primary_key=True)
    description = Column(String(255), nullable=False)
    aliases = Column(Integer, nullable=False, server_default=text("'0'"))
    mailboxes = Column(Integer, nullable=False, server_default=text("'0'"))
    maxquota = Column(BigInteger, nullable=False, server_default=text("'0'"))
    quota = Column(BigInteger, nullable=False, server_default=text("'0'"))
    transport = Column(String(255), nullable=False)
    backupmx = Column(Integer, nullable=False, server_default=text("'0'"))
    created = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    modified = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    active = Column(Integer, nullable=False, server_default=text("'1'"))


t_domain_admins = Table(
    'domain_admins', metadata,
    Column('username', String(255), nullable=False, index=True),
    Column('domain', String(255), nullable=False),
    Column('created', DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'")),
    Column('active', Integer, nullable=False, server_default=text("'1'"))
)


class Fetchmail(Base):
    __tablename__ = 'fetchmail'

    id = Column(Integer, primary_key=True)
    mailbox = Column(String(255), nullable=False)
    src_server = Column(String(255), nullable=False)
    src_auth = Column(Enum(u'password', u'kerberos_v5', u'kerberos', u'kerberos_v4', u'gssapi', u'cram-md5', u'otp', u'ntlm', u'msn', u'ssh', u'any'))
    src_user = Column(String(255), nullable=False)
    src_password = Column(String(255), nullable=False)
    src_folder = Column(String(255), nullable=False)
    poll_time = Column(Integer, nullable=False, server_default=text("'10'"))
    fetchall = Column(Integer, nullable=False, server_default=text("'0'"))
    keep = Column(Integer, nullable=False, server_default=text("'0'"))
    protocol = Column(Enum(u'POP3', u'IMAP', u'POP2', u'ETRN', u'AUTO'))
    usessl = Column(Integer, nullable=False, server_default=text("'0'"))
    extra_options = Column(Text)
    returned_text = Column(Text)
    mda = Column(String(255), nullable=False)
    date = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))


t_log = Table(
    'log', metadata,
    Column('timestamp', DateTime, nullable=False, index=True, server_default=text("'0000-00-00 00:00:00'")),
    Column('username', String(255), nullable=False),
    Column('domain', String(255), nullable=False),
    Column('action', String(255), nullable=False),
    Column('data', Text, nullable=False)
)


class Mailbox(Base):
    __tablename__ = 'mailbox'

    username = Column(String(255), primary_key=True)
    password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    maildir = Column(String(255), nullable=False)
    quota = Column(BigInteger, nullable=False, server_default=text("'0'"))
    local_part = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=False, index=True)
    created = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    modified = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    active = Column(Integer, nullable=False, server_default=text("'1'"))


class Quota(Base):
    __tablename__ = 'quota'

    username = Column(String(255), primary_key=True, nullable=False)
    path = Column(String(100), primary_key=True, nullable=False)
    current = Column(BigInteger)


class Quota2(Base):
    __tablename__ = 'quota2'

    username = Column(String(100), primary_key=True)
    bytes = Column(BigInteger, nullable=False, server_default=text("'0'"))
    messages = Column(Integer, nullable=False, server_default=text("'0'"))


class Vacation(Base):
    __tablename__ = 'vacation'

    email = Column(String(255), primary_key=True, index=True)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    cache = Column(Text, nullable=False)
    domain = Column(String(255), nullable=False)
    created = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    active = Column(Integer, nullable=False, server_default=text("'1'"))


class VacationNotification(Base):
    __tablename__ = 'vacation_notification'

    on_vacation = Column(ForeignKey(u'vacation.email', ondelete=u'CASCADE'), primary_key=True, nullable=False)
    notified = Column(String(255), primary_key=True, nullable=False)
    notified_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))

    vacation = relationship(u'Vacation')
