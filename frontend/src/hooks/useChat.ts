
import {useGenerateChat} from "@/queryOptions/ChatMutation.ts";



export  function useSendMessage({
                                   sessionId,
                                   adjustHeight,
                               }: {
    sessionId: string;
    adjustHeight?: (reset?: boolean) => void;
}) {


    const { mutateAsync,isPending,isSuccess } = useGenerateChat();



    const sendMessage = async (prompt: string) => {
        if (!prompt.trim()) return;


        const userId = localStorage.getItem("userId");

        if (!userId) {
            console.error("No userId found in localStorage");
            return;
        }


        if (adjustHeight) adjustHeight(true);

        await mutateAsync({
            userId,
            prompt : prompt.trim(),
            sessionId
        })


    }
    return {
        sendMessage,
        isSuccess,
        isPending,
    }
}
