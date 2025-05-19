import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {PromptProvider} from "./context/chat-context.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <PromptProvider>
          <App />
      </PromptProvider>

  </StrictMode>,
)
