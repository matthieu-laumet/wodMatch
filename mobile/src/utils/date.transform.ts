import { isAfter, isBefore, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'

const TIME_ZONE = 'Europe/Berlin'

type DateInput = string | number | Date

export const convertDateEvent = (
  start: DateInput,
  end: DateInput,
  showDate?: boolean,
  noHappening?: 'noHappening' | string
): string => {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const fmt = (date: Date, pattern: string): string =>
    formatInTimeZone(date, TIME_ZONE, pattern, { locale: fr })

  const startYear = fmt(startDate, 'yyyy')
  const startMonth = fmt(startDate, 'MMM').toUpperCase()
  const startDay = fmt(startDate, 'd')
  const endYear = fmt(endDate, 'yyyy')
  const endMonth = fmt(endDate, 'MMM').toUpperCase()
  const endDay = fmt(endDate, 'd')

  const convertDateGenerator = (): string => {
    if (isSameDay(startDate, endDate)) {
      return `${startDay} ${startMonth} ${startYear}`
    }
    if (startYear === endYear && startMonth === endMonth) {
      return `${startDay} au ${endDay} ${endMonth} ${startYear}`
    }
    if (startYear === endYear) {
      return `${startDay} ${startMonth} au ${endDay} ${endMonth} ${startYear}`
    }
    return `${startDay} ${startMonth} ${startYear} au ${endDay} ${endMonth} ${endYear}`
  }

  if (noHappening === 'noHappening') {
    return convertDateGenerator()
  }

  const now = new Date()
  const isHappeningNow =
    isSameDay(now, startDate) ||
    (isAfter(now, startDate) && isBefore(now, endDate))

  if (isHappeningNow) {
    return showDate ? `Actuellement ${convertDateGenerator()}` : 'Actuellement'
  }

  return convertDateGenerator()
}