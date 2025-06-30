import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ItineraryProvider } from './context/ItineraryContext';
import HomePage from './pages/HomePage';
import ManualPlanPage from './pages/ManualPlanPage';
import AIPlanPage from './pages/AIPlanPage';
import ItineraryPage from './pages/ItineraryPage';
import AccommodationSearchPage from './pages/AccommodationSearchPage';

function App() {
  return (
    <ItineraryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create/manual" element={<ManualPlanPage />} />
          <Route path="/create/ai" element={<AIPlanPage />} />
          <Route path="/itinerary" element={<ItineraryPage />} />
          <Route path="/accommodation-search" element={<AccommodationSearchPage />} />
        </Routes>
      </BrowserRouter>
    </ItineraryProvider>
  );
}

export default App;
