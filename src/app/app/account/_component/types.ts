export type User = {
name: string;
email: string;
handle?: string;
joinedAt?: string;
avatarUrl?: string;
};


export type PLPoint = {
date: string; // YYYY-MM-DD
value: number; // net P/L for the day
};