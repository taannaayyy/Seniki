/**
 * Small fixed palette for task tags (the accent bar on a calendar card, and
 * the swatch picker in the add-task form). Kept separate from the theme
 * tokens in index.css: these need to stay visually distinct from each other
 * on both a light and a dark surface, not shift with the theme.
 */
export const TASK_COLORS = [
  { id: 'accent', label: 'Orange', value: 'var(--accent)' },
  { id: 'blue', label: 'Blue', value: '#5b8def' },
  { id: 'green', label: 'Green', value: '#4caf7d' },
  { id: 'purple', label: 'Purple', value: '#9575cd' },
] as const

export type TaskColorId = (typeof TASK_COLORS)[number]['id']

export function taskColorValue(id: string): string {
  return TASK_COLORS.find((color) => color.id === id)?.value ?? TASK_COLORS[0].value
}

/** Inverse of `taskColorValue`, so a stored task can be re-opened in a form. */
export function taskColorId(value: string): TaskColorId {
  return TASK_COLORS.find((color) => color.value === value)?.id ?? TASK_COLORS[0].id
}
