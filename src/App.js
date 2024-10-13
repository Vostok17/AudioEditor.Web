import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EditPage from './features/edit-page/EditPage';
import HomePage from './features/home-page/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/edit" element={<EditPage />} />
      </Routes>
    </Router>
  );
}

export default App;
