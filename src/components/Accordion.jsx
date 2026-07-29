import { useState } from 'react'
import { Icon } from './Icons'

// Shared collapsible-section primitive — real <button> trigger,
// aria-expanded/aria-controls wired to the panel, fully keyboard
// operable (it's a button, so Enter/Space just work). Used by
// FilterPanel's mobile accordion grouping and anywhere else a "progressive
// disclosure" section is needed.
let idCounter = 0
export default function AccordionSection({ title, defaultOpen = false, children }) {
  const [id] = useState(() => `accordion-${idCounter++}`)
  const [open, setOpen] = useState(defaultOpen)
  const triggerId = `${id}-trigger`
  const panelId = `${id}-panel`

  return (
    <div className="accordion-section">
      <button
        type="button"
        id={triggerId}
        className="accordion-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <Icon id="i-chevron" size={14} className={`accordion-chevron${open ? ' open' : ''}`} />
      </button>
      <div id={panelId} role="region" aria-labelledby={triggerId} className="accordion-panel" hidden={!open}>
        {open && children}
      </div>
    </div>
  )
}
