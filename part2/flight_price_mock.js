try {
  // 안전한 입력 데이터 접근
  const inputData = $input.first().json;
  let destinationCity = "";
  
  // 다양한 입력 형태 처리
  if (inputData.destination_city) {
    destinationCity = inputData.destination_city.toLowerCase();
  } else if (inputData.destination) {
    destinationCity = inputData.destination.toLowerCase();
  } else if (inputData.region && inputData.region.includes("동남아")) {
    destinationCity = "bangkok"; // 기본값
  } else {
    destinationCity = "bangkok"; // 최종 기본값
  }

  // 항공료 데이터베이스
  const flightDatabase = {
    "bangkok": {
      city: "방콕",
      country: "태국",
      base_price: 450000,
      flight_time: "6시간 30분",
      airlines: ["타이항공", "대한항공", "아시아나항공"],
      airport_code: "BKK",
      currency: "THB"
    },
    "danang": {
      city: "다낭", 
      country: "베트남",
      base_price: 380000,
      flight_time: "5시간 45분",
      airlines: ["베트남항공", "제주항공", "비엣젯"],
      airport_code: "DAD",
      currency: "VND"
    },
    "cebu": {
      city: "세부",
      country: "필리핀", 
      base_price: 420000,
      flight_time: "3시간 20분",
      airlines: ["필리핀항공", "세부퍼시픽", "제주항공"],
      airport_code: "CEB",
      currency: "PHP"
    },
    "phuket": {
      city: "푸켓",
      country: "태국",
      base_price: 480000,
      flight_time: "6시간 45분",
      airlines: ["타이항공", "대한항공", "스쿠트"],
      airport_code: "HKT",
      currency: "THB"
    }
  };

  // 목적지 선택
  let selectedDestination = flightDatabase[destinationCity];
  if (!selectedDestination) {
    // 키워드 매칭 시도
    for (const key in flightDatabase) {
      if (destinationCity.includes(key) || key.includes(destinationCity)) {
        selectedDestination = flightDatabase[key];
        break;
      }
    }
  }
  
  // 여전히 없으면 기본값
  if (!selectedDestination) {
    selectedDestination = flightDatabase["bangkok"];
  }

  // 현실적인 가격 변동 시뮬레이션
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=일요일, 6=토요일
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // 가격 변동 요소
  let priceMultiplier = 1.0;
  if (isWeekend) priceMultiplier += 0.15; // 주말 15% 증가
  
  // 랜덤 변동 (-10% ~ +20%)
  const randomVariation = (Math.random() - 0.5) * 0.3;
  priceMultiplier += randomVariation;
  
  const currentPrice = Math.round(selectedDestination.base_price * priceMultiplier);
  
  // 항공편 옵션 생성 (3개 항공사)
  const flightOptions = selectedDestination.airlines.slice(0, 3).map((airline, index) => {
    const priceAdjustment = index * 30000; // 항공사별 가격 차이
    return {
      airline: airline,
      price: currentPrice + priceAdjustment,
      departure_time: ["09:30", "14:20", "19:15"][index],
      arrival_time: ["16:00", "20:50", "01:45"][index],
      seat_available: Math.floor(Math.random() * 50) + 10
    };
  });

  // 최종 결과
  const result = {
    destination: selectedDestination.city,
    country: selectedDestination.country,
    airport_code: selectedDestination.airport_code,
    currency: selectedDestination.currency,
    flight_time: selectedDestination.flight_time,
    base_price: selectedDestination.base_price,
    current_price: currentPrice,
    price_change: currentPrice - selectedDestination.base_price,
    flight_options: flightOptions,
    best_price: Math.min(...flightOptions.map(f => f.price)),
    search_date: today.toISOString().split('T')[0]
  };

  return [{ json: result }];
  
} catch (error) {
  // 에러 발생시 기본 데이터 반환
  return [{
    json: {
      destination: "방콕",
      country: "태국",
      current_price: 450000,
      error: "항공료 검색 중 오류 발생: " + error.message,
      flight_options: [{
        airline: "타이항공",
        price: 450000,
        departure_time: "09:30"
      }]
    }
  }];
}