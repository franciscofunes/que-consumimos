# Que-Consumimos: Smart Grocery Inventory App

Que-Consumimos is a modern pantry management application designed to help users track grocery items, manage consumption rates, and streamline shopping experiences through barcode scanning technology.

## About the Application

Que-Consumimos helps answer the everyday question "What should I consume?" by providing:

- **Barcode Scanning**: Quickly add products to your inventory by scanning product barcodes
- **Product Categorization**: Organize items by categories like dairy, grains, meat, produce, etc.
- **Consumption Tracking**: Monitor usage patterns to better predict when you'll need to replenish items
- **Inventory Management**: Keep track of what's in your pantry and when items might expire
- **User Authentication**: Secure your personal inventory data with Firebase authentication

## Technology Stack

This application leverages a modern technology stack:

- **Frontend**: Angular 19 (latest version) with standalone component architecture
- **UI Framework**: Tailwind CSS v4 for responsive, utility-first styling
- **State Management**: NgRx for predictable state management
- **Backend/Database**: Firebase/Firestore for real-time data storage
- **Authentication**: Firebase Authentication
- **Deployment**: Firebase Hosting

## Features

- **Barcode Scanning**: Use your device's camera to scan and identify products
- **Product Details**: View and edit comprehensive product information
- **Consumption Rate Tracking**: Set and monitor how quickly you use different items
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Offline Support**: Basic functionality works even without an internet connection

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm (v10 or higher)
- Angular CLI (v19.2.8)

### Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/que-consumimos.git
cd que-consumimos
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
ng serve
```

The application will be available at `http://localhost:4200/`.

### Firebase Configuration

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication and Firestore
3. Add your Firebase configuration to the environment files

## Project Structure

The application follows Angular 19's recommended standalone component architecture:

```
src/
├── app/
│   ├── core/           # Core services, guards, and interceptors
│   ├── features/       # Feature modules (products, auth, etc.)
│   ├── shared/         # Shared components, directives, and pipes
│   ├── store/          # NgRx store, actions, reducers, and effects
│   └── models/         # TypeScript interfaces and models
├── assets/             # Static assets
└── environments/       # Environment configurations
```

## Building for Production

```bash
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

## Testing

### Unit Tests

```bash
ng test
```

### End-to-End Tests

```bash
ng e2e
```

## Deployment

The application can be deployed to Firebase Hosting:

```bash
ng build --configuration production
firebase deploy
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The Angular team for the incredible framework
- Tailwind CSS for the utility-first CSS framework
- Firebase for backend services
- The open source community for their invaluable resources