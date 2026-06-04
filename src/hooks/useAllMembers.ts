import { useEffect, useState } from "react";
import { getAllMembers } from "../firebase/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Member } from "../utils/types";

export interface MemberWithSponsor extends Member {
    sponsorName: string;
}

export const useAllMembers = () => {
    const [members, setMembers] = useState<MemberWithSponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);

            const raw = await getAllMembers();
            const sponsorUids = [...new Set(raw.map((m: any) => m.referredBy).filter(Boolean))];

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

            const withSponsors: MemberWithSponsor[] = raw.map((m: any) => ({
                ...m,
                sponsorName: m.referredBy ? (sponsorMap[m.referredBy] ?? "—") : "—",
            }));

            if (!cancelled) {
                setMembers(withSponsors);
                setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [tick]);

    const refetch = () => setTick((t) => t + 1);

    return { members, loading, refetch };
};

export default useAllMembers;
