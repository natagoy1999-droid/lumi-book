import type { MessageChannel, MessageDraft, MessageKind } from '../state/messaging'
import { uid } from '../state/messaging'
import type { Booking, Client, Service } from '../state/store'

type TimeSlot = { dateISO: string; time: string; labelDay: string }

function softGreeting() {
  const variants = ['Здравствуйте', 'Добрый день', 'Здравствуйте ✨', 'Здравствуйте 🌿']
  return variants[Math.floor(Math.random() * variants.length)]
}

function softClosing() {
  const variants = [
    'Буду рада видеть вас.',
    'Подскажите, как вам удобнее?',
    'Если удобно — просто ответьте “да”.',
    'Я на связи, как будет комфортно.',
  ]
  return variants[Math.floor(Math.random() * variants.length)]
}

function channelPrefix(channel: MessageChannel) {
  // Keep text neutral (no CRM tone); channels can style delivery.
  if (channel === 'sms') return ''
  if (channel === 'whatsapp') return ''
  return ''
}

export function generateMessageDraft(args: {
  kind: MessageKind
  channel: MessageChannel
  client: Client
  service?: Service
  booking?: Booking
  slot?: TimeSlot
  slots?: TimeSlot[]
  specialOffer?: { title: string; subtitle?: string }
}): MessageDraft {
  const { kind, channel, client, service, booking, slot, slots, specialOffer } = args

  const name = client.name.split(' ')[0]
  const greet = `${softGreeting()}, ${name}.`
  const close = softClosing()

  let title = 'Сообщение'
  let text = ''

  if (kind === 'slot_offer') {
    const s = slot ?? slots?.[0]
    title = 'Предложить окно'
    text =
      `${channelPrefix(channel)}${greet}\n` +
      `У нас освободилось удобное окно ${s ? `${s.labelDay.toLowerCase()} в ${s.time}` : 'на этой неделе'}. ` +
      `Подойдёт вам?\n\n` +
      `${close}`
  }

  if (kind === 'reengage') {
    title = 'Вернуть клиента'
    const s = slots?.[0]
    text =
      `${channelPrefix(channel)}${greet}\n` +
      `Давно вас не было — буду рада записать вас снова. ` +
      (s ? `Есть спокойное время ${s.labelDay.toLowerCase()} в ${s.time}.` : 'Есть удобные окна на этой неделе.') +
      `\n\n${close}`
  }

  if (kind === 'nudge_confirm') {
    title = 'Мягкое напоминание'
    const when = booking ? `${booking.dateISO} ${booking.time}` : 'сегодня'
    const serviceName = service?.name ?? 'услуга'
    text =
      `${channelPrefix(channel)}${greet}\n` +
      `Проверяю запись: ${serviceName} • ${when}. ` +
      `Подтвердите, пожалуйста, если всё в силе.\n\n` +
      `${close}`
  }

  if (kind === 'reschedule_offer') {
    title = 'Предложение переноса'
    const s = slot ?? slots?.[0]
    const serviceName = service?.name ?? 'услуга'
    text =
      `${channelPrefix(channel)}${greet}\n` +
      `Чтобы было комфортно, могу предложить новое время на ${serviceName}: ` +
      (s ? `${s.labelDay.toLowerCase()} в ${s.time}.` : 'на этой неделе.') +
      `\n\n${close}`
  }

  if (kind === 'special_offer') {
    title = 'Спец‑предложение'
    const offerTitle = specialOffer?.title ?? 'Для вас небольшое предложение'
    const offerSub = specialOffer?.subtitle
    text =
      `${channelPrefix(channel)}${greet}\n` +
      `${offerTitle}.` +
      (offerSub ? ` ${offerSub}` : '') +
      `\n\n${close}`
  }

  if (kind === 'followup') {
    title = 'Follow‑up'
    text =
      `${channelPrefix(channel)}${greet}\n` +
      `Хотела уточнить, получилось ли выбрать удобное время? ` +
      `Если подскажете, когда вам комфортнее — подберу лучший слот.\n\n` +
      `${close}`
  }

  return {
    id: uid('draft'),
    kind,
    clientId: client.id,
    bookingId: booking?.id,
    channel,
    title,
    text,
    createdAt: Date.now(),
  }
}

