export interface TierItem {
  id: string;
  name: string;
  tierId: string;
  imageUrl?: string; // Base64 or URL for images
  color?: string;
  note?: string;
}

export interface Tier {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface RankingBoard {
  id: string;
  title: string;
  tiers: Tier[];
  items: TierItem[];
}
