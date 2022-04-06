var A = {
    "$type": "OffRoadWaypoint",
    "location": {
        "offRoadCoordinate": {
            "x": 6.097592281341554,
            "y": 49.60986178122983
        }
    }
};

var B = {
    "$type": "OffRoadWaypoint",
    "location": {
        "offRoadCoordinate": {
            "x": 6.103880139846803,
            "y": 49.60598956829434
        }
    }
};

var map = new L.Map('map', {
    center: [49.61, 6.125],
    zoom: 13
});

// Add tile layer to map
var tileUrl = xServerUrl + '/services/rest/XMap/tile/{z}/{x}/{y}';
var tileLayer = new L.TileLayer(tileUrl, {
    minZoom: 3,
    maxZoom: 18,
    noWrap: true
}).addTo(map);

var outputString = '';

function calculateSpecificRoute(dtw) {
    xroute.calculateRoute({
        "waypoints": [A, B],
        "resultFields": {
            "polyline": true
        },
        "requestProfile": {
            "routingProfile": {
                "searchSpace": {
                    "heuristicAggressiveness": 0,
                    "excludeByNetworkClass": {
                        "minimumDistancesFromWaypoint": [
                            "UNBOUNDED",
                            "UNBOUNDED",
                            "UNBOUNDED",
                            "UNBOUNDED",
                            "UNBOUNDED",
                            "UNBOUNDED",
                            "UNBOUNDED",
                            "UNBOUNDED"
                        ]
                    }
                },
                "course": {
                    "distanceTimeWeighting": dtw,
                    "network": {
                        "rampPenalty": 0,
                        "penaltiesByNetworkClass": {
                            "penalties": [0, 0, 0, 0, 0, 0, 0, 0]
                        }
                    },
                    "specialAreas": {
                        "residentsOnlyPenalty": 0,
                        "urbanPenalty": 0,
                        "forbiddenLowEmissionZonePenalty": 0
                    },
                    "maneuver": {
                        "uTurnCost": 0
                    }
                }
            }
        },
        "geometryOptions": {
            "responseGeometryTypes": ["GEOJSON"]
        }
    }, function(route, exception) {
        var geoJson = route.polyline.geoJSON;
        if (dtw < 50) {
            displayGeoJson(geoJson, '#ffa225');
            outputString += 'shortest route: ' + route.distance + ' m  in ' + route.travelTime + ' s   ';
        } else {
            displayGeoJson(geoJson, '#2882C8');
            outputString += 'fastest route: ' + route.distance + ' m  in ' + route.travelTime + ' s   ';
        }
        print(outputString);
    });
}

function displayGeoJson(geoJson, color) {
    var jsonObject = JSON.parse(geoJson);
    var geoJsonLayer = new L.GeoJSON(jsonObject, {
        style: {
            color: color,
            weight: 8
        }
    }).addTo(map);
    map.fitBounds(geoJsonLayer.getBounds());
};

calculateSpecificRoute(0);
calculateSpecificRoute(100);