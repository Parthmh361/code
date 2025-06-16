
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import SchPost from './components/SchPost';
import { store } from './store';
import { Provider } from 'react-redux';
import axios from 'axios';
import Insights from './components/Insights';
axios.defaults.withCredentials = true;
const App = () => {
  return(
     <Provider store={store}>
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/schedulePost" element={<SchPost />} />
        <Route path="/insight" element={<Insights/>} />
      </Routes>
    </Router>
    </Provider>
  );
};

export default App;
