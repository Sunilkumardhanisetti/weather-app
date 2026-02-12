const apiKey = "cfc7a3d7297294d063219b67b9b63d1b";

const result = document.getElementById("result");
const hourly = document.getElementById("hourly");
const forecast = document.getElementById("forecast");


/* SEARCH BY NAME */
async function getWeatherByName(){
  let place = document.getElementById("place").value;
  if(place === ""){
    alert("Enter place name");
    return;
  }

  try{
    let geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${place}&limit=1&appid=${apiKey}`;
    let geoRes = await fetch(geoUrl);
    let geoData = await geoRes.json();

    if(geoData.length === 0) throw new Error("Place not found");

    let lat = geoData[0].lat;
    let lon = geoData[0].lon;
    let name = geoData[0].name;

    fetchWeather(lat, lon, name);
  }catch(err){
    result.innerText = err.message;
  }
}

/* MY LOCATION */
function getWeatherByLocation(){
  navigator.geolocation.getCurrentPosition(async pos=>{
    fetchWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
  });
}

/* FETCH WEATHER */
async function fetchWeather(lat, lon, name){
  let wUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  let fUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  let wData = await (await fetch(wUrl)).json();
  let fData = await (await fetch(fUrl)).json();

  showWeather(wData, name);
  showForecast(fData.list);
  showHourlyForecast(fData.list);
}

/* SHOW WEATHER */
function showWeather(data, name){
  let icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  let condition = data.weather[0].main.toLowerCase();

  document.body.className = "";

  if(condition.includes("clear")) document.body.classList.add("clear");
  else if(condition.includes("cloud")) document.body.classList.add("clouds");
  else if(condition.includes("rain")) document.body.classList.add("rain");
  else if(condition.includes("snow")) document.body.classList.add("snow");

  result.innerHTML = `
    <h3>${name}</h3>
    <img src="${icon}" class="weather-icon">
    <div class="temp">${data.main.temp} °C</div>
    <div class="desc">${data.weather[0].description}</div>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p>🌬️ Wind: ${data.wind.speed} m/s</p>
  `;

  document.getElementById("sunCard").innerHTML = `
    <h3>🌅 Sun Info</h3>
    <p>Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</p>
    <p>Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</p>
  `;

  document.getElementById("detailsCard").innerHTML = `
    <h3>📊 Details</h3>
    <p>Feels Like: ${data.main.feels_like} °C</p>
    <p>Pressure: ${data.main.pressure} hPa</p>
    <p>Visibility: ${data.visibility / 1000} km</p>
  `;
}


/* FORECAST */
function showForecast(list){
  forecast.innerHTML = "";
  list.filter(i=>i.dt_txt.includes("12:00:00")).forEach(day=>{
    forecast.innerHTML += `
      <div class="forecast-day">
        <div>${new Date(day.dt_txt).toLocaleDateString("en",{weekday:"short"})}</div>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
        <div>${Math.round(day.main.temp)}°C</div>
      </div>
    `;
  });
}
function showHourlyForecast(list){
  hourly.innerHTML = "";

  // take next 6 time slots (≈ next 18 hours)
  let nextHours = list.slice(0, 6);

  nextHours.forEach(item => {
    let time = new Date(item.dt_txt)
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

    hourly.innerHTML += `
  <div class="hour-card">
    <div class="time">${time}</div>
    <img src="${icon}">
    <div class="temp">${Math.round(item.main.temp)}°C</div>
  </div>
`;

  });
}


function showHourly(){
  hourly.style.display = "flex";
}