/* =====================================================
   OCEAN SEAFOOD - FILE: js/products.js
   Nội dung: dữ liệu món ăn, danh mục và các hàm hỗ trợ
   ===================================================== */

/* ---------- 1. DANH MỤC MÓN ĂN ---------- */
// id: mã danh mục (dùng để lọc), name: tên hiển thị, icon: biểu tượng
const CATEGORIES = [
  { id: "tuoi-song", name: "Hải sản tươi sống", icon: "🦀" },
  { id: "tom-hum",   name: "Tôm hùm",           icon: "🦞" },
  { id: "cua-ghe",   name: "Cua, ghẹ",          icon: "🦀" },
  { id: "tom-muc",   name: "Tôm, mực",          icon: "🦐" },
  { id: "ca-bien",   name: "Cá biển",           icon: "🐟" },
  { id: "oc-so",     name: "Ốc, sò",            icon: "🐚" },
  { id: "lau",       name: "Lẩu & Combo",       icon: "🍲" },
  { id: "do-uong",   name: "Đồ uống",           icon: "🥥" }
];

/* ---------- 2. DỮ LIỆU 19 MÓN ĂN ---------- */
// Mỗi món là một "đối tượng" gồm nhiều thông tin.
// image: đường dẫn ảnh. Nếu bạn chưa có ảnh, website sẽ tự hiện ảnh dự phòng.
// bestSeller: true nếu là món bán chạy. inStock: false nếu hết hàng.
const PRODUCTS = [
  {
    id: 1,
    name: "Tôm hùm nướng phô mai",
    category: "tom-hum",
    price: 890000,
    image: "images/products/tom-hum-nuong-pho-mai.jpg",
    description: "Tôm hùm bông nướng cùng lớp phô mai Mozzarella béo ngậy, thịt tôm ngọt dai.",
    ingredients: "Tôm hùm bông, phô mai Mozzarella, bơ, tỏi, hành lá, tiêu đen.",
    cooking: "Tôm hùm được chẻ đôi, phết bơ tỏi, phủ phô mai rồi nướng lửa vừa đến khi phô mai vàng đều.",
    rating: 4.9, reviews: 128, bestSeller: true, inStock: true
  },
  {
    id: 2,
    name: "Cua biển hấp bia",
    category: "cua-ghe",
    price: 450000,
    image: "images/products/cua-bien-hap-bia.jpg",
    description: "Cua biển thịt chắc, gạch đầy, hấp cùng bia và sả nên vị ngọt thanh, thơm nhẹ.",
    ingredients: "Cua biển, bia, sả, gừng, hành tím, ớt.",
    cooking: "Cua làm sạch, xếp vào nồi cùng sả, gừng và bia, hấp khoảng 15 phút cho chín đều.",
    rating: 4.8, reviews: 96, bestSeller: true, inStock: true
  },
  {
    id: 3,
    name: "Ghẹ rang me",
    category: "cua-ghe",
    price: 320000,
    image: "images/products/ghe-rang-me.jpg",
    description: "Ghẹ xanh tươi rang với sốt me chua ngọt đậm đà, ăn kèm bánh mì cực kỳ bắt vị.",
    ingredients: "Ghẹ xanh, me, đường, tỏi, ớt, hành lá.",
    cooking: "Ghẹ chiên sơ cho săn lại, sau đó rang nhanh với sốt me sánh đặc.",
    rating: 4.7, reviews: 74, bestSeller: false, inStock: true
  },
  {
    id: 4,
    name: "Tôm sú nướng muối ớt",
    category: "tom-muc",
    price: 380000,
    image: "images/products/tom-su-nuong-muoi-ot.jpg",
    description: "Tôm sú size lớn nướng than hoa, chấm muối ớt xanh cay nhẹ, thơm lừng.",
    ingredients: "Tôm sú, muối ớt, sả, tỏi, dầu ăn.",
    cooking: "Tôm ướp sả tỏi 15 phút rồi nướng than hoa đến khi vỏ đỏ cam, thịt chín săn.",
    rating: 4.8, reviews: 110, bestSeller: true, inStock: true
  },
  {
    id: 5,
    name: "Mực hấp gừng",
    category: "tom-muc",
    price: 260000,
    image: "images/products/muc-hap-gung.jpg",
    description: "Mực ống tươi hấp gừng giữ trọn vị ngọt tự nhiên, giòn dai, ăn không ngán.",
    ingredients: "Mực ống, gừng, hành lá, nước mắm, ớt.",
    cooking: "Mực để nguyên con, xếp gừng thái sợi lên trên và hấp 8 phút.",
    rating: 4.6, reviews: 58, bestSeller: false, inStock: true
  },
  {
    id: 6,
    name: "Bạch tuộc nướng sa tế",
    category: "tom-muc",
    price: 240000,
    image: "images/products/bach-tuoc-nuong-sa-te.jpg",
    description: "Bạch tuộc giòn sần sật quết sa tế cay thơm, nướng vàng cạnh.",
    ingredients: "Bạch tuộc, sa tế, tỏi, ớt, mè rang.",
    cooking: "Bạch tuộc sơ chế sạch nhớt, ướp sa tế 20 phút rồi nướng lửa lớn.",
    rating: 4.5, reviews: 47, bestSeller: false, inStock: true
  },
  {
    id: 7,
    name: "Cá hồi áp chảo",
    category: "ca-bien",
    price: 350000,
    image: "images/products/ca-hoi-ap-chao.jpg",
    description: "Phi lê cá hồi Na Uy áp chảo da giòn, thịt mềm béo, dùng kèm sốt chanh dây.",
    ingredients: "Cá hồi Na Uy, bơ, chanh dây, rau củ nướng, tiêu.",
    cooking: "Cá ướp muối tiêu, áp chảo mỗi mặt 3 phút với bơ, rưới sốt chanh dây.",
    rating: 4.7, reviews: 83, bestSeller: false, inStock: true
  },
  {
    id: 8,
    name: "Cá mú hấp xì dầu",
    category: "ca-bien",
    price: 520000,
    image: "images/products/ca-mu-hap-xi-dau.jpg",
    description: "Cá mú đỏ nguyên con hấp xì dầu, thịt trắng ngọt, nước sốt đậm đà.",
    ingredients: "Cá mú, xì dầu, gừng, hành lá, ngò, dầu hành.",
    cooking: "Cá hấp 12 phút, rưới xì dầu nóng và dầu hành lên trên trước khi dọn.",
    rating: 4.9, reviews: 102, bestSeller: true, inStock: true
  },
  {
    id: 9,
    name: "Hàu nướng mỡ hành",
    category: "oc-so",
    price: 180000,
    image: "images/products/hau-nuong-mo-hanh.jpg",
    description: "Phần 6 con hàu sữa nướng mỡ hành, đậu phộng giòn, béo thơm.",
    ingredients: "Hàu sữa, hành lá, mỡ heo, đậu phộng rang.",
    cooking: "Hàu nướng than đến khi mở vỏ, rưới mỡ hành nóng và rắc đậu phộng.",
    rating: 4.6, reviews: 69, bestSeller: false, inStock: true
  },
  {
    id: 10,
    name: "Sò điệp nướng phô mai",
    category: "oc-so",
    price: 220000,
    image: "images/products/so-diep-nuong-pho-mai.jpg",
    description: "Phần 4 con sò điệp Nhật nướng phô mai tan chảy, vị ngọt béo hài hòa.",
    ingredients: "Sò điệp, phô mai, bơ tỏi, hành lá.",
    cooking: "Sò điệp phết bơ tỏi, phủ phô mai và nướng 10 phút.",
    rating: 4.8, reviews: 91, bestSeller: true, inStock: true
  },
  {
    id: 11,
    name: "Ốc hương rang muối",
    category: "oc-so",
    price: 210000,
    image: "images/products/oc-huong-rang-muoi.jpg",
    description: "Ốc hương size lớn rang muối ớt, giòn sần sật, vị mặn cay lôi cuốn.",
    ingredients: "Ốc hương, muối ớt, tỏi, lá chanh.",
    cooking: "Ốc luộc sơ, sau đó rang lửa lớn cùng muối ớt và tỏi băm.",
    rating: 4.5, reviews: 52, bestSeller: false, inStock: true
  },
  {
    id: 12,
    name: "Lẩu hải sản đặc biệt",
    category: "lau",
    price: 690000,
    image: "images/products/lau-hai-san-dac-biet.jpg",
    description: "Nồi lẩu cho 3 đến 4 người gồm tôm, mực, nghêu, cá, nước dùng thanh ngọt.",
    ingredients: "Tôm, mực, nghêu, cá điêu hồng, nấm, rau tươi, bún.",
    cooking: "Nước dùng ninh từ xương và củ quả, nhúng hải sản và rau trực tiếp tại bàn.",
    rating: 4.9, reviews: 140, bestSeller: true, inStock: true
  },
  {
    id: 13,
    name: "Súp cua",
    category: "cua-ghe",
    price: 85000,
    image: "images/products/sup-cua.jpg",
    description: "Súp cua sánh mịn với thịt cua xé sợi, trứng gà và nấm đông cô.",
    ingredients: "Thịt cua, trứng gà, nấm đông cô, bột năng, tiêu.",
    cooking: "Nấu nước dùng, thả thịt cua và nấm, đánh trứng tạo vân rồi hòa bột năng cho sánh.",
    rating: 4.4, reviews: 61, bestSeller: false, inStock: true
  },
  {
    id: 14,
    name: "Miến xào hải sản",
    category: "tom-muc",
    price: 150000,
    image: "images/products/mien-xao-hai-san.jpg",
    description: "Miến dai xào cùng tôm, mực và rau củ, đậm đà, ăn kèm rất hợp.",
    ingredients: "Miến dong, tôm, mực, cà rốt, hành tây, nấm.",
    cooking: "Miến ngâm mềm, xào lửa lớn cùng hải sản và rau củ với nước tương.",
    rating: 4.3, reviews: 38, bestSeller: false, inStock: true
  },
  {
    id: 15,
    name: "Combo hải sản gia đình",
    category: "lau",
    price: 1290000,
    image: "images/products/combo-hai-san-gia-dinh.jpg",
    description: "Combo cho 4 đến 5 người gồm tôm nướng, cua hấp, ốc rang, súp và miến xào.",
    ingredients: "Tôm sú, cua biển, ốc hương, súp cua, miến xào hải sản.",
    cooking: "Các món được chế biến riêng và dọn lần lượt, tiết kiệm hơn gọi lẻ khoảng 15%.",
    rating: 4.9, reviews: 156, bestSeller: true, inStock: true
  },
  {
    id: 16,
    name: "Tôm hùm bông sống (500g)",
    category: "tuoi-song",
    price: 1150000,
    image: "images/products/tom-hum-bong-song.jpg",
    description: "Tôm hùm bông tươi sống tuyển chọn, nhà hàng chế biến theo ý bạn.",
    ingredients: "Tôm hùm bông sống, giá tính theo 500g.",
    cooking: "Chọn cách chế biến: hấp, nướng, cháo hoặc xào bơ tỏi (tính thêm phí chế biến).",
    rating: 4.8, reviews: 44, bestSeller: false, inStock: true
  },
  {
    id: 17,
    name: "Cua Cà Mau sống (1kg)",
    category: "tuoi-song",
    price: 980000,
    image: "images/products/cua-ca-mau-song.jpg",
    description: "Cua Cà Mau chắc thịt, nhiều gạch, giá tính theo 1kg.",
    ingredients: "Cua Cà Mau sống, giá tính theo 1kg.",
    cooking: "Có thể hấp, rang me hoặc rang muối theo yêu cầu.",
    rating: 4.9, reviews: 35, bestSeller: false, inStock: false   // MÓN HẾT HÀNG để demo
  },
  {
    id: 18,
    name: "Nước dừa tươi",
    category: "do-uong",
    price: 35000,
    image: "images/products/nuoc-dua-tuoi.jpg",
    description: "Dừa xiêm Bến Tre mát lạnh, ngọt thanh, giải nhiệt cùng hải sản.",
    ingredients: "Dừa xiêm tươi.",
    cooking: "Dừa được ướp lạnh trước khi phục vụ.",
    rating: 4.6, reviews: 72, bestSeller: false, inStock: true
  },
  {
    id: 19,
    name: "Trà đào cam sả",
    category: "do-uong",
    price: 45000,
    image: "images/products/tra-dao-cam-sa.jpg",
    description: "Trà đào thơm mát kết hợp cam tươi và sả, thanh mát cho bữa ăn.",
    ingredients: "Trà đen, đào miếng, cam tươi, sả, đường phèn.",
    cooking: "Trà pha sẵn, thêm đào, cam lát và sả đập dập, dùng lạnh.",
    rating: 4.7, reviews: 88, bestSeller: false, inStock: true
  }
];

