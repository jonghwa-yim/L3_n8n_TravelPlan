# n8n으로 나만의 여행 계획 AI 만들기 (Step-by-Step 가이드)

안녕하세요! 이 가이드를 따라 n8n을 사용하여 여러분만의 멋진 여행 계획 AI를 만들어 보겠습니다. 각 단계를 차근차근 따라오시면, 코드를 잘 모르더라도 누구나 완성할 수 있습니다.

---

## 🎯 최종 목표

-   **입력**: 가고 싶은 여행지와 날짜 등 간단한 조건

---

## 🚀 Step 1: 워크플로우 준비하기

가장 먼저, n8n에서 새로운 워크플로우를 만들고 시작 데이터를 설정합니다.

### 1-1. 새 워크플로우 생성

1.  n8n 대시보드에서 **"New Workflow"** 버튼을 클릭하세요.
2.  워크플로우의 이름을 `나만의 여행 계획 AI` 와 같이 원하는 이름으로 변경해 주세요.
3.  저장 후 편집 화면으로 들어갑니다.

### 1-2. 시작 노드(Manual Trigger) 설정

1.  기본으로 생성된 **Manual Trigger** 노드를 클릭합니다.
2.  오른쪽 패널에서 **"Test step"** 버튼을 누르세요.
3.  **"Edit test event"** 를 클릭하고, 아래 JSON 데이터를 복사하여 붙여넣습니다. 이 데이터는 우리가 만들 AI의 기본 입력값이 됩니다.

```json
[
  {
    "destination": "태국 푸켓",
    "destination_code": "HKT",
    "city": "Phuket",
    "country": "Thailand",
    "budget_breakdown": {
      "flight": 450000,
      "hotel": 360000,
      "food": 240000,
      "activity": 200000
    },
    "user_request": {
      "checkin": "2024-03-15",
      "checkout": "2024-03-18",
      "duration": "3박 4일"
    }
  }
]
```

4.  **"Save test event"** 를 클릭하여 저장합니다.

---

## 🛫 Step 2: 항공권 정보 만들기 (시뮬레이션)

실제 항공권 API 대신, 현실적인 가짜 항공권 데이터를 만드는 Code 노드를 추가합니다.

### 2-1. Code 노드 추가

1.  `+` 아이콘을 눌러 **Code** 노드를 찾아 추가하고, **Manual Trigger** 노드에 연결하세요.
2.  노드 이름을 **"항공료 검색"**으로 변경하면 나중에 알아보기 쉽습니다.

### 2-2. 항공권 시뮬레이션 코드 입력

아래 코드를 **전체 복사**하여 Code 노드의 `JavaScript` 입력창에 붙여넣으세요.

```javascript
// n8n Code 노드용 - 항공료 시뮬레이션
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
    "bangkok": { city: "방콕", country: "태국", base_price: 450000, flight_time: "6시간 30분", airlines: ["타이항공", "대한항공", "아시아나항공"], airport_code: "BKK", currency: "THB" },
    "danang": { city: "다낭", country: "베트남", base_price: 380000, flight_time: "5시간 45분", airlines: ["베트남항공", "제주항공", "비엣젯"], airport_code: "DAD", currency: "VND" },
    "cebu": { city: "세부", country: "필리핀", base_price: 420000, flight_time: "3시간 20분", airlines: ["필리핀항공", "세부퍼시픽", "제주항공"], airport_code: "CEB", currency: "PHP" },
    "phuket": { city: "푸켓", country: "태국", base_price: 480000, flight_time: "6시간 45분", airlines: ["타이항공", "대한항공", "스쿠트"], airport_code: "HKT", currency: "THB" }
  };

  // 목적지 선택
  let selectedDestination = flightDatabase[destinationCity];
  if (!selectedDestination) {
    for (const key in flightDatabase) {
      if (destinationCity.includes(key) || key.includes(destinationCity)) {
        selectedDestination = flightDatabase[key];
        break;
      }
    }
  }
  if (!selectedDestination) {
    selectedDestination = flightDatabase["bangkok"];
  }

  // 현실적인 가격 변동 시뮬레이션
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=일요일, 6=토요일
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  let priceMultiplier = 1.0;
  if (isWeekend) priceMultiplier += 0.15; // 주말 15% 증가
  
  const randomVariation = (Math.random() - 0.5) * 0.3; // -10% ~ +20%
  priceMultiplier += randomVariation;
  
  const currentPrice = Math.round(selectedDestination.base_price * priceMultiplier);
  
  // 항공편 옵션 생성
  const flightOptions = selectedDestination.airlines.slice(0, 3).map((airline, index) => {
    const priceAdjustment = index * 30000;
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
  return [{ json: { error: "항공료 검색 중 오류 발생: " + error.message } }];
}
```

