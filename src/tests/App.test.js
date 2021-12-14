import { render, screen, getByText } from '@testing-library/react';
import App from './../App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/rankings/i); // Outside of forms, text content is the main way users find elements. This method can be used to find non-interactive elements (like divs, spans, and paragraphs).
  expect(linkElement).toBeInTheDocument();
});
