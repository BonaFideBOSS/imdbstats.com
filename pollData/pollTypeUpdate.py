import os
import json
import requests
from bs4 import BeautifulSoup

# ===== Read =====
print("-----> Reading old data.")
file = open("allimdbpolls.json", "r", encoding="utf-8")
data = json.load(file)
file.close()

count = 0
mainerrors = 0
failedlinks = []
suberrors = 0
failedlists = []

for i in data["polls"]:
    if i["type"] == "":
        listpage = i["url"].replace("poll", "list")
        try:
            myheader = {"User-Agent": "Mozilla/5.0"}
            connection = requests.get(listpage, headers=myheader)
            scrape = BeautifulSoup(connection.text, "html.parser")
            connection.close()

            polltype = scrape.select_one(".desc")
            if polltype:
                polltype = polltype.get_text()
                if "titles" in polltype or "title" in polltype:
                    polltype = "Titles"
                elif "images" in polltype or "image" in polltype:
                    polltype = "Images"
                elif "people" in polltype or "names" in polltype:
                    polltype = "People"
                i["type"] = polltype
                count = count + 1
                print("-----> Progress: " + str(count))
            else:
                suberrors = suberrors + 1
                failedlists.append(i["url"])
        except:
            mainerrors = mainerrors + 1
            failedlinks.append(i["url"])
            continue

print("-----> Logging report.")
reportlog = open("reportlog.txt", "w")
reportlog.write(
    "Fails: "
    + str(mainerrors)
    + "\n"
    + str(failedlinks)
    + "\nSub errors: "
    + str(suberrors)
    + "\n"
    + str(failedlists)
)
reportlog.close()
print("-----> Report logged.")

print("Saving...")
file = open("allimdbpolls.json", "w")
json.dump(data, file)
file.close()
print("-----> Data updated successfully.")
print("-----> Total no. of errors occurred: " + str(mainerrors + suberrors))
