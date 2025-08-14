# ScreenFun

A real-time multiplayer quiz game with interactive features and power-ups.

## Features

- **Real-time Multiplayer**: Multiple players can join a game session
- **QR Code Join**: Players can easily join using QR codes
- **Power-up System**: Players can use power-ups like freeze, gloop, and flash
- **Score Tracking**: Automatic score calculation and leaderboard
- **Host Controls**: Dedicated host interface to control game flow
- **Responsive Design**: Works on both desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- PowerShell (for Windows users)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/AAgamesnl/ScreenFun.git
cd ScreenFun
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

Or run directly with PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-screenfun.ps1
```

The server will start on `http://localhost:3000` by default.

## How to Play

### As a Host

1. Open the host interface at `http://localhost:3000/host.html`
2. A room code will be generated automatically
3. Share the room code or QR code with players
4. Start the game when all players are ready
5. Control the game flow and progress through questions

### As a Player

1. Open the player interface at `http://localhost:3000/player.html`
2. Enter the room code provided by the host
3. Choose a nickname
4. Mark yourself as ready
5. Answer questions and use power-ups strategically

## Power-ups

- **Freeze**: Temporarily freezes another player's screen
- **Gloop**: Affects the target player's screen visibility
- **Flash**: Creates a flash effect on the target player's screen

## Game Flow

1. **Lobby**: Players join and mark themselves as ready
2. **Questions**: Players answer multiple-choice questions
3. **Reveal**: Correct answers are shown and scores are updated
4. **Scoreboard**: Current standings are displayed
5. **Repeat** until all questions are answered

## Configuration

Questions can be configured in the `data/questions.sample.json` file with the following format:

```json
{
  "id": "unique-id",
  "text": "Question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctIndex": 0,
  "durationMs": 30000
}
```

## Development

The project uses:

- TypeScript for type-safe development
- Express.js for the web server
- Socket.IO for real-time communication
- Three.js for 3D effects (in host3d.js and player3d.js)

### Project Structure

- `/src` - TypeScript source files
- `/public` - Static web files
  - `/css` - Stylesheets
  - `/js` - Client-side JavaScript
- `/data` - Game configuration and questions
- `/scripts` - Utility scripts

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
