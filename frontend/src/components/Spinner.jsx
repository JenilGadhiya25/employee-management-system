const Spinner = ({ size = 'md', center = true }) => {
  const cls = size === 'sm' ? 'spinner spinner-sm' : 'spinner'

  if (!center) {
    // Inline usage — e.g. inside a button
    return (
      <span
        className={cls}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      />
    )
  }

  return (
    <div className="spinner-overlay">
      <div className={cls} />
    </div>
  )
}

export default Spinner
