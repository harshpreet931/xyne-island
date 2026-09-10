import {Config} from '@remotion/cli/config';

// Codec-specific quality flags live in the npm scripts: setting them globally
// breaks the GIF render, which rejects --crf.
Config.setVideoImageFormat('png');
Config.setEntryPoint('./src/index.ts');
