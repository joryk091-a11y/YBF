const AIRLINES = [
  { code: 'YEM', name: 'اليمنية', office: 'عدن' },
  { code: 'QTB', name: 'القطيبي', office: 'صنعاء' },
  { code: 'SBA', name: 'سبأ', office: 'سيئون' },
]

export const AIRPORT_LABELS = {
  ADE: 'عدن',
  SAH: 'صنعاء',
  RIY: 'الرياض',
  JED: 'جدة',
  CAI: 'القاهرة',
  AMM: 'عمّان',
  IST: 'إسطنبول',
  DXB: 'دبي',
}

const createId = (prefix) => `${prefix}_${Math.random().toString(16).slice(2, 10)}`

export const buildDefaultCriteria = () => ({
  origin: 'ADE',
  destination: 'CAI',
  departureDate: '',
  returnDate: '',
  adults: 1,
  cabin: 'ECONOMY',
  maxPrice: '',
  preferredAirline: 'ALL',
  directOnly: false,
})

export const createDemoFlightQuotes = (criteria) => {
  const origin = criteria.origin || 'ADE'
  const destination = criteria.destination || 'CAI'
  const departureDate =
    criteria.departureDate || new Date().toISOString().slice(0, 10)
  const travelerCount = Number(criteria.adults || 1)
  const cabin = criteria.cabin || 'ECONOMY'
  const maxPrice = Number(criteria.maxPrice || 0)
  const preferredAirline = criteria.preferredAirline || 'ALL'
  const directOnly = Boolean(criteria.directOnly)

  const templates = [
    {
      airline: AIRLINES[0],
      departureHour: '07:20',
      arrivalHour: '10:10',
      duration: '2س 50د',
      stops: 0,
      baseFare: 228,
      taxes: 24,
      fees: 11,
      seatAvailability: 7,
    },
    {
      airline: AIRLINES[1],
      departureHour: '09:45',
      arrivalHour: '13:40',
      duration: '3س 55د',
      stops: 1,
      baseFare: 198,
      taxes: 21,
      fees: 9,
      seatAvailability: 11,
    },
    {
      airline: AIRLINES[2],
      departureHour: '15:10',
      arrivalHour: '18:05',
      duration: '2س 55د',
      stops: 0,
      baseFare: 242,
      taxes: 26,
      fees: 12,
      seatAvailability: 5,
    },
  ]

  const offers = templates
    .map((template) => {
      const totalPrice = template.baseFare + template.taxes + template.fees
      return {
        providerReference: createId('flight'),
        airline: template.airline.name,
        airlineCode: template.airline.code,
        office: template.airline.office,
        origin,
        destination,
        originLabel: AIRPORT_LABELS[origin] ?? origin,
        destinationLabel: AIRPORT_LABELS[destination] ?? destination,
        departureDate,
        departureHour: template.departureHour,
        arrivalHour: template.arrivalHour,
        duration: template.duration,
        stops: template.stops,
        travelerCount,
        cabin,
        cabinLabel: cabin === 'BUSINESS' ? 'درجة أعمال' : 'درجة اقتصادية',
        currency: 'USD',
        baseFare: template.baseFare,
        taxes: template.taxes,
        fees: template.fees,
        totalPrice,
        seatAvailability: template.seatAvailability,
        baggage: '23 كجم',
        officePaymentAvailable: true,
      }
    })
    .filter((offer) =>
      preferredAirline === 'ALL' ? true : offer.airlineCode === preferredAirline,
    )
    .filter((offer) => (directOnly ? offer.stops === 0 : true))
    .filter((offer) => (maxPrice > 0 ? offer.totalPrice <= maxPrice : true))
    .sort((left, right) => left.totalPrice - right.totalPrice)

  const quotes = offers.map((offer) => ({
    id: createId('qte'),
    type: 'flight',
    summary: {
      title: `${offer.originLabel} إلى ${offer.destinationLabel}`,
      subtitle: `${offer.airline} • ${offer.departureHour} • ${offer.duration}`,
    },
    totalPrice: offer.totalPrice,
    currency: offer.currency,
    payload: offer,
    expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    createdAt: new Date().toISOString(),
  }))

  return { type: 'flight', quotes }
}

