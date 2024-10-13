import { useContext, useEffect, useMemo, useRef } from 'react';
import { useWavesurfer } from '@wavesurfer/react';
import { FileContext } from 'src/common/contexts/fileContext';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';

const AudioWaveform = () => {
  const containerRef = useRef(null);
  const { fileURL } = useContext(FileContext);

  const { wavesurfer } = useWavesurfer({
    container: containerRef,
    autoCenter: true,
    cursorColor: 'violet',
    waveColor: '#211027',
    progressColor: '#69207F',
    url: fileURL,
    // @ts-ignore
    plugins: useMemo(() => [Timeline.create()], []),
  });

  useEffect(() => {
    if (wavesurfer) {
      // wsf.on('ready', () => {
      //   wsf.play();
      // });
    }
  }, [wavesurfer]);

  return (
    <section className="waveform-container">
      <div ref={containerRef} />
    </section>
  );
};

export default AudioWaveform;
