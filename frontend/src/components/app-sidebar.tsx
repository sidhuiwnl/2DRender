import { Home, MessageCircle, Plus } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useEffect, useState,useRef  } from "react"
import {useNavigate} from "react-router";


type SessionType = {
    id: string;
    user_id: string;
    name: string;
};



export function AppSidebar() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<SessionType[]>([])
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [tempName, setTempName] = useState<string>("");

    const inputRef = useRef<HTMLInputElement>(null);



    useEffect(() => {
        const userId = localStorage.getItem("userId")

        const fetchSessions = async () => {
            const response = await fetch(`http://localhost:3000/sessions?user_id=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const data = await response.json()


            console.log(data)
            setSessions(data.data.sessions || [])
        }
        fetchSessions()
    }, [])

    const handleDoubleClick = (sessionId : string,currentName :string) => {
        setEditingSessionId(sessionId)
        setTempName(currentName)
        setTimeout(() => inputRef.current?.focus(), 0);
    }

    const handleBlur = async (sessionId : string) => {
        setEditingSessionId(null)

        try {
            await fetch(`http://localhost:3000/session/${sessionId}`, {
                method : "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name : tempName
                })
            })

            setSessions((prev) =>
                prev.map((session) => session.id === sessionId ? {
                    ...session,
                    name : tempName
                } : session)
            )
        }catch (err) {
            console.error("Failed to update session name", err);
        }
    }

    return (
        <Sidebar>
            <SidebarContent className="flex flex-col justify-between h-full">
                <div>
                    <SidebarGroup>
                        <SidebarGroupLabel>Plura</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <a href="#">
                                            <Home />
                                            <span>Home</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <a href="#">
                                            <MessageCircle />
                                            <span>My Chat</span>
                                        </a>
                                    </SidebarMenuButton>
                                    <div className="p-4 space-y-2">
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild>
                                                    <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border hover:bg-primary/90">
                                                        <Plus size={18} />
                                                        <span>New Chat</span>
                                                    </button>
                                            </SidebarMenuButton>

                                        </SidebarMenuItem>
                                        <h1 className="mt-5">Chats</h1>
                                        {sessions.map((session) => (
                                            <SidebarMenuItem key={session.id}>
                                                <SidebarMenuButton
                                                    onDoubleClick={() => handleDoubleClick(session.id,session.name)}
                                                    onClick={() => navigate(`/chats/${session.id}`)}
                                                    asChild
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer   hover:bg-muted/40 text-sm text-white transition-all duration-150 shadow-sm"
                                                >
                                                {editingSessionId === session.id ? (
                                                    <input
                                                        ref={inputRef}
                                                        type="text"
                                                        value={tempName}
                                                        onChange={(e) => setTempName(e.target.value)}
                                                        onBlur={() => handleBlur(session.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") inputRef.current?.blur();
                                                        }}
                                                        className="bg-transparent border-none outline-none text-white w-full"
                                                    />
                                                ) : (
                                                    <span className="truncate">
                                                       └ {session.name}
                                                    </span>
                                                )}

                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}



                                    </div>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </div>
            </SidebarContent>
        </Sidebar>
    )
}