### 2-3. 테스트 실행

1.  **"Test step"** 버튼을 클릭하여 코드가 잘 작동하는지 확인합니다.
2.  오른쪽 **Output** 탭에서 아래와 비슷한 결과가 나오면 성공입니다. (가격은 실행할 때마다 조금씩 다를 수 있습니다.)

```json
{
  "destination": "푸켓",
  "country": "태국",
  "current_price": 456000,
  "flight_options": [ ... ]
}
```

---

## 🏨 Step 3: 호텔 정보 만들기 (시뮬레이션)

항공권과 마찬가지로, 다양한 호텔 정보를 만들어주는 Code 노드를 추가합니다.

### 3-1. Code 노드 추가

1.  **Manual Trigger** 노드를 다시 클릭하고, `+` 아이콘을 눌러 **Code** 노드를 하나 더 추가합니다. (항공료 노드와 나란히 연결되도록)
2.  노드 이름을 **"호텔 검색"**으로 변경합니다.

### 3-2. 호텔 시뮬레이션 코드 입력

아래 코드를 **전체 복사**하여 Code 노드의 `JavaScript` 입력창에 붙여넣으세요.

```javascript
// n8n Code 노드용 - 호텔 시뮬레이션
try {
  const inputData = $input.first().json;
  let destinationCity = (inputData.destination || inputData.destination_city || "bangkok").toLowerCase();

  // 호텔 데이터베이스
  const hotelDatabase = {
    "bangkok": [
      { name: "샹그릴라 호텔 방콕", category: "럭셔리", rating: 5, price_per_night: 180000, location: "실롬", amenities: ["야외수영장", "스파", "피트니스센터"], review_score: 9.2 },
      { name: "센타라 그랜드 센트럴월드", category: "비즈니스", rating: 4, price_per_night: 120000, location: "사이암", amenities: ["실내수영장", "쇼핑몰연결"], review_score: 8.5 },
      { name: "르부아 앳 스테이트 타워", category: "럭셔리", rating: 5, price_per_night: 250000, location: "실롬", amenities: ["스카이바", "미슐랭레스토랑"], review_score: 9.0 },
      { name: "노보텔 방콕 시암 스퀘어", category: "표준", rating: 4, price_per_night: 95000, location: "사이암", amenities: ["야외수영장", "피트니스센터"], review_score: 8.1 }
    ],
    "danang": [
      { name: "인터콘티넨탈 다낭", category: "럭셔리", rating: 5, price_per_night: 150000, location: "미케해변", amenities: ["해변접근", "골프코스"], review_score: 9.1 },
      { name: "풀만 다낭 비치 리조트", category: "리조트", rating: 4, price_per_night: 100000, location: "미케해변", amenities: ["해변접근", "키즈클럽"], review_score: 8.3 }
    ],
    "cebu": [
      { name: "샹그릴라 막탄 세부", category: "럭셔리", rating: 5, price_per_night: 140000, location: "막탄섬", amenities: ["전용해변", "다이빙센터"], review_score: 8.9 },
      { name: "크림슨 리조트 앤 스파", category: "리조트", rating: 4, price_per_night: 90000, location: "막탄섬", amenities: ["해변접근", "스파"], review_score: 8.2 }
    ]
  };

  // 목적지별 호텔 선택
  let selectedHotels = hotelDatabase[destinationCity];
  if (!selectedHotels) {
    for (const key in hotelDatabase) {
      if (destinationCity.includes(key) || key.includes(destinationCity)) {
        selectedHotels = hotelDatabase[key];
        break;
      }
    }
  }
  if (!selectedHotels) {
    selectedHotels = hotelDatabase["bangkok"];
  }

  const nights = 3; // 3박 4일
  
  // 호텔별 가격 조정
  const hotelsWithPricing = selectedHotels.map(hotel => {
    let adjustedPrice = hotel.price_per_night;
    const variation = (Math.random() - 0.7) * 0.25; // -15% ~ +10%
    adjustedPrice = Math.round(adjustedPrice * (1 + variation));
    
    return {
      ...hotel,
      current_price: adjustedPrice,
      total_price: adjustedPrice * nights,
      nights: nights,
      availability: Math.random() > 0.1 ? "available" : "limited"
    };
  });

  hotelsWithPricing.sort((a, b) => a.current_price - b.current_price);

  // 결과 구성
  const result = {
    destination: destinationCity,
    search_date: new Date().toISOString().split('T')[0],
    nights: nights,
    hotels: hotelsWithPricing
  };

  return [{ json: result }];
  
} catch (error) {
  return [{ json: { error: "호텔 검색 중 오류 발생: " + error.message } }];
}
```

