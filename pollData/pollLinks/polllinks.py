import os
import requests
from bs4 import BeautifulSoup

with open("polllinks.txt") as file:
    savedlinks = file.read().splitlines()
file.close()

newlinks = []
newdata = []

totalpolls = 0


def connect(resultURL):
    global totalpolls
    connection = requests.get(resultURL)
    scrape = BeautifulSoup(connection.text, "html.parser")
    connection.close()
    featured = scrape.select_one(".poll-featured .action form")
    links = scrape.select(".poll.teaser b a", href=True)
    nxt = "yes"

    if featured:
        featuredlink = "https://www.imdb.com" + featured.get("action")
        if featuredlink not in savedlinks:
            newlinks.append(featuredlink)
            data = (
                '{"url":"'
                + featuredlink
                + '","title": "","type":"","authorid":"","author":"","date":"","votes":"","featured":"No","status":"Live"}'
            )
            newdata.append(data)
            totalpolls = 1

    for a in links:
        link = "https://www.imdb.com" + (a["href"]).replace("?ref_=po_ho", "")

        if link not in savedlinks:
            newlinks.append(link)
            data = (
                '{"url":"'
                + link
                + '","title": "","type":"","authorid":"","author":"","date":"","votes":"","featured":"No","status":"Live"}'
            )
            newdata.append(data)
            totalpolls = totalpolls + 1
        else:
            nxt = "no"

    print("-----> Total new polls: " + str(totalpolls))

    nextpage = scrape.select_one('a[href*="&start"]', href=True)
    if nextpage:
        if nxt == "yes":
            resultURL = "https://www.imdb.com/poll/" + nextpage["href"]
            connect(resultURL)


connect("https://www.imdb.com/poll/")

if totalpolls > 0:
    file = open("newpolls.txt", "w")
    for i in newdata:
        file.write(i + ",")
    file.write("\nTotal New Poll Links: " + str(totalpolls))
    file.close()
    file = open("polllinks.txt", "a")
    for i in newlinks:
        file.write("\n" + i)
    file.close()
    file = open("savedpolls.txt", "a")
    for i in newdata:
        file.write(i + ",")
    file.close()
    print("-----> New poll links retrieved successfully!")
else:
    print("-----> No new polls found.")
