from passlib.hash import md5_crypt


def pass_crypt(passw, pass_db=''):

	if pass_db:
		salt = pass_db.split('$')[2]
		if md5_crypt.encrypt(passw, salt=salt) == pass_db:
			return True
	else:
		return md5_crypt.encrypt(passw, salt_size=8)
