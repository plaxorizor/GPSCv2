import { useEffect, useState } from "react";
import { getAllMembers } from "../firebase/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Member } from "../pages/types";

export interface MemberWithSponsor extends Member {
    sponsorName: string;
}

export const useAllMembers = () => {
    const [members, setMembers] = useState<MemberWithSponsor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const raw = await getAllMembers();

            // Collect unique sponsor UIDs
            const sponsorUids = [...new Set(raw.map((m: any) => m.referredBy).filter(Boolean))];

            // Fetch all sponsor docs in parallel
            const sponsorMap: Record<string, string> = {};
            await Promise.all(
                sponsorUids.map(async (uid: string) => {
                    const snap = await getDoc(doc(db, "members", uid));
                    if (snap.exists()) {
                        const d = snap.data();
                        sponsorMap[uid] = `${d.firstName} ${d.lastName}`;
                    }
                }),
            );

            // Attach sponsor name to each member
            const withSponsors: MemberWithSponsor[] = raw.map((m: any) => ({
                ...m,
                sponsorName: m.referredBy ? (sponsorMap[m.referredBy] ?? "—") : "—",
            }));

            setMembers(withSponsors);
            setLoading(false);
        };
        fetch();
    }, []);

    return { members, loading };
};
