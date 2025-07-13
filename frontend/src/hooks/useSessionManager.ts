import {
    useCreateSession,
    useDeleteSession,
    useSessionsQuery,
    useUpdateSessionMutation
} from "@/queryOptions/SessionMutation.ts";
import {useQueryClient} from "@tanstack/react-query";
import {fetchChats} from "@/queryOptions/ChatMutation.ts";
import {useCallback} from "react";

export const useSessionManager = (userId : string) => {
    const { data, isLoading : fetchingSessions,  } = useSessionsQuery(userId);
    const { mutate : updateSession} = useUpdateSessionMutation()
    const { mutate, isPending} = useCreateSession();
    const { mutate : deleteSession } = useDeleteSession();


    const queryClient = useQueryClient();


    const prefetchChats = useCallback((sessionId: string) => {
        queryClient.prefetchQuery({
            queryKey: ["chats", sessionId],
            queryFn: async () => fetchChats(sessionId)
        });
    },[queryClient]);

    const handleDeleteSession = useCallback((sessionId : string) => {
        console.log("deleting session", sessionId)
        deleteSession({
            userId,
            sessionId
        })
    },[userId,deleteSession])






    return {
        prefetchChats,
        handleDeleteSession,
        data,
       fetchingSessions,
        updateSession,
        isPending,
        mutate,
    }



}