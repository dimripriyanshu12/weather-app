let currentUnit = "metric";
let chart;
const apiKey = "5983b6da69507fefeb6d8fcfc92b82ae";

const loader = document.getElementById("loader");
const current = document.getElementById("currentWeather");
const forecastContainer = document.getElementById("forecast");

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function showLoader(show) {
  loader.classList.toggle("hidden", !show);
}

async function searchWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return;
  fetchWeather(city);
}

async function fetchWeather(city) {
  showLoader(true);
  current.classList.add("hidden");
  forecastContainer.innerHTML = "";
  

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();
    displayCurrent(data);
    displayForecast(data);
    changeBackground(data.list[0].weather[0].main);

  } catch (err) {
    alert(err.message);
  }

  showLoader(false);
}

function displayCurrent(data) {
  const weather = data.list[0];

  document.getElementById("cityName").textContent =
    data.city.name + ", " + data.city.country;

  document.getElementById("temp").textContent =
    Math.round(weather.main.temp) + "°C";

  document.getElementById("desc").textContent =
    weather.weather[0].description;

  document.getElementById("humidity").textContent =
    weather.main.humidity;

  document.getElementById("wind").textContent =
    weather.wind.speed;

  document.getElementById("icon").src =
    `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;

  current.classList.remove("hidden");
}

function displayForecast(data) {
  const daily = data.list.filter(item =>
    item.dt_txt.includes("12:00:00")
  );

  daily.slice(0, 5).forEach(day => {
    const card = document.createElement("div");
    card.classList.add("card");

    const date = new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" });

    card.innerHTML = `
      <h4>${date}</h4>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
      <p>${Math.round(day.main.temp)}°C</p>
    `;

    forecastContainer.appendChild(card);
  });
}

function changeBackground(weatherMain) {
  const body = document.body;

  if (weatherMain === "Clear") {
    body.style.background = "linear-gradient(135deg, #fceabb, #f8b500)";
  } else if (weatherMain === "Rain") {
    body.style.background = "linear-gradient(135deg, #4e54c8, #8f94fb)";
  } else if (weatherMain === "Clouds") {
    body.style.background = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
  } else {
    body.style.background = "linear-gradient(135deg, #4facfe, #00f2fe)";
  }
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
      );

      const data = await res.json();
      displayCurrent(data);
      displayForecast(data);
      changeBackground(data.list[0].weather[0].main);
    });
  }
}
async function fetchWeather(city) {
  showLoader(true);

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${currentUnit}&appid=${apiKey}`
  );

  const data = await res.json();

  displayCurrent(data);
  displayForecast(data);
  displayHourlyChart(data);
  saveToHistory(city);
  applyEffects(data.list[0].weather[0].main);

  showLoader(false);
}
function displayHourlyChart(data) {
  const ctx = document.getElementById("hourlyChart").getContext("2d");

  const labels = data.list.slice(0, 8).map(item =>
    new Date(item.dt_txt).getHours() + ":00"
  );

  const temps = data.list.slice(0, 8).map(item =>
    item.main.temp
  );

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Next 24 Hours",
        data: temps,
        borderWidth: 2,
        tension: 0.4
      }]
    }
  });
}
function setUnit(unit) {
  currentUnit = unit;
  const city = document.getElementById("cityName").textContent.split(",")[0];
  if (city) fetchWeather(city);
}
function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) history.pop();
  }

  localStorage.setItem("weatherHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  const list = document.getElementById("historyList");

  list.innerHTML = "";

  history.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.onclick = () => fetchWeather(city);
    list.appendChild(li);
  });
}

renderHistory();
function applyEffects(weather) {
  document.getElementById("rainEffect").classList.add("hidden");
  document.getElementById("snowEffect").classList.add("hidden");

  if (weather === "Rain") {
    document.getElementById("rainEffect").classList.remove("hidden");
  } else if (weather === "Snow") {
    document.getElementById("snowEffect").classList.remove("hidden");
  }
}