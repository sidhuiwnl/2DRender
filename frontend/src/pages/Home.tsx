import ChatInterface from "../components/ChatInterface.tsx";
import grad1 from "../assets/grad-4.jpg";
import {
    SignedOut,
    SignInButton,
    SignedIn,
    UserButton
} from "@clerk/clerk-react";
import {useUser} from "@clerk/clerk-react";
import {useEffect} from "react";

export default function Home() {
    const { user,isSignedIn } = useUser();


    useEffect(() => {

        async function RegisterUser(){
            if(isSignedIn && user){
                const response = await fetch("http://localhost:3000/register",{
                    method: "POST",
                    headers : {
                        "Content-Type": "application/json"
                    },
                    body : JSON.stringify({
                        fullName : user.fullName,
                        email : user.emailAddresses[0].emailAddress,
                        clerkId : user.id
                    })
                })
                const data = await response.json();

                localStorage.setItem("userId",data.id);
            }
        }

        RegisterUser();

    }, [user]);
    return (
        <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden">

            <div className="absolute top-4 right-4 z-20">
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>

            <img
                src={grad1}
                alt="Decorative background"
                className="absolute w-[1300px] h-full rounded-3xl blur-3xl opacity-70 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
            />


            <h1 className="text-5xl font-medium z-10">What do you want to render?</h1>
            <p className="text-neutral-400 z-10">Prompt, run, edit, and deploy 2d animation videos.</p>
            <ChatInterface />
        </div>
    );
}
