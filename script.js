const app = document.querySelector('.weather-app');
const temp = document.querySelector('.temp');
const dateOutput = document.querySelector('.date');
const timeOutput = document.querySelector('.time');
const conditionOutput = document.querySelector('.condition');
const nameOutput = document.querySelector('.name');
const icon = document.querySelector('.icon');
const cloudOutput = document.querySelector('.cloud');
const humidityOutput = document.querySelector('.humidity');
const windOutput = document.querySelector('.wind');
const form = document.getElementById('locationinput');
const search = document.querySelector('.search');
const btn = document.querySelector('.submit');
const cities = document.querySelectorAll('.city');
const healthOutput = document.querySelector('.issues');// Add this line


// Default city when the page loads
let cityInput = "Chennai";

//Fetch weather data for default city immediately when the page loads
fetchWeatherData();

// Add click event to each city in the panel
cities.forEach((city) => {
    city.addEventListener('click', (e) => {
        // Change from default city to the clicked one
        cityInput = e.target.innerHTML;
        fetchWeatherData();
        app.style.opacity = "0";
    });
});
form.addEventListener('submit', (e) => {
    if (search.value.length === 0) {
        alert('Please type in a city name');
    } else {
        cityInput = search.value;
        fetchWeatherData();
        search.value = "";
        app.style.opacity = "0";
    }
    e.preventDefault();
});

// Function to return the day of the week
function dayOfTheWeek(day, month, year) {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekday[new Date(`${month}/${day}/${year}`).getDay()];
}

function fetchWeatherData() {
    // Fetch the data and dynamically add the city name with template literals
    fetch(`https://api.weatherapi.com/v1/current.json?key=a1d96f5333274c21ad6122553240610&q=${cityInput}`)
        .then(response => response.json())
        .then(data => {
            // Console log the data to see what is available
            console.log(data);

            // Adding the temperature and weather condition to the webpage
            temp.innerHTML = data.current.temp_c + "&#176;";
            conditionOutput.innerHTML = data.current.condition.text;

            // Extract the date and time from the city
            const date = data.location.localtime;
            const y = parseInt(date.substr(0, 4));
            const m = parseInt(date.substr(5, 2));
            const d = parseInt(date.substr(8, 2));
            const time = date.substr(11);

            // Reformatting the date
            dateOutput.innerHTML = `${dayOfTheWeek(d, m, y)} ${d}, ${m}, ${y}`;
            timeOutput.innerHTML = time;

            // Add the city name to the page
            nameOutput.innerHTML = data.location.name;

            // Set the weather icon
            icon.src = "https:" + data.current.condition.icon;

            // Add the weather details
            cloudOutput.innerHTML = "Cloudy:" + data.current.cloud + "%";
            humidityOutput.innerHTML = "Humidity:" + data.current.humidity + "%";
            windOutput.innerHTML = "Wind:" + data.current.wind_kph + "km/h";

            fetchHealthDataFromJSON(data.current);


            // Determine time of the day
            let timeOfDay = data.current.is_day ? "day" : "night";
            const code = data.current.condition.code;

            // Change the background image and button color based on weather conditions
            if (code === 1000) {
                app.style.backgroundImage = `url(./images/${timeOfDay}/clear.png)`;
                btn.style.background = timeOfDay === "night" ? "#181e27" : "#e5ba92";
            } else if (
                [1003, 1006, 1009, 1030, 1069, 1087, 1135, 1273, 1276, 1279, 1282].includes(code)
            ) {
                app.style.backgroundImage = `url(./images/${timeOfDay}/cloudy.png)`;
                btn.style.background = "#fa6d1b";
            } else if (code >= 1065 && code <= 1252) {
                app.style.backgroundImage = `url(./images/${timeOfDay}/rainy.png)`;
                btn.style.background = timeOfDay === "night" ? "#325c80" : "#647d75";
            } else {
                app.style.backgroundImage = `url(./images/${timeOfDay}/snowy.png)`;
                btn.style.background = timeOfDay === "night" ? "#1b1b1b" : "#4d72aa";
            }

            //Fetch health issues data and compare it with the weather condition
    

            app.style.opacity = "1";
        })
        .catch(() => {
            alert('City not found, please try again');
            app.style.opacity = "1";
        });
}

function fetchHealthDataFromJSON(currentData) {
    fetch('./health_weather_data.json')
        .then(response => response.json())
        .then(healthData => {
            const humidity = currentData.humidity;
            const temp = currentData.temp_c;
            const wind = currentData.wind_kph;
            const conditionText = currentData.condition.text.toLowerCase();

            let matchedRisks = [];

            healthData.forEach(entry => {
                const cond = entry.weather.condition;
                const val = entry.weather.value;

                if (
                    (cond === "high_humidity" && humidity > 80) ||
                    (cond === "extreme_cold" && temp < 0) ||
                    (cond === "high_temperature" && temp > 30) ||
                    (cond === "extreme_heat" && temp > 40) ||
                    (cond === "windy" && wind > 30) ||
                    (cond === "rainy" && conditionText.includes("rain")) ||
                    (cond === "fog" && conditionText.includes("fog")) ||
                    (cond === "snowfall" && conditionText.includes("snow")) ||
                    (cond === "thunderstorms" && conditionText.includes("thunder")) ||
                    (cond === "low_air_quality" && conditionText.includes("smoke") || conditionText.includes("haze")) ||
                    (cond === "uv_index" && currentData.uv > 8) ||
                    (cond === "high_pollen" && conditionText.includes("pollen"))
                ) {
                    matchedRisks.push(...entry.health_risks);
                }
            });

            if (matchedRisks.length > 0) {
                healthOutput.innerHTML = matchedRisks.map(risk => `<li><strong>${risk.name}:</strong> ${risk.tips}</li>`).join('');
            } else {
                healthOutput.innerHTML = "<li>No specific health risks reported for current weather.</li>";
            }
        })
        .catch(error => {
            console.error('Error fetching JSON health data:', error);
            healthOutput.innerHTML = "<li>Unable to fetch health data.</li>";
        });
}
