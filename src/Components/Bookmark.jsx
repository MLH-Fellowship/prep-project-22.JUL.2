import React,{useEffect, useState} from "react";
import "../assets/css/Bookmark.css";


function DailyForecast({day, forecast}) {
  return (
      <>
      <div className='daily-container'>
          <div className='day'>{day}</div>
          <img src={"http://openweathermap.org/img/wn/"+forecast.icon+"@2x.png"} alt="cloudy-icon"/>
				<p>{Math.round(forecast.temperature.maximum)}&#8451;</p>
				<p>{Math.round(forecast.temperature.minimum)}&#8451;</p>
      </div>
      </>
  )
}

function Bookmark({city, dailyforecast}) {
	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	return (
		<>
		<div className="bookmark">
			<div className="bookmark-country-name">
				<h1>{city}</h1>
			</div>
			<div className="bookmark-cloud-type">
				<div className='weather-icon'>
					<img src={"http://openweathermap.org/img/wn/"+dailyforecast[0].icon+"@2x.png"} alt='cloudy_img'/>
        </div>
				<p>{dailyforecast[0].condition}</p>
			</div>
			<div className="bookmark-wind-humidity">
				<ul>
					<li> Wind {dailyforecast[0].windspeed}m/s </li>
					<li> Humidity {dailyforecast[0].humidity}% </li>
				</ul>
			</div>
			<div className="bookmark-temp">
				<h1>{ Math.round(dailyforecast[0].current_temp) }&#8451;</h1>
			</div>
			<div className="flex bookmark-daily-forecast">
		    {dailyforecast.map((forecast, id) => (
				  <DailyForecast key={id} day={days[forecast.date.getDay()]} forecast={forecast} />
        ))}
			</div>
		</div>
		</>
	)
}





function BookmarksContainer({bookmarks}){
	const [error, setError] = useState(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [results, setResults] = useState(null);
	const [forecast, setForecast] = useState(null);
	const [generic, setGeneric] = useState("app");
	const [notfound, setFlag] = useState(false);
	const [weatherData, setWeatherData] = useState([]);

	const fetchWeather = (city) => {
		const url = "https://api.openweathermap.org/data/2.5/forecast?q=" +
        city +
        "&units=metric" +
        "&appid=" +
        process.env.REACT_APP_APIKEY;
		return fetch(url)
		  .then((res) => res.json())
		  .then((result) => {
			
			if (result.cod !== "200") {
	
			  setIsLoaded(false);
			  if(result.name !== null){
				setIsLoaded(true);
				console.log("name",result.name);
				setResults(results);
			  }
			  if (result["cod"] == "404") {
				setIsLoaded(true);
				setFlag(true);
			  }
			  return null;
			}
	
			let hourlyForecast = [];
			result.list.forEach((fc) => {
			  hourlyForecast.push({
				current_temp: fc.main.temp,
				condition: fc.weather[0].description,
				date: new Date(fc.dt * 1000),
				feels_like: fc.main.feels_like,
				temperature: {
				  minimum: fc.main.temp_min,
				  maximum: fc.main.temp_max,
				},
				icon: fc.weather[0].icon,
				windspeed: fc.wind.speed,
				humidity: fc.main.humidity,
			  });
			});
			document.body.classList = result.list[0].weather[0].main;
			setWeatherData(prev=>{
				return [...prev, {forecast:hourlyForecast,city:city}]
			});
			setIsLoaded(true);
		  })
		  .catch((error) => {
			setIsLoaded(true);
			setError(error);
		  });
	  };

	  useEffect(()=>{
		console.log(bookmarks+">>>>>>>>>>>>>>>>>>>>>>>>>.");
		setWeatherData([]);
		setIsLoaded(false);
		bookmarks.forEach(async city=>{
			await fetchWeather(city);
		 })
	  },[bookmarks]);

	  return(
		<div className="flex bookmark-box">
			{weatherData.length===0?<h2>No Bookmarks 😒</h2>:null}
			{isLoaded && weatherData && weatherData.map((data, index)=>{
				const daily_forecast = [];
				console.log(data);
				data?.forecast?.map((daily, key) => {
					if (key === 0) {
						daily_forecast.push(daily);
					}
					const last = daily_forecast.length - 1;
			
					if (!(daily.date.getDay() == daily_forecast[last].date.getDay())) {
						daily_forecast.push(daily);
					}
				});
				return <Bookmark key={index} city={data.city} dailyforecast={daily_forecast.slice(1, 6)}/>
			})}
		</div>
	  )
}


export default BookmarksContainer;

