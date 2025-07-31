const FORECAST_DAYS = 4; // Change if needed

function codeToIconText(code) {
  const map = {
    0:   ['☀️', "Clear"],
    1:   ['🌤️', "Mainly clear"],
    2:   ['⛅', "Partly cloudy"],
    3:   ['☁️', "Overcast"],
    45:  ['🌫️', "Fog"],
    48:  ['🌫️', "Rime fog"],
    51:  ['🌦️', "Light drizzle"],
    53:  ['🌦️', "Moderate drizzle"],
    55:  ['🌦️', "Dense drizzle"],
    56:  ['🌧️', "Light freez. drizzle"],
    57:  ['🌧️', "Dense freez. drizzle"],
    61:  ['🌦️', "Light rain"],
    63:  ['🌧️', "Moderate rain"],
    65:  ['🌧️', "Heavy rain"],
    66:  ['🌧️', "Light freezing rain"],
    67:  ['🌧️', "Heavy freezing rain"],
    71:  ['🌨️', "Light snow"],
    73:  ['🌨️', "Moderate snow"],
    75:  ['❄️', "Heavy snow"],
    77:  ['🌨️', "Snow grains"],
    80:  ['🌧️', "Slight rain showers"],
    81:  ['🌧️', "Moderate rain showers"],
    82:  ['⛈️', "Violent rain showers"],
    85:  ['🌨️', "Slight snow showers"],
    86:  ['🌨️', "Heavy snow showers"],
    95:  ['⛈️', "Thunderstorm"],
    96:  ['⛈️', "Thunderstorm+hail"],
    99:  ['⛈️', "Heavy thunderstorm+hail"]
  };
  return map[code] || ['❓', "Unknown"];
}

async function showWeather() {
  const city = document.getElementById('cityInput').value.trim();
  const searchSection = document.getElementById('search-section');
  const resultDiv = document.getElementById('weatherResult');
  if (!city) {
    alert('Please enter a city name.');
    return;
  }
  searchSection.style.display = 'none';
  resultDiv.style.display = 'flex';
  resultDiv.innerHTML = '<div class="glassy-card"><div class="loader"></div></div>';

  try {
    // Step 1: Geocode
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoResp = await fetch(geoUrl);
    if (!geoResp.ok) throw new Error('Could not geocode city');
    const geoData = await geoResp.json();
    if (!geoData.results || geoData.results.length === 0) {
      resultDiv.innerHTML = `<div class="glassy-card" style="color:red;">City not found.</div>
      <button id="backBtn" onclick="resetUI()">Back</button>`;
      return;
    }
    const loc = geoData.results[0];
    const { latitude, longitude, name, country } = loc;

    // Step 2: Weather fetch
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&forecast_days=${FORECAST_DAYS}&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset&timezone=auto`;
    const weatherResp = await fetch(weatherUrl);
    if (!weatherResp.ok) throw new Error('Weather data not available');
    const weatherData = await weatherResp.json();

    // Current weather
    const curr = weatherData.current_weather;
    const daily = weatherData.daily;

    // Glassy result card HTML
    const [icon, wText] = codeToIconText(curr.weathercode);
    let out = `<div class="glassy-card">
      <div id="cityName">${name}, ${country}</div>
      <div class="weather-main">
        <div class="temperature">${icon} ${curr.temperature}°C</div>
        <div class="weather-desc">${wText}</div>
        <div class="weather-extra">Wind: ${curr.windspeed} km/h</div>
        <div class="weather-extra">Updated: ${curr.time.replace('T',' ')}</div>
      </div>
      <table class="forecast-table">
        <tr><th>Date</th><th>Max</th><th>Min</th><th>Sunrise</th><th>Sunset</th></tr>`;
    for (let i = 0; i < daily.time.length; ++i) {
      out += `<tr>
        <td>${daily.time[i]}</td>
        <td>${daily.temperature_2m_max[i]}°C</td>
        <td>${daily.temperature_2m_min[i]}°C</td>
        <td>${daily.sunrise[i].split('T')[1]}</td>
        <td>${daily.sunset[i].split('T')[1]}</td>
      </tr>`;
    }
    out += `</table>
      <button id="backBtn" onclick="resetUI()">Back</button>
    </div>`;

    resultDiv.innerHTML = out;
  } catch (err) {
    resultDiv.innerHTML = `<div class="glassy-card" style="color:red;">Error: ${err.message}</div>
    <button id="backBtn" onclick="resetUI()">Back</button>`;
  }
}

// Back button function
function resetUI() {
  document.getElementById('search-section').style.display = 'flex';
  document.getElementById('weatherResult').style.display = 'none';
  document.getElementById('weatherResult').innerHTML = '';
  document.getElementById('cityInput').value = '';
  setTimeout(()=>{ document.getElementById('cityInput').focus(); }, 100);
}

// Auto focus input box on load
window.onload = () => {
  document.getElementById('cityInput').focus();
}
document.getElementById('cityInput').addEventListener('keyup', function(e){
  if(e.key === "Enter") showWeather();
});
