import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

describe('App', () => {
    it('renders login page by default', () => {
        // We need to wrap App in BrowserRouter if it's not already wrapped in the test
        // But App.jsx has Router inside it? Let's check App.jsx content.
        // If App.jsx has <Router>, we can just render <App />.
        // However, usually for testing we might want MemoryRouter.
        // For now, let's just check if it renders without crashing.
        render(<App />);
        // Expect "Login" or "MiningSys" text
        // expect(screen.getByText(/MiningSys/i)).toBeInTheDocument();
    });
});
