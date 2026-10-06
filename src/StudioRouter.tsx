import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export const STUDIO_ROUTES = ['/dashboard', '/genre-mixer', '/vocal-persona', '/mood-mapper', '/visualiser', '/project'] as const
export type StudioRoute = typeof STUDIO_ROUTES[number]
export type ProjectTab = 'overview' | 'tracks' | 'compare' | 'export'

type StudioRouterValue = {
  pathname: StudioRoute
  search: string
  navigate: (to: string, options?: { replace?: boolean }) => void
}

const StudioRouterContext = createContext<StudioRouterValue | null>(null)

function normalizePath(pathname: string): StudioRoute {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return STUDIO_ROUTES.includes(normalized as StudioRoute) ? normalized as StudioRoute : '/dashboard'
}

function readLocation() {
  return { pathname: normalizePath(window.location.pathname), search: window.location.search }
}

export function StudioRouter({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState(readLocation)

  useEffect(() => {
    function onPopState() {
      const next = readLocation()
      if (window.location.pathname !== next.pathname) window.history.replaceState(null, '', `${next.pathname}${next.search}`)
      setLocation(next)
    }
    window.addEventListener('popstate', onPopState)
    const current = readLocation()
    if (window.location.pathname !== current.pathname) window.history.replaceState(null, '', `${current.pathname}${current.search}`)
    setLocation(current)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const value = useMemo<StudioRouterValue>(() => {
    function navigate(to: string, options: { replace?: boolean } = {}) {
      const target = new URL(to, window.location.href)
      if (target.origin !== window.location.origin) return
      const pathname = normalizePath(target.pathname)
      const nextSearch = pathname === '/project' ? target.search : ''
      const nextUrl = `${pathname}${nextSearch}`
      if (options.replace) window.history.replaceState(null, '', nextUrl)
      else if (`${window.location.pathname}${window.location.search}` !== nextUrl) window.history.pushState(null, '', nextUrl)
      setLocation({ pathname, search: nextSearch })
    }
    return { ...location, navigate }
  }, [location])

  return <StudioRouterContext.Provider value={value}>{children}</StudioRouterContext.Provider>
}

export function useStudioRouter() {
  const value = useContext(StudioRouterContext)
  if (!value) throw new Error('useStudioRouter must be used inside StudioRouter.')
  return value
}

export function projectTabFromSearch(search: string): ProjectTab {
  const tab = new URLSearchParams(search).get('tab')
  return tab === 'tracks' || tab === 'compare' || tab === 'export' ? tab : 'overview'
}

export function projectTabUrl(tab: ProjectTab) {
  return tab === 'overview' ? '/project' : `/project?tab=${tab}`
}
