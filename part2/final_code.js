try {
  // 모든 입력 데이터 수집
  const inputs = $input.all();
  console.log("입력 데이터 개수:", inputs.length);
  
  // 각 API 결과 안전하게 파싱
  let flightData = {};
  let hotelData = {};
  let weatherData = {};
  let exchangeData = {};
  
  // 입력 데이터에서 각 API 결과 구분 (더 정확한 식별)
  inputs.forEach((input, index) => {
    const json = input.json;
    console.log(`데이터 ${index}:`, Object.keys(json));
    
    // 항공료 데이터 식별 (airport_code, flight_options 등으로 식별)
    if (json.airport_code || json.flight_options || (json.destination && json.current_price && json.country)) {
      flightData = json;
      console.log("항공료 데이터 식별됨");
    }
    // 호텔 데이터 식별 (hotels 배열로 식별)
    else if (json.hotels && Array.isArray(json.hotels)) {
      hotelData = json;
      console.log("호텔 데이터 식별됨");
    }
    // 날씨 데이터 식별 (current_temperature로 식별)
    else if (json.current_temperature !== undefined || json.location) {
      weatherData = json;
      console.log("날씨 데이터 식별됨");
    }
    // 환율 데이터 식별 (rates 객체로 식별)
    else if (json.rates && typeof json.rates === 'object') {
      exchangeData = json;
      console.log("환율 데이터 식별됨");
    }
  });

  // 기본값 설정 (API 오류 대비)
  if (!flightData.destination) {
    flightData = {
      destination: "방콕",
      country: "태국",
      current_price: 450000,
      flight_options: [{ airline: "타이항공", price: 450000, departure_time: "09:30" }],
      currency: "THB"
    };
    console.log("항공료 기본값 설정");
  }
  
  if (!hotelData.hotels || !Array.isArray(hotelData.hotels)) {
    hotelData = {
      hotels: [{ 
        name: "기본 호텔", 
        current_price: 120000, 
        total_price: 360000, 
        nights: 3,
        rating: 4,
        review_score: 8.0,
        location: "시내"
      }]
    };
    console.log("호텔 기본값 설정");
  }
  
  if (!weatherData.current_temperature) {
    weatherData = {
      location: flightData.destination || "방콕",
      current_temperature: 30,
      description: "맑음",
      humidity: 70,
      travel_advice: ["쾌적한 날씨입니다!"]
    };
    console.log("날씨 기본값 설정");
  }
  
  if (!exchangeData.rates) {
    exchangeData = { 
      rates: { KRW: 1387, THB: 32.54, VND: 26132, PHP: 57.73 },
      base: "USD"
    };
    console.log("환율 기본값 설정");
  }

  // 환율 정보 추출
  const currency = flightData.currency || "THB";
  const exchangeRate = exchangeData.rates[currency] || 32.54;
  const usdToKrw = exchangeData.rates.KRW || 1387;

  // 최적 호텔 선택 (가성비 기준) - 안전한 접근
  let recommendedHotel = { name: "추천 호텔", current_price: 120000, total_price: 360000 };
  if (hotelData.hotels && hotelData.hotels.length > 0) {
    // 평점 8.0 이상 중에서 선택, 없으면 첫 번째 호텔
    recommendedHotel = hotelData.hotels.find(h => h.review_score >= 8.0) || hotelData.hotels[0];
  }

  // 최적 항공편 선택 (가격 기준) - 안전한 접근
  let recommendedFlight = { airline: "추천 항공사", price: 450000, departure_time: "09:30" };
  if (flightData.flight_options && flightData.flight_options.length > 0) {
    recommendedFlight = flightData.flight_options.reduce((best, current) => 
      current.price < best.price ? current : best);
  }

  // 총 비용 계산
  const costs = {
    flight: recommendedFlight.price || 450000,
    hotel: recommendedHotel.total_price || 360000,
    food: 240000, // 1일 8만원 * 3일
    activities: 200000, // 액티비티 예상 비용
    shopping: 150000, // 쇼핑 예상 비용
    transport: 80000, // 현지 교통비
    insurance: 30000 // 여행자 보험
  };
  
  costs.total = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

  // 일정표 생성
  const itinerary = generateItinerary(flightData.destination, recommendedFlight, recommendedHotel);

  // 최종 여행 계획서 텍스트 생성
  const travelPlanData = {
    destination: flightData.destination,
    country: flightData.country,
    flight: recommendedFlight,
    hotel: recommendedHotel,
    weather: weatherData,
    costs: costs,
    itinerary: itinerary,
    exchangeRate: exchangeRate,
    currency: currency,
    hotels: hotelData.hotels || []
  };
  
  const travelPlanText = generateTravelPlanText(travelPlanData);

  // 결과 반환
  return [{
    json: {
      // 구조화된 데이터
      destination: flightData.destination,
      country: flightData.country,
      total_cost: costs.total,
      travel_dates: "2024년 3월 15일 ~ 18일 (3박 4일)",
      weather_summary: `${weatherData.current_temperature}°C, ${weatherData.description}`,
      recommended_flight: recommendedFlight,
      recommended_hotel: recommendedHotel,
      
      // 텍스트 형태 여행 계획서
      travel_plan_text: travelPlanText,
      
      // 추가 정보
      all_hotels: hotelData.hotels || [],
      weather_details: weatherData,
      cost_breakdown: costs,
      itinerary_details: itinerary,
      
      // 생성 정보
      generated_at: new Date().toISOString(),
      data_sources: {
        flight: flightData.error ? "시뮬레이션 (오류)" : "시뮬레이션",
        hotel: hotelData.error ? "시뮬레이션 (오류)" : "시뮬레이션", 
        weather: weatherData.error ? "기본값 (오류)" : "실시간",
        exchange: exchangeData.error ? "기본값 (오류)" : "실시간"
      }
    }
  }];

} catch (error) {
  console.error("통합 코드 에러:", error);
  return [{
    json: {
      error: "데이터 통합 중 오류 발생: " + error.message,
      travel_plan_text: "오류로 인해 여행 계획서를 생성할 수 없습니다. 다시 시도해 주세요.",
      destination: "방콕",
      total_cost: 1500000,
      debug_info: {
        error_stack: error.stack,
        inputs_count: $input.all().length
      }
    }
  }];
}

