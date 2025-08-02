import {
    SignedOut,
    SignInButton,
    SignedIn,
    UserButton
} from "@clerk/clerk-react";
import useSignedIn from "@/hooks/useSignedIn.ts";
import {Button} from "@/components/ui/button.tsx";
import {ChevronRight} from "lucide-react";
import {useNavigate} from "react-router";

export default function Home() {
    const navigate = useNavigate();
    const auth = useSignedIn();

    // Show loading state while authentication is being determined
    if (auth.isLoading) {
        return (
            <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-4 right-4 z-20">
                    <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                </div>
                <div className="flex items-center justify-center">
                    <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mr-3"></div>
                    <span className="text-lg">Loading...</span>
                </div>
            </div>
        );
    }



    // Show error state if registration failed
    if (auth.registrationError) {
        return (
            <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-4 right-4 z-20">
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
                <div className="flex flex-col items-center max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold mb-2 text-red-600">Setup Error</h2>
                    <p className="text-gray-600 mb-4">We encountered an issue setting up your account:</p>
                    <p className="text-sm text-red-600 mb-6">{auth.registrationError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }


    // Main application UI
    return (
        <div
            className="relative h-screen flex flex-col items-center justify-center overflow-hidden"

        >
            <div className="absolute top-4 right-4 z-20">
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>

            {/* Welcome message for new users */}
            {auth.isNewUser && auth.isSignedIn && (
                <div className="absolute top-20 right-4 z-20 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded max-w-sm">
                    <div className="flex">
                        <div className="py-1">
                            <svg className="fill-current h-4 w-4 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold">Welcome!</p>
                            <p className="text-sm">Your account has been set up successfully.</p>
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-7xl font-bold z-10">What do you want to render?</h1>
            <p className="z-10 m-5">Prompt, run, edit, and deploy 2d animation videos.</p>


            {auth.isSignedIn && auth.backendUser && (
                <Button
                    className="cursor-pointer"
                    onClick={() => navigate("/chat")}
                >
                    Get Started
                    <ChevronRight/>
                </Button>
            )}


            {!auth.isSignedIn && (
                <div className="z-10 mt-8 text-center">
                    <p className="text-gray-400 mb-4">Sign in to start creating amazing animations</p>
                    <SignInButton>
                        <button className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold">
                            Get Started
                        </button>
                    </SignInButton>
                </div>
            )}
        </div>
    );
}