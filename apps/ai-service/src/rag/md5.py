import os
from dotenv import load_dotenv
load_dotenv()

import hashlib

class MD5:
	def __init__(self, file_path: str) -> None:
		self.file_path = os.environ.get("FILE_MD5_PATH") or file_path

	# 根据str生成md5，并将生成的md5存到本地文件
	def generate_md5(self, s: str, encoding: str = "utf-8") -> str:
		_s = s.encode(encoding)
		_md5 = hashlib.md5() # 创建md5对象
		_md5.update(_s) # 更新md5对象
		return _md5.hexdigest() # 转成十六进, 返回md5值

	# 根据md5文件，读取md5值
	def read_md5(self) -> str:
		with open(self.file_path, "r", encoding="utf-8") as f:
			return f.read()

	# 根据md5文件，写入md5值
	def write_md5(self, md5: str) -> None:
		os.makedirs(os.path.dirname(self.file_path) or ".", exist_ok=True)
		with open(self.file_path, "w", encoding="utf-8") as f:
			f.write(md5 + '\n')

	# 判断当前md5在文件中是否存在
	def md5_exists(self, md5: str) -> bool:
		if not os.path.exists(self.file_path):
			return False
		with open(self.file_path, "r", encoding="utf-8") as f:
			return md5 in f.readlines()

	# 根据字符串生成md5, 判断md5是否在文件中, 如果没有就将md5写入文件
	def md5_and_write(self, s: str, encoding: str = "utf-8") -> str:
		md5 = self.generate_md5(s, encoding)
		if not self.md5_exists(md5):
			self.write_md5(md5)
		return md5

if __name__ == "__main__":
	# _md5 = MD5("test.md5")
	# print(_md5.md5_and_write("test"))
	# print(_md5.md5_and_write("test"))
  pass