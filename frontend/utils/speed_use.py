#  Have to stash because do not have time to integrate 
# Does work on its own 

import overpy

# return a score based on speed and direction of passageway in storefront
# used to produce a visibility score
def speed_dir_score(wayID, df, query):

    # determine speed based on highway type if maxspeed not provided
    speed_dict = {'primary' : 70,
                  'secondary' : 55,
                  'tertiary' : 45,
                  'trunk' : 55,
                  'residential' : 15}

    # read in the way and direction
    way = df[df['osm_id'] == wayID]
    dir = way['match_dir'].values[0]

    # set opposite direction to -1 value
    if (dir == 2):
        dir = -1

    # query desired way
    api = overpy.Overpass()
    result = api.query(query)
    way = result.ways[way.index]

    # set speed based on either maxspeed, speed_dict, or placeholder value of 35 mph
    if 'maxspeed' in way.tags:
        speed = int(list(way.tags['maxspeed'].split(' '))[0])
    elif 'highway' in way.tags:
        if way.tags['highway'].lower() in speed_dict.keys():
            speed = speed_dict[way.tags['highway'].lower()]
        else:
            speed = 35

    else:
        speed = 35

    # calculate score and return
    return calculate_score(dir, speed)

# calculate score based on direction and speed
def calculate_score(dir, speed):

    # params
    a = 0.3
    b = 0.05
    
    # bidirectional case
    if dir == 3:
        return 50(1 + a) / (1 + b * speed) + 50(1 - a) / (1 + b * speed)
    # normal case
    else:
        return 100(1 + a * dir) / (1 + b * speed)