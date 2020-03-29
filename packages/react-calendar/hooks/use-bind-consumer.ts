import { useMemo } from 'react'
import { CalendarProps, Bind, BindProp } from '../shared-types'

interface BindData {
  shared?: BindProp['shared']
  props: CalendarProps
}

export default function useBindConsumer <Shared>(bindData: BindData): Bind {
  const { props, shared } = bindData
  const { bind } = props

  const owner = useMemo(() => Symbol('Owner'), [])
  const order = useMemo(() => bind?.owners.length || 0, [])

  const bindProps = useMemo(() => {
    if (order === 0) return {}
    return bind?.props || {}
  }, [])

  // Update shared props
  if (order === 0) Object.assign(bindProps, props)
  
  if (bind && !bind.owners.includes(owner)) {
    bind.owners.push(owner)
    if (order === 0) {
      bind.props = bindProps
      bind.shared = shared
    }
  }

  // delete bindProps['bind']

  return {
    order,
    props: bindProps,
    shared: bind?.shared,
  }
}