### 3-3. 테스트 실행

1.  **"Test step"** 버튼을 클릭하여 호텔 정보가 잘 생성되는지 확인합니다.
2.  Output에서 여러 호텔 정보가 담긴 `hotels` 배열이 보이면 성공입니다.

---

## 🌤️ Step 4: 실시간 날씨 정보 가져오기

이제 실제 외부 API를 사용하여 실시간 날씨 정보를 가져옵니다.

### 4-1. HTTP Request 노드 추가

1.  **Manual Trigger** 노드에 **HTTP Request** 노드를 추가로 연결합니다.
2.  노드 이름을 **"날씨 정보"**로 변경합니다.

### 4-2. 날씨 API 설정

노드 설정 패널에서 아래와 같이 입력하세요.

-   **Method**: `GET`
-   **URL**: `https://wttr.in/Bangkok?format=j1`

> 💡 **팁**: `Bangkok` 부분을 `Phuket`, `Danang` 등 다른 도시 영문명으로 바꾸면 해당 도시의 날씨를 가져올 수 있습니다.

### 4-3. 날씨 데이터 처리용 Code 노드 추가

API 결과는 그대로 사용하기 복잡하므로, 우리가 쓰기 좋은 형태로 가공하는 Code 노드를 추가합니다.

1.  **"날씨 정보" (HTTP Request)** 노드 뒤에 **Code** 노드를 연결합니다.
2.  노드 이름을 **"날씨 데이터 처리"**로 변경합니다.
3.  아래 코드를 복사하여 붙여넣으세요.

```javascript
try {
  const weatherData = $input.first().json;
  
  if (!weatherData.current_condition || !weatherData.current_condition[0]) {
    throw new Error("날씨 데이터 형식 오류");
  }
  
  const current = weatherData.current_condition[0];
  
  const result = {
    location: weatherData.nearest_area[0].areaName[0].value,
    current_temperature: parseInt(current.temp_C),
    description: current.weatherDesc[0].value,
    humidity: parseInt(current.humidity),
    feels_like: parseInt(current.FeelsLikeC),
    travel_advice: generateTravelAdvice(parseInt(current.temp_C), parseInt(current.humidity))
  };
  
  return [{ json: result }];
  
} catch (error) {
  return [{ json: { error: "날씨 정보 처리 중 오류: " + error.message } }];
}

function generateTravelAdvice(temp, humidity) {
  let advice = [];
  if (temp > 30) {
    advice.push("날씨가 더우니 가벼운 옷차림을 준비하세요.");
    advice.push("자외선 차단제와 선글라스는 필수입니다.");
  } else if (temp < 20) {
    advice.push("쌀쌀할 수 있으니 겉옷을 챙기세요.");
  }
  if (humidity > 80) {
    advice.push("습도가 높으니 통풍이 잘 되는 옷이 좋습니다.");
  }
  return advice.length > 0 ? advice : ["여행하기 좋은 쾌적한 날씨입니다!"];
}
```

