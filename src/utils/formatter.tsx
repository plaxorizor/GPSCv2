export const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString("en-PH")}`;
};

export const formatDate = (dateString: string | null): string => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};
