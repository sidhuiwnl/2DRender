import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

export const generateManimChat = async ({
                                            userId,
                                            prompt,
                                            sessionId,
                                        }: {
    userId: string;
    prompt: string;
    sessionId: string;
}) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt: prompt.trim(),
            user_id: userId,
            session_id: sessionId,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate response");
    }

    return response.json(); // Assuming the backend sends back response data
};


export const useGenerateChat = () => {
    const client = useQueryClient();

    return useMutation({
        mutationFn: generateManimChat,
        onMutate: async (newMessage) => {
            await client.cancelQueries({
                queryKey: ["messages", newMessage.sessionId],
            });

            const previousMessages = client.getQueryData(["messages", newMessage.sessionId]);

            client.setQueryData(["messages", newMessage.sessionId], (old: any) => [
                ...(old || []),
                {
                    id: `temp-${Date.now()}`,
                    prompt: newMessage.prompt,
                    role: "user",
                    pending: true,
                },
            ]);

            return { previousMessages };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousMessages) {
                client.setQueryData(["messages", _vars.sessionId], context.previousMessages);
            }
        },
        onSuccess: (data, vars) => {
            client.setQueryData(["messages", vars.sessionId], (old: any) => [
                ...(old || []),
                {
                    id: data.id,
                    prompt: data.prompt, // or `content`, depending on what the backend returns
                    code: data.code,
                    video_url: data.video_url,
                    explanation: data.explanation,
                    role: "assistant",
                },
            ]);
        },
        onSettled: (_data, _err, vars) => {
            client.invalidateQueries({ queryKey: ["messages", vars.sessionId] });
        },
    });
};



export type Chat = {
    id: string;
    prompt: string;
    code?: string;
    video_url?: string;
    explanation?: string;
};


export const useGetChatQuery = (sessionId : string) => {
    return useQuery<Chat[]>({
        queryKey : ["messages",sessionId],
        queryFn :  () => fetchChats(sessionId),
        enabled : !!sessionId,
        staleTime: 5 * 60 * 1000,
        gcTime : 10 * 60 * 1000,
    })
}

export const fetchChats = async (sessionId: string) => {
    const response = await fetch(`http://localhost:3000/manim-chat/${sessionId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return data.data?.chats || [];
};
