import { ItineraryData } from './types';

export const initialData: ItineraryData = {
  title: "SUMMER TRIP 2026",
  subtitle: "18/06 - 23/06 (6 ngày 5 đêm, 4 đêm Đà Nẵng)",
  summary: {
    villaCost: "20.000.000đ",
    foodBudget: "2.000.000đ/bữa",
    totalExpected: "53.200.000đ"
  },
  itinerary: [
    {
      date: "18-06-2026",
      title: "Thứ Năm: HN ➔ Cửa Lò",
      distance: "~290 km",
      activities: [
        { 
          time: "13:30", 
          description: "Xuất phát từ HN. Đi cao tốc Pháp Vân - Cầu Giẽ.", 
          type: "transport",
          mapLink: "https://www.google.com/maps/dir/Hà+Nội/Cửa+Lò,+Nghệ+An/",
          tollCost: "250.000đ"
        },
        { 
          time: "18:30", 
          description: "Đến Cửa Lò. Nhận căn hộ nghỉ đêm.", 
          type: "accommodation",
          mapLink: "https://www.google.com/maps/search/Căn+hộ+Cửa+Lò/"
        },
        { 
          time: "20:00", 
          description: "Bữa tối hải sản ven biển.", 
          type: "food",
          mapLink: "https://www.google.com/maps/search/Hải+sản+Cửa+Lò/"
        }
      ]
    },
    {
      date: "19-06-2026",
      title: "Thứ Sáu: Cửa Lò ➔ Đà Nẵng",
      distance: "~470 km",
      activities: [
        { 
          time: "06:00", 
          description: "Lên đường đi ĐN qua hầm Đèo Ngang.", 
          type: "transport",
          mapLink: "https://www.google.com/maps/dir/Cửa+Lò/Đà+Nẵng/",
          tollCost: "300.000đ"
        },
        { 
          time: "12:00", 
          description: "Ăn trưa cơm gia đình tại Huế hoặc Lăng Cô.", 
          type: "food",
          mapLink: "https://www.google.com/maps/search/Nhà+hàng+Lăng+Cô/"
        },
        { 
          time: "16:00", 
          description: "Check-in Cherry Villa Homestay - Mộc Miên 2.", 
          type: "accommodation",
          mapLink: "https://www.google.com/maps/search/Cherry+Villa+Homestay+Mộc+Miên+2+Đà+Nẵng/"
        },
        { 
          time: "19:30", 
          description: "Bữa tối bánh tráng thịt heo ĐN.", 
          type: "food",
          mapLink: "https://www.google.com/maps/search/Bánh+tráng+thịt+heo+Trần+Đà+Nẵng/"
        }
      ]
    },
    {
      date: "20-06-2026",
      title: "Thứ Bảy: Đảo Cù Lao Chàm",
      distance: "~20km đến cảng",
      activities: [
        { 
          time: "08:00", 
          description: "Di chuyển đến cảng Cửa Đại (Hội An).", 
          type: "transport",
          mapLink: "https://www.google.com/maps/place/Cảng+Cửa+Đại/"
        },
        { 
          time: "09:00", 
          description: "Cano ra đảo Cù Lao Chàm. Lặn san hô Hòn Dài.", 
          type: "visit"
        },
        { 
          time: "12:00", 
          description: "Ăn trưa hải sản trên đảo.", 
          type: "food"
        },
        { 
          time: "21:00", 
          description: "Xem Cầu Rồng phun lửa.", 
          type: "visit",
          mapLink: "https://www.google.com/maps/place/Cầu+Rồng/"
        }
      ]
    },
    {
      date: "21-06-2026",
      title: "Chủ Nhật: VinWonders Nam Hội An",
      distance: "~30km",
      activities: [
        { 
          time: "09:00", 
          description: "Vui chơi VinWonders Nam Hội An. Xem show diễn.", 
          type: "visit",
          mapLink: "https://www.google.com/maps/place/VinWonders+Nam+Hội+An/"
        },
        { 
          time: "16:00", 
          description: "Dạo phố cổ Hội An buổi chiều tà.", 
          type: "visit",
          mapLink: "https://www.google.com/maps/place/Phố+cổ+Hội+An/"
        },
        { 
          time: "19:00", 
          description: "Ăn tối cơm gà Hội An.", 
          type: "food",
          mapLink: "https://www.google.com/maps/search/Cơm+Gà+Bà+Buội+Hội+An/"
        }
      ]
    },
    {
      date: "22-06-2026",
      title: "Thứ Hai: City Tour & BBQ",
      distance: "Nội thành",
      activities: [
        { 
          time: "09:00", 
          description: "Tham quan Ngũ Hành Sơn & Bán đảo Sơn Trà.", 
          type: "visit",
          mapLink: "https://www.google.com/maps/place/Chùa+Linh+Ứng+Sơn+Trà/"
        },
        { 
          time: "16:00", 
          description: "Mua sắm đặc sản tại Chợ Hàn.", 
          type: "visit",
          mapLink: "https://www.google.com/maps/place/Chợ+Hàn/"
        },
        { 
          time: "18:30", 
          description: "Tiệc BBQ hồ bơi tại Villa.", 
          type: "food"
        }
      ]
    },
    {
      date: "23-06-2026",
      title: "Thứ Ba: Đà Nẵng ➔ Hà Nội",
      distance: "~760 km",
      activities: [
        { 
          time: "04:30", 
          description: "Trả phòng sớm. Xuất phát chặng về.", 
          type: "transport",
          mapLink: "https://www.google.com/maps/dir/Đà+Nẵng/Hà+Nội/",
          tollCost: "550.000đ"
        },
        { 
          time: "09:00", 
          description: "Nghỉ dừng chân & vệ sinh tại Quảng Trị.", 
          type: "note",
          mapLink: "https://www.google.com/maps/search/Trạm+dừng+chân+Quảng+Trị/"
        },
        { 
          time: "12:00", 
          description: "Ăn trưa cơm gà tại Quảng Bình.", 
          type: "food",
          mapLink: "https://www.google.com/maps/search/Quán+ăn+ngon+Quảng+Bình/"
        },
        { 
          time: "15:30", 
          description: "Nghỉ uống nước tại Hà Tĩnh.", 
          type: "note",
          mapLink: "https://www.google.com/maps/search/Trạm+dừng+chân+Hà+Tĩnh/"
        },
        { 
          time: "20:30", 
          description: "Về đến Hà Nội.", 
          type: "transport"
        }
      ]
    }
  ],
  expenses: {
    totalLabel: "53.200.000đ",
    items: [
      { category: "Villa 4 đêm", amount: 20000000, note: "Đà Nẵng" },
      { category: "Căn hộ Cửa Lò", amount: 1200000, note: "3 phòng/1 đêm" },
      { category: "Phí cầu đường", amount: 1000000, note: "Dự kiến" },
      { category: "Ăn uống đoàn", amount: 16000000, note: "8 bữa chính" },
      { category: "Vé VinWonders", amount: 6000000, note: "Nam Hội An" },
      { category: "Tour Cù Lao Chàm", amount: 5000000, note: "Cano & Lặn biển" },
      { category: "Xăng xe", amount: 4000000, note: "" }
    ]
  },
  recommendations: {
    title: "Gợi ý điểm đến & Vui chơi",
    categories: [
      {
        name: "Ăn sáng Đà Nẵng",
        items: [
          { name: "Bún chả cá Ông Tạ - 113A Nguyễn Chí Thanh", mapLink: "https://www.google.com/maps/search/Bún+chả+cá+Ông+Tạ+Đà+Nẵng/" },
          { name: "Mì Quảng Bà Mua - 95 Trưng Nữ Vương", mapLink: "https://www.google.com/maps/search/Mì+Quảng+Bà+Mua+Đà+Nẵng/" },
          { name: "Bún bò Bà Thương - 23 Trần Bình Trọng", mapLink: "https://www.google.com/maps/search/Bún+bò+Bà+Thương+Đà+Nẵng/" },
          { name: "Bánh mì Bà Đào - 02 Cầu Vồng", mapLink: "https://www.google.com/maps/search/Bánh+mì+Bà+Đào+Đà+Nẵng/" },
          { name: "Xôi Bà Bé - 27 Ngô Gia Tự", mapLink: "https://www.google.com/maps/search/Xôi+Bà+Bé+Đà+Nẵng/" },
          { name: "Phở 63 - 63 Phan Châu Trinh", mapLink: "https://www.google.com/maps/search/Phở+63+Đà+Nẵng/" }
        ]
      },
      {
        name: "Bữa chính Đà Nẵng",
        items: [
          { name: "Hải sản Năm Đảnh - 139/59 Hẻm K139", mapLink: "https://www.google.com/maps/search/Hải+sản+Năm+Đảnh/" },
          { name: "Cơm Niêu Nhà Đỏ - 176 Nguyễn Tri Phương", mapLink: "https://www.google.com/maps/search/Cơm+Niêu+Nhà+Đỏ+Đà+Nẵng/" },
          { name: "Bánh tráng thịt heo Trần - 04 Lê Duẩn", mapLink: "https://www.google.com/maps/search/Bánh+tráng+thịt+heo+Trần+Đà+Nẵng/" },
          { name: "Hải sản Bé Mặn - Lô 2 Võ Nguyên Giáp", mapLink: "https://www.google.com/maps/search/Hải+sản+Bé+Mặn+Đà+Nẵng/" },
          { name: "Nhà hàng Madame Lân - 04 Bạch Đằng", mapLink: "https://www.google.com/maps/search/Nhà+hàng+Madame+Lân+Đà+Nẵng/" },
          { name: "Bánh xèo Bà Dưỡng - K280/23 Hoàng Diệu", mapLink: "https://www.google.com/maps/search/Bánh+xèo+Bà+Dưỡng+Đà+Nẵng/" }
        ]
      },
      {
        name: "Điểm vui chơi",
        items: [
          { name: "Công viên Châu Á (Asia Park)", mapLink: "https://www.google.com/maps/place/Asia+Park/" },
          { name: "VinWonders Nam Hội An", mapLink: "https://www.google.com/maps/place/VinWonders+Nam+Hội+An/" },
          { name: "Mikazuki Water Park", mapLink: "https://www.google.com/maps/place/Da+Nang+Mikazuki+Japanese+Resorts+%26+Spa/" },
          { name: "Bảo tàng tranh 3D Art in Paradise", mapLink: "https://www.google.com/maps/place/Art+in+Paradise+Danang/" },
          { name: "Show Ký Ức Hội An", mapLink: "https://www.google.com/maps/place/Công+viên+Ấn+tượng+Hội+An/" }
        ]
      },
      {
        name: "Cafe View đẹp",
        items: [
          { name: "Sơn Trà Marina", mapLink: "https://www.google.com/maps/place/Sơn+Trà+Marina/" },
          { name: "Wonderlust Danang", mapLink: "https://www.google.com/maps/search/Wonderlust+Danang/" },
          { name: "La Luna Candle Coffee", mapLink: "https://www.google.com/maps/search/La+Luna+Candle+Coffee+Đà+Nẵng/" },
          { name: "The Cup Coffee", mapLink: "https://www.google.com/maps/search/The+Cup+Coffee+Đà+Nẵng/" }
        ]
      },
      {
        name: "Ăn ngon Hội An",
        items: [
          { name: "Cơm gà Bà Buội - 22 Phan Châu Trinh", mapLink: "https://www.google.com/maps/search/Cơm+gà+Bà+Buội+Hội+An/" },
          { name: "Bánh mì Phượng - 2B Phan Châu Trinh", mapLink: "https://www.google.com/maps/search/Bánh+mì+Phượng+Hội+An/" },
          { name: "Bánh mì Madam Khánh - 115 Trần Cao Vân", mapLink: "https://www.google.com/maps/search/Bánh+mì+Madam+Khánh+Hội+An/" },
          { name: "Cao lầu Thanh - 26 Thái Phiên", mapLink: "https://www.google.com/maps/search/Cao+lầu+Thanh+Hội+An/" },
          { name: "Mì Quảng Ông Hai - 6A Trương Minh Lượng", mapLink: "https://www.google.com/maps/search/Mì+Quảng+Ông+Hai+Hội+An/" },
          { name: "Thịt nướng Giếng Bá Lễ - 45/51 Trần Hưng Đạo", mapLink: "https://www.google.com/maps/search/Thịt+nướng+Giếng+Bá+Lễ+Hội+An/" },
          { name: "Bánh vạc Hoa Hồng Trắng - 533 Hai Bà Trưng", mapLink: "https://www.google.com/maps/search/Bánh+vạc+Hoa+Hồng+Trắng+Hội+An/" }
        ]
      },
      {
        name: "Cafe Hội An",
        items: [
          { name: "Faifo Coffee (View mái ngói) - 130 Trần Phú", mapLink: "https://www.google.com/maps/search/Faifo+Coffee+Hội+An/" },
          { name: "Mót Hội An (Trà thảo mộc) - 150 Trần Phú", mapLink: "https://www.google.com/maps/search/Mót+Hội+An/" },
          { name: "Reaching Out Tea House - 131 Trần Phú", mapLink: "https://www.google.com/maps/search/Reaching+Out+Tea+House+Hội+An/" },
          { name: "Hội An Roastery - 135 Trần Phú", mapLink: "https://www.google.com/maps/search/Hội+An+Roastery/" },
          { name: "The Hill Station - 321 Nguyễn Duy Hiệu", mapLink: "https://www.google.com/maps/search/The+Hill+Station+Hội+An/" }
        ]
      }
    ]
  }
};
