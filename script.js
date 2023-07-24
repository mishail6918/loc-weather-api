const apiKey = "ec9cef8eca4cde580ebf4d3fe887ed01";
const form = document.querySelector(".header__search form");
const input = form.querySelector("input");
const list = document.querySelector(".info");
const forecast = document.querySelector(".info-forecast");

//Собираем элемент с данными о погоде на текущее время
var itemInitialize = function (weatherInfo) {

    //Добавляем иконку погоды
    const icon = `https://openweathermap.org/img/wn/${
        weatherInfo['weather'][0]['icon']
    }.png`;

    const cityName = weatherInfo['name'];

    let infoBlock = document.createElement('div');
    infoBlock.classList.add('info__city');
    let markup = `
    <div class="info__block">
        <div class="info__block-main">
            <div class="info__block-name"><h1>${weatherInfo['name']}</h1><span>${weatherInfo['sys']['country']}</span><span class="time">${new Date().toLocaleTimeString().slice(0,-3)}</span></div>
            <div class="info__block-temp">
                <h1>${Math.round(weatherInfo['main']['temp'])}<sup>°C</sup></h1>
                <figure>
                    <img class="city-icon" src="${icon}">
                    <figcaption>${weatherInfo['weather'][0]['description']}</figcaption>
                </figure>
            </div>
            <div class="info__block-wind">
                <h2>Скорость ветра:</h2>
                <p>${Math.round(weatherInfo['wind']['speed'])}<sup>м/с</sup></p>
            </div>
        </div>
        <video autoplay muted loop id="myVideo">
            <source src="video/${weatherInfo['weather'][0]['main']}.mp4" type="video/mp4">
        </video>
    </div>
    `;
    infoBlock.innerHTML = markup;
    list.appendChild(infoBlock);

    let video = document.querySelector("video");
    setTimeout(()=>{video.classList.add("show")}, 500)

}

var forecastInitialize = function (forecastInfo) {

    let cityName = forecastInfo['city']['name'];
    let vowels = ['а', 'я', 'у', 'ю', 'о', 'е', 'ё', 'э', 'и', 'ы', 'ь'];
    let lastIdx = cityName.length - 1;
    let last = cityName[lastIdx];
    if (vowels.find((i) => i === last) === 'ь') {
        let tempCity = cityName.split('', cityName.length);
        tempCity[tempCity.length - 1] = 'и';
        cityName = tempCity.join('');
    }
    else if (vowels.indexOf(last) !== -1) {
        let tempCity = cityName.split('', cityName.length);
        tempCity[tempCity.length - 1] = 'е';
        cityName = tempCity.join('');
    }
    else {
        let tempCity = cityName.split('', cityName.length);
        tempCity.push('e');
        cityName = tempCity.join('');
    }

    document.querySelector('.info-forecast').innerHTML += "<h1>Погода в " + cityName + " на 5 дней</h1>";

    let forecastBlock = document.createElement('div');
    forecastBlock.classList.add('forecast__wrapper');
    forecastInfo['list'].forEach(function (element) {

        const icon = `https://openweathermap.org/img/wn/${
            element['weather'][0]['icon']
        }.png`;

        let markup = `
            <div>
                <h1>${Math.round(element['main']['temp'])}<sup>°C</sup></h1>
                <figure>
                    <img class="city-icon" src="${icon}">
                    <figcaption>${element['weather'][0]['description']}</figcaption>
                </figure>
                ${element['dt_txt']}
            </div>
        `;
        forecastBlock.innerHTML += markup;
    });
    forecast.appendChild(forecastBlock);

    $('.forecast__wrapper').slick({
        slidesToShow: 6,
        slidesToScroll: 6,
        infinite: false,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4,
                    arrows: false
                }
            },
            {
                breakpoint: 520,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                }
            }
        ]
    });
}

if (localStorage.getItem('recentCity')) {
    (async function () {
        let inputValue = localStorage.getItem('recentCity');
        const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + inputValue + '&appid=' + apiKey + '&units=metric&lang=ru';

        //Отправляем запрос по последнему поиску
        let response = await fetch(url);
        let weatherInfo = await response.json();
        itemInitialize(weatherInfo);

        //Отправляем запрос о данных на 5 дней
        const urlFewDays = 'https://api.openweathermap.org/data/2.5/forecast?q=' + inputValue + '&appid=' + apiKey + '&units=metric&lang=ru';
        let responseFewDays = await fetch(urlFewDays);
        let weatherInfoFewDays = await responseFewDays.json();
        forecastInitialize(weatherInfoFewDays);
    })();
}

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const inputValue = input.value;
    const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + inputValue + '&appid=' + apiKey + '&units=metric&lang=ru';

    //Обнуляем данные на странице html
    document.querySelector(".info").innerHTML = "";
    document.querySelector(".info-forecast").innerHTML = "";

    //Отправляем запрос о текущем времени
    let response = await fetch(url);
    let weatherInfo = await response.json();
    itemInitialize(weatherInfo);

    //Сохраняем последний запрос
    localStorage.setItem('recentCity', inputValue);

    //Отправляем запрос о данных на 5 дней
    const urlFewDays = 'https://api.openweathermap.org/data/2.5/forecast?q=' + inputValue + '&appid=' + apiKey + '&units=metric&lang=ru';
    let responseFewDays = await fetch(urlFewDays);
    let weatherInfoFewDays = await responseFewDays.json();
    forecastInitialize(weatherInfoFewDays);

});
