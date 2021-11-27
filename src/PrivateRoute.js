import { Navigate } from 'react-router-dom';
import { useAuth } from './services/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" />;
}

export default PrivateRoute;