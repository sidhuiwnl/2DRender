import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"

export default function SignIn() {
    return (
        <div className="min-h-screen flex items-center justify-center  px-4 ">
            <Card className="w-full max-w-md rounded-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                    <CardDescription className="text-center">Enter your details below to create your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" type="text" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" placeholder="••••••••" required />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full">
                        Create Account
                    </Button>
                    <div className="text-sm text-center text-muted-foreground">
                        Already have an account?{" "}
                        <a href="#" className="text-primary hover:underline">
                            Sign in
                        </a>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
