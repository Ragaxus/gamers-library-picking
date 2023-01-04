import csv
import json

def transformStandardBox(box):
    out = box
    out["startCard"] = {
            "name": box["startName"],
            "set": box["startSet"]
        }
    out["endCard"] = {
            "name": box["endName"],
            "set": box["endSet"]
        }
    del out["startName"]
    del out["startSet"]
    del out["endName"]
    del out["endSet"]
    return out

def transformSuppBox(box):
    out = box
    out["sets"] = box["setList"].split(",")
    del out["setList"]
    return out 

with open ('boxes_supp.csv') as boxfile:
    allboxes = []
    reader = csv.DictReader(boxfile)
    print(json.dumps([transformSuppBox(box) for box in reader], indent=4))
