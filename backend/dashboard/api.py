from ninja import NinjaAPI
import requests


api = NinjaAPI()

@api.post("/getbounds")
def get_bounding_box(request,address):
    url = f"https://nominatim.openstreetmap.org/search?q={address}&format=json"
    response = requests.get(url).json()
    
    if response:
        bbox = response[0]["boundingbox"]
        return {
            "lat_min": float(bbox[0]),
            "lat_max": float(bbox[1]),
            "lng_min": float(bbox[2]),
            "lng_max": float(bbox[3])
        }
    return None

