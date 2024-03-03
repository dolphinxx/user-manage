DROP TABLE IF EXISTS `admin`;
DROP TABLE IF EXISTS `user`;
CREATE TABLE `admin` (
  id INTEGER PRIMARY KEY,
  name TEXT (64) NOT NULL,
  username TEXT (64) NOT NULL,
  password TEXT (64) NOT NULL,
  status INTEGER NOT NULL DEFAULT (1),
  remark TEXT,
  createTime INTEGER,
  updateTime INTEGER
);

CREATE TABLE `user` (
  id INTEGER PRIMARY KEY,
  name TEXT (64) NOT NULL,
  phone TEXT (20) NOT NULL,
  idCard TEXT (24) NOT NULL,
  status INTEGER NOT NULL DEFAULT (1),
  remark TEXT,
  createTime INTEGER,
  updateTime INTEGER
);
