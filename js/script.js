// script.js
let unit = 'metric'; // Default to Celsius
const apiKey = 'ba70db3d70d52ac42304f9f4236044df';

document.getElementById('weather-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const city = document.getElementById('city-input').value;
    getWeatherByCity(city);
});

document.getElementById('current-location-btn').addEventListener('click', getWeatherByLocation);

document.getElementById('celsius-btn').addEventListener('click', () => setUnit('metric'));
document.getElementById('fahrenheit-btn').addEventListener('click', () => setUnit('imperial'));

function setUnit(newUnit) {
    unit = newUnit;
    document.getElementById('celsius-btn').classList.toggle('active', unit === 'metric');
    document.getElementById('fahrenheit-btn').classList.toggle('active', unit === 'imperial');
}

function getWeatherByCity(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;
    fetchData(apiUrl, forecastUrl);
}

function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude: lat, longitude: lon } = position.coords;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
            fetchData(apiUrl, forecastUrl);
        }, () => alert('Unable to access location.'));
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function fetchData(apiUrl, forecastUrl) {
    toggleLoading(true);
    Promise.all([fetch(apiUrl), fetch(forecastUrl)])
        .then(async ([weatherRes, forecastRes]) => {
            const weatherData = await weatherRes.json();
            const forecastData = await forecastRes.json();
            toggleLoading(false);
            displayWeather(weatherData);
            displayForecast(forecastData.list);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            toggleLoading(false);
            alert('Error fetching data.');
        });
}

function displayWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    if (data.cod !== 200) {
        weatherInfo.innerHTML = `<p class="text-danger">City not found. Please try again.</p>`;
    } else {
        const { name, main, weather } = data;
        weatherInfo.innerHTML = `
            <div class="weather-card" data-aos="zoom-in">
                <h3>${name}</h3>
                <p>${weather[0].main}</p>
                <img src="https://openweathermap.org/img/wn/${weather[0].icon}.png" alt="${weather[0].description}">
                <div class="temperature">${Math.round(main.temp)}°${unit === 'metric' ? 'C' : 'F'}</div>
                <p>Humidity: ${main.humidity}%</p>
            </div>
        `;
    }
}

function displayForecast(forecastList) {
    const forecastInfo = document.getElementById('forecast-info');
    forecastInfo.innerHTML = `<h3 class="mt-5">5-Day Forecast</h3><div class="d-flex flex-wrap justify-content-center">`;

    const dailyForecast = forecastList.filter((_, index) => index % 8 === 0);

    dailyForecast.forEach(day => {
        const date = new Date(day.dt * 1000).toDateString();
        forecastInfo.innerHTML += `
            <div class="forecast-card text-center" data-aos="flip-left">
                <h4>${date}</h4>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                <div class="temperature">${Math.round(day.main.temp)}°${unit === 'metric' ? 'C' : 'F'}</div>
                <p>${day.weather[0].main}</p>
            </div>
        `;
    });
    forecastInfo.innerHTML += `</div>`;
}

function toggleLoading(isLoading) {
    document.getElementById('loading').style.display = isLoading ? 'block' : 'none';
}
