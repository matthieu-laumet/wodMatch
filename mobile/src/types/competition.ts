export type Division = { price: number };
export type EventMode = { event_mode_slug: string; mode: string; order: number };
export type Tag = { id_tag: number; tag_slug: string; tag_name: string; tag_img?: string | null };
export type Favorite = { id_competition: number };

export type Competition = {
  id: number;
  name: string;
  city: string;
  startDate: string;
  id_competition: number;
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

// Types de l'écran. Chaque champ indique la table / colonne d'où il viendra.

export type PipelineStep = 'match' | 'exchange' | 'wod_test' | 'roster';

/** Quelqu'un (ou une team) qui m'a liké : swipes.direction = 'like' */
export interface Liker {
  id: string;
  name: string;
  avatarUrl?: string;  // wm_users photo, ou team_photos.url pour une team
}

/** matches.status -> étape du pipeline */
export interface MatchSummary {
  id: number;          // id_match
  name: string;
  step: PipelineStep;
  nextLabel?: string;  // ex. 'WOD test sam. 14'
}

export interface Slot {                // team_slots
  gender: 'F' | 'H' | null;
  filledBy: number | null;             // filled_by (null = place libre)
}

/** Onglet « Je recrute » : une team que j'ai créée (teams.created_by) */
export interface RecruitItem {
  competition: Competition;
  team: { id: number; name: string; division: string; slots: Slot[] };
  likers: Liker[];                     // swipes vers id_team_to = team.id
  matches: MatchSummary[];             // matches.id_team = team.id
  id: number; 
  name: string; 
  city: string; 
  startDate: string; 
  division_name: string; 
}


/** Onglet « Je rejoins » : je suis seul·e (user_searches.is_active) */
export interface JoinItem {
  competition: Competition;
  division: string;                    // user_search_divisions -> divisions
  searchActive: boolean;               // user_searches.is_active
  likers: Liker[];                     // teams qui m'ont liké (id_user_to = moi)
  matches: MatchSummary[];             // matches.id_user = moi
}