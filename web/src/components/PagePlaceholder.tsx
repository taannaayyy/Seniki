import './PagePlaceholder.css'

type PagePlaceholderProps = {
  title: string
  note?: string
}

function PagePlaceholder({ title, note }: PagePlaceholderProps) {
  return (
    <section className="placeholder">
      <h1 className="placeholder-title">{title}</h1>
      <p className="placeholder-note">{note ?? 'Nothing here yet.'}</p>
    </section>
  )
}

export default PagePlaceholder
