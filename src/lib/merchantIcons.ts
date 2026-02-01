import {
    ShoppingCart, Coffee, Utensils, Car, Fuel, Home, Zap, Wifi,
    Smartphone, Laptop, Music, Film, Gamepad2, Dumbbell, Heart,
    Hotel, ShoppingBag, Gift,
    type LucideIcon
} from 'lucide-react';

export interface MerchantIconConfig {
    icon: LucideIcon;
    color: string;
}

// Merchant keyword to icon mapping
const merchantPatterns: Record<string, MerchantIconConfig> = {
    // Food & Dining
    'uber eats': { icon: Utensils, color: '#10b981' },
    'deliveroo': { icon: Utensils, color: '#00ccbc' },
    'mcdonald': { icon: Utensils, color: '#ffc72c' },
    'starbucks': { icon: Coffee, color: '#00704a' },
    'costa': { icon: Coffee, color: '#e03c31' },
    'restaurant': { icon: Utensils, color: '#f59e0b' },
    'cafe': { icon: Coffee, color: '#8b4513' },
    'pizza': { icon: Utensils, color: '#ef4444' },

    // Transport
    'uber': { icon: Car, color: '#000000' },
    'lyft': { icon: Car, color: '#ff00bf' },
    'taxi': { icon: Car, color: '#f59e0b' },
    'shell': { icon: Fuel, color: '#fbce07' },
    'bp': { icon: Fuel, color: '#00853f' },
    'total': { icon: Fuel, color: '#ee1c25' },
    'essence': { icon: Fuel, color: '#64748b' },

    // Utilities
    'edf': { icon: Zap, color: '#ff6600' },
    'engie': { icon: Zap, color: '#00aaff' },
    'orange': { icon: Wifi, color: '#ff7900' },
    'sfr': { icon: Wifi, color: '#e2001a' },
    'bouygues': { icon: Wifi, color: '#009fe3' },
    'free': { icon: Wifi, color: '#cc0000' },

    // Tech & Electronics
    'apple': { icon: Smartphone, color: '#000000' },
    'samsung': { icon: Smartphone, color: '#1428a0' },
    'microsoft': { icon: Laptop, color: '#00a4ef' },
    'amazon': { icon: ShoppingCart, color: '#ff9900' },

    // Entertainment
    'netflix': { icon: Film, color: '#e50914' },
    'disney': { icon: Film, color: '#113ccf' },
    'spotify': { icon: Music, color: '#1db954' },
    'apple music': { icon: Music, color: '#fa243c' },
    'youtube': { icon: Film, color: '#ff0000' },
    'playstation': { icon: Gamepad2, color: '#003791' },
    'xbox': { icon: Gamepad2, color: '#107c10' },

    // Health & Fitness
    'salle de sport': { icon: Dumbbell, color: '#ef4444' },
    'gym': { icon: Dumbbell, color: '#ef4444' },
    'pharmacie': { icon: Heart, color: '#10b981' },

    // Shopping
    'carrefour': { icon: ShoppingCart, color: '#0055a5' },
    'auchan': { icon: ShoppingCart, color: '#ed1c24' },
    'leclerc': { icon: ShoppingCart, color: '#005ca9' },
    'zara': { icon: ShoppingBag, color: '#000000' },
    'h&m': { icon: ShoppingBag, color: '#e50010' },

    // Other
    'hotel': { icon: Hotel, color: '#8b5cf6' },
    'airbnb': { icon: Home, color: '#ff5a5f' },
    'booking': { icon: Hotel, color: '#003580' },
    'cadeau': { icon: Gift, color: '#ec4899' },
};

export function getMerchantIcon(description: string): MerchantIconConfig | null {
    const lowerDesc = description.toLowerCase();

    for (const [keyword, config] of Object.entries(merchantPatterns)) {
        if (lowerDesc.includes(keyword)) {
            return config;
        }
    }

    return null;
}
