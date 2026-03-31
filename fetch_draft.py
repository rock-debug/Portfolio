import requests
import json
from bs4 import BeautifulSoup
import traceback

stats = {
    "leetcode": {},
    "geeksforgeeks": {},
    "hackerrank": {}
}

# Leetcode
try:
    url = "https://leetcode.com/graphql"
    payload = {
        "operationName": "getUserProfile",
        "variables": { "username": "rock17" },
        "query": "query getUserProfile($username: String!) { matchedUser(username: $username) { profile { ranking } submitStats { acSubmissionNum { difficulty count } } } }"
    }
    r = requests.post(url, json=payload, timeout=10)
    data = r.json()
    ac = data["data"]["matchedUser"]["submitStats"]["acSubmissionNum"]
    stats["leetcode"]["total"] = next((x["count"] for x in ac if x["difficulty"] == "All"), 0)
    stats["leetcode"]["easy"] = next((x["count"] for x in ac if x["difficulty"] == "Easy"), 0)
    stats["leetcode"]["medium"] = next((x["count"] for x in ac if x["difficulty"] == "Medium"), 0)
    stats["leetcode"]["hard"] = next((x["count"] for x in ac if x["difficulty"] == "Hard"), 0)
    stats["leetcode"]["ranking"] = data["data"]["matchedUser"]["profile"]["ranking"]
except Exception as e:
    stats["leetcode"]["error"] = str(e)

# HackerRank
try:
    url = "https://www.hackerrank.com/rest/hackers/ryanrony2005/badges"
    headers = {"User-Agent": "Mozilla/5.0"}
    r = requests.get(url, headers=headers, timeout=10)
    data = r.json()
    models = data.get("models", [])
    stars = sum(m.get("stars", 0) for m in models)
    badges = [{"name": m.get("badge_name"), "stars": m.get("stars")} for m in models]
    stats["hackerrank"]["total_stars"] = stars
    stats["hackerrank"]["badges"] = badges
except Exception as e:
    stats["hackerrank"]["error"] = str(e)

# GFG
try:
    url = "https://www.geeksforgeeks.org/profile/rockdebug/"
    headers = {"User-Agent": "Mozilla/5.0"}
    r = requests.get(url, headers=headers, timeout=10)
    stats["geeksforgeeks"]["html_snippet"] = r.text[15000:16000] # just to see if we get the actual page
    soup = BeautifulSoup(r.text, "html.parser")
    # GFG uses a script tag with id "__NEXT_DATA__" containing all the stats in JSON!
    next_data = soup.find("script", id="__NEXT_DATA__")
    if next_data:
        gfg_json = json.loads(next_data.string)
        user_info = gfg_json["props"]["pageProps"]["userInfo"]
        stats["geeksforgeeks"]["score"] = user_info.get("score")
        stats["geeksforgeeks"]["pod_solved"] = user_info.get("pod_solved")
        stats["geeksforgeeks"]["total_problems_solved"] = user_info.get("total_problems_solved")
        stats["geeksforgeeks"]["institute_rank"] = user_info.get("institute_rank")
    else:
        # maybe it's not nextjs anymore?
        # Find score based on text
        score_div = soup.find(string="Overall Coding Score")
        if score_div:
            val = score_div.find_next("span")
            stats["geeksforgeeks"]["score_text"] = val.text if val else "not found"
except Exception as e:
    stats["geeksforgeeks"]["error"] = str(e)
    stats["geeksforgeeks"]["trace"] = traceback.format_exc()

with open("coding_stats.json", "w") as f:
    json.dump(stats, f, indent=2)
print("Done writing coding_stats.json")
