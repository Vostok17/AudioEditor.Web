import { useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import Effects from 'common/content/effects';

const useFFmpeg = () => {
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    const ffmpeg = ffmpegRef.current;
    ffmpeg.load();
  }, []);

  const applyEffect = async (
    sourceUrl: string,
    effect: Effects,
    start: number | null = null,
    end: number | null = null,
  ) => {
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile('input.wav', await fetchFile(sourceUrl));

    if (start && end) {
      // Extract the selected fragment
      await ffmpeg.exec([
        '-i',
        'input.wav',
        '-ss',
        start.toString(),
        '-to',
        end.toString(),
        '-c',
        'copy',
        'fragment.wav',
      ]);

      // Apply reverb effect to the extracted fragment
      await ffmpeg.exec(['-i', 'fragment.wav', '-af', effect, 'edited_fragment.wav']);

      // Merge the modified fragment back into the original audio
      await ffmpeg.exec([
        '-i',
        'input.wav',
        '-i',
        'edited_fragment.wav',
        '-filter_complex',
        `[0:a]atrim=end=${start},asetpts=PTS-STARTPTS[part1];[0:a]atrim=start=${end},asetpts=PTS-STARTPTS[part3];[part1][1:a][part3]concat=n=3:v=0:a=1[out]`,
        '-map',
        '[out]',
        'output.wav',
      ]);
    } else {
      await ffmpeg.exec(['-i', 'input.wav', '-af', effect, 'output.wav']);
    }

    return ffmpeg.readFile('output.wav');
  };

  return { applyEffect };
};

export default useFFmpeg;
