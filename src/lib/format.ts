export const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(new Date(dateString));
};
