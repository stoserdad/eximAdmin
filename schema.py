# coding: utf-8
from sqlalchemy import BigInteger, Column, Date, DateTime, Integer, String, text
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


class Alia(Base):
    __tablename__ = 'alias'

    address = Column(String(255), primary_key=True)
    goto = Column(String, nullable=False)
    domain = Column(String(255), nullable=False, index=True)
    created = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    modified = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    active = Column(Integer, nullable=False, server_default=text("'1'"))


class Blacklist(Base):
    __tablename__ = 'blacklist'

    senders = Column(String(128), primary_key=True, server_default=text("''"))
    when_added = Column(Date, nullable=False)


class BlacklistHost(Base):
    __tablename__ = 'blacklist_host'

    senders = Column(String(64), primary_key=True, server_default=text("''"))
    when_added = Column(Date, nullable=False)


class Domain(Base):
    __tablename__ = 'domain'

    domain = Column(String(255), primary_key=True)
    description = Column(String(255), nullable=False)
    aliases = Column(Integer, nullable=False, server_default=text("'0'"))
    mailboxes = Column(Integer, nullable=False, server_default=text("'0'"))
    quota = Column(BigInteger, nullable=False, server_default=text("'0'"))
    created = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    modified = Column(DateTime, nullable=False, server_default=text("'0000-00-00 00:00:00'"))
    active = Column(Integer, nullable=False, server_default=text("'1'"))


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


class Whitelist(Base):
    __tablename__ = 'whitelist'

    senders = Column(String(128), primary_key=True, server_default=text("''"))
    when_added = Column(Date, nullable=False)
