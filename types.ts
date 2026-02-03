
export enum Step {
  LANDING = 'LANDING',
  STORY = 'STORY',
  QUESTION = 'QUESTION',
  SUCCESS = 'SUCCESS'
}

export interface StorySlide {
  emoji: string;
  text: string;
  subtext?: string;
  imageUrl?: string;
}
