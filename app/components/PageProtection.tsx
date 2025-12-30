"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ProtectedProps {
    children: ReactNode;
}
export default function Protected({ children }: ProtectedProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect only after render (safe)
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin"); // clean redirect
        }
    }, [status, router]);

    if (status === "loading") return null;

    if (!session) return null; // prevent rendering until redirect happens

    return <>{children}</>;
}
