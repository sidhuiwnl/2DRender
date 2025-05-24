import {BrowserRouter,Routes,Route} from "react-router";
import Home from "@/pages/Home.tsx";
import Chat from "@/pages/chat.tsx";

export default function Main(){


    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/chats" element={<Chat/>}/>
            </Routes>
        </BrowserRouter>
    )
}