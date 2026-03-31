import requests
import json
from bs4 import BeautifulSoup

def test_leetcode():
    url = "https://leetcode.com/graphql"
    payload = {
        "operationName": "getUserProfile",
        "variables": { "username": "rock17" },
        "query": "query getUserProfile($username: String!) { matchedUser(username: $username) { profile { ranking } submitStats { acSubmissionNum { difficulty count } } } }"
    }
    try:
        r = requests.post(url, json=payload, timeout=5)
        print("LeetCode:", r.status_code, r.text[:200])
    except Exception as e:
        print("LeetCode Error:", e)

def test_gfg():
    url2 = "https://www.geeksforgeeks.org/profile/rockdebug/"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        r = requests.get(url2, headers=headers, timeout=5)
        soup = BeautifulSoup(r.text, "html.parser")
        title = soup.title.text if soup.title else "No Title"
        print("GFG Title:", title)
    except Exception as e:
        print("GFG Error:", e)

def test_hackerrank():
    url = "https://www.hackerrank.com/rest/hackers/ryanrony2005/badges"
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get(url, headers=headers, timeout=5)
        print("HackerRank:", r.status_code, r.text[:200])
    except Exception as e:
        print("HackerRank Error:", e)

test_leetcode()
test_gfg()
test_hackerrank()
