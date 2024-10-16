import { Container, Row } from 'react-bootstrap';
import { LibraryMusic } from '@mui/icons-material';
import UploadAudio from 'src/common/components/UploadAudio/UploadAudio';
import './home-page.css';

const HomePage = () => (
  <>
    <Container className="home-page__container mt-5">
      <Row className="justify-content-center">
        <LibraryMusic className="home-page__music-icon" />
      </Row>
      <UploadAudio />
    </Container>
  </>
);

export default HomePage;