---

## 💱 Step 5: 실시간 환율 정보 가져오기

여행 계획에 필수적인 환율 정보도 실시간으로 가져옵니다.

### 5-1. HTTP Request 노드 추가

1.  **Manual Trigger** 노드에 **HTTP Request** 노드를 하나 더 연결합니다.
2.  노드 이름을 **"환율 정보"**로 변경합니다.

### 5-2. 환율 API 설정

아래와 같이 설정하세요.

-   **Method**: `GET`
-   **URL**: `https://api.exchangerate-api.com/v4/latest/USD`

---

## 🔄 Step 6: 모든 데이터 합치고 최종 계획서 만들기

지금까지 만든 항공, 호텔, 날씨, 환율 정보를 하나로 합쳐서 멋진 최종 결과물을 만들 차례입니다.

### 6-1. Merge 노드 추가

1.  `+` 아이콘을 눌러 **Merge** 노드를 추가합니다.
2.  지금까지 만든 4개의 데이터 흐름(**항공료 검색, 호텔 검색, 날씨 데이터 처리, 환율 정보**)의 끝을 모두 이 **Merge** 노드에 연결하세요.
3.  Merge 노드 설정에서 **Mode**를 `Multiplex`로 변경합니다.

### 6-2. 최종 통합 Code 노드 추가

1.  **Merge** 노드 뒤에 마지막 **Code** 노드를 연결합니다.
2.  노드 이름을 **"최종 여행 계획서 생성"**으로 변경합니다.
3.  아래의 **최종 통합 코드**를 복사하여 붙여넣으세요. 이 코드가 모든 정보를 취합하여 하나의 완벽한 여행 계획서를 만들어줍니다.

