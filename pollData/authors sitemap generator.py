import os
import json
import time
from datetime import date, datetime, timedelta
from pytz import timezone
import requests
from bs4 import BeautifulSoup

tz = timezone("EST")
timerstart = datetime.now()

# ===== Read =====
print("-----> Reading old data.")
file = open("allimdbpolls.json", "r", encoding="utf-8")
data = json.load(file)
file.close()

totalauthors = len(data["authors"])
print("-----> Total Authors: " + str(totalauthors))

# ===== Update =====
print("-----> Updating data.")

currentAuthor = 0
errors = 0
failedAuthors = []

for i in data["authors"]:
    authorId = i["authorid"]
    print('<url>\n<loc>https://imdbstats.com/user?id='+authorId+'</loc>\n<changefreq>monthly</changefreq>\n<priority>0.90</priority>\n</url>')
    