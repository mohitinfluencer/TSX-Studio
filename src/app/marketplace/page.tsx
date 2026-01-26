import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MarketplaceClient } from "./marketplace-client";

export default async function MarketplacePage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    return <MarketplaceClient />;
}
