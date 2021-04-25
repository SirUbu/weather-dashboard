// store page objects to reference
var currentWeatherEl = $("#currentWeather");

// function to fetch api
var APISearch = function(userSearch) {
    // update DOM that search is happening
    currentWeatherEl.text("Searching Please Wait...").attr("class", "bg-warning text-center p-2");

    // store api key for reference
    var APIKey = "5ca19e2089c84836dfdfb8cf20c691ed";

    // make fetch using address with userSearch
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${userSearch}&appid=${APIKey}`)
        .then(function(cityResponse) {
            if(cityResponse.ok) {
                return cityResponse.json();
            } else {
                currentWeatherEl.text(`Error ${cityResponse.status}: ${cityResponse.statusText}`).attr("class", "bg-danger p-2 text-center");
            }
        })
        // pass to display function
        .then(function(cityData) {
            // store city and country info to pass on
            var city = cityData.name;
            var country = cityData.sys.country;
            // store lon and lat
            var searchLon = cityData.coord.lon;
            var searchLat = cityData.coord.lat;

            // use searchLon and searchLat to fetch api of one call
            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${searchLat}&lon=${searchLon}&units=imperial&appid=${APIKey}`)
                .then(function(oneCallResponse) {
                    if(oneCallResponse.ok) {
                        return oneCallResponse.json();
                    } else {
                        currentWeatherEl.text("Your search had no results").attr("class", "bg-danger p-2 text-center");
                    }
                })
                .then(function(oneCallData) {
                    displayWeather(oneCallData, city, country);
                })
        })
};

// function to display  weather to DOM
var displayWeather = function(data, city, country) {
    // clear DOM
    currentWeatherEl.text("").attr("class", "");

    // create card for weather info to be added to
    var backgroundColor = "bg-secondary";
    var cardEl = $("<div>").addClass(`card ${backgroundColor} text-light`);

    var imgSrc = "./assets/images/cloud-fill.svg";
    var imgAlt = "cloud";
    var imgEl = $("<img>").attr("src", imgSrc).attr("alt", imgAlt).addClass("card-img p-1");
    cardEl.append(imgEl);

    var overlayEl = $("<div>").addClass("card-img-overlay");

    var cardHeaderEl = $("<div>").addClass("card-header");
    
    var cardTitleEl = $("<h4>").addClass("card-title").text(`${city}, ${country}`);
    cardHeaderEl.append(cardTitleEl);

    overlayEl.append(cardHeaderEl);
    
    var cardBodyEl = $("<div>").addClass("card-body");

    var cardSubEl = $("<h5>").addClass("card-subtitle mb-2").text(`Timezone: ${data.timezone}`);
    cardBodyEl.append(cardSubEl);

    overlayEl.append(cardBodyEl);

    cardEl.append(overlayEl);

    currentWeatherEl.append(cardEl);
};

// button handlers
$("#searchBtn").click(function(event) {
    event.preventDefault();

    var userSearch = $("#userSearch").val();

    APISearch(userSearch);

    $("#userSearch").val("");
});