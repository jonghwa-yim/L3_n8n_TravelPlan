try {
  const weatherData = $input.first().json;
  
  if (!weatherData.current_condition || !weatherData.current_condition[0]) {
    throw new Error("날씨 데이터 형식 오류");
  }
  
  const current = weatherData.current_condition[0];
  const forecast = weatherData.weather && weatherData.weather[0] ? weatherData.weather[0] : {};
  
  const result = {
    location: "방콕", // 하드코딩 또는 입력에서 받기
    current_temperature: parseInt(current.temp_C),
    current_temperature_f: parseInt(current.temp_F),
    description: current.weatherDesc && current.weatherDesc[0] ? current.weatherDesc[0].value : "정보 없음",
    humidity: parseInt(current.humidity),
    wind_speed: parseInt(current.windspeedKmph),
    feels_like: current.FeelsLikeC ? parseInt(current.FeelsLikeC) : parseInt(current.temp_C),
    forecast: {
      max_temp: forecast.maxtempC ? parseInt(forecast.maxtempC) : null,
      min_temp: forecast.mintempC ? parseInt(forecast.mintempC) : null,
      date: forecast.date || new Date().toISOString().split('T')[0]
    },
    travel_advice: generateTravelAdvice(parseInt(current.temp_C), parseInt(current.humidity))
  };
  
  return [{ json: result }];
  
} catch (error) {
  return [{
    json: {
      location: "알 수 없음",
      current_temperature: 30,
      description: "정보를 가져올 수 없음",
      humidity: 70,
      error: "날씨 정보 처리 중 오류: " + error.message
    }
  }];
}

function generateTravelAdvice(temp, humidity) {
  let advice = [];
  
  if (temp > 30) {
    advice.push("기온이 높으니 가벼운 옷을 준비하세요.");
    advice.push("충분한 수분 섭취와 자외선 차단제가 필요합니다.");
  } else if (temp < 20) {
    advice.push("쌀쌀하니 겉옷을 준비하세요.");
  }
  
  if (humidity > 80) {
    advice.push("습도가 높으니 통풍이 잘 되는 옷을 입으세요.");
  }
  
  return advice.length > 0 ? advice : ["쾌적한 날씨입니다!"];
}