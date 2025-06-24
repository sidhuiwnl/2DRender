import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {useUser} from "@clerk/clerk-react";

interface UserRegistrationData {
    fullName: string;
    email: string;
    clerkId: string;
}

export interface BackendUser {
    id: string;
}

// API functions
const registerUser = async (userData: UserRegistrationData): Promise<BackendUser> => {
    const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
    }

    const data =  await response.json();
    localStorage.setItem("userId",data.data.id);
    return data;
};

const checkUserExists = async (clerkId: string): Promise<BackendUser | null> => {
    const response = await fetch(`http://localhost:3000/user/${clerkId}`);

    if (response.status === 404) {
        return null; // User doesn't exist
    }

    if (!response.ok) {
        throw new Error(`Failed to check user: ${response.statusText}`);
    }


     const data =  await response.json();

    return data;

};

export default function useSignedIn() {
    const { user, isSignedIn, isLoaded } = useUser();
    const queryClient = useQueryClient();
    const [hasCheckedUser, setHasCheckedUser] = useState(false);

    // Check if user exists in backend
    const { data: backendUser, isLoading: isCheckingUser } = useQuery({
        queryKey: ["user", user?.id],
        queryFn: () => {
            if (!user?.id) return Promise.resolve(null);
            return checkUserExists(user.id);
        },
        enabled: !!user?.id && isSignedIn && isLoaded,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,


    });

    // Register new user mutation
    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {

            queryClient.setQueryData(["user", user?.id], data);
        },
        onError: (error) => {
            console.error("Registration failed:", error);
        }
    });

    // Effect to handle first-time user registration
    useEffect(() => {
        if (
            isLoaded &&
            isSignedIn &&
            user &&
            !isCheckingUser &&
            backendUser === null &&
            !hasCheckedUser &&
            !registerMutation.isPending
        ) {
            setHasCheckedUser(true);

            // User doesn't exist in backend, register them
            registerMutation.mutate({
                fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.emailAddresses[0]?.emailAddress || '',
                clerkId: user.id
            });
        }
    }, [
        user,
        isSignedIn,
        isLoaded,
        backendUser,
        isCheckingUser,
        hasCheckedUser,
        registerMutation
    ]);

    // Reset state when user signs out
    useEffect(() => {
        if (!isSignedIn) {
            setHasCheckedUser(false);

        }
    }, [isSignedIn]);

    // Return loading state while Clerk is initializing
    if (!isLoaded) {
        return {
            isLoading: true,
            user: null,
            backendUser: null,
            isSignedIn: false,
            isRegistering: false,
            registrationError: null
        };
    }

    // Return signed out state
    if (!isSignedIn || !user) {
        return {
            isLoading: false,
            user: null,
            backendUser: null,
            isSignedIn: false,
            isRegistering: false,
            registrationError: null
        };
    }

    // Return signed in state
    return {
        isLoading: isCheckingUser,
        user,
        backendUser,
        isSignedIn: true,
        isRegistering: registerMutation.isPending,
        registrationError: registerMutation.error?.message || null,
        isNewUser: backendUser === null && !registerMutation.data
    };
}