```javascript
try {
  // 모든 입력 데이터 수집
  const inputs = $input.all();
  
  // 각 API 결과 안전하게 파싱
  let flightData = {}, hotelData = {}, weatherData = {}, exchangeData = {};
  
  // 입력 데이터에서 각 API 결과 구분
  inputs.forEach(input => {
    const json = input.json;
    if (json.flight_options) flightData = json;
    else if (json.hotels) hotelData = json;
    else if (json.current_temperature !== undefined) weatherData = json;
    else if (json.rates) exchangeData = json;
  });

  // 기본값 설정 (API 오류 대비)
  if (!flightData.destination) flightData = { destination: "방콕", country: "태국", current_price: 450000, flight_options: [{ airline: "타이항공", price: 450000, departure_time: "09:30" }], currency: "THB" };
  if (!hotelData.hotels) hotelData = { hotels: [{ name: "기본 호텔", current_price: 120000, total_price: 360000, nights: 3, rating: 4, review_score: 8.0, location: "시내" }] };
  if (!weatherData.current_temperature) weatherData = { location: flightData.destination, current_temperature: 30, description: "맑음", humidity: 70, travel_advice: ["쾌적한 날씨입니다!"] };
  if (!exchangeData.rates) exchangeData = { rates: { KRW: 1387, THB: 32.54, VND: 26132, PHP: 57.73 } };

  // 환율 정보 추출
  const currency = flightData.currency || "THB";
  const exchangeRate = exchangeData.rates[currency] || 32.54;
  const krwRate = exchangeData.rates.KRW || 1387;

  // 최적 호텔/항공편 선택
  const recommendedHotel = hotelData.hotels.find(h => h.review_score >= 8.0) || hotelData.hotels[0];
  const recommendedFlight = flightData.flight_options.reduce((best, current) => current.price < best.price ? current : best);

  // 총 비용 계산
  const costs = {
    flight: recommendedFlight.price,
    hotel: recommendedHotel.total_price,
    food: 240000, // 1일 8만원 * 3일
    activities: 200000,
    shopping: 150000,
    transport: 80000,
    insurance: 30000
  };
  costs.total = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

  // 일정표 생성
  const itinerary = generateItinerary(flightData.destination, recommendedFlight, recommendedHotel);

  // 최종 여행 계획서 데이터
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
  
  // 최종 텍스트 생성
  const travelPlanText = generateTravelPlanText(travelPlanData);

  // 최종 결과 반환
  return [{
    json: {
      destination: flightData.destination,
      country: flightData.country,
      total_cost: costs.total,
      travel_plan_text: travelPlanText,
      recommended_flight: recommendedFlight,
      recommended_hotel: recommendedHotel,
      all_hotels: hotelData.hotels,
      weather_details: weatherData,
      cost_breakdown: costs,
      itinerary_details: itinerary
    }
  }];

} catch (error) {
  return [{ json: { error: "데이터 통합 중 오류 발생: " + error.message, stack: error.stack } }];
}

// 일정표 생성 함수
function generateItinerary(destination, flight, hotel) {
  const activitiesByCity = {
    "방콕": { d1: "왓포 사원 방문", d2: "짜뚜짝 위켄드 마켓", d3: "담넌사두악 수상시장" },
    "다낭": { d1: "미케 해변 휴식", d2: "바나힐스 투어", d3: "호이안 고도시 투어" },
    "세부": { d1: "리조트 체크인 및 휴식", d2: "아일랜드 호핑", d3: "세부 시티 투어" },
    "푸켓": { d1: "빠통 비치 구경", d2: "피피섬 투어", d3: "푸켓 올드타운 방문" }
  };
  const activities = activitiesByCity[destination] || activitiesByCity["방콕"];
  return {
    day1: { morning: `${flight.departure_time} 인천 출발`, afternoon: "현지 도착 및 호텔 체크인", evening: activities.d1 },
    day2: { morning: activities.d2, afternoon: "현지 맛집 탐방", evening: "야시장 구경" },
    day3: { morning: activities.d3, afternoon: "마지막 쇼핑", evening: "공항 이동 준비" },
    day4: { morning: "공항으로 이동 및 출국", afternoon: "인천 도착" }
  };
}

// 여행 계획서 텍스트 생성 함수
function generateTravelPlanText(data) {
  return `
🌟 ═══════════════════════════════════════════════════════
   ${data.destination} ${data.country} 3박 4일 완전 여행 계획서
═══════════════════════════════════════════════════════ 🌟

📅 여행 일정: 2024년 3월 15일(금) ~ 18일(월) [3박 4일]
🌍 목적지: ${data.destination}, ${data.country}
💰 총 예상 비용: ${data.costs.total.toLocaleString()}원

✈️ 항공 정보
  - 항공사: ${data.flight.airline}
  - 항공료: ${data.flight.price.toLocaleString()}원 (왕복)
  - 출발: ${data.flight.departure_time} (인천)

🏨 숙박 정보
  - 호텔명: ${data.hotel.name}
  - 등급: ${data.hotel.rating ? '★'.repeat(data.hotel.rating) : '★★★★'}
  - 숙박비: ${data.hotel.total_price.toLocaleString()}원 (3박)
  - 평점: ${data.hotel.review_score || '8.5'}/10

🌤️ 날씨 정보
  - 현재 기온: ${data.weather.current_temperature}°C (${data.weather.description})
  - 복장 추천: ${data.weather.travel_advice ? data.weather.travel_advice.join(' ') : '가벼운 옷차림'}

💰 예산 분석
  - 항공료: ${data.costs.flight.toLocaleString()}원
  - 숙박비: ${data.costs.hotel.toLocaleString()}원
  - 식비: ${data.costs.food.toLocaleString()}원
  - 액티비티: ${data.costs.activities.toLocaleString()}원
  - 기타: ${(data.costs.shopping + data.costs.transport + data.costs.insurance).toLocaleString()}원