// 일정표 생성 함수
function generateItinerary(destination, flight, hotel) {
  const destinationActivities = {
    "방콕": {
      day1: ["왓포 사원 방문", "카오산로드 탐방", "차오프라야 강 크루즈"],
      day2: ["짜뚜짝 위켄드 마켓", "왕궁 관람", "태국 전통 마사지"],
      day3: ["담넌사두악 수상시장", "마지막 쇼핑", "공항 이동"]
    },
    "다낭": {
      day1: ["미케 해변 휴식", "다낭 대성당 방문", "한시장 탐방"],
      day2: ["바나힐스 투어", "골든브릿지", "프렌치 빌리지"],
      day3: ["호이안 고도시 투어", "일본인 다리", "공항 이동"]
    },
    "세부": {
      day1: ["막탄섬 도착", "리조트 체크인", "해변 휴식"],
      day2: ["아일랜드 호핑", "스노클링", "바베큐 디너"],  
      day3: ["세부 시티 투어", "템플 오브 리아", "공항 이동"]
    }
  };

  const activities = destinationActivities[destination] || destinationActivities["방콕"];
  
  return {
    day1: {
      morning: `${flight.departure_time} 인천공항 출발`,
      afternoon: "현지 도착, 호텔 체크인",
      evening: activities.day1[0],
      accommodation: hotel.name
    },
    day2: {
      morning: activities.day1[1],
      afternoon: activities.day1[2],
      evening: "현지 음식 체험",
      accommodation: hotel.name
    },
    day3: {
      morning: activities.day2[0],
      afternoon: activities.day2[1],
      evening: activities.day2[2],
      accommodation: hotel.name
    },
    day4: {
      morning: activities.day3[0],
      afternoon: activities.day3[1],
      evening: activities.day3[2],
      accommodation: "기내"
    }
  };
}

