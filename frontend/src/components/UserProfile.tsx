// UserProfile.tsx
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";

export function UserProfile() {
    const { user } = useUser();
    const username = user?.fullName || "Profile";
    const emailAddress = user?.emailAddresses[0].emailAddress || "example@clerk.clerk.com";

    return (
        <div className="p-4 flex">
            <SignedIn>
                <UserButton />
                <div className="flex flex-col ml-2">
                    <span className="text-sm">{username}</span>
                    <span className="text-sm text-neutral-400">{emailAddress}</span>
                </div>
            </SignedIn>
            <SignedOut>
                <SignInButton />
            </SignedOut>
        </div>
    );
}
