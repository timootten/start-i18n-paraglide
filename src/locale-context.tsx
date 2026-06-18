import * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import {
  getLocale,
  localizeUrl,
  cookieName,
  cookieMaxAge,
  cookieDomain,
  type Locale,
} from '@/paraglide/runtime'

type LocaleContextValue = {
  locale: Locale
  switchLanguage: (locale: Locale) => void
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(() => getLocale())
  const router = useRouter()

  // Sync locale state when URL changes
  React.useEffect(() => {
    const currentLocale = getLocale()
    if (currentLocale !== locale) {
      setLocaleState(currentLocale)
      document.documentElement.lang = currentLocale
    }
  }, [router.state.location.pathname, locale])

  const switchLanguage = React.useCallback(
    (nextLocale: Locale) => {
      // Update the cookie
      const cookieString = `${cookieName}=${nextLocale}; path=/; max-age=${cookieMaxAge}`
      document.cookie = cookieDomain
        ? `${cookieString}; domain=${cookieDomain}`
        : cookieString

      // Get the localized URL for the new locale
      const newUrl = localizeUrl(window.location.href, {
        locale: nextLocale,
      })

      // Update state and HTML lang attribute
      setLocaleState(nextLocale)
      document.documentElement.lang = nextLocale

      // Navigate using the router (no full page reload)
      router.history.push(newUrl.pathname + newUrl.search + newUrl.hash)
    },
    [router]
  )

  return (
    <LocaleContext.Provider value={{ locale, switchLanguage }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider')
  return ctx
}
