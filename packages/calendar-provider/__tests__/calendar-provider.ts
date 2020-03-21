import CalendarProvider from "../calendar-provider"
import y1998m05 from './static/days/1998-05'
import y1998 from './static/months/1998'

describe('Calendar Provider', () => {
  const calendar = new CalendarProvider({
    date: new Date(1998, 4, 8),
    backwardYears: 8,
    forwardYears: 8,
  })

  it('should returns all days of the mounth', () => {
    expect(calendar.days).toEqual(y1998m05)
  })

  it('should returns all months of the year', () => {
    expect(calendar.months).toEqual(y1998)
  })

  it('should returns years around', () => {
    expect(calendar.months).toEqual(y1998)
  })
})
