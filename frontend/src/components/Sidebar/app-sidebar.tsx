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
} from "@/components/ui/sidebar.tsx"
import {useNavigate} from "react-router";
import {SignedOut,SignInButton,SignedIn,UserButton} from "@clerk/clerk-react";
import {useUser} from "@clerk/clerk-react";
import {useSessionManager} from "@/hooks/useSessionManager.ts";
import {SidebarSessionItem} from "@/components/SidebarSessionItems.tsx";


export function AppSidebar() {
    const navigate = useNavigate();
    const { user } = useUser();
    const username = user?.fullName || "Profile";
    const emailAddress = user?.emailAddresses[0].emailAddress || "example@clerk.clerk.com";
    const userId = localStorage.getItem("userId") as string;




    const  { prefetchChats,handleDeleteSession,fetchingSessions,updateSession,isPending,mutate,data } = useSessionManager(userId);






    const renderNewChatButton = () => {

        return isPending ? (
            <>
                <Loader2 className="animate-spin" size={18} />
                <span>Creating...</span>
            </>
        ) : (
            <>
                <Plus size={18} />
                <span>New Chat</span>
            </>
        );
    }

    return (
        <Sidebar className="border-none">
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
                                                onClick={() => {
                                                    mutate(userId)
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border hover:bg-neutral-800 cursor-pointer"
                                            >
                                                {renderNewChatButton()}
                                            </SidebarMenuButton>

                                        </SidebarMenuItem>
                                        <h1 className="mt-5">Prompt History</h1>
                                        { fetchingSessions ? (
                                            <Loader2  className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                {data?.map((session) => (
                                                    <SidebarSessionItem
                                                        key={session.id}
                                                        session={session}
                                                        onRename={(id, name) => updateSession({ sessionId: id, tempName: name, userId })}
                                                        onDelete={handleDeleteSession}
                                                        onNavigate={(id) => navigate(`/chats/${id}`)}
                                                        onPrefetch={prefetchChats}
                                                    />
                                                ))}

                                            </>
                                        )}
                                    </div>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                </div>
                <div className="p-4 flex">
                    <SignedIn>
                        <UserButton />
                        <div className="flex flex-col ml-2 ">
                            <span className="text-sm">{username}</span>
                            <span className="text-sm text-neutral-400">{emailAddress}</span>
                        </div>

                    </SignedIn>
                    <SignedOut>
                        <SignInButton/>
                    </SignedOut>
                </div>

            </SidebarContent>
        </Sidebar>
    )
}

