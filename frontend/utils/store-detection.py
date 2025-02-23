#  Have to stash because do not have time to integrate 
# Does work on its own 

import os
import requests
from PIL import Image
import math
from io import BytesIO

def compute_heading(viewpoint_lat, viewpoint_lng, storefront_lat, storefront_lng):
    """
    Compute the heading angle from the viewpoint to the storefront.
    """
    lat1 = math.radians(viewpoint_lat)
    lon1 = math.radians(viewpoint_lng)
    lat2 = math.radians(storefront_lat)
    lon2 = math.radians(storefront_lng)

    # Calculate difference in longitude
    d_lon = lon2 - lon1

    # General spherical calculation for road
    y = math.sin(d_lon) * math.cos(lat2)
    x = (math.cos(lat1) * math.sin(lat2)) - (math.sin(lat1) * math.cos(lat2) * math.cos(d_lon))
    initial_heading = math.atan2(y, x) * (180 / math.pi)

    # Normalize heading to be within [0, 360]
    heading = (initial_heading + 360) % 360

    # For roads that run along the East-West direction, adjust heading based on road direction
    if abs(viewpoint_lat - storefront_lat) < 0.0001:  # Roughly the same latitude (East-West road)
        # East-bound roads: Heading 90 degrees to the right (South to North -> 90, North to South -> 270)
        if viewpoint_lng < storefront_lng:
            heading = 90  # Right turn, facing the side of the road
        else:
            heading = 270  # Left turn, facing the side of the road
    else:
        # North-South roads, adjust the heading based on relative position of the storefront
        if (storefront_lat > viewpoint_lat and viewpoint_lng < storefront_lng) or (storefront_lat < viewpoint_lat and viewpoint_lng > storefront_lng):
            heading = (heading + 90) % 360  # Facing the side perpendicular to road

    return heading


def get_streetview_image(viewpoint_lat, viewpoint_lng, heading, api_key):
    """
    Retrieve a Street View image from Google Maps API.
    """
    size = "600x400"
    fov = 90
    pitch = 0
    location = f"{viewpoint_lat},{viewpoint_lng}"
    streetview_url = f"https://maps.googleapis.com/maps/api/streetview?size={size}&location={location}&heading={heading}&fov={fov}&pitch={pitch}&key={api_key}"

    response = requests.get(streetview_url)
    if response.status_code == 200:
        return Image.open(BytesIO(response.content))
    else:
        response.raise_for_status()

def capture_images_on_road(start_lat, start_lng, end_lat, end_lng, storefront_lat, storefront_lng, api_key, road_name="Road"):
    """
    Capture images along a road from start to end, adjusting the heading at each point and save them to a folder.
    """
    # Define the number of steps along the road (adjust for finer or coarser steps)
    num_steps = 20

    # Calculate lat/lng steps for the road
    lat_step = (end_lat - start_lat) / num_steps
    lng_step = (end_lng - start_lng) / num_steps

    # Create a folder to save the images
    folder_name = f"{road_name}_images"
    os.makedirs(folder_name, exist_ok=True)

    for i in range(num_steps + 1):
        # Compute the current position along the road
        lat = start_lat + lat_step * i
        lng = start_lng + lng_step * i

        # Compute the heading to the storefront from the current position
        heading = compute_heading(lat, lng, storefront_lat, storefront_lng)

        # Capture the image from Google Street View
        image = get_streetview_image(lat, lng, heading, api_key)

        # Save the image to the folder
        image_path = os.path.join(folder_name, f"{road_name}_image_{i+1}.jpg")
        image.save(image_path)

        print(f"Captured image {i+1} at lat: {lat}, lng: {lng}, heading: {heading} and saved to {image_path}")

# Define the coordinates for the Kimpton Shane Hotel and roads
kimpton_shane_lat = 33.791024446831486
kimpton_shane_lng = -84.38792022670943

# Define the coordinates for Road 1
road1_start_lat = 33.791106793495246
road1_start_lng = -84.38926528753336
road1_end_lat = 33.79109702198348
road1_end_lng = -84.38731108451704

# Define the coordinates for Road 2
road2_start_lat = 33.791390952775494
road2_start_lng = -84.38778402202692
road2_end_lat = 33.790726723036876
road2_end_lng = -84.38780577317992

# Your Google API key
api_key = 'AIzaSyASAUc5Rc4dmINrnM-4s2PKDR0NESKH6Bs'

# Capture images along both roads and save them to folders
capture_images_on_road(road1_start_lat, road1_start_lng, road1_end_lat, road1_end_lng, kimpton_shane_lat, kimpton_shane_lng, api_key, "Road1")
capture_images_on_road(road2_start_lat, road2_start_lng, road2_end_lat, road2_end_lng, kimpton_shane_lat, kimpton_shane_lng, api_key, "Road2")
