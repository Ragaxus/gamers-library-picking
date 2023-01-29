import json
import requests
import os

headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600',
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0'
    }

url = "https://api.scryfall.com/sets"
output_dir = "../public/images/set-icons"
req = requests.get(url, headers)
set_info = json.loads(req.content)["data"]
for set in set_info:
    set_code = set["code"]
    file_loc = f'{output_dir}/{set_code}.svg'
    if not os.path.exists(file_loc):
        response = requests.get(set["icon_svg_uri"])
        open(file_loc, "wb").write(response.content)
        print(f'Saved {set["name"]}')
    else:
        print(f'Already had {set["name"]}')