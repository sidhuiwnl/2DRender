import {useMutation,useQueryClient} from "@tanstack/react-query";

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
        mutationFn : generateManimChat,
        onMutate : async (newMessage ) => {
            await client.cancelQueries({
                queryKey : ["messages",newMessage.sessionId],
            })

            const previousMessages = client.getQueryData(["messages", newMessage.sessionId]);

            client.setQueryData(["messages",newMessage.sessionId],(old : any) => [
                ...(old || []),{
                    id: `temp-${Date.now()}`,
                    content: newMessage.prompt,
                    role: "user",
                    pending: true,
                }
            ])

            return { previousMessages }
        },
        onError: (_err, _vars, context) => {
            if (context?.previousMessages) {
                client.setQueryData(["messages", _vars.sessionId], context.previousMessages);
            }
        },
        onSuccess: (data, vars) => {
            // Append the AI response to message list (if data contains it)
            client.setQueryData(["messages", vars.sessionId], (old: any) => [
                ...(old || []),
                {
                    id: data.id,
                    content: data.content,
                    role: "assistant",
                },
            ]);
        },
        onSettled: (_data, _err, vars) => {
            client.invalidateQueries({ queryKey: ["messages", vars.sessionId] });
        },
    })
}