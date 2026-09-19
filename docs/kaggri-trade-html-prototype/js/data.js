
window.KAGGRI_DATA = {
  buyer: {
    company: "HTX Bách Hóa Xanh",
    recipientName: "Nguyễn Minh Anh",
    recipientPhone: "090 123 4567",
    receivingAddress: "128 Đường số 7, Phường Bình Trị Đông B, Quận Bình Tân, TP. Hồ Chí Minh",
    receivingWindow: "03:30 - 08:00 hàng ngày",
    deliveryNote: "Ưu tiên giao trước 06:00 nếu có thể.",
    invoiceRequested: true,
    invoiceProfile: {
      companyName: "HTX Bách Hóa Xanh",
      taxCode: "0312345678",
      billingAddress: "128 Đường số 7, Phường Bình Trị Đông B, Quận Bình Tân, TP. Hồ Chí Minh",
      invoiceEmail: "hoadon@bachhoaxanh.example"
    },
    creditProfile: {
      approved: true,
      limit: 50000000,
      used: 12000000,
      available: 38000000,
      termDays: 15,
      dueFrom: "Ngày phát hành hóa đơn"
    }
  },

  logistics: {
    estimatedDelivery: null
  },

  order: {
    id: "PO-20260917-8831",
    paymentId: "PAY-20260917-0042",
    createdAt: "17/09/2026",
    reservationMinutes: 30,
    preorderLeadDaysMin: 7,
    minPreorderDate: "2026-09-24",
    defaultPreorderDate: "2026-10-17"
  },

  vendors: [
    {
      id: "v1",
      name: "Hợp tác xã Nông nghiệp Công nghệ cao Lạc Dương",
      shortName: "HTX Lạc Dương",
      location: "Lạc Dương, Lâm Đồng",
      certification: "VietGAP / GLOBALG.A.P. IFA",
      status: "verified"
    },
    {
      id: "v2",
      name: "Hợp tác xã Rau sạch Hữu cơ Đơn Dương",
      shortName: "HTX Đơn Dương",
      location: "Đơn Dương, Lâm Đồng",
      certification: "Hồ sơ chứng nhận đã xác minh",
      status: "verified"
    }
  ],

  products: [
    {
      id: "p1",
      vendorId: "v1",
      name: "Bắp cải sạch VietGAP",
      sku: "SKU-DALAT-CAB-001",
      unit: "kg",
      qty: 350,
      minQty: 100,
      available: 1850,
      unitPrice: 16800,
      priceTiers: [
        { minQty: 100, maxQty: 299, unitPrice: 18500 },
        { minQty: 300, maxQty: 999, unitPrice: 16800 },
        { minQty: 1000, maxQty: null, unitPrice: 15200 }
      ],
      oldUnitPrice: null,
      amount: 5880000,
      images: [
        {
          id: "main",
          src: "image.png",
          icon: "🥬",
          label: "Ảnh sản phẩm chính",
          alt: "Ba bắp cải xanh trên nền sáng",
          credit: "Ảnh sản phẩm do nhà cung cấp cung cấp",
          sourcePage: "image.png"
        },
        {
          id: "harvest",
          src: "assets/products/cabbage-harvest.jpg",
          icon: "🧺",
          label: "Sau thu hoạch",
          alt: "Nông dân thu hoạch và tập kết bắp cải",
          credit: "Denniz Futalan / Pexels",
          sourcePage: "https://www.pexels.com/photo/farmer-with-cabbages-in-box-18717519/"
        },
        {
          id: "farm",
          src: "assets/products/cabbage-field-natural.jpg",
          icon: "🌱",
          label: "Tại vùng trồng",
          alt: "Luống bắp cải trưởng thành dưới ánh sáng tự nhiên",
          credit: "Alexander Paramonov / Pexels",
          sourcePage: "https://www.pexels.com/photo/green-cabbage-in-a-farm-8524094/"
        },
        {
          id: "packing",
          src: "assets/products/produce-packing-natural.jpg",
          icon: "📦",
          label: "Sơ chế & đóng thùng",
          alt: "Công nhân phân loại và đóng thùng rau sau thu hoạch",
          credit: "Mark Stebnicki / Pexels",
          sourcePage: "https://www.pexels.com/photo/a-person-in-gray-long-sleeves-putting-the-broccoli-in-a-box-11678433/"
        },
        {
          id: "dispatch",
          src: "assets/products/produce-dispatch-documentary.jpg",
          icon: "🚚",
          label: "Bàn giao vận chuyển",
          alt: "Công nhân tập kết nông sản đóng thùng lên xe tại ruộng",
          credit: "Mark Stebnicki / Pexels",
          sourcePage: "https://www.pexels.com/photo/farmers-harvesting-broccolis-in-the-farm-11678443/"
        }
      ],
      quality: [
        ["Phân loại thương mại", "Hạng A • Do nhà cung cấp công bố"],
        ["Chứng nhận", "VietGAP"],
        ["Trạng thái hồ sơ", "Đã xác minh"],
        ["Quy cách", "Bao lưới 25kg • Size 1.0–1.4kg/bắp"]
      ],
      image: "🥬",
      note: ""
    },
    {
      id: "p2",
      vendorId: "v1",
      name: "Cà rốt baby Đà Lạt",
      sku: "SKU-DALAT-CAR-002",
      unit: "kg",
      qty: 200,
      minQty: 80,
      available: 650,
      unitPrice: 22000,
      oldUnitPrice: null,
      amount: 4400000,
      quality: [
        ["Chứng nhận", "GLOBALG.A.P. IFA"],
        ["Quy cách", "Thùng carton 10kg"],
        ["Tình trạng", "Rửa sạch, sấy mát"]
      ],
      image: "🥕",
      note: ""
    },
    {
      id: "p3",
      vendorId: "v2",
      name: "Ớt chuông Sweet Palermo vàng",
      sku: "SKU-DOND-PPR-003",
      unit: "kg",
      qty: 180,
      minQty: 50,
      available: 180,
      unitPrice: 45000,
      oldUnitPrice: null,
      amount: 8100000,
      quality: [
        ["Quy cách", "Hộp carton 5kg"],
        ["Thuộc tính NCC công bố", "Brix 9.5+"],
        ["Tình trạng", "Đã cập nhật theo tồn khả dụng"]
      ],
      image: "🫑",
      note: ""
    },
    {
      id: "p4",
      vendorId: "v2",
      name: "Cà chua bi Socola Cherry Đà Lạt",
      sku: "SKU-DOND-TOM-004",
      unit: "kg",
      qty: 120,
      minQty: 50,
      available: 520,
      unitPrice: 35500,
      oldUnitPrice: 32000,
      amount: 4260000,
      quality: [
        ["Quy cách", "Thùng 12 hộp 500g"],
        ["Trạng thái giá", "Giá mới đã xác nhận"]
      ],
      image: "🍅",
      note: ""
    }
  ],

  paymentAttempt: {
    paymentStatus: "pending",
    settlementType: "PREPAID",
    providerCode: null,
    providerMessage: null,
    failureCategory: null,
    retryable: false,
    failedAt: null,
    paymentMethod: "vietqr",
    paymentReference: "PAY-20260917-0042",
    vendorOrderIds: [],
    lineItems: [],
    amount: 0,
    reservationStatus: null,
    createdAt: null
  },

  paymentFailureMocks: {
    INSUFFICIENT_FUNDS: {
      providerCode: "51",
      providerMessage: "Insufficient funds",
      retryable: false
    },
    CARD_DECLINED: {
      providerCode: "05",
      providerMessage: "Do not honor",
      retryable: false
    },
    AUTHENTICATION_FAILED: {
      providerCode: "3DS_AUTH_FAILED",
      providerMessage: "Cardholder authentication failed",
      retryable: true
    },
    PAYMENT_LIMIT_EXCEEDED: {
      providerCode: "61",
      providerMessage: "Exceeds withdrawal amount limit",
      retryable: false
    },
    BANK_UNAVAILABLE: {
      providerCode: "91",
      providerMessage: "Issuer or switch is inoperative",
      retryable: true
    },
    PROVIDER_TIMEOUT: {
      providerCode: "PROVIDER_TIMEOUT",
      providerMessage: "Provider response timed out",
      retryable: true
    },
    USER_CANCELLED: {
      providerCode: "USER_CANCELLED",
      providerMessage: "Payment flow cancelled by user",
      retryable: true
    },
    INVALID_PAYMENT_INFO: {
      providerCode: "14",
      providerMessage: "Invalid payment information",
      retryable: false
    },
    TRANSACTION_NOT_FOUND: {
      providerCode: "25",
      providerMessage: "Transaction record not found",
      retryable: true
    },
    UNKNOWN: {
      providerCode: "UNKNOWN_ERROR",
      providerMessage: "Unmapped provider error",
      retryable: false
    }
  },

  paymentMethods: [
    {
      id: "vietqr",
      title: "VietQR",
      description: "Quét QR bằng ứng dụng ngân hàng.",
      status: "Trả trước",
      eligible: true,
      settlementType: "PREPAID"
    },
    {
      id: "va",
      title: "Chuyển khoản / Virtual Account",
      description: "Chuyển khoản tới tài khoản định danh cho giao dịch.",
      status: "Trả trước",
      eligible: true,
      settlementType: "PREPAID"
    },
    {
      id: "napas",
      title: "Thẻ nội địa / NAPAS",
      description: "Thanh toán bằng thẻ ngân hàng nội địa.",
      status: "Trả trước",
      eligible: true,
      settlementType: "PREPAID"
    },
    {
      id: "cod",
      title: "Thanh toán khi nhận hàng (COD)",
      description: "Thanh toán giá trị VendorOrder được NCC xác nhận khi nhận hàng.",
      status: "Trả khi giao",
      eligible: true,
      settlementType: "COD"
    },
    {
      id: "credit",
      title: "Công nợ doanh nghiệp",
      description: "NET 15 từ ngày phát hành hóa đơn, áp dụng trong hạn mức đã duyệt.",
      status: "Đủ hạn mức",
      eligible: true,
      settlementType: "CREDIT"
    }
  ]
};
