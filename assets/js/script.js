// store page objects to reference
var currentWeatherEl = $("#currentWeather");
var forecastEl = $("#forecast");
var searchHistEl = $("#searchHistory");

// global variable
var searchHistArr = [];

// function to fetch api
var APISearch = function(userSearch) {
    // update DOM that search is happening
    currentWeatherEl.text("Searching Please Wait...").attr("class", "bg-warning text-center p-2");
    forecastEl.text("");

    // store api key for reference
    var APIKey = "5ca19e2089c84836dfdfb8cf20c691ed";

    // make fetch using address with userSearch
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${userSearch}&appid=${APIKey}`)
        .then(function(cityResponse) {
            if(cityResponse.ok) {
                return cityResponse.json();
            } else {
                throw new Error("Search had no results.");
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
                        throw new Error("Search had no results.");
                    }
                })
                // pass data to display functions
                .then(function(oneCallData) {
                    // pass needed data to displayWeather function
                    displayWeather(oneCallData, city, country);
                    // pass needed data to displayForecast function
                    displayForecast(oneCallData);
                })
        })
        .catch(function(error) {
            currentWeatherEl.text(error).attr("class", "bg-danger p-2 text-center");
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

    var tempEl = $("<h4>").addClass("card-text").html(`<i class="fas fa-temperature-high"></i> Current Temperature: ${data.current.temp}&degF`);
    cardBodyEl.append(tempEl);

    var feelsLikeEl = $("<h5>").addClass("card-text").html(`Feels like: ${data.current.feels_like}&degF`);
    cardBodyEl.append(feelsLikeEl);

    var dailyHighLow = $("<h5>").addClass("card-text mb-3").html(`High: ${data.daily[0].temp.max}&degF, Low: ${data.daily[0].temp.min}&degF`);
    cardBodyEl.append(dailyHighLow);

    var windEl = $("<h4>").addClass("card-text mb-3").html(`<i class="fas fa-wind"></i> Wind: ${data.current.wind_speed} MPH`);
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
    
    overlayEl.append(cardBodyEl);
    
    cardEl.append(overlayEl);
    
    currentWeatherEl.append(cardEl);
};

// function to update DOM with forecast
var displayForecast = function(data) {
    // reset DOM
    forecastEl.text("");

    // store daily array and pass to forecast function
    var dailyArr = data.daily;

    // loop through api daily array to create cards with basic info and display to DOM to show next 5 days forecast
    for (var i = 1; i < 6; i++) {
        var dailyCardEl = $("<div>").addClass("card m-2 bg-light bg-gradient text-dark");

        var dailyCardBodyEl = $("<div>").addClass("card-body");

        var dayEl = $("<h5>").addClass("card-title").text(moment().add(i, 'days').format("MM/DD/YYYY"));
        dailyCardBodyEl.append(dayEl);

        var dayIconSrc = `http://openweathermap.org/img/wn/${dailyArr[i].weather[0].icon}.png`;
        var dayIconAlt = dailyArr[i].weather[0].description;
        var dayIconBackground = "";
        if (dailyArr[i].weather[0].main === "Thunderstorm") {
            dayIconBackground = "bg-dark bg-gradient";
        } else if (dailyArr[i].weather[0].main === "Drizzle" || dailyArr[i].weather[0].main === "Rain" || dailyArr[i].weather[0].main === "Snow") {
            dayIconBackground = "bg-primary bg-gradient";
        } else if (dailyArr[i].weather[0].main === "Mist" || dailyArr[i].weather[0].main === "Haze" || dailyArr[i].weather[0].main === "Dust" || dailyArr[i].weather[0].main === "Fog") {
            dayIconBackground = "bg-secondary bg-gradient";
        } else if (dailyArr[i].weather[0].main === "Smoke" || dailyArr[i].weather[0].main === "Sand" || dailyArr[i].weather[0].main === "Ash" || dailyArr[i].weather[0].main === "Squall" || dailyArr[i].weather[0].main === "Tornado") {
            dayIconBackground = "bg-danger bg-gradient";
        } else if (dailyArr[i].weather[0].main === "Clear") {
            dayIconBackground = "bg-warning bg-gradient";
        } else if (dailyArr[i].weather[0].main === "Clouds") {
            dayIconBackground = "bg-secondary bg-gradient";
        } else {
            dayIconBackground = "bg-light bg-gradient";
        }
        var dayIconEl = $("<img>").attr("src", dayIconSrc).attr("alt", dayIconAlt).addClass(`${dayIconBackground} rounded-circle`);
        dailyCardBodyEl.append(dayIconEl);

        var dayCondition = $("<h6>").addClass("card-text").html(`${dailyArr[i].weather[0].main}`);
        dailyCardBodyEl.append(dayCondition);

        var dayTemp = $("<h6>").addClass("card-text").html(`<i class="fas fa-temperature-high"></i> ${dailyArr[i].temp.max}&degF`);
        dailyCardBodyEl.append(dayTemp);

        var dayWind = $("<h6>").addClass("card-text").html(`<i class="fas fa-wind"></i> ${dailyArr[i].wind_speed}MPH`);
        dailyCardBodyEl.append(dayWind);

        var dayHumidity = $("<h6>").addClass("card-text").html(`<i class="fas fa-water"></i> ${dailyArr[i].humidity}%`);
        dailyCardBodyEl.append(dayHumidity);

        dailyCardEl.append(dailyCardBodyEl);

        forecastEl.append(dailyCardEl);
    }
};

