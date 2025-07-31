try {
  // 안전한 입력 데이터 접근
  const inputData = $input.first().json;
  let destinationCity = "";
  
  // 목적지 결정 (항공료 코드와 동일한 로직)
  if (inputData.destination || inputData.destination_city) {
    destinationCity = (inputData.destination || inputData.destination_city).toLowerCase();
  } else {
    destinationCity = "bangkok";
  }

  // 호텔 데이터베이스
  const hotelDatabase = {
    "bangkok": [
      {
        name: "샹그릴라 호텔 방콕",
        category: "럭셔리",
        rating: 5,
        price_per_night: 180000,
        location: "실롬",
        distance_to_center: "2km",
        amenities: ["야외수영장", "스파", "피트니스센터", "조식포함", "무료WiFi"],
        review_score: 9.2,
        review_count: 3847,
        booking_url: "fake-booking-url",
        image_url: "fake-image-url"
      },
      {
        name: "센타라 그랜드 센트럴월드",
        category: "비즈니스",
        rating: 4,
        price_per_night: 120000,
        location: "사이암",
        distance_to_center: "1km",
        amenities: ["실내수영장", "쇼핑몰연결", "조식포함", "무료WiFi"],
        review_score: 8.5,
        review_count: 2156,
        booking_url: "fake-booking-url",
        image_url: "fake-image-url"
      },
      {
        name: "르부아 앳 스테이트 타워",
        category: "럭셔리",
        rating: 5,
        price_per_night: 250000,
        location: "실롬",
        distance_to_center: "3km",
        amenities: ["스카이바", "미슐랭레스토랑", "스파", "무한풀", "컨시어지"],
        review_score: 9.0,
        review_count: 1892,
        booking_url: "fake-booking-url",
        image_url: "fake-image-url"
      },
      {
        name: "노보텔 방콕 시암 스퀘어",
        category: "표준",
        rating: 4,
        price_per_night: 95000,
        location: "사이암",
        distance_to_center: "1.5km",
        amenities: ["야외수영장", "피트니스센터", "무료WiFi"],
        review_score: 8.1,
        review_count: 4521,
        booking_url: "fake-booking-url",
        image_url: "fake-image-url"
      }
    ],
    "danang": [
      {
        name: "인터콘티넨탈 다낭 선펜니슐라",
        category: "럭셔리",
        rating: 5,
        price_per_night: 150000,
        location: "미케해변",
        distance_to_center: "8km",
        amenities: ["해변접근", "야외수영장", "스파", "골프코스", "키즈클럽"],
        review_score: 9.1,
        review_count: 2847,
        booking_url: "fake-booking-url",
        image_url: "fake-image-url"
      },
      {
        name: "풀만 다낭 비치 리조트",
        category: "리조트",
        rating: 4,
        price_per_night: 100000,
        location: "미케해변",
        distance_to_center: "7km",
        amenities: ["해변접근", "야외수영장", "키즈클럽", "무료WiFi"],
        review_score: 8.3,
        review_count: 1654,
        booking_url: "fake-booking-url",
        image_url: "fake-image-url"
      },
      {
        name: "하얏트 리젠시 다낭",
        category: "비즈니스",
        rating: 4,
        price_per_night: 80000,
        location: "다낭시내",
        distance_to_center: "2km",
        amenities: ["야외수영장", "피트니스센터", "비즈니스센터"],
        review_score: 8.0,
        review_count: 987,
        booking_url: "fake-booking-url",
        image_url: "fake-image-url"
      }
    ],
    "cebu": [
      {
        name: "샹그릴라 막탄 세부",
        category: "럭셔리",
        rating: 5,
        price_per_night: 140000,
        location: "막탄섬",
        distance_to_center: "15km",
        amenities: ["전용해변", "야외수영장", "스파", "골프코스", "다이빙센터"],
        review_score: 8.9,
        review_count: 3412,
        booking_url: "fake-booking-url",
        image_url: "fake-image-url"
      },
      {
        name: "크림슨 리조트 앤 스파",
        category: "리조트",
        rating: 4,
        price_per_night: 90000,
        location: "막탄섬",
        distance_to_center: "12km",
        amenities: ["해변접근", "야외수영장", "스파", "무료WiFi"],
        review_score: 8.2,
        review_count: 1876,
        booking_url: "fake-booking-url",
        image_url: "fake-image-url"
      }
    ]
  };

  // 목적지별 호텔 선택
  let selectedHotels = hotelDatabase[destinationCity];
  if (!selectedHotels) {
    // 키워드 매칭
    for (const key in hotelDatabase) {
      if (destinationCity.includes(key) || key.includes(destinationCity)) {
        selectedHotels = hotelDatabase[key];
        break;
      }
    }
  }
  
  // 기본값 설정
  if (!selectedHotels) {
    selectedHotels = hotelDatabase["bangkok"];
  }

  // 숙박 일수 결정
  const nights = 3; // 3박 4일 기본값
  
  // 현실적인 가격 변동 적용
  const today = new Date();
  const dayOfWeek = today.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // 호텔별 가격 조정
  const hotelsWithPricing = selectedHotels.map(hotel => {
    let adjustedPrice = hotel.price_per_night;
    
    // 주말 할증
    if (isWeekend) {
      adjustedPrice = Math.round(adjustedPrice * 1.2);
    }
    
    // 랜덤 변동 (-15% ~ +10%)
    const variation = (Math.random() - 0.7) * 0.25;
    adjustedPrice = Math.round(adjustedPrice * (1 + variation));
    
    return {
      ...hotel,
      original_price: hotel.price_per_night,
      current_price: adjustedPrice,
      total_price: adjustedPrice * nights,
      nights: nights,
      price_per_person: Math.round((adjustedPrice * nights) / 2), // 2인 기준
      availability: Math.random() > 0.1 ? "available" : "limited", // 90% 확률로 예약 가능
      discount_percent: hotel.price_per_night > adjustedPrice ? 
        Math.round(((hotel.price_per_night - adjustedPrice) / hotel.price_per_night) * 100) : 0
    };
  });

  // 가격순 정렬
  hotelsWithPricing.sort((a, b) => a.current_price - b.current_price);

  // 결과 구성
  const result = {
    destination: destinationCity,
    search_date: today.toISOString().split('T')[0],
    nights: nights,
    hotels: hotelsWithPricing,
    hotel_count: hotelsWithPricing.length,
    price_range: {
      min: Math.min(...hotelsWithPricing.map(h => h.current_price)),
      max: Math.max(...hotelsWithPricing.map(h => h.current_price)),
      average: Math.round(hotelsWithPricing.reduce((sum, h) => sum + h.current_price, 0) / hotelsWithPricing.length)
    },
    recommended: hotelsWithPricing.filter(h => h.review_score >= 8.5)[0], // 평점 높은 것 추천
    budget_option: hotelsWithPricing[0], // 가장 저렴한 것
    luxury_option: hotelsWithPricing[hotelsWithPricing.length - 1] // 가장 비싼 것
  };

  return [{ json: result }];
  
} catch (error) {
  // 에러 처리
  return [{
    json: {
      destination: "bangkok",
      hotels: [{
        name: "기본 호텔",
        current_price: 100000,
        total_price: 300000,
        nights: 3
      }],
      error: "호텔 검색 중 오류 발생: " + error.message
    }
  }];
}