📋 상세 일정표
  - Day 1: ${data.itinerary.day1.morning} → ${data.itinerary.day1.afternoon} → 저녁: ${data.itinerary.day1.evening}
  - Day 2: 오전: ${data.itinerary.day2.morning} → 오후: ${data.itinerary.day2.afternoon} → 저녁: ${data.itinerary.day2.evening}
  - Day 3: 오전: ${data.itinerary.day3.morning} → 오후: ${data.itinerary.day3.afternoon} → 저녁: ${data.itinerary.day3.evening}
  - Day 4: ${data.itinerary.day4.morning} → ${data.itinerary.day4.afternoon}

💡 여행 팁
  - 환율: 1 ${data.currency} ≈ ${Math.round(1387 / data.exchangeRate)}원 (참고용)
  - 준비물: 여권, 상비약, 자외선 차단제, 보조배터리

🎉 즐거운 ${data.destination} 여행 되세요! 🎉
`;
}
```

---

## 🧪 Step 7: 최종 테스트 및 결과 확인

이제 모든 것이 준비되었습니다. 전체 워크플로우를 실행하여 최종 결과를 확인해 보세요!

1.  가장 처음의 **Manual Trigger** 노드에서 **"Test workflow"** 버튼을 클릭합니다.
2.  모든 노드가 녹색으로 바뀌며 성공적으로 실행되는지 지켜봅니다.
3.  마지막 **"최종 여행 계획서 생성"** 노드의 **Output**을 확인합니다.
4.  `travel_plan_text` 필드에 멋지게 정리된 여행 계획서가 들어있다면 완벽하게 성공한 것입니다!

---

## ✅ 체크리스트: 잘 만들어졌나요?

아래 항목들을 확인하며 스스로 점검해 보세요.

-   [ ] Manual Trigger에 테스트용 JSON 데이터가 잘 입력되었나요?
-   [ ] 항공료와 호텔 정보가 시뮬레이션되어 결과가 잘 나오나요?
-   [ ] 실시간 날씨와 환율 정보 API가 오류 없이 데이터를 가져오나요?
-   [ ] 모든 정보가 Merge 노드에 잘 연결되었나요?
-   [ ] 마지막 노드에서 모든 정보가 합쳐진 멋진 여행 계획서 텍스트가 만들어졌나요?

---

**완성!** 여러분은 이제 n8n을 활용하여 여러 데이터를 조합하고 가공하여 멋진 결과물을 만들어내는 자신만의 AI 에이전트를 완성했습니다.

---

## 🧐 프로젝트 동작 원리 리뷰 (How it Works)

이 n8n 워크플로우는 **"하나의 간단한 입력으로, 여러 전문 도구(노드)를 동시에 실행하고, 그 결과를 종합하여 하나의 완벽한 보고서를 만드는"** 과정을 자동화한 것입니다. 전체 동작은 크게 4단계로 나눌 수 있습니다.

---

### 1️⃣ 단계: 모든 것의 시작, 최초 입력 (`Manual Trigger`)

워크플로우는 사용자가 `Manual Trigger` 노드에 입력한 JSON 데이터로부터 시작됩니다.

```json
{
  "destination": "태국 푸켓",
  ...
}
```

-   **핵심 역할:** 여기서 가장 중요한 정보는 `"destination": "태국 푸켓"` 입니다. 이 값 하나가 뒤따라오는 모든 노드의 행동을 결정하는 '지시서' 역할을 합니다.
-   **어떻게 변화를 만드나?**
    -   만약 `destination`을 `"베트남 다낭"`으로 바꾸면, 항공료와 호텔 검색 노드는 '다낭'에 맞는 데이터를 생성하게 됩니다.
    -   날씨 API 호출 URL의 도시 이름도 이 값에 따라 동적으로 변경할 수 있습니다. (가이드에서는 `Bangkok`으로 고정했지만, 실제로는 입력값을 받아 처리하도록 확장 가능)

---

### 2️⃣ 단계: 4개의 전문가가 동시에 정보 수집 (병렬 처리)

입력값을 받은 워크플로우는 4개의 길(Branch)로 나뉘어 동시에 작업을 수행합니다. 각 길은 특정 분야의 전문가처럼 행동합니다.

