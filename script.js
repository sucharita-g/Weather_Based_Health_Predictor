const healthWeatherData = [
    { Weather: "Sunny", Condition: 30, Humidity: 40, "Health Issue": "Dehydration, Heatstroke" },
    { Weather: "Partly cloudy", Condition: 28, Humidity: 50, "Health Issue": "Allergies" },
    { Weather: "Cloudy", Condition: 25, Humidity: 60, "Health Issue": "Fatigue" },
    { Weather: "Overcast", Condition: 20, Humidity: 70, "Health Issue": "Low energy, Depression" },
    { Weather: "Mist", Condition: 18, Humidity: 80, "Health Issue": "Respiratory issues" },
    { Weather: "Patchy rain possible", Condition: 22, Humidity: 75, "Health Issue": "Common cold" },
    { Weather: "Patchy snow possible", Condition: 0, Humidity: 65, "Health Issue": "Frostbite" },
    { Weather: "Thundery outbreaks", Condition: 24, Humidity: 78, "Health Issue": "Anxiety, Migraine" },
    { Weather: "Fog", Condition: 15, Humidity: 85, "Health Issue": "Asthma, Respiratory issues" },
    { Weather: "Freezing fog", Condition: -1, Humidity: 90, "Health Issue": "Hypothermia" },
    { Weather: "Light drizzle", Condition: 19, Humidity: 85, "Health Issue": "Common cold" },
    { Weather: "Moderate rain", Condition: 21, Humidity: 88, "Health Issue": "Flu, Joint pain" },
    { Weather: "Heavy rain", Condition: 20, Humidity: 95, "Health Issue": "Flu, Joint pain" },
    { Weather: "Light snow", Condition: -5, Humidity: 60, "Health Issue": "Hypothermia, Frostbite" },
    { Weather: "Blizzard", Condition: -10, Humidity: 55, "Health Issue": "Hypothermia, Frostbite" },
    { Weather: "Ice pellets", Condition: -8, Humidity: 65, "Health Issue": "Hypothermia" },
    { Weather: "Light rain shower", Condition: 23, Humidity: 85, "Health Issue": "Flu" },
    { Weather: "Torrential rain shower", Condition: 18, Humidity: 92, "Health Issue": "Flu, Joint pain" },
    { Weather: "Patchy light rain", Condition: 20, Humidity: 80, "Health Issue": "Sinus infection" },
    { Weather: "Moderate or heavy sleet", Condition: 1, Humidity: 70, "Health Issue": "Hypothermia, Frostbite" }
];

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
const healthOutput = document.querySelector('.issues'); // Add this line

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

// Adding submit event to the form
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
    fetch(`http://api.weatherapi.com/v1/current.json?key=7cf9b568b7fb48128f8130655242711&q=${cityInput}`)
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

            // Determine time of the day
            let timeOfDay = data.current.is_day ? "day" : "night";
            const code = data.current.condition.code;

            // Change the background image and button color based on weather conditions
            if (code === 1000) {
                app.style.backgroundImage = `url(./icons/${timeOfDay}/clear.jpg)`;
                btn.style.background = timeOfDay === "night" ? "#181e27" : "#e5ba92";
            } else if (
                [1003, 1006, 1009, 1030, 1069, 1087, 1135, 1273, 1276, 1279, 1282].includes(code)
            ) {
                app.style.backgroundImage = `url(./icons/${timeOfDay}/cloudy.jpg)`;
                btn.style.background = "#fa6d1b";
            } else if (code >= 1065 && code <= 1252) {
                app.style.backgroundImage = `url(./icons/${timeOfDay}/rainy.jpg)`;
                btn.style.background = timeOfDay === "night" ? "#325c80" : "#647d75";
            } else {
                app.style.backgroundImage = `url(./icons/${timeOfDay}/snowy.jpg)`;
                btn.style.background = timeOfDay === "night" ? "#1b1b1b" : "#4d72aa";
            }

            //Fetch health issues data and compare it with the weather condition
            fetchHealthData(data.current.condition.text);

            app.style.opacity = "1";
        })
        .catch(() => {
            alert('City not found, please try again');
            app.style.opacity = "1";
        });
}

function fetchHealthData(weatherCondition) {
    console.log('Weather Condition from API:', weatherCondition); // Debug input condition

    // Optional: Map condition to a standard form
    const weatherMapping = {
        'Clear': 'Sunny',
        'Patchy rain possible': 'Light drizzle',
        'Thundery outbreaks possible': 'Thundery outbreaks',
        // Add more mappings as needed
    };
    const standardizedCondition = weatherMapping[weatherCondition] || weatherCondition;
    console.log('Standardized Condition:', standardizedCondition); // Log mapped condition

    // Search for health issue directly in the local array
    let matchedIssue = "No health issues reported for this weather condition";
    healthWeatherData.forEach(entry => {
        if (
            entry.Weather.toLowerCase().trim() === standardizedCondition.toLowerCase().trim()
        ) {
            matchedIssue = entry['Health Issue'];
        }
    });

    console.log('Matched Health Issue:', matchedIssue); // Debug match result
    healthOutput.innerHTML = matchedIssue;
    if (matchedIssue !== "No health issues reported for this weather condition") {
        // Example phone number, replace with a dynamic number if needed
        const userPhoneNumber = '+1234567890'; // Replace with the actual phone number
        const message = `Weather alert: ${standardizedCondition} - Health issues: ${matchedIssue}`;
        
        // Call the server-side sendSms function to send the SMS
        fetch('/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: userPhoneNumber, message: message })
        })
        .then(response => response.json())
        .then(data => console.log('SMS sent:', data))
        .catch(error => console.error('Error sending SMS:', error));
    }
}
