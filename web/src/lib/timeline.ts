import { DAY_MINUTES, minutesOfDay } from './calendar'

/** Shortest span a task may occupy, so a brief task stays readable. */
export const MIN_DURATION = 15

export type Span = {
  /** Minutes since midnight. */
  start: number
  end: number
}

/**
 * The span a task occupies on a day timeline. An end at or before the start —
 * bad stored data, or a task running past midnight — is treated as the
 * minimum duration rather than a zero-height or negative block.
 */
export function taskSpan(task: { time: string; endTime: string }): Span {
  const start = Math.min(minutesOfDay(task.time), DAY_MINUTES - MIN_DURATION)
  const rawEnd = minutesOfDay(task.endTime)
  const end = rawEnd > start ? Math.min(rawEnd, DAY_MINUTES) : start + MIN_DURATION
  return { start, end }
}

export type Placed<T> = {
  item: T
  start: number
  end: number
  /** Column index within the overlapping cluster, and how many columns it has. */
  lane: number
  lanes: number
}

/**
 * Lays overlapping tasks out side by side.
 *
 * Items are swept in start order and collected into clusters of things that
 * overlap; each item takes the first lane whose previous item has already
 * finished, and every item in a cluster is widened to the same lane count so
 * the columns line up.
 */
export function placeSpans<T>(items: T[], spanOf: (item: T) => Span): Placed<T>[] {
  const sorted = items
    .map((item) => ({ item, ...spanOf(item) }))
    .sort((a, b) => a.start - b.start || b.end - a.end)

  const placed: Placed<T>[] = []
  let cluster: Placed<T>[] = []
  let laneEnds: number[] = []

  const flush = () => {
    for (const entry of cluster) entry.lanes = laneEnds.length
    placed.push(...cluster)
    cluster = []
    laneEnds = []
  }

  for (const entry of sorted) {
    // Nothing in the cluster is still running, so it can't overlap any of it.
    if (cluster.length > 0 && entry.start >= Math.max(...laneEnds)) flush()

    let lane = laneEnds.findIndex((end) => end <= entry.start)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(entry.end)
    } else {
      laneEnds[lane] = entry.end
    }

    cluster.push({ item: entry.item, start: entry.start, end: entry.end, lane, lanes: 1 })
  }

  flush()
  return placed
}
