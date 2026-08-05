import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import './index.css'
import App from './App.tsx'
import AuthProvider from './features/auth/provider/AuthProvider.tsx'
import { ThemeProvider } from './features/theme'

const initializeNativeShell = async () => {
  if (!Capacitor.isNativePlatform()) return

  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#10b981' })
    window.setTimeout(() => {
      void SplashScreen.hide()
    }, 700)
  } catch (error) {
    console.warn('Capacitor native shell init failed', error)
  }
}

void initializeNativeShell()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