// function to add search to history
var searchHistUpdate = function(userSearch) {
    // add to searchHistArr
    searchHistArr.push(userSearch);

    // save local
    saveLocal();

    // call displaySearchHist
    displaySearchHist();
};

// function to display search history to DOM
var displaySearchHist = function() {
    // clear search history area of DOM
    searchHistEl.text("");

    // loop through search history array and display to DOM
    for(var i = 0; i < searchHistArr.length; i++) {
        // create a clickable DOM element
        var searchEl = $("<a>").attr("href", "#");
        
        var textEl = $("<div>").text(searchHistArr[i]).addClass("bg-secondary rounded-pill text-center mb-2 text-light p-1");
        searchEl.append(textEl);


        searchHistEl.prepend(searchEl);
    }
};


// function to save search history
var saveLocal = function() {
    // save local
    localStorage.setItem("weatherSearchHist", JSON.stringify(searchHistArr));
};

// function to pull search history and update DOM
var getLocal = function() {
    // get local
    searchHistArr = JSON.parse(localStorage.getItem("weatherSearchHist"));
    if(!searchHistArr) {
        searchHistArr = [];
    }

    // update dom
    displaySearchHist();

    // run resent search through api
    if(searchHistArr.length > 0) {
        var index = searchHistArr.length - 1;
        APISearch(searchHistArr[index])
    }
};

// click handlers
// new search
$("#searchBtn").click(function(event) {
    event.preventDefault();

    // get user entry
    var userSearch = $("#userSearch").val();

    // check that a search item was entered
    if(!userSearch) {
        currentWeatherEl.text("Please enter a valid search.").attr("class", "bg-danger text-center p-2");
        forecastEl.text("");
        return;
    }

    // pass user entry to API
    APISearch(userSearch);

    // pass user entry to searchHistUpdate function
    searchHistUpdate(userSearch);

    $("#userSearch").val("");
});

// clear search history
$("#clearBtn").click(function() {
    // re-set searchHistArr
    searchHistArr = [];

    // remove localStorage
    localStorage.removeItem("weatherSearchHist");

    // update DOM
    searchHistEl.text("");
    currentWeatherEl.text("").attr("class", "");
    forecastEl.text("");
});

// handler for search history item clicked
$("#searchHistory").on("click", "div", function() {
    // get target textContent
    var prevSearch = this.textContent;
    // pass clicked textContent into API array
    APISearch(prevSearch);
});

getLocal();