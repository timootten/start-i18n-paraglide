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

/**
 * Sets the locale cookie with proper domain and expiration settings
 */
function setLocaleCookie(locale: Locale) {
  const cookieString = `${cookieName}=${locale}; path=/; max-age=${cookieMaxAge}`
  document.cookie = cookieDomain
    ? `${cookieString}; domain=${cookieDomain}`
    : cookieString
}

/**
 * Provider component that manages locale state and synchronization
 * Wraps your app to enable i18n functionality
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(() => getLocale())
  const router = useRouter()

  // Sync locale state when URL changes (e.g., browser back/forward)
  React.useEffect(() => {
    const currentLocale = getLocale()
    if (currentLocale !== locale) {
      setLocaleState(currentLocale)
      document.documentElement.lang = currentLocale
    }
  }, [router.state.location.pathname, locale])

  const switchLanguage = React.useCallback(
    (nextLocale: Locale) => {
      // Persist locale preference
      setLocaleCookie(nextLocale)

      // Get the localized URL for the target locale
      const newUrl = localizeUrl(window.location.href, {
        locale: nextLocale,
      })

      // Update state and HTML lang attribute
      setLocaleState(nextLocale)
      document.documentElement.lang = nextLocale

      // Navigate to localized URL (SPA navigation, no page reload)
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

/**
 * Hook to access current locale and language switching function
 * @throws Error if used outside LocaleProvider
 */
export function useLocale() {
  const ctx = React.useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return ctx
}
