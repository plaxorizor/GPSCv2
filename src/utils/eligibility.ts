export const ELIGIBILITY_MILESTONES = [
    { label: "Accidental Death Assistance", months: 1, days: 30},
    { label: "Natural Death (₱20,000 tier)", months: 5, days: 150 },
    { label: "Hospital Cash Assistance", months: 6, days: 180 },
    { label: "Birthday Care Gift", months: 8, days: 240 },
    { label: "Natural/Accidental (₱40,000 tier)", months: 10, days: 300 },
];

export const getEligibilityTimeline = (dateCreated: Date | { toDate: () => Date }) => {
    if (!dateCreated) return ELIGIBILITY_MILESTONES.map((m) => ({ ...m, unlocked: false }));

    const joinDate: Date = typeof dateCreated === "object" && "toDate" in dateCreated ? dateCreated.toDate() : new Date(dateCreated);
    const now = new Date();
    const monthsElapsed = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth());
    const daysElapsed = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24);

    return ELIGIBILITY_MILESTONES.map((m) => ({
        ...m,
        unlocked: (monthsElapsed >= m.months && daysElapsed >= m.days),
    }));
};