// 여행 계획서 텍스트 생성 함수 (const 문제 해결)
function generateTravelPlanText(data) {
  // let으로 변경하여 재할당 가능하게 수정
  let plan = `
🌟 ═══════════════════════════════════════════════════════
   ${data.destination} ${data.country} 3박 4일 완전 여행 계획서
═══════════════════════════════════════════════════════ 🌟

📅 여행 일정: 2024년 3월 15일(금) ~ 18일(월) [3박 4일]
🌍 목적지: ${data.destination}, ${data.country}
💰 총 예상 비용: ${data.costs.total.toLocaleString()}원

┌─────────────────────────────────────────────────────────┐
│                    ✈️  항공 정보                         │
└─────────────────────────────────────────────────────────┘
🛫 항공사: ${data.flight.airline}
💸 항공료: ${data.flight.price.toLocaleString()}원 (왕복)
🕘 출발시간: ${data.flight.departure_time} (인천국제공항)
⏰ 소요시간: 약 6시간

┌─────────────────────────────────────────────────────────┐
│                    🏨  숙박 정보                         │
└─────────────────────────────────────────────────────────┘
🏩 호텔명: ${data.hotel.name}
⭐ 등급: ${data.hotel.rating ? '★'.repeat(data.hotel.rating) : '★★★★'} 
💸 숙박비: ${data.hotel.current_price.toLocaleString()}원/박 × 3박 = ${data.hotel.total_price.toLocaleString()}원
📍 위치: ${data.hotel.location || '시내 중심가'}
🎯 평점: ${data.hotel.review_score || '8.5'}/10

┌─────────────────────────────────────────────────────────┐
│                    🌤️  날씨 정보                        │
└─────────────────────────────────────────────────────────┘
🌡️ 현재 기온: ${data.weather.current_temperature}°C
☁️ 날씨 상태: ${data.weather.description}
💧 습도: ${data.weather.humidity}%
👕 복장 추천: ${data.weather.travel_advice ? data.weather.travel_advice.join(' ') : '가벼운 여름옷 준비'}

┌─────────────────────────────────────────────────────────┐
│                    💰  예산 분석                        │
└─────────────────────────────────────────────────────────┘
✈️ 항공료:     ${data.costs.flight.toLocaleString()}원
🏨 숙박비:     ${data.costs.hotel.toLocaleString()}원
🍽️ 식비:       ${data.costs.food.toLocaleString()}원 (1일 8만원)
🎯 액티비티:   ${data.costs.activities.toLocaleString()}원
🛍️ 쇼핑:       ${data.costs.shopping.toLocaleString()}원
🚌 교통비:     ${data.costs.transport.toLocaleString()}원
🛡️ 보험료:     ${data.costs.insurance.toLocaleString()}원
─────────────────────────────────────────────
💳 총 합계:    ${data.costs.total.toLocaleString()}원

┌─────────────────────────────────────────────────────────┐
│                📋  상세 일정표                          │
└─────────────────────────────────────────────────────────┘

🗓️ Day 1 (3월 15일 금요일)
  🌅 09:30 - 인천국제공항 출발 (${data.flight.airline})
  🌆 15:30 - ${data.destination} 도착 (현지시간)
  🏨 17:00 - ${data.hotel.name} 체크인
  🍽️ 19:00 - ${data.itinerary.day1.evening}
  💰 예상비용: ${Math.round(data.costs.flight/2 + data.costs.hotel/3 + data.costs.food/3).toLocaleString()}원

🗓️ Day 2 (3월 16일 토요일)  
  🌅 09:00 - ${data.itinerary.day2.morning}
  🌆 14:00 - ${data.itinerary.day2.afternoon}
  🌙 18:00 - ${data.itinerary.day2.evening}
  💰 예상비용: ${Math.round(data.costs.hotel/3 + data.costs.food/3 + data.costs.activities/2).toLocaleString()}원

🗓️ Day 3 (3월 17일 일요일)
  🌅 10:00 - ${data.itinerary.day3.morning}
  🌆 15:00 - ${data.itinerary.day3.afternoon}
  🌙 19:00 - ${data.itinerary.day3.evening}
  💰 예상비용: ${Math.round(data.costs.hotel/3 + data.costs.food/3 + data.costs.activities/2 + data.costs.shopping).toLocaleString()}원

🗓️ Day 4 (3월 18일 월요일)
  🌅 11:00 - ${data.itinerary.day4.morning}
  🌆 14:00 - 공항 이동 및 마지막 쇼핑
  🛫 17:00 - ${data.destination} 출발
  🏠 23:30 - 인천국제공항 도착 (한국시간)
  💰 예상비용: ${Math.round(data.costs.flight/2 + data.costs.transport).toLocaleString()}원

┌─────────────────────────────────────────────────────────┐
│                🏨  호텔 옵션 비교                       │
└─────────────────────────────────────────────────────────┘`;

  // 호텔 옵션들 추가 (let 사용으로 안전하게 재할당)
  if (data.hotels && data.hotels.length > 0) {
    data.hotels.slice(0, 3).forEach((hotel, index) => {
      const option = index === 0 ? "💎 추천" : index === 1 ? "💰 가성비" : "🌟 럭셔리";
      plan += `
${option} ${hotel.name}
  ⭐ ${hotel.rating}성급 | 📍 ${hotel.location || '시내'}
  💸 ${hotel.current_price.toLocaleString()}원/박 (총 ${hotel.total_price.toLocaleString()}원)
  🏆 평점: ${hotel.review_score}/10 | 🛏️ ${hotel.availability || 'available'}`;
    });
  }

  plan += `

┌─────────────────────────────────────────────────────────┐
│                💡  여행 팁 & 주의사항                   │
└─────────────────────────────────────────────────────────┘
📱 현지 통신: 로밍 또는 현지 유심 구입
💳 결제수단: 현금 + 신용카드 병행 사용
💊 준비물: 상비약, 자외선 차단제, 우산
🎫 필수서류: 여권 (잔여기간 6개월 이상)
🌐 환율: 1 ${data.currency} ≈ ${Math.round(1387/data.exchangeRate)}원 (참고용)

🎉 즐거운 ${data.destination} 여행 되세요! 🎉

═══════════════════════════════════════════════════════════
   생성일시: ${new Date().toLocaleString('ko-KR')}
   데이터: 실시간 날씨·환율 + 시뮬레이션 항공료·호텔료
═══════════════════════════════════════════════════════════`;

  return plan;
}