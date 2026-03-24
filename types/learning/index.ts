export type UnifiedLessonBlock = {
  id: string;
  type: string;
  title?: string;
  content?: string;
  order: number;
  config?: Record<string, unknown>;
};

export type UnifiedLesson = {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  estimatedDuration: number;
  status: string;
  blocks: UnifiedLessonBlock[];
};

export type UnifiedModule = {
  id: string;
  trackId: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  status: string;
  xpReward: number;
  lessons: UnifiedLesson[];
};

export type UnifiedTrack = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  status: string;
  modules: UnifiedModule[];
};