export const createDemoBookingFromQuote = ({ bookingId, quote }) => {
  const safeBookingId = bookingId || `DEMO-${String(Date.now()).slice(-6)}`
  const safeQuote = quote ?? createDemoFlightQuotes(buildDefaultCriteria()).quotes[0]

  return {
    id: safeBookingId,
    type: 'flight',
    status: 'pending_payment',
    paymentStatus: 'pending',
    quoteId: safeQuote.id,
    items: [
      {
        id: createId('item'),
        title: safeQuote.summary.title,
        subtitle: safeQuote.summary.subtitle,
        totalPrice: safeQuote.totalPrice,
        currency: safeQuote.currency,
        payload: safeQuote.payload,
      },
    ],
    travelers: [],
    serviceRequests: {
      wheelchair: false,
      oxygenCylinder: false,
      movableBed: false,
      ambulanceSupport: false,
      groundTransport: false,
      medicalEscort: false,
      notes: '',
    },
    ticketNumber: null,
    ticketIssuedAt: null,
  }
}

export const createDemoMyBookings = () => {
  const base = buildDefaultCriteria()
  const response = createDemoFlightQuotes({ ...base, departureDate: base.departureDate || new Date().toISOString().slice(0, 10) })
  const quotes = response.quotes

  return [
    {
      ...createDemoBookingFromQuote({ bookingId: 'DEMO-120001', quote: quotes[0] }),
      status: 'confirmed',
      paymentStatus: 'paid',
      ticketNumber: 'YBF-245811',
      travelers: [
        {
          firstName: 'أحمد',
          lastName: 'الشميري',
          birthDate: '1998-06-11',
          nationality: 'YE',
          documentNumber: 'A1234567',
          seatNumber: '2B',
        },
      ],
      serviceRequests: {
        wheelchair: true,
        oxygenCylinder: false,
        movableBed: false,
        ambulanceSupport: false,
        groundTransport: false,
        medicalEscort: false,
        notes: 'حالة خاصة.',
      },
    },
    {
      ...createDemoBookingFromQuote({ bookingId: 'DEMO-120002', quote: quotes[1] }),
      status: 'payment_deferred',
      paymentStatus: 'deferred',
      travelers: [],
    },
  ]
}

export const createDemoNotifications = () => [
  {
    id: createId('ntf'),
    title: 'تم إنشاء الحجز',
    message: 'تم إنشاء حجز تجريبي ويمكنك متابعة إدخال بيانات المسافرين وإصدار التذكرة.',
    createdAt: new Date().toISOString(),
  },
  {
    id: createId('ntf'),
    title: 'تذكير',
    message: 'هذه نسخة واجهات فقط، لذلك حالات الدفع والتنبيهات لغرض العرض.',
    createdAt: new Date().toISOString(),
  },
]

export const createDemoAdminData = () => ({
  users: [
    { id: 'usr_admin', name: 'مدير النظام', email: 'admin@ybf.test', role: 'admin' },
    { id: 'usr_employee', name: 'موظف الحجز', email: 'employee@ybf.test', role: 'employee' },
    { id: 'usr_customer', name: 'عميل تجريبي', email: 'user@ybf.test', role: 'customer' },
  ],
  bookings: createDemoMyBookings(),
  payments: [
    { id: createId('pay'), bookingId: 'DEMO-120001', amount: 263, currency: 'USD', status: 'paid' },
  ],
  emails: [
    { id: createId('mail'), subject: 'تم إصدار التذكرة الإلكترونية', status: 'sent' },
    { id: createId('mail'), subject: 'تم حفظ الحجز للدفع في المكتب', status: 'sent' },
  ],
})


