/** MicroClub GitHub organization, also used as placeholder link for projects without a public repo. */
export const ORGANIZATION_URL = "https://github.com/MicroClub-USTHB"

export type Project = {
  name: string
  /** First tag is the main one (filled badge). Uppercase, as in Figma. */
  tags: string[]
  year: number
  description: string
  url: string
}

export type ProjectCategory = {
  /** DOM id fragment of the category heading. */
  id: string
  name: string
  projects: Project[]
}

/** Hall of Projects, grouped by section, in display order. */
export const PROJECT_CATEGORIES: ProjectCategory[] = [
  {
    id: "it",
    name: "IT",
    projects: [
      {
        name: "Mcoli-ui",
        tags: ["WEB", "OPEN SOURCE"],
        year: 2026,
        description:
          "The premier React component library that brings professional-grade UI components with a bold MicroClub DNA to developers everywhere. We’ve combined world-class design standards with an elite visual identity to help you build stunning web applications in record time.",
        url: `${ORGANIZATION_URL}/mcoli-ui`,
      },
      {
        name: "mAIcro",
        tags: ["AI", "OPEN SOURCE"],
        year: 2026,
        description:
          "An open-source AI service designed to centralize organizational knowledge and answer questions via RAG (Retrieval-Augmented Generation). It features a stateless architecture optimized for cloud deployment, automatic Discord integration, and production-ready performance.",
        url: `${ORGANIZATION_URL}/mAIcro`,
      },
      {
        name: "M-security",
        tags: ["SECURITY", "RUST"],
        year: 2026,
        description:
          "A native Rust security SDK for Flutter, providing high-performance cryptographic services, streaming encryption with compression, an encrypted virtual file system (EVFS), and secure memory management. All operations run in Rust through Flutter Rust Bridge. No Dart-level crypto, no platform channels.",
        url: `${ORGANIZATION_URL}/M-Security`,
      },
      {
        name: "Micro loaders",
        tags: ["ANIMATION", "OPEN SOURCE"],
        year: 2024,
        description:
          "A comprehensive, customizable Flutter package that brings a stunning collection of animated loading indicators to your mobile applications. Crafted with precision by the innovative minds at Micro Club - USTHB.",
        url: `${ORGANIZATION_URL}/micro_loaders`,
      },
    ],
  },
  {
    id: "robotics",
    name: "Robotics",
    projects: [
      {
        name: "Solar tracking system",
        tags: ["AUTOMATION", "HARDWARE", "SENSORS"],
        year: 2026,
        description:
          "A dual-axis solar panel that follows the sun throughout the day. Light sensors feed a microcontroller that drives two servo motors, keeping the panel facing the brightest point of the sky to capture more energy than a fixed installation.",
        url: ORGANIZATION_URL,
      },
      {
        name: "Autonomous ai drone",
        tags: ["AI", "DRONE", "AUTONOMOUS"],
        year: 2026,
        description:
          "A quadcopter that flies without a pilot. An onboard computer runs computer vision models to detect obstacles and targets in real time, while the flight controller handles stabilization and navigation along autonomous missions.",
        url: ORGANIZATION_URL,
      },
      {
        name: "Mini RC car platform",
        tags: ["ROBOTICS", "WIRELESS", "SENSORS"],
        year: 2026,
        description:
          "A compact remote-controlled car built as a modular robotics platform. It is driven wirelessly from a custom controller, and its onboard sensors make it a base for experiments with obstacle avoidance and line following.",
        url: ORGANIZATION_URL,
      },
      {
        name: "2D plotter machine",
        tags: ["CNC", "AUTOMATION", "HARDWARE"],
        year: 2026,
        description:
          "A two-axis CNC drawing machine that turns digital vector files into precise pen drawings on paper. Stepper motors move the pen along X and Y while a small servo lifts and lowers it, all driven by G-code.",
        url: ORGANIZATION_URL,
      },
      {
        name: "Robotic arm",
        tags: ["ROBOTICS", "AUTOMATION", "HARDWARE"],
        year: 2026,
        description:
          "A multi-joint robotic arm driven by servo motors that can pick, move and place small objects. Each joint is controlled by a microcontroller, allowing both manual control and pre-programmed automated movements.",
        url: ORGANIZATION_URL,
      },
    ],
  },
  {
    id: "game-dev",
    name: "Game Dev",
    projects: [
      {
        name: "Area 9 to 5",
        tags: ["GAME", "2D", "SIMULATION"],
        year: 2026,
        description:
          "A physics-based game where you play as a hardworking alien waiter delivering drinks to customers. Balance your tray carefully, as every movement affects the stability of the cups. Serve everyone efficiently to earn top ratings, with charming 2D art and accessible controls.",
        url: ORGANIZATION_URL,
      },
      {
        name: "Unstable connection",
        tags: ["GAME", "2D", "EXPLORATION"],
        year: 2026,
        description:
          "You play as a guy gaming at home, but there's one problem: your TV is completely unstable. Try to solve the puzzles using the manual while dealing with the TV constantly glitching, changing, and making things harder than they should be. Keep your sanity, figure out what's going on, and try not to lose your mind because of that unstable TV.",
        url: ORGANIZATION_URL,
      },
      {
        name: "Don’t implode",
        tags: ["GAME", "3D", "SURVIVAL"],
        year: 2025,
        description:
          "A horror game where you play as a man exploring the bottom of the ocean in an old submarine that is slowly falling apart. As you descend deeper, you must repair failing systems using the right tools while paying attention to sounds, visual clues, and yellow indicators. With its PSX-inspired style and creepy environments, the game focuses on exploration, repairs, and survival.",
        url: ORGANIZATION_URL,
      },
      {
        name: "Crowd rush hour",
        tags: ["GAME", "2D", "ARCADE"],
        year: 2025,
        description:
          "A fast-paced point-and-click game where your mission is to keep the crowd satisfied at all costs. Jump between funny mini-games that test your focus, speed, and precision, while keeping an eye on the satisfaction bar. As the pressure builds, the challenges become harder, and letting the bar drop too low means game over.",
        url: ORGANIZATION_URL,
      },
    ],
  },
]
