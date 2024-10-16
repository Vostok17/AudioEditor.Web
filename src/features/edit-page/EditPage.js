import { Container, Row } from 'react-bootstrap';
import AudioWaveform from './components/audio-waveform/AudioWaveform';
import './edit-page.css';

const EditPage = () => (
  <Container className="edit-page pt-5">
    <Row>
      <h1 className="edit-page__title">Editor</h1>
    </Row>
    <AudioWaveform />
  </Container>
);

export default EditPage;
