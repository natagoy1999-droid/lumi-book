/**
 * Humane communication wording — calm luxury tone, not CRM pressure.
 * Call sites pass socialQuietness / advisoryDelicacy (0–1) from communication calm layer.
 */

export function nudgeClientLabel(socialQuietness: number): string {
  return socialQuietness > 0.52 ? 'Мягко напомнить' : 'Напомнить'
}

export function rescheduleFollowupTitle(socialQuietness: number): string {
  return socialQuietness > 0.5
    ? 'Спокойно продолжить коммуникацию?'
    : 'Напомнить клиенту?'
}

export function offerAlternateTimeTitle(socialQuietness: number): string {
  return socialQuietness > 0.54 ? 'Предложить другое время без спешки?' : 'Предложить другое время?'
}

export function pendingBookingHeadline(clientName: string, socialQuietness: number): string {
  return socialQuietness > 0.56
    ? `${clientName} ещё не подтвердила запись`
    : `${clientName} не подтвердила запись`
}

export function recoveryOpportunitySubtitle(args: {
  returnLikelihood: 'high' | 'medium' | 'low'
  socialQuietness: number
}): string {
  const { returnLikelihood, socialQuietness } = args
  if (socialQuietness > 0.58) {
    if (returnLikelihood === 'high') return 'Можно спокойно вернуться к диалогу'
    if (returnLikelihood === 'medium') return 'Мягкий контакт уместен'
    return 'Лучше без спешки и давления'
  }
  if (returnLikelihood === 'high') return 'Высокая вероятность возврата'
  if (returnLikelihood === 'medium') return 'Хороший шанс вернуть'
  return 'Нужен мягкий сценарий'
}

export function dismissLaterHint(socialQuietness: number): string {
  return socialQuietness > 0.55
    ? 'Можно спокойно написать позже — без давления.'
    : 'Можно отложить сообщение.'
}

export function focusDockBadge(socialQuietness: number): string {
  return socialQuietness > 0.55 ? 'Спокойный фокус' : 'Фокус'
}
