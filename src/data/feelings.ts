export interface TertiaryEmotion {
  name: string;
}

export interface SecondaryEmotion {
  name: string;
  tertiary: string[];
}

export interface CoreEmotion {
  name: string;
  color: string;
  bgColor: string;
  emoji: string;
  secondary: SecondaryEmotion[];
}

export const feelingsData: CoreEmotion[] = [
  {
    name: 'Happy',
    color: '#b45309',
    bgColor: '#fef3c7',
    emoji: '😊',
    secondary: [
      { name: 'Optimistic', tertiary: ['Inspired', 'Hopeful'] },
      { name: 'Trusting', tertiary: ['Intimate', 'Sensitive'] },
      { name: 'Peaceful', tertiary: ['Thankful', 'Loving'] },
      { name: 'Powerful', tertiary: ['Creative', 'Courageous'] },
      { name: 'Accepted', tertiary: ['Valued', 'Respected'] },
      { name: 'Proud', tertiary: ['Confident', 'Successful'] },
      { name: 'Interested', tertiary: ['Inquisitive', 'Curious'] },
      { name: 'Content', tertiary: ['Joyful', 'Free'] },
      { name: 'Playful', tertiary: ['Cheeky', 'Aroused'] },
    ],
  },
  {
    name: 'Surprised',
    color: '#9d174d',
    bgColor: '#fce7f3',
    emoji: '😲',
    secondary: [
      { name: 'Excited', tertiary: ['Energetic', 'Eager'] },
      { name: 'Amazed', tertiary: ['Awe', 'Astonished'] },
      { name: 'Confused', tertiary: ['Perplexed', 'Disillusioned'] },
      { name: 'Startled', tertiary: ['Dismayed', 'Shocked'] },
    ],
  },
  {
    name: 'Fearful',
    color: '#5b21b6',
    bgColor: '#ede9fe',
    emoji: '😨',
    secondary: [
      { name: 'Scared', tertiary: ['Helpless', 'Frightened'] },
      { name: 'Anxious', tertiary: ['Overwhelmed', 'Worried'] },
      { name: 'Insecure', tertiary: ['Inadequate', 'Inferior'] },
      { name: 'Weak', tertiary: ['Worthless', 'Insignificant'] },
      { name: 'Rejected', tertiary: ['Excluded', 'Persecuted'] },
      { name: 'Threatened', tertiary: ['Nervous', 'Exposed'] },
    ],
  },
  {
    name: 'Angry',
    color: '#991b1b',
    bgColor: '#fee2e2',
    emoji: '😠',
    secondary: [
      { name: 'Let Down', tertiary: ['Betrayed', 'Resentful'] },
      { name: 'Humiliated', tertiary: ['Disrespected', 'Ridiculed'] },
      { name: 'Bitter', tertiary: ['Indignant', 'Violated'] },
      { name: 'Mad', tertiary: ['Furious', 'Jealous'] },
      { name: 'Aggressive', tertiary: ['Provoked', 'Hostile'] },
      { name: 'Frustrated', tertiary: ['Infuriated', 'Annoyed'] },
      { name: 'Distant', tertiary: ['Withdrawn', 'Numb'] },
      { name: 'Critical', tertiary: ['Sceptical', 'Dismissive'] },
    ],
  },
  {
    name: 'Disgusted',
    color: '#065f46',
    bgColor: '#d1fae5',
    emoji: '🤢',
    secondary: [
      { name: 'Disapproving', tertiary: ['Judgemental', 'Embarrassed'] },
      { name: 'Disappointed', tertiary: ['Appalled', 'Revolted'] },
      { name: 'Awful', tertiary: ['Nauseated', 'Detestable'] },
      { name: 'Repelled', tertiary: ['Horrified', 'Hesitant'] },
    ],
  },
  {
    name: 'Sad',
    color: '#1e40af',
    bgColor: '#dbeafe',
    emoji: '😢',
    secondary: [
      { name: 'Hurt', tertiary: ['Embarrassed', 'Disappointed'] },
      { name: 'Depressed', tertiary: ['Inferior', 'Empty'] },
      { name: 'Guilty', tertiary: ['Remorseful', 'Ashamed'] },
      { name: 'Despair', tertiary: ['Powerless', 'Grief'] },
      { name: 'Vulnerable', tertiary: ['Fragile', 'Victimised'] },
      { name: 'Lonely', tertiary: ['Abandoned', 'Isolated'] },
    ],
  },
  {
    name: 'Bad',
    color: '#374151',
    bgColor: '#f3f4f6',
    emoji: '😞',
    secondary: [
      { name: 'Bored', tertiary: ['Indifferent', 'Apathetic'] },
      { name: 'Busy', tertiary: ['Pressured', 'Rushed'] },
      { name: 'Stressed', tertiary: ['Overwhelmed', 'Out of Control'] },
      { name: 'Tired', tertiary: ['Sleepy', 'Unfocused'] },
    ],
  },
];
