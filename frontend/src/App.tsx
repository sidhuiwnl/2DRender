
import {BrowserRouter,Routes,Route} from "react-router";
import Home from "./pages/Home.tsx";
import Chat from "./pages/chat.tsx";


function App() {
  return (

            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/chats" element={<Chat/>}/>
                </Routes>
            </BrowserRouter>
  )
}

export default App
