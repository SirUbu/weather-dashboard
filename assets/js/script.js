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
    var currentWeatherCondition = data.current.weather[0].main;
    var backgroundColor = "";
    var textColor = "";
    // use currentWeatherCondition to determine the card background color
    if (currentWeatherCondition === "Thunderstorm") {
        backgroundColor = "bg-dark bg-gradient";
        textColor = "text-warning";
    } else if (currentWeatherCondition === "Drizzle" || currentWeatherCondition === "Rain" || currentWeatherCondition === "Snow") {
        backgroundColor = "bg-primary bg-gradient";
        textColor = "text-dark";
    } else if (currentWeatherCondition === "Mist" || currentWeatherCondition === "Haze" || currentWeatherCondition === "Dust" || currentWeatherCondition === "Fog") {
        backgroundColor = "bg-secondary bg-gradient";
        textColor = "text-danger";
    } else if (currentWeatherCondition === "Smoke" || currentWeatherCondition === "Sand" || currentWeatherCondition === "Ash" || currentWeatherCondition === "Squall" || currentWeatherCondition === "Tornado") {
        backgroundColor = "bg-danger bg-gradient";
        textColor = "text-dark";
    } else if (currentWeatherCondition === "Clear") {
        backgroundColor = "bg-warning bg-gradient";
        textColor = "text-dark";
    } else if (currentWeatherCondition === "Clouds") {
        backgroundColor = "bg-secondary bg-gradient";
        textColor = "text-dark";
    } else {
        backgroundColor = "bg-light bg-gradient";
        textColor = "text-dark";
    }

    var cardEl = $("<div>").addClass(`card ${backgroundColor} ${textColor}`);

    // use provided icon via api to assign image to card
    var imgSrc = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@4x.png`;
    var imgAlt = data.current.weather[0].description;
    var imgEl = $("<img>").attr("src", imgSrc).attr("alt", imgAlt).addClass("card-img p-1");
    cardEl.append(imgEl);

    var overlayEl = $("<div>").addClass("card-img-overlay");

    var cardHeaderEl = $("<div>").addClass("card-header d-flex justify-content-between");
    
    var cardTitleEl = $("<h2>").addClass("card-title").text(`${city}, ${country}`);
    cardHeaderEl.append(cardTitleEl);
    var cardTitleSpanEl = $("<span>").text(moment().format("MMMM Do YYYY, h:mma"))
    cardHeaderEl.append(cardTitleSpanEl);

    overlayEl.append(cardHeaderEl);

    var cardBodyEl = $("<div>").addClass("card-body");
    
    var weatherEl = $("<h3>").addClass("card-text mb-3").html(`Current Weather: ${currentWeatherCondition}, ${data.current.weather[0].description}`);
    cardBodyEl.append(weatherEl);

    var tempEl = $("<h4>").addClass("card-text").html(`<i class="fas fa-temperature-high"></i> Current Temperature: ${data.current.temp}&deg f`);
    cardBodyEl.append(tempEl);

    var feelsLikeEl = $("<h5>").addClass("card-text").html(`Feels like: ${data.current.feels_like}&deg f`);
    cardBodyEl.append(feelsLikeEl);

    var dailyHighLow = $("<h5>").addClass("card-text mb-3").html(`High: ${data.daily[0].temp.max}&deg f, Low: ${data.daily[0].temp.min}&deg f`);
    cardBodyEl.append(dailyHighLow);

    var windEl = $("<h4>").addClass("card-text mb-3").html(`<i class="fas fa-wind"></i> Wind: ${data.current.wind_speed} mph`);
    cardBodyEl.append(windEl);

    var humidityEl = $("<h4>").addClass("card-text mb-3").html(`<i class="fas fa-water"></i> Humidity: ${data.current.humidity}%`);
    cardBodyEl.append(humidityEl);

    var uvi = data.current.uvi;
    var uvBackground = "";
    // use uvi to determine background color for uv display
    if(uvi < 3) {
        uvBackground = "color-low";
    } else if(uvi > 2 & uvi < 6) {
        uvBackground = "color-mod";
    } else if(uvi > 5 & uvi < 8) {
        uvBackground = "color-high";
    } else if(uvi > 7 & uvi < 11) {
        uvBackground = "color-veryHigh";
    } else if(uvi > 10) {
        uvBackground = "color-extreme";
    }
    var uviEl = $("<h4>").addClass("card-text").html(`<i class="fas fa-sun"></i> UV Index: <span class="${uvBackground}">${uvi}</span>`);
    cardBodyEl.append(uviEl);

    // add loop here to go through the "daily" info from the API and create cards with the next 5 day forecast and append to body


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