import { useState } from 'react';
import { ButtonGroup, Container, Row } from 'react-bootstrap';
import Effects from 'common/content/effects';
import AudioWaveform from './components/audio-waveform/AudioWaveform';
import './edit-page.css';

const EditPage = () => {
  const [selectedEffect, setSelectedEffect] = useState<Effects | null>(null);

  const handleEffectApply = () => setSelectedEffect(null);

  return (
    <Container className="edit-page p-5" fluid>
      <Row>
        <ButtonGroup>
          <div className="btn-group" role="group">
            {Object.entries(Effects).map(([name, value]) => (
              <label key={name} className="btn btn-outline-primary" htmlFor={name}>
                {name}
                <input
                  type="radio"
                  className="btn-check"
                  name="audio-options"
                  id={name}
                  autoComplete="off"
                  onChange={() => setSelectedEffect(value)}
                  checked={selectedEffect === name}
                />
              </label>
            ))}
          </div>
        </ButtonGroup>
      </Row>
      <Row>
        <AudioWaveform effectToApply={selectedEffect} onEffectApplied={handleEffectApply} />
      </Row>
    </Container>
  );
};

export default EditPage;