/* ---------- 3. ẢNH DỰ PHÒNG ---------- */
// Nếu file ảnh không tồn tại, website tự thay bằng ảnh này (không bao giờ hiện ảnh vỡ).
const IMAGE_FALLBACK = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#0a4d8c"/><stop offset="1" stop-color="#062f57"/>' +
  '</linearGradient></defs>' +
  '<rect width="600" height="420" fill="url(#g)"/>' +
  '<text x="300" y="215" font-size="90" text-anchor="middle">🦞</text>' +
  '<text x="300" y="300" font-size="26" fill="#e6c65c" text-anchor="middle" font-family="Arial">OCEAN SEAFOOD</text>' +
  '</svg>'
);

// Hàm này được gọi khi ảnh bị lỗi: <img onerror="handleImageError(this)">
function handleImageError(imgElement) {
  imgElement.onerror = null;          // tránh lặp vô hạn nếu ảnh dự phòng cũng lỗi
  imgElement.src = IMAGE_FALLBACK;
}

/* ---------- 4. CÁC HÀM HỖ TRỢ ---------- */

// Định dạng giá tiền: 890000 -> "890.000đ"
function formatPrice(number) {
  return number.toLocaleString("vi-VN") + "đ";
}

// Tạo chuỗi ngôi sao: 4.6 -> "★★★★★" (làm tròn), 4.4 -> "★★★★☆"
function getStars(rating) {
  const fullStars = Math.round(rating);
  return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
}

