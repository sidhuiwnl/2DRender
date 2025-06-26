import { toast } from "sonner";
import {useMutation, useQuery,useQueryClient} from "@tanstack/react-query";
import { useNavigate } from "react-router";



type SessionResponseData = {
    success: boolean;
    message: string;
    data: {
        sessionId: string;
    };
}

type Session = {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
};


// type SessionsType = {
//     sessions: Session[];
// };

// type SessionsResponseData = {
//     success: boolean;
//     message: string;
//     data: SessionsType[];
// }


export const createSession = async (userId: string): Promise<SessionResponseData> => {

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/session`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: userId,
        })
    });

    if (!response.ok) {
        throw new Error("Could not create session");
    }

    return response.json();
};

export const useCreateSession = () => {

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => createSession(userId),
        onSuccess: (data) => {
            navigate(`/chats/${data.data.sessionId}`);
            queryClient.invalidateQueries({
                queryKey : ["sessions"]
            })
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });
};


const getSession = async (userId: string): Promise<Session[]> => {
    const response = await fetch(`http://localhost:3000/sessions?user_id=${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    if (!response.ok) {
        throw new Error("Failed to fetch sessions");
    }

    const data = await response.json();

    return data.data.sessions;
}

export const useSessionsQuery = (userId: string) => {
    return useQuery({
        queryKey: ['sessions', userId],
        queryFn: () => getSession(userId),
        enabled: !!userId // only runs if userId is truthy
    });
};



export const updateSession = async (sessionId : string,tempName : string) => {
    const response = await fetch(`http://localhost:3000/session/${sessionId}`, {
        method : "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name : tempName
        })
    })

    if (!response.ok) {
        throw new Error("Could not update session");
    }

}

export const useUpdateSessionMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, tempName }: { sessionId: string; tempName: string }) =>
            updateSession(sessionId, tempName),

        onSuccess : () =>{
            queryClient.invalidateQueries({
                queryKey : ["sessions"]
            })
        },
        onError: (error) => {
            console.error("Failed to update session:", error);
        },
    })
}



export const deleteSession = async (userId: string,sessionId : string) => {
    try {
        const response = await fetch(`http://localhost:3000/session/${sessionId}?userId=${userId}`, {
            method: "DELETE"
        })
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to delete session");
        }
        const data = await response.json();
        return data;
    }catch (error) {
        console.error("Error deleting session:", error);
        throw error;
    }

}

export const useDeleteSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn : async ({ userId,sessionId} : {
            userId : string,
            sessionId : string
        }) => {
            await deleteSession(userId,sessionId)
        },

        onMutate : async ({ sessionId,userId }) => {
            await queryClient.cancelQueries({
                queryKey : ["sessions",userId],
            })

            const previousSessions = queryClient.getQueryData<Session[]>(["sessions",userId]);

            queryClient.setQueryData<Session[]>(["sessions",userId],old =>
                old?.filter((session) => session.id !== sessionId)
            )

            return { previousSessions };
        },

        onError : (_err,_vars,context) => {
            if (context?.previousSessions) {
                queryClient.setQueryData(["sessions",_vars.userId], context.previousSessions);
            }
        },
        onSettled: (_data, _err, variables) => {
            queryClient.invalidateQueries({ queryKey: ["sessions",variables.userId] });
        },

    })
}