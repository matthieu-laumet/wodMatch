export type Division = { price: number };
export type EventMode = { event_mode_slug: string; mode: string; order: number };
export type Tag = { id_tag: number; tag_slug: string; tag_name: string; tag_img?: string | null };
export type Favorite = { id_competition: number };

export type Competition = {
  id_competition: number;
  name: string;
  compet_name?: string;
  begin: string;
  end: string;
  img_small?: string;
  location?: string;
  divisions: Division[];
  event_mode: EventMode[];
  tags?: { tag_slug: string }[];
  compet_adresse?: string;
  compet_code_postal?: string;
  compet_ville?: string;
  coordinates?: { lat: number | string; lon: number | string }[];
  // ajoutés par la recherche géographique
  distance?: number;
  queryMatchCity?: string;
};

export type SearchMode = {
  id_search_mode: number;
  icon: string;
  label_short: string;
};

export type Searching = { gender: string | null; count: number };

export type TeamMember = {
  id_user: number;
  role: string;
  first_name?: string;
  last_name?: string;
  avatar?: string | null;
  club_name?: string | null;
  age: number | null;
};

export type TeamProfile = {
  type: 'team';
  id_team: number;
  name: string;
  bio: string | null;
  objective: string | null;
  division: { id_division: number; name: string | null };
  members: TeamMember[];
  searching: Searching[];
  avg_age: number | null;
  skills: string[];
  objective_skills: string[];
  fun_reps: { label: string; description: string }[];
  photos: string[];
};