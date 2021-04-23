// store page objects to reference
var currentWeatherEl = $("#currentWeather");

// function to fetch api
var citySearchAPI = function(userSearch) {
    // update DOM
    currentWeatherEl.text("Searching Please Wait...").addClass("bg-warning text-center p-2");
    // store api key for reference
    var APIKey = "5ca19e2089c84836dfdfb8cf20c691ed";

    // api address using userSearch and APIKey
    var apiAddress = `https://api.openweathermap.org/data/2.5/weather?q=${userSearch}&appid=${APIKey}`;

    // make fetch using address
    fetch(apiAddress)
        .then(function(response) {
            if(response.ok) {
                return response.json();
            } else {
                currentWeatherEl.text("Your search had no results").addClass("bg-danger p-2 text-center");
            }
        })
        // pass to display function
        .then(function(data) {
            // store lon and lat
            var searchLon = data.coord.lon;
            var searchLat = data.coord.lat;

            // pass lon and lat to oneCallAPI
            oneCallAPI(searchLon, searchLat);
        })
};

// function to display  weather to DOM
var displayWeather = function(data) {
    console.log(data);
};

// button handlers
$("#searchBtn").click(function(event) {
    event.preventDefault();

    var userSearch = $("#userSearch").val();

    citySearchAPI(userSearch);

    $("#userSearch").val("");
});