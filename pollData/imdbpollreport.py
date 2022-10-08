import os
import json
import time
from datetime import date, datetime, timedelta
from pytz import timezone
import requests
from bs4 import BeautifulSoup
import traceback

from sys import exit

tz = timezone("EST")
timerstart = datetime.now()

# ===== Read =====
print("-----> Reading old data.")
file = open("allimdbpolls.json", "r", encoding="utf-8")
data = json.load(file)
file.close()

# ===== Backup =====
print("-----> Creating backup.")
backup = open("allimdbpolls_backup.json", "w", encoding="utf-8")
json.dump(data, backup)
backup.close()
print("-----> Backup created.")

totalpolls = len(data["polls"])
print("-----> Total Polls: " + str(totalpolls))

# ===== Update =====
print("-----> Updating data.")
data["totalpolls"] = totalpolls
data["lastupdated"] = datetime.now(tz).strftime("%A, %B %d, %Y - %H:%M %Z")
data["rawdate"] = str(datetime.now(tz))

currentPoll = 0
errors = 0
failedlinks = []

errorpolls = []

for i in data["polls"]:
    pollLink = i["url"]
    if i["status"] == "Live":
        if i["votes"] == "" or i["url"] in errorpolls:
            try:
                resultURL = pollLink
                mobileURL = pollLink.replace("www", "m")
                if pollLink.endswith("/"):
                    resultURL = pollLink + "results"
                else:
                    resultURL = pollLink + "/results"

                myheader = {"User-Agent": "Mozilla/5.0", "Connection": "keep-alive"}

                connection = requests.get(resultURL, headers=myheader)
                scrape = BeautifulSoup(connection.text, "html.parser")
                connection.close()
                connectionMobile = requests.get(mobileURL, headers=myheader)
                scrapeMob = BeautifulSoup(connectionMobile.text, "html.parser")
                connectionMobile.close()

                pollTitle = scrape.title.text[14:-7]
                user = scrape.select_one(".poll .byline a", href=True)
                authorid = ""
                author = ""
                if user:
                    authorid = user["href"][6:-1]
                    author = user.get_text()
                inactivecheck = ""
                closedcheck = ""
                inactivecheckHTML = scrapeMob.select_one(".col-xs-12")
                if inactivecheckHTML:
                    inactivecheck = inactivecheckHTML.get_text()
                closedcheckHTML = scrape.select_one(".poll.results h2")
                if closedcheckHTML:
                    closedcheck = closedcheckHTML.get_text()
                if ("inactive" not in inactivecheck) & ("closed" not in closedcheck):
                    status = "Live"
                    polldate = scrapeMob.select_one(".btn-full .media .media-body")
                    xxdate = scrapeMob.select_one(
                        ".btn-full .media .media-body .media-heading"
                    )
                    if polldate:
                        polldate = polldate.get_text().replace(xxdate.get_text(), "")[
                            8:
                        ]
                        if (":" not in polldate) & ("ago" not in polldate):
                            polldate = datetime.strptime(polldate, "%b %d %Y").strftime(
                                "%Y/%m/%d"
                            )
                        elif ":" in polldate:
                            polldate = str(datetime.today().year) + datetime.strptime(
                                polldate, "%b %d %H:%M"
                            ).strftime("/%m/%d")
                            if datetime.strptime(polldate, "%Y/%m/%d") > datetime.now():
                                polldate = str(
                                    datetime.today().year - 1
                                ) + datetime.strptime(polldate, "%Y/%m/%d").strftime(
                                    "/%m/%d"
                                )
                        elif "days ago" in polldate or "day ago" in polldate:
                            polldate = polldate[:1]
                            polldate = (
                                datetime.today() - timedelta(int(polldate))
                            ).strftime("%Y/%m/%d")
                        elif "hours ago" in polldate or "hour ago" in polldate:
                            polldate = datetime.today().strftime("%Y/%m/%d")
                        elif "minutes ago" in polldate or "minute ago" in polldate:
                            polldate = datetime.today().strftime("%Y/%m/%d")
                elif "inactive" in inactivecheck:
                    status = "Inactive"
                elif "closed" in closedcheck:
                    status = "Closed"
                else:
                    status = "unknown"
                voteCountRaw = scrape.select_one(".poll.results .article h2").text[
                    11:-7
                ]
                voteCount = voteCountRaw.replace(",", "").strip()

                i["title"] = pollTitle
                i["authorid"] = authorid
                i["author"] = author
                i["votes"] = int(voteCount)
                if polldate != None:
                    i["date"] = polldate
                i["status"] = status

                currentPoll = currentPoll + 1
                print("-----> Progress: " + str(currentPoll))
            except Exception as e:
                failedlinks.append(pollLink)
                currentPoll = currentPoll + 1
                errors = errors + 1
                print("Error occurred at: " + str(currentPoll))
                print(e)
                print(traceback.format_exc())
                continue

totalvotes = 0
featuredpolls = 0
for i in data["polls"]:
    if i["votes"] != "":
        totalvotes = totalvotes + i["votes"]
    if i["featured"].lower() == "yes":
        featuredpolls = featuredpolls + 1
data["totalvotes"] = totalvotes
data["totalfeatures"] = featuredpolls

totalauthors = {i["authorid"] for i in data["polls"]}
data["totalauthors"] = len(totalauthors)
savedauthors = {d["authorid"] for d in data["authors"]}
for i in totalauthors:
    if i not in savedauthors:
        data["authors"].append({"authorid": i, "avatar": ""})

# ===== Save =====
file = open("allimdbpolls.json", "w")
json.dump(data, file)
file.close()
print("-----> Data updated successfully.")
print("-----> Total no. of errors occurred: " + str(errors))

# ===== Log =====
print("-----> Logging report.")
reportlog = open("reportlog.txt", "w")
reportlog.write("Fails: " + str(errors) + "\n" + str(failedlinks))
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
