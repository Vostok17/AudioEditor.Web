import { useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const useFFmpeg = () => {
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    const ffmpeg = ffmpegRef.current;
    ffmpeg.load();
    console.log('ffmpeg loaded');
  }, []);

  const effects = {
    reverb: 'aecho=0.8:0.88:60:0.4',
    echo: 'aecho=0.8:0.9:1000:0.3',
    normalize: 'dynaudnorm',
    bassBoost: 'bass=g=20',
    trebleBoost: 'treble=g=5',
    chorus: 'chorus=0.7:0.9:55:0.4:0.25:2',
  };

  const applyEffect = async (sourceUrl, effect, start = null, end = null) => {
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
      await ffmpeg.exec(['-i', 'fragment.wav', '-af', effects[effect], 'edited_fragment.wav']);

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
      await ffmpeg.exec(['-i', 'input.wav', '-af', effects[effect], 'output.wav']);
    }

    const fileData = await ffmpeg.readFile('output.wav');

    // @ts-ignore
    const data = new Uint8Array(fileData);
    return data;
  };

  return { applyEffect };
};

export default useFFmpeg;
