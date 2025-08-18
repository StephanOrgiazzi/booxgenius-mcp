export interface Character {
  name: string;
  role: 'protagoniste' | 'antagoniste' | 'secondaire' | 'figurant';
  age?: number;
  background: string;
  personality: string[];
  relationships?: Record<string, string>;
  arc?: {
    start: string;
    end: string;
  };
}

export interface ChapterOutline {
  chapter_number: number;
  title: string;
  summary: string;
  key_events: string[];
  characters_involved: string[];
  target_scenes: number;
}

export interface SceneMetadata {
  chapter: number;
  scene: number;
  characters: string[];
  location: string;
  mood: string;
}

export interface BookConfig {
  title: string;
  author: string;
  style_guide: string;
}
