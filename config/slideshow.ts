export interface SlideConfig {
  title: string;
  url: string;
  duration: number; // seconds
}

export const SLIDESHOW_SLIDES: SlideConfig[] = [
  {
    title: 'TOURNAMENT OVERVIEW',
    url: '/',
    duration: 10,
  },
  {
    title: 'FIFA KNOCKOUT BRACKET',
    url: '/fifa',
    duration: 20,
  },
  {
    title: 'FIFA GROUP STANDINGS',
    url: '/fifa/groups',
    duration: 15,
  },
  {
    title: 'DART CHALLENGE',
    url: '/dart',
    duration: 15,
  },
  {
    title: 'TABLE TENNIS BRACKET',
    url: '/table-tennis',
    duration: 20,
  },
  {
    title: 'TABLE TENNIS GROUPS',
    url: '/table-tennis/groups',
    duration: 15,
  },
];

export const SLIDESHOW_PRESETS = {
  quick: 5,      // 5 seconds per slide
  standard: 15,  // 15 seconds per slide
  detailed: 30,  // 30 seconds per slide
};
