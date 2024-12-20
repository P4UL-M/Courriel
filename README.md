# Courriel

## Description
Courriel is a web platform designed for managing and viewing incoming emails from both Microsoft and Google accounts. The application consists of several components, including an authentication system, a mail viewer, and various utility and UI components in order to have the best possible user experience. This application is built with Next.js, using TypeScript and Tailwind CSS for styling.

## Concept
This application is designed to give users a clear and easy way to access their emails. Users can search, sort, and view their messages smoothly. The structure is built to be flexible, so it’s easy to customize and add support for different email providers in the future. The project is organized to be scalable and simple to maintain.

## Live Demo
Courriel is hosted and deployed on vercel, you can access it via [this link](https://courriel.deway.fr/)

## Usage

### Features
- **Authentication**:
    The application uses NextAuth for authentication, providing a quick and easy login through Google and Microsoft accounts. Custom configurations for each provider allow secure and scalable access management.

- **Email Management**:
    The main functionality of Courriel includes accessing, viewing, and organizing emails. Users can view his emails in different categories, search for specific emails and view the content of each ones perfectly. The system uses specialized queries and actions to interact with Google and Microsoft APIs for retrieving email data.

- **UI components**:
     The interface, built with Tailwind CSS and Next.js components, provides a responsive design that adapts to different devices. Components like thread-content, thread-list, user-icon, and left-sidebar enhance navigation and usability.

### Bonuses Features
- **Enhanced search**:
    The search feature allows users to find emails by sender, subject, or content. The system uses a custom search query to filter emails based on the user's input. You just have to follow basic gmail or outlook search syntax (e.g. `from:` or `subject:`).

- **Attachments**:
    The application supports attachments, allowing users to download and view files attached to emails. The system uses a custom query to retrieve attachments and display them in the email viewer.

- **CID Images**:
    The system supports CID images, displaying embedded images in the email content. The system uses a custom query to retrieve and display images in the email viewer.

- **HTML Content**:
    The system supports HTML content, displaying emails with rich text and images. The system uses a custom query to retrieve and display HTML content in the email viewer.

### Prerequisites
- [Node.js](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)
- [Entra Microsoft ID](https://portal.azure.com/)
- [Google API](https://console.developers.google.com/)

### Installation and Setup with Docker
1. Clone the repository:
    ```bash
    git clone https://github.com/P4UL-M/Courriel.git
    cd Courriel
    ```
2. Install the dependencies:
    ```bash
    npm install
    ```
3. Create a `.env.local` file in the root directory with the following variables:
    ```bash
    MICROSOFT_ENTRA_ID_CLIENT_ID=your_microsoft_entra_client_id
    MICROSOFT_ENTRA_ID_CLIENT_SECRET=your_microsoft_entra_client_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_nextauth_secret
    ```
4. Start the Application:
    ```bash
    npm run dev
    ```

## Contribution
Contributions are welcome! Please follow these steps to contribute:
1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b my-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push your branch  (`git push origin my-feature`).
5. Open a Pull Request.

## Licence
This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for more information
