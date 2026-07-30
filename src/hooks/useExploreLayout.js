import { useEffect, useState } from 'react'
import { readStorage, writeStorage } from '../services/storage'

const STORAGE_KEY = 'vh-explore-layout'
const VALID = new Set(['grid', 'list'])

// Card/List view preference for Explore's "更多活動" section and the
// unified search/filter result list — Featured/Urgent/saved-search strips
// are unaffected (they're editorial strips, not the browsable catalogue).
// A corrupted or otherwise-invalid stored value falls back to 'grid'
// rather than throwing or defaulting to some third state.
export function useExploreLayout() {
  const [layout, setLayoutState] = useState(() => {
    const raw = readStorage(STORAGE_KEY, 'grid')
    return VALID.has(raw) ? raw : 'grid'
  })

  useEffect(() => {
    writeStorage(STORAGE_KEY, layout)
  }, [layout])

  function setLayout(value) {
    setLayoutState(VALID.has(value) ? value : 'grid')
  }

  return { layout, setLayout }
}

export const EXPLORE_LAYOUT_STORAGE_KEY = STORAGE_KEY
