import React, { useContext } from 'react'
import { CalendarContext } from '../../context'
import useProps from '../../hooks/use-props'
import resolveClassName from '../../utils/classname-resolve'
import compareDates from '../../utils/compare-dates'
import dateIncludes from '../../utils/date-includes'
import customEvent from '../../utils/custom-event'
import getSelectedDates from '../../utils/selected-dates'
import getPickRangeClassNames from './pick-range-classnames'

function Days () {
  const { calendarProvider, dateMouseOver, emitEvent } = useContext(
    CalendarContext
  )

  const {
    pick,
    selectedDate,
    filterInvalidDates,
    DateProps,
    classNames,
    rangeSize
  } = useProps()

  const { days } = calendarProvider
  const selectedDates = getSelectedDates(selectedDate)

  return (
    <>
      {days.map(({ date, day, belongCurrentMonth }) => {
        const isCurrentDate = compareDates(date, new Date())
        const isSelectedDate = dateIncludes(selectedDates, date)
        const isInvalidDate = filterInvalidDates
          ? filterInvalidDates(date)
          : false
        const isPickRange = pick === 'range'

        const pickRangeClassNames = isPickRange
          ? getPickRangeClassNames({
              selectedDates,
              dateMouseOver,
              date,
              rangeSize: rangeSize,
              isInvalidDate,
              classNames
            })
          : []

        const clickHandler = () => {
          if (isSelectedDate) {
            emitEvent('removeSelectedDate', date)
            if (isPickRange) {
              emitEvent('setDateMouseOver', date)
            }
          } else if (belongCurrentMonth && !isInvalidDate) {
            emitEvent('setSelectedDate', date)
          }
        }

        const mouseEnterHandler = () => {
          if (isPickRange && belongCurrentMonth && selectedDates.length === 1) {
            emitEvent('setDateMouseOver', date)
          }
        }

        const mouseLeaveHandler = () => {
          if (isPickRange) {
            emitEvent('setDateMouseOver', null)
          }
        }

        return (
          <button
            {...DateProps}
            key={day + belongCurrentMonth.toString()}
            type='button'
            className={resolveClassName(
              DateProps?.className,
              classNames?.Cell,
              classNames?.DayCell,
              isInvalidDate ? classNames?.InvalidDate : classNames?.ValidDate,
              belongCurrentMonth && classNames?.DayBelongCurrentMonth,
              isCurrentDate && classNames?.CurrentDate,
              isSelectedDate && classNames?.SelectedDate,
              ...pickRangeClassNames
            )}
            onClick={customEvent(clickHandler, DateProps?.onClick)}
            onMouseEnter={customEvent(mouseEnterHandler, DateProps?.onClick)}
            onMouseLeave={customEvent(mouseLeaveHandler, DateProps?.onClick)}
          >
            {day}
          </button>
        )
      })}
    </>
  )
}

function Months () {
  const {
    calendarProvider,
    emitEvent,
    bind: { order }
  } = useContext(CalendarContext)

  const { classNames, monthsDictionary, selectedDate, MonthProps } = useProps()

  const { months } = calendarProvider
  const selectedDates = getSelectedDates(selectedDate)

  return (
    <>
      {months.map(({ date, month }) => {
        const currentDate = new Date()
        const dateString = `${date.getMonth()}${date.getFullYear()}`
        const currentDateString = `${currentDate.getMonth()}${currentDate.getFullYear()}`

        const clonedSelectedDates = selectedDates.map(originalDate => {
          const clonedDate = new Date(originalDate)
          clonedDate.setDate(1)
          return clonedDate
        })

        const clickHandler = () => {
          const clonedDate = new Date(date)
          clonedDate.setMonth(clonedDate.getMonth() - order)
          emitEvent('calendar.goto', clonedDate)
          emitEvent('setDataToView', 'days')
        }

        return (
          <button
            {...MonthProps}
            key={month}
            type='button'
            className={resolveClassName(
              MonthProps?.className,
              classNames?.Cell,
              classNames?.MonthCell,
              dateString === currentDateString && classNames?.CurrentDate,
              dateIncludes(clonedSelectedDates, date) &&
                classNames?.SelectedDate
            )}
            onClick={customEvent(clickHandler, MonthProps?.onClick)}
          >
            {monthsDictionary[month]}
          </button>
        )
      })}
    </>
  )
}

function Years () {
  const {
    calendarProvider,
    emitEvent,
    bind: { order }
  } = useContext(CalendarContext)

  const { classNames, selectedDate, YearProps } = useProps()

  const { years } = calendarProvider
  const selectedDates = getSelectedDates(selectedDate)

  return (
    <>
      {years.map(({ date, year }) => {
        const currentDate = new Date()

        const clonedSelectedDates = selectedDates.map(originalDate => {
          const clonedDate = new Date(originalDate)
          clonedDate.setDate(1)
          clonedDate.setMonth(0)
          return clonedDate
        })

        const clickHandler = () => {
          const clonedDate = new Date(date)
          clonedDate.setFullYear(clonedDate.getFullYear() - order)
          emitEvent('calendar.goto', clonedDate)
          emitEvent('setDataToView', 'months')
        }

        return (
          <button
            {...YearProps}
            key={year}
            type='button'
            className={resolveClassName(
              YearProps?.className,
              classNames?.Cell,
              classNames?.YearCell,
              date.getFullYear() === currentDate.getFullYear() &&
                classNames?.CurrentDate,
              dateIncludes(clonedSelectedDates, date) &&
                classNames?.SelectedDate
            )}
            onClick={customEvent(clickHandler, YearProps?.onClick)}
          >
            {year}
          </button>
        )
      })}
    </>
  )
}

export default function Body () {
  const { dataToView } = useContext(CalendarContext)

  const {
    classNames,
    BodyProps,
    DaysProps,
    DayProps,
    CellsProps,
    daysDictionary
  } = useProps()

  return (
    <div
      {...BodyProps}
      className={resolveClassName(
        BodyProps?.className,
        classNames?.Body,
        dataToView === 'days' && classNames?.BodyDays,
        dataToView === 'months' && classNames?.BodyMonths,
        dataToView === 'years' && classNames?.BodyYears
      )}
    >
      {dataToView === 'days' && (
        <div
          {...DaysProps}
          className={resolveClassName(DaysProps?.className, classNames?.Days)}
        >
          {daysDictionary.map((day, i) => (
            <div
              {...DayProps}
              key={day + i}
              className={resolveClassName(DayProps?.className, classNames?.Day)}
            >
              {day}
            </div>
          ))}
        </div>
      )}
      <div
        {...CellsProps}
        className={resolveClassName(CellsProps?.className, classNames?.Cells)}
      >
        {dataToView === 'days' && <Days />}
        {dataToView === 'months' && <Months />}
        {dataToView === 'years' && <Years />}
      </div>
    </div>
  )
}
