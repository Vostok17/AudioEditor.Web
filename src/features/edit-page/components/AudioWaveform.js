import { useContext, useEffect, useRef, useState } from 'react';
import { FileContext } from 'src/common/contexts/fileContext';
import wavesurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';

const AudioWaveform = () => {
  const wavesurferRef = useRef(null);

  const { fileURL } = useContext(FileContext);

  const [wsf, setWsf] = useState(null);

  useEffect(() => {
    if (wavesurferRef.current && !wsf) {
      setWsf(
        wavesurfer.create({
          container: '#waveform',
          autoCenter: true,
          cursorColor: 'violet',
          waveColor: '#211027',
          progressColor: '#69207F',
          // @ts-ignore
          plugins: [TimelinePlugin.create()],
        }),
      );
    }
  }, [wavesurferRef, wsf, fileURL]);

  useEffect(() => {
    if (fileURL && wsf) {
      wsf.load(fileURL);
    }
  }, [fileURL, wsf]);

  useEffect(() => {
    if (wsf) {
      if (wsf) {
        wsf.on('ready', () => {
          wsf.play();
        });
      }
    }
  }, [wsf]);

  return (
    <section className="waveform-container">
      <div ref={wavesurferRef} id="waveform" />
    </section>
  );
};

export default AudioWaveform;