// Tìm món ăn theo id. Không thấy thì trả về undefined.
function getProductById(id) {
  return PRODUCTS.find(function (product) {
    return product.id === Number(id);
  });
}

// Lấy tên danh mục từ mã danh mục: "tom-hum" -> "Tôm hùm"
function getCategoryName(categoryId) {
  const category = CATEGORIES.find(function (c) {
    return c.id === categoryId;
  });
  return category ? category.name : "";
}

// Lấy các món liên quan: ưu tiên cùng danh mục, thiếu thì bù bằng món khác
function getRelatedProducts(product, limit) {
  const same = PRODUCTS.filter(function (p) {
    return p.category === product.category && p.id !== product.id;
  });
  const others = PRODUCTS.filter(function (p) {
    return p.category !== product.category && p.id !== product.id;
  });
  return same.concat(others).slice(0, limit);
}

// Tạo đoạn HTML của một thẻ (card) món ăn. Dùng ở trang chủ và trang thực đơn.
function createProductCard(product) {
  const soldOut = !product.inStock;

  // Nhãn trên góc ảnh
  let badge = "";
  if (soldOut) {
    badge = '<span class="badge badge-soldout">Hết hàng</span>';
  } else if (product.bestSeller) {
    badge = '<span class="badge">Bán chạy</span>';
  }

  const liked = typeof isWishlisted === "function" && isWishlisted(product.id);
return `
    <div class="product-card" draggable="${soldOut ? "false" : "true"}"
         data-product-id="${product.id}" data-soldout="${soldOut}">
      <div class="product-image">
        ${badge}
        <button type="button" class="wishlist-btn${liked ? " wishlist-active" : ""}" data-id="${product.id}"
                onclick="event.stopPropagation(); toggleWishlist(${product.id})" aria-label="Yêu thích">
          ${liked ? "❤️" : "🤍"}
        </button>
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="handleImageError(this)">
        ${soldOut ? "" : '<span class="drag-hint">✥ Kéo vào giỏ</span>'}
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="rating">${getStars(product.rating)} <small>${product.rating} (${product.reviews})</small></div>
        <p class="product-desc">${product.description}</p>
        <div class="product-price">${formatPrice(product.price)}</div>
        <div class="product-actions">
          <a href="product-detail.html?id=${product.id}" class="btn btn-outline-blue">Xem chi tiết</a>
          <button class="btn btn-primary" onclick="addToCart(${product.id})" ${soldOut ? "disabled" : ""}>
            ${soldOut ? "Hết hàng" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </div>
  `;
}