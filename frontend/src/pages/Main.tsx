import {BrowserRouter,Routes,Route} from "react-router";
import Home from "@/pages/Home.tsx";
import Chat from "@/pages/chat.tsx";
import EditPage from "@/pages/EditPage.tsx";
import SignIn from "@/components/AuthPage/SignInPage.tsx";

export default function Main(){


    return(
        <BrowserRouter>
            <Routes>
                <Route path="/sign-in" element={<SignIn/>} />
                <Route path="/" element={<Home/>}/>
                <Route path="/chats/:id" element={<Chat/>}/>
                <Route path="/edit/:video" element={<EditPage/>}/>
            </Routes>
        </BrowserRouter>
    )
}