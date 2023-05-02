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
    if i["avatar"] != "":
        continue
    try:
        profileURL = "https://www.imdb.com/user/" + authorId

        myheader = {"User-Agent": "Mozilla/5.0"}

        connection = requests.get(profileURL, headers=myheader)
        scrape = BeautifulSoup(connection.text, "html.parser")
        connection.close()

        imagelink = scrape.select_one("#avatar")
        if imagelink:
            i["avatar"] = imagelink["src"]

        currentAuthor = currentAuthor + 1
        print("-----> Progress: " + str(currentAuthor))
    except:
        failedAuthors.append(authorId)
        currentAuthor = currentAuthor + 1
        errors = errors + 1
        print("Error occurred at: " + str(currentAuthor))
        continue

# ===== Save =====
file = open("allimdbpolls.json", "w")
json.dump(data, file)
file.close()
print("-----> Data updated successfully.")
print("-----> Total no. of errors occurred: " + str(errors))

# ===== Log =====
print("-----> Logging report.")
reportlog = open("reportlog.txt", "w")
reportlog.write(
    "Authors failed to retrieve:\nFails: " + str(errors) + "\n" + str(failedAuthors)
)
reportlog.close()
print("-----> Report logged.")

timerend = datetime.now()
difference = (timerend - timerstart).total_seconds()
print(
    time.strftime(
        "-----> Total Time taken: %H hours %M minutes %S seconds",
        time.gmtime(difference),
    )
)
