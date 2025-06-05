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
import { useEffect, useState } from "react"
import {useNavigate} from "react-router";

export function AppSidebar() {
    const navigate = useNavigate();

    const [sessions, setSessions] = useState<{ id: string; user_id: string }[]>([])



    useEffect(() => {
        const userId = localStorage.getItem("userId")
        const fetchSessions = async () => {
            const response = await fetch(`http://localhost:3000/sessions?userId=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const data = await response.json()

            console.log(data)

            setSessions(data.sessions || [])
        }
        fetchSessions()
    }, [])

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
                                                    onClick={() => navigate(`/chats/${session.id}`)}
                                                    asChild
                                                >
                                                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-muted bg-muted/20 hover:bg-muted/40 text-sm text-white transition-all duration-150 shadow-sm">

                                                        <span className="truncate">
                    {session.id.slice(0, 10)}...{session.id.slice(-4)}
                </span>
                                                    </button>
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
