// Mapbox access token.
mapboxgl.accessToken = "pk.eyJ1IjoiYWFsZ2VyIiwiYSI6ImNqZDF3dzRoNTNuaXAycnJ4aGU2N2d6MWMifQ";

// Initialize Mapbox and place the center of the map on the United States.
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-96, 37.8],
    zoom: 3
});

// Initialize popups for college locations - see below for useage
var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

$(document).ready(function(e) {

    // When the submit button on the HTML form is clicked ...
    $("form").submit(function(e) {
        e.preventDefault();
        var form_data = $(this).serialize();

        // Creates a GET request to fetch the API data.
        $.get({
            url: "/api/colleges",
            data: form_data,
            dataType: "json",
            success: function(data) {
                
                // Clears the search results at the bottom of the form.
                $("#results").empty();

                // GeoJSON object to put locations on the map.
                let geojson = {
                    "type": "FeatureCollection",
                    "features": []
                };

                // Removes GeoJSON points if they are on the map from a previous search.
                if (map.getLayer("point")) {
                    map.removeLayer("point");
                    map.removeSource("points");
                }

                // Loads the colleges defined in the "results" array, 
                // which we got back from the College Scorecard API.
                let colleges = data.results;

                // Loops through each result. It generates a list of colleges
                // and it creates a GeoJSON object for each of them to append to
                // the Mapbox map.
                $.each(colleges, function(index, item) {

                    // Creates a <div> for each college name within the results array.
                    $("<div class='college-info'>").append(
                        $("<div class='college-name'>").text(item[
                            "school.name"])
                    ).appendTo("#results");

                    // Creates a GeoJSON object for each college and 
                    // appends its lon-lat coordinates, name and college id.
                    // This is so Mapbox can place each college on the map.
                    let collegeLocation = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                item["location.lon"],
                                item["location.lat"]
                            ]
                        },
                        "properties": {
                            "name": item["school.name"],
                            "college_id": item.id
                        }

                    };

                    // Appends the 'collegeLocation' object to the 'features' array
                    // in the geojson object created above.
                    geojson.features.push(collegeLocation);
                });

                // Adds the geojson object as the data that Mapbox will place on the map
                // this is tagged as a "geojson" data type.
                map.addSource("points", {
                    "type": "geojson",
                    "data": geojson
                });

                // Mapbox will create a blue circle for each college location.
                map.addLayer({
                    "id": "point",
                    "source": "points",
                    "type": "circle",
                    "paint": {
                        "circle-radius": 4,
                        "circle-color": "rgba(55,148,179,1)"
                    }
                });

                // When the cursor is hovering over a point, a popup will appear with the college name.
                map.on("mouseenter", "point", function(e) {
                    // Change the cursor style as a UI indicator.
                    map.getCanvas().style.cursor = "pointer";

                    // Populate the popup and set its coordinates
                    // based on the feature found.
                    popup.setLngLat(e.features[0].geometry.coordinates)
                        .setHTML(e.features[0].properties.name)
                        .addTo(map);
                    });

                // The popup will be removed when the cursor is not on a map point.
                map.on("mouseleave", "point", function() {
                    map.getCanvas().style.cursor = "";
                    popup.remove();
                });

            },
            error: function(error) {
                $("#results").html(error);
            }
        });
    });
});