import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './components/ThemeProvider';
import { UserAuthProvider } from './context/UserAuthContext';

export default function App() {
  return (
    <ThemeProvider>
      <UserAuthProvider>
        <RouterProvider router={router} />
      </UserAuthProvider>
    </ThemeProvider>
  );
}
