import ChatInterface from "./components/ChatInterface.tsx";

function App() {


  return (
    <div className="h-screen flex flex-col space-y-2 items-center justify-center">
        <h1 className="text-5xl font-medium">What do you want to render?</h1>
        <p className="text-neutral-400">Prompt, run, edit, and deploy 2d animation videos.</p>
        <ChatInterface />
    </div>
  )
}

export default App
