import { Dispatch, SetStateAction } from 'react'
import { TEventType, ICalendarProps, TDataToView, TEventDispatcher } from "./types";
import CalendarProvider from "../calendar-provider/calendar-provider";
import defaultProps from "./defaultProps";
import dateDiff from "./utils/date-diff";
import dateSort from "./utils/date-sort";
import getDatesRange from './utils/get-dates-range';
import getSelectedDates from './utils/selected-dates';

interface IArgs {
  order: number
  calendarProvider: CalendarProvider
  setDateMouseOver: Dispatch<SetStateAction<Date | null>>
  setDataToView: Dispatch<SetStateAction<TDataToView>>
  props: ICalendarProps
}

type TEvents = {
  [P in TEventType]: (...args: any) => any
}

export default function dispatcherFactory (args: IArgs): TEventDispatcher {
  const {
    order,
    calendarProvider,
    setDateMouseOver,
    setDataToView,
    props,
    props: {
      bind,
      onChangeSelectedDate,
      filterInvalidDates
    }
  } = args

  function emitSelectedDateEvent (date: Date[] | Date | null) {
    return onChangeSelectedDate && onChangeSelectedDate(date)
  }
  
  function setSingleDate (value: Date) {
    emitSelectedDateEvent(value)
  }
  
  function setMultipleDate (value: Date) {
    const pickLimit = props?.pickLimit || defaultProps.pickLimit
    const selectedDates = getSelectedDates(props?.selectedDate)

    if (selectedDates.length < pickLimit) {
      emitSelectedDateEvent(dateSort(...selectedDates, value))
    }
  }

  function setRangeDate (value: Date) {
    const selectedDates = getSelectedDates(props?.selectedDate)
    const rangeSize = props?.rangeSize || defaultProps.rangeSize

    switch (selectedDates.length) {
      case 0: {
        emitSelectedDateEvent([value])
        break
      }
      case 1: {
        const rangeDiff = dateDiff(selectedDates[0], value)
        const rangeDiffAbs = Math.abs(rangeDiff)
        const datesRange = getDatesRange(selectedDates[0], value)
        const isValid = !filterInvalidDates || (
          datesRange.filter(date => filterInvalidDates(date)).length === 0
        )

        if (isValid && (rangeDiffAbs >= rangeSize.min && rangeDiffAbs <= rangeSize.max)) {
          emitSelectedDateEvent(dateSort(...selectedDates, value))
          break
        }
      }
    }
  }

  function addSelectedDateHandler (date: Date) {
    const pick = props?.pick || defaultProps.pick
    const methods = {
      single: setSingleDate,
      multiple: setMultipleDate,
      range: setRangeDate,
    }

    methods[pick](date)
  }

  function removeSelectedDate (value: Date) {
    const pick = props?.pick || defaultProps.pick

    if (pick === 'single') {
      emitSelectedDateEvent(null)
    } else {
      const selectedDates = getSelectedDates(props?.selectedDate)
      const clonedSelectedDates = [...selectedDates]
      const formattedDates = selectedDates.map(d => d.toLocaleDateString())

      clonedSelectedDates.splice(formattedDates.indexOf(value.toLocaleDateString()), 1)

      emitSelectedDateEvent(dateSort(...clonedSelectedDates))
    }
  }

  function setDataToViewHandler (value: TDataToView) {
    if (order > 0) {
      if (!bind || !order || !bind?.mainCalendarProvider) return
      const { mainCalendarProvider } = bind
      const { backwardYears, forwardYears } = mainCalendarProvider
      const date = new Date(mainCalendarProvider.dateToView)
  
      if (value === 'days') {
        date.setMonth(date.getMonth() + order)
        calendarProvider.goto(date)
      }
  
      if (value === 'months') {
        date.setFullYear(date.getFullYear() + order)
        calendarProvider.goto(date)
      }
  
      if (value === 'years') {
        const years = mainCalendarProvider.years
        date.setFullYear(
          years[backwardYears].date.getFullYear() +
            (backwardYears + forwardYears) * order
        )
        calendarProvider.goto(date)
      }
    }

    setDataToView(value)
  }

  const events: TEvents = {
    'calendar.prevMonth': calendarProvider.prevMonth,
    'calendar.nextMonth': calendarProvider.nextMonth,
    'calendar.prevYear': calendarProvider.prevYear,
    'calendar.nextYear': calendarProvider.nextYear,
    'calendar.prevYears': calendarProvider.prevYears,
    'calendar.nextYears': calendarProvider.nextYears,
    'calendar.goto': calendarProvider.goto,
    'calendar.addSelectedDate': addSelectedDateHandler,
    'calendar.removeSelectedDate': removeSelectedDate,
    'setDateMouseOver': setDateMouseOver,
    'setDataToView': setDataToViewHandler,
  }

  return (eventType, ...eventValue) => events[eventType](...eventValue)
}
