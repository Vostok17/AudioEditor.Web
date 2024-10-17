import { useState } from 'react';
import { ButtonGroup, Container, Row } from 'react-bootstrap';
import AudioWaveform from './components/audio-waveform/AudioWaveform';
import './edit-page.css';

const EditPage = () => {
  const [selectedEffect, setSelectedEffect] = useState('');

  const handleEffectApply = () => setSelectedEffect('');

  const handleRadioChange = event => {
    setSelectedEffect(event.target.id);
  };

  return (
    <Container className="edit-page p-5" fluid>
      <Row>
        <ButtonGroup>
          <div className="btn-group" role="group">
            <input
              type="radio"
              className="btn-check"
              name="audio-options"
              id="reverb"
              autoComplete="off"
              onChange={handleRadioChange}
              checked={selectedEffect === 'reverb'}
            />
            <label className="btn btn-outline-primary" htmlFor="reverb">
              Reverb
            </label>

            <input
              type="radio"
              className="btn-check"
              name="audio-options"
              id="echo"
              autoComplete="off"
              onChange={handleRadioChange}
              checked={selectedEffect === 'echo'}
            />
            <label className="btn btn-outline-primary" htmlFor="echo">
              Echo
            </label>

            <input
              type="radio"
              className="btn-check"
              name="audio-options"
              id="normalize"
              autoComplete="off"
              onChange={handleRadioChange}
              checked={selectedEffect === 'normalize'}
            />
            <label className="btn btn-outline-primary" htmlFor="normalize">
              Normalize
            </label>

            <input
              type="radio"
              className="btn-check"
              name="audio-options"
              id="bassBoost"
              autoComplete="off"
              onChange={handleRadioChange}
              checked={selectedEffect === 'bassBoost'}
            />
            <label className="btn btn-outline-primary" htmlFor="bassBoost">
              Bass Boost
            </label>

            <input
              type="radio"
              className="btn-check"
              name="audio-options"
              id="trebleBoost"
              autoComplete="off"
              onChange={handleRadioChange}
              checked={selectedEffect === 'trebleBoost'}
            />
            <label className="btn btn-outline-primary" htmlFor="trebleBoost">
              Treble Boost
            </label>

            <input
              type="radio"
              className="btn-check"
              name="audio-options"
              id="chorus"
              autoComplete="off"
              onChange={handleRadioChange}
              checked={selectedEffect === 'chorus'}
            />
            <label className="btn btn-outline-primary" htmlFor="chorus">
              Chorus
            </label>
          </div>
        </ButtonGroup>
      </Row>
      <Row>
        <AudioWaveform effect={selectedEffect} onEffectApplied={handleEffectApply} />
      </Row>
    </Container>
  );
};

export default EditPage;
