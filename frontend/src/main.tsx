import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {PromptProvider} from "./context/chat-context.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";
import {ClerkProvider} from "@clerk/clerk-react";
import {Toaster} from "@/components/ui/sonner.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <PromptProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
                  <App />
                  <Toaster/>
              </ClerkProvider>
          </ThemeProvider>
      </PromptProvider>
  </StrictMode>,
)
