import React from 'react';
import {Composition} from 'remotion';
import {HERO_DURATION, HERO_FPS, HERO_HEIGHT, HERO_WIDTH, HeroLoop} from './HeroLoop';
import {FILM_DURATION, FILM_FPS, FILM_HEIGHT, FILM_WIDTH, LaunchFilm} from './LaunchFilm';
import {TOUR_DURATION, TOUR_FPS, TOUR_HEIGHT, TOUR_WIDTH, TourFilm} from './TourFilm';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="HeroLoop"
      component={HeroLoop}
      durationInFrames={HERO_DURATION}
      fps={HERO_FPS}
      width={HERO_WIDTH}
      height={HERO_HEIGHT}
      defaultProps={{drift: true}}
    />
    <Composition
      id="LaunchFilm"
      component={LaunchFilm}
      durationInFrames={FILM_DURATION}
      fps={FILM_FPS}
      width={FILM_WIDTH}
      height={FILM_HEIGHT}
    />
    <Composition id="TourFilm" component={TourFilm} durationInFrames={TOUR_DURATION} fps={TOUR_FPS} width={TOUR_WIDTH} height={TOUR_HEIGHT} />
  </>
);
