import { Home, MessageCircle, Plus,Loader2 } from "lucide-react"
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
import { useState,useRef  } from "react"
import {useNavigate} from "react-router";
import {useSessionsQuery,useUpdateSessionMutation} from "@/queryOptions/createSessionMutation.ts";




export function AppSidebar() {
    const navigate = useNavigate();
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);

    const [tempName, setTempName] = useState<string>("");

    const inputRef = useRef<HTMLInputElement>(null);

    const userId = localStorage.getItem("userId") as string;

    const { data, isLoading : fetchingSessions,  } = useSessionsQuery(userId);
    const { mutate : updateSession} = useUpdateSessionMutation()

    const handleDoubleClick = (sessionId : string,currentName :string) => {
        setEditingSessionId(sessionId)
        setTempName(currentName)
        setTimeout(() => inputRef.current?.focus(), 0);
    }

    const handleBlur = async (sessionId : string) => {
        setEditingSessionId(null)
        setUpdatingSessionId(sessionId)
        updateSession({
            sessionId,
            tempName,
        },{
            onSettled : () => setUpdatingSessionId(null)
        })
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
                                            <SidebarMenuButton
                                                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border hover:bg-primary/90"
                                               >
                                                        <Plus size={18} />
                                                        <span>New Chat</span>

                                            </SidebarMenuButton>

                                        </SidebarMenuItem>
                                        <h1 className="mt-5">Chats</h1>
                                        { fetchingSessions ? (
                                            <Loader2  className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                {data?.data.sessions.map((session) => (
                                                    <SidebarMenuItem key={session.id}>
                                                        <SidebarMenuButton
                                                            onDoubleClick={() => handleDoubleClick(session.id,session.name)}
                                                            onClick={() => navigate(`/chats/${session.id}`)}
                                                            asChild
                                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer  hover:bg-neutral-300 hover:text-black  text-sm bg-white text-black transition-all duration-150 shadow-sm"
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
                                                                    className="bg-transparent border-none outline-none  w-full"
                                                                />
                                                            ) : (
                                                                <span className="truncate">
                                                                      {updatingSessionId === session.id ? (
                                                                          <Loader2 className="animate-spin" size={20} />
                                                                      ) : (
                                                                          session.name
                                                                      )}
                                                                </span>

                                                            )}

                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </>
                                        )}
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

