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

export function AppSidebar() {
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
                                    <div className="p-4">
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild>
                                                <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border hover:bg-primary/90">
                                                    <Plus size={18} />
                                                    <span>New Chat</span>
                                                </button>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
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
