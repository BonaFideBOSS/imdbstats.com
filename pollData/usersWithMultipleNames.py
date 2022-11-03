import os
import json
import time
from datetime import date, datetime, timedelta
from pytz import timezone
import requests
from bs4 import BeautifulSoup
import traceback

# ===== Read =====
print("-----> Reading old data.")
file = open("allimdbpolls.json", "r", encoding="utf-8")
data = json.load(file)
file.close()

mylist = {}
for i in data["polls"]:
        if i["authorid"] not in mylist:
                mylist[i["authorid"]] = [i["author"]]
        else:
                if i["author"] not in mylist[i["authorid"]]:
                        mylist[i["authorid"]].extend([i["author"]])

for key,value in mylist.items():
        if len(value) > 1:
                print(key,value)
