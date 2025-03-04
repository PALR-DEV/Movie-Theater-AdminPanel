# Mayaguez Town Center Cinema - Admin Panel

A modern, responsive web application for managing the Mayaguez Town Center Cinema operations. This administrative panel provides an intuitive interface for managing movies, screenings, and theater operations.

## Features

### Movie Management
- Add new movies with detailed information
- Upload movie posters
- Set YouTube trailer links
- Manage movie categories and duration
- View and edit existing movies

### Screening Management
- Schedule movie screenings across multiple halls
- Flexible time slot selection
- Day-wise scheduling
- Real-time hall availability tracking

### User Interface
- Modern, responsive design
- Dark mode support
- Intuitive navigation
- Real-time preview of changes

## Technology Stack

- **Frontend Framework**: React with Vite
- **Styling**: TailwindCSS
- **Routing**: React Router
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Yarn package manager

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd TheaterAdmin
```

2. Install dependencies
```bash
yarn install
```

3. Start the development server
```bash
yarn dev
```

4. Build for production
```bash
yarn build
```

## Usage

### Adding a New Movie
1. Navigate to the Movies section
2. Click on "Add Movie"
3. Fill in the movie details:
   - Title
   - Duration
   - Poster (upload or URL)
   - YouTube trailer ID
   - Categories
4. Set up screening schedule:
   - Select hall
   - Choose screening days
   - Set time slots
5. Save the movie

### Managing Existing Movies
- View all movies in a grid layout
- Search movies by title
- Filter by status
- Edit movie details and schedules

## Development

### Project Structure
```
src/
  ├── Views/           # Page components
  ├── components/      # Reusable UI components
  ├── assets/         # Static assets
  ├── App.jsx         # Main application component
  └── main.jsx        # Application entry point
```

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## License

This project is proprietary software for Mayaguez Town Center Cinema.

## Support

For support and inquiries, please contact the system administrator.
