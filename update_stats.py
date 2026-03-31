import requests
import json
from bs4 import BeautifulSoup
import os

stats = {
    "leetcode": {},
    "geeksforgeeks": {},
    "hackerrank": {}
}

# --- Leetcode ---
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
    
    # Format ranking -> "865K"
    rank = int(data["data"]["matchedUser"]["profile"]["ranking"])
    if rank >= 1000:
        stats["leetcode"]["ranking"] = f"#{rank//1000}K"
    else:
        stats["leetcode"]["ranking"] = f"#{rank}"
except Exception as e:
    stats["leetcode"]["error"] = str(e)

# --- HackerRank ---
def get_stars_str(count):
    count = min(count, 5)
    return ("★" * count) + ("☆" * (5 - count))

try:
    url = "https://www.hackerrank.com/rest/hackers/ryanrony2005/badges"
    headers = {"User-Agent": "Mozilla/5.0"}
    r = requests.get(url, headers=headers, timeout=10)
    data = r.json()
    models = data.get("models", [])
    
    badge_dict = {}
    total_stars = 0
    for m in models:
        name = m.get("badge_name")
        stars = m.get("stars", 0)
        total_stars += stars
        if name:
            badge_dict[name] = get_stars_str(stars)
            badge_dict[name + "_raw"] = stars
    
    stats["hackerrank"]["total_stars"] = total_stars
    stats["hackerrank"]["badges"] = badge_dict
except Exception as e:
    stats["hackerrank"]["error"] = str(e)

# --- GeeksForGeeks ---
try:
    url = "https://www.geeksforgeeks.org/profile/rockdebug/"
    headers = {"User-Agent": "Mozilla/5.0"}
    r = requests.get(url, headers=headers, timeout=10)
    soup = BeautifulSoup(r.text, "html.parser")
    next_data = soup.find("script", id="__NEXT_DATA__")
    if next_data:
        gfg_json = json.loads(next_data.string)
        user_info = gfg_json["props"]["pageProps"]["userInfo"]
        stats["geeksforgeeks"]["score"] = user_info.get("score")
        stats["geeksforgeeks"]["total_problems_solved"] = user_info.get("total_problems_solved")
        rank = user_info.get("institute_rank")
        stats["geeksforgeeks"]["institute_rank"] = f"#{rank:,}" if rank else "N/A"
except Exception as e:
    stats["geeksforgeeks"]["error"] = str(e)

# Save to file
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "coding_stats.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(stats, f, indent=2)
print("Updated coding_stats.json successfully!")
