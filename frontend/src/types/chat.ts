export type ContentBlock = {
    type: "text" | "code" | "link" | "loading";
    value: string ;
    language?: string;
};

export type MessageType = {
    type: "user" | "assistant";
    content: ContentBlock[];
};

export type Chat = {
    prompt: string;
    code?: string;
    video_url?: string;
    explanation?: string;
};