const templates = {
  en: {
    bookingApprovedSubject: 'Booking approved: {{service}}',
    bookingApprovedText: (params) => `Hi ${params.guestName},\n\nGood news! Your booking for ${params.serviceName} has been approved.\n\nCheck-in: ${params.checkIn}\nCheck-out: ${params.checkOut}\nGuests: ${params.guests}\nTotal price: ${params.total}\n\nThank you for booking with TrincoMate.`,
    bookingApprovedHtml: (params) => `
      <p>Hi ${params.safeGuestName},</p>
      <p>Good news! Your booking for <strong>${params.safeServiceName}</strong> has been approved.</p>
      <ul>
        <li><strong>Check-in:</strong> ${params.safeCheckIn}</li>
        <li><strong>Check-out:</strong> ${params.safeCheckOut}</li>
        <li><strong>Guests:</strong> ${params.guests}</li>
        <li><strong>Total price:</strong> ${params.total}</li>
      </ul>
      <p>Thank you for booking with TrincoMate.</p>
    `
  }
  // Additional languages
  ,de: {
    bookingApprovedSubject: 'Buchung bestätigt: {{service}}',
    bookingApprovedText: (p) => `Hallo ${p.guestName},\n\nGute Nachrichten! Ihre Buchung für ${p.serviceName} wurde bestätigt.\n\nAnreise: ${p.checkIn}\nAbreise: ${p.checkOut}\nGäste: ${p.guests}\nGesamtpreis: ${p.total}\n\nDanke, dass Sie TrincoMate gewählt haben.`,
    bookingApprovedHtml: (p) => `<p>Hallo ${p.safeGuestName},</p><p>Gute Nachrichten! Ihre Buchung für <strong>${p.safeServiceName}</strong> wurde bestätigt.</p><ul><li><strong>Anreise:</strong> ${p.safeCheckIn}</li><li><strong>Abreise:</strong> ${p.safeCheckOut}</li><li><strong>Gäste:</strong> ${p.guests}</li><li><strong>Gesamtpreis:</strong> ${p.total}</li></ul><p>Danke, dass Sie TrincoMate gewählt haben.</p>`
  },
  fr: {
    bookingApprovedSubject: 'Réservation confirmée : {{service}}',
    bookingApprovedText: (p) => `Bonjour ${p.guestName},\n\nBonne nouvelle ! Votre réservation pour ${p.serviceName} a été confirmée.\n\nArrivée : ${p.checkIn}\nDépart : ${p.checkOut}\nInvités : ${p.guests}\nPrix total : ${p.total}\n\nMerci d'avoir réservé avec TrincoMate.`,
    bookingApprovedHtml: (p) => `<p>Bonjour ${p.safeGuestName},</p><p>Bonne nouvelle ! Votre réservation pour <strong>${p.safeServiceName}</strong> a été confirmée.</p><ul><li><strong>Arrivée :</strong> ${p.safeCheckIn}</li><li><strong>Départ :</strong> ${p.safeCheckOut}</li><li><strong>Invités :</strong> ${p.guests}</li><li><strong>Prix total :</strong> ${p.total}</li></ul><p>Merci d'avoir réservé avec TrincoMate.</p>`
  },
  ru: {
    bookingApprovedSubject: 'Бронирование подтверждено: {{service}}',
    bookingApprovedText: (p) => `Здравствуйте ${p.guestName},\n\nХорошие новости! Ваше бронирование для ${p.serviceName} подтверждено.\n\nЗаезд: ${p.checkIn}\nВыезд: ${p.checkOut}\nГостей: ${p.guests}\nИтоговая цена: ${p.total}\n\nСпасибо, что выбрали TrincoMate.`,
    bookingApprovedHtml: (p) => `<p>Здравствуйте ${p.safeGuestName},</p><p>Хорошие новости! Ваше бронирование для <strong>${p.safeServiceName}</strong> подтверждено.</p><ul><li><strong>Заезд:</strong> ${p.safeCheckIn}</li><li><strong>Выезд:</strong> ${p.safeCheckOut}</li><li><strong>Гостей:</strong> ${p.guests}</li><li><strong>Итоговая цена:</strong> ${p.total}</li></ul><p>Спасибо, что выбрали TrincoMate.</p>`
  },
  zh: {
    bookingApprovedSubject: '预订已确认：{{service}}',
    bookingApprovedText: (p) => `${p.guestName},\n\n好消息！您预订的 ${p.serviceName} 已确认。\n\n入住：${p.checkIn}\n退房：${p.checkOut}\n人数：${p.guests}\n总价：${p.total}\n\n感谢您使用 TrincoMate。`,
    bookingApprovedHtml: (p) => `<p>${p.safeGuestName},</p><p>好消息！您预订的 <strong>${p.safeServiceName}</strong> 已确认。</p><ul><li><strong>入住：</strong> ${p.safeCheckIn}</li><li><strong>退房：</strong> ${p.safeCheckOut}</li><li><strong>人数：</strong> ${p.guests}</li><li><strong>总价：</strong> ${p.total}</li></ul><p>感谢您使用 TrincoMate。</p>`
  },
  ja: {
    bookingApprovedSubject: '予約が承認されました：{{service}}',
    bookingApprovedText: (p) => `${p.guestName}様,\n\nお知らせ：${p.serviceName} のご予約が承認されました。\n\nチェックイン：${p.checkIn}\nチェックアウト：${p.checkOut}\n人数：${p.guests}\n合計金額：${p.total}\n\nTrincoMateをご利用いただきありがとうございます。`,
    bookingApprovedHtml: (p) => `<p>${p.safeGuestName}様,</p><p>${p.safeServiceName} のご予約が承認されました。</p><ul><li><strong>チェックイン：</strong> ${p.safeCheckIn}</li><li><strong>チェックアウト：</strong> ${p.safeCheckOut}</li><li><strong>人数：</strong> ${p.guests}</li><li><strong>合計金額：</strong> ${p.total}</li></ul><p>TrincoMateをご利用いただきありがとうございます。</p>`
  },
  it: {
    bookingApprovedSubject: 'Prenotazione confermata: {{service}}',
    bookingApprovedText: (p) => `Ciao ${p.guestName},\n\nBuone notizie! La tua prenotazione per ${p.serviceName} è stata confermata.\n\nCheck-in: ${p.checkIn}\nCheck-out: ${p.checkOut}\nOspiti: ${p.guests}\nPrezzo totale: ${p.total}\n\nGrazie per aver prenotato con TrincoMate.`,
    bookingApprovedHtml: (p) => `<p>Ciao ${p.safeGuestName},</p><p>Buone notizie! La tua prenotazione per <strong>${p.safeServiceName}</strong> è stata confermata.</p><ul><li><strong>Check-in:</strong> ${p.safeCheckIn}</li><li><strong>Check-out:</strong> ${p.safeCheckOut}</li><li><strong>Ospiti:</strong> ${p.guests}</li><li><strong>Prezzo totale:</strong> ${p.total}</li></ul><p>Grazie per aver prenotato con TrincoMate.</p>`
  },
  es: {
    bookingApprovedSubject: 'Reserva confirmada: {{service}}',
    bookingApprovedText: (p) => `Hola ${p.guestName},\n\n¡Buenas noticias! Su reserva para ${p.serviceName} ha sido confirmada.\n\nEntrada: ${p.checkIn}\nSalida: ${p.checkOut}\nHuéspedes: ${p.guests}\nPrecio total: ${p.total}\n\nGracias por reservar con TrincoMate.`,
    bookingApprovedHtml: (p) => `<p>Hola ${p.safeGuestName},</p><p>¡Buenas noticias! Su reserva para <strong>${p.safeServiceName}</strong> ha sido confirmada.</p><ul><li><strong>Entrada:</strong> ${p.safeCheckIn}</li><li><strong>Salida:</strong> ${p.safeCheckOut}</li><li><strong>Huéspedes:</strong> ${p.guests}</li><li><strong>Precio total:</strong> ${p.total}</li></ul><p>Gracias por reservar con TrincoMate.</p>`
  },
  ta: {
    bookingApprovedSubject: 'இறுதி செய்யப்பட்ட முன்பதிவு: {{service}}',
    bookingApprovedText: (p) => `${p.guestName},\n\nசிறந்த செய்தி! உங்கள் ${p.serviceName} முன்பதிவு உறுதிசெய்யப்பட்டது.\n\nசெக்-இன்: ${p.checkIn}\nசெக்-அவுட்: ${p.checkOut}\nஅதிதிகள்: ${p.guests}\nமொத்தம்: ${p.total}\n\nTrincoMate ஐ தெரிவு செய்தமைக்கு நன்றி.`,
    bookingApprovedHtml: (p) => `<p>${p.safeGuestName},</p><p>சிறந்த செய்தி! உங்கள் <strong>${p.safeServiceName}</strong> முன்பதிவு உறுதிசெய்யப்பட்டது.</p><ul><li><strong>செக்-இன்:</strong> ${p.safeCheckIn}</li><li><strong>செக்-அவுட்:</strong> ${p.safeCheckOut}</li><li><strong>அதிதிகள்:</strong> ${p.guests}</li><li><strong>மொத்தம்:</strong> ${p.total}</li></ul><p>TrincoMate ஐ தெரிவு செய்தமைக்கு நன்றி.</p>`
  },
  si: {
    bookingApprovedSubject: 'බෙූකින් අනුමතයි: {{service}}',
    bookingApprovedText: (p) => `${p.guestName},\n\nසුබ පුවත්! ඔබගේ ${p.serviceName} සඳහා වන බේකින් අනුමත කර ඇත.\n\nපරීක්ෂාව: ${p.checkIn}\nපිටවීම: ${p.checkOut}\nඅමුත්තන්: ${p.guests}\nමුළු මිල: ${p.total}\n\nTrincoMate සමඟ වෙන් කිරීමට ස්තුතියි.`,
    bookingApprovedHtml: (p) => `<p>${p.safeGuestName},</p><p>සුබ පුවත්! ඔබගේ <strong>${p.safeServiceName}</strong> සඳහා වූ බුකින් අනුමත කර ඇත.</p><ul><li><strong>පරීක්ෂාව:</strong> ${p.safeCheckIn}</li><li><strong>පිටවීම:</strong> ${p.safeCheckOut}</li><li><strong>අමුත්තන්:</strong> ${p.guests}</li><li><strong>මුළු මිල:</strong> ${p.total}</li></ul><p>TrincoMate සමඟ වෙන් කළාට ස්තුතියි.</p>`
  }
};

export default templates;