-   **✈️ 항공료 & 🏨 호텔 검색 (시뮬레이션 전문가):**
    -   **역할:** `Code` 노드를 사용하여, 실제 API처럼 현실적인 가짜 데이터를 만들어냅니다.
    -   **동작:** 1단계에서 받은 `destination` 값을 기반으로, 미리 준비된 `flightDatabase`와 `hotelDatabase`에서 해당 도시에 맞는 정보를 찾습니다. 그리고 `Math.random()` 함수로 가격에 약간의 변동을 주어 매번 다른 결과를 보여줍니다.

-   **🌤️ 날씨 & 💱 환율 정보 (실시간 정보 전문가):**
    -   **역할:** `HTTP Request` 노드를 사용하여, 외부 세계의 실제 API에 접속해 실시간 데이터를 가져옵니다.
    -   **동작:** 지정된 URL로 데이터를 요청하고, API가 반환한 복잡한 데이터 중 우리가 필요한 정보(`current_temperature`, `rates` 등)만 다음 `Code` 노드에서 추출하여 쓰기 좋게 가공합니다.

---

### 3️⃣ 단계: 흩어진 정보 취합 (`Merge` 노드)

4명의 전문가가 가져온 결과물은 이제 `Merge` 노드에서 하나로 합쳐집니다.

-   **핵심 역할:** `Mode`를 `Multiplex`로 설정하여, 항공료, 호텔, 날씨, 환율 정보가 담긴 4개의 데이터 덩어리를 하나의 데이터 흐름(배열)으로 합쳐 다음 단계로 전달합니다. 이 단계가 없으면 최종 노드는 4개의 정보를 한 번에 받을 수 없습니다.

---

### 4️⃣ 단계: 최종 보고서 작성 (`최종 여행 계획서 생성` Code 노드)

**이 워크플로우의 하이라이트이자 가장 중요한 부분입니다.** `Merge` 노드로부터 합쳐진 데이터를 받아 최종 결과물을 만듭니다.

-   **핵심 코드 분석:**
    1.  **데이터 수집 및 분류:** `const inputs = $input.all();` 코드로 모든 데이터를 받은 뒤, `forEach` 루프를 돌며 각 데이터가 항공, 호텔, 날씨, 환율 중 무엇인지 식별합니다.
        ```javascript
        if (json.flight_options) flightData = json; // 'flight_options' 키가 있으면 항공료 데이터!
        else if (json.hotels) hotelData = json;     // 'hotels' 키가 있으면 호텔 데이터!
        ```
    2.  **오류 처리:** 만약 특정 API가 실패해서 데이터가 오지 않았을 경우를 대비해, 미리 준비된 기본값(Default Value)을 사용합니다. 이 덕분에 워크플로우가 중간에 멈추지 않고 안정적으로 작동합니다.
    3.  **데이터 가공 및 추천:** 수집된 데이터를 바탕으로 가장 저렴한 항공권(`recommendedFlight`)과 평점이 좋은 호텔(`recommendedHotel`)을 자동으로 선택합니다.
    4.  **최종 텍스트 생성:** `generateTravelPlanText` 함수를 호출하여, 지금까지 가공한 모든 데이터를 조합해 사람이 읽기 좋은 하나의 긴 텍스트(여행 계획서)로 만듭니다.
    5.  **결과 반환:** 구조화된 JSON 데이터와 함께, 최종적으로 만들어진 `travel_plan_text`를 결과물로 반환합니다. 이것이 우리가 화면에서 보게 될 최종 결과입니다.

---

### ✨ 결론

이 프로젝트는 n8n을 사용하여 **데이터의 흐름을 시각적으로 설계**하고, 각 단계에서 **JavaScript 코드로 데이터를 가공/생성**하며, **외부 API와 연동**하여 동적인 결과물을 만드는 강력한 자동화의 예시입니다. 사용자가 `destination`만 바꾸면, 전체 워크플로우가 유기적으로 반응하여 해당 도시에 맞는 맞춤형 여행 계획을 순식간에 만들어냅니다.
