# Dynamite Gambling

A third-party platform that aggregates NBA prediction market data from Kalshi and Polymarket, helping Five College students make informed betting decisions and avoid predatory gambling tactics. The platform compares odds across platforms, tracks placed bets, sends alerts on price changes, and enforces user-defined safety limits.

## Getting Started & Build Instructions

- **Backend:** See [backend/README.md](backend/README.md) for setup and API documentation.
- **Frontend:** See [frontend/README.md](frontend/README.md) for setup and development instructions.

## Team: Dynamite Gambling
| Turag Ikbal/turagik |
| Rohit Joshi/roheetyeet |
| Tyler Callahan/tylercallahan1 |
| Kevin Mathew/kevinmathew23 |

## Google Drive
[Link](https://drive.google.com/drive/folders/1eM4ipxgYaH_dQh9KM2jC03YV6JpHiPNg?usp=sharing)

## Github Link
[Link](https://github.com/TuragIk/520Proj/)

### 1. Requirements
## 1.1 Overview
Despite the legal age of gambling in Massachusetts being 21 years old, many students have found exposure to the practice. This is due to a legal loophole, where prediction markets like Kalshi and Polymarket allow you to “invest” in a particular event happening, then paying out accordingly whether the event happened or not. For example, one could “invest” in the Celtics winning, and will receive the profit from their investment if the Celtics win, or lose their money if they don’t. It is quite clear that this is effectively the same as gambling or sports betting, but because it is masked as an investment, legally you only have to be 18 to participate. In fact, one could argue that this is arguably worse than traditional gambling and betting, as these prediction markets allow for various types of bets, such as betting on election outcomes or when a particular video game will be released.

Due to the high accessibility and predatory tactics of these prediction markets (risk free bets, celebrity sponsorships, time sensitive bets, insider information), we have seen many UMass and Five College students succumb to gambling addictions and make hasty, uninformed decisions. We seek to create a third party platform that aggregates information from prediction markets, namely Kalshi and Polymarket for the scope of this project, and allows students to see all available information on their bets. The primary objectives are that students can make informed decisions on their bets by seeing all available options, and it allows us to give warnings if students are placing bets at too high a frequency. In doing so, we hope to aid the Five College Community in making smarter choices regarding gambling.

## 1.2 Features

- **User Authentication and Login**
   - Users will be able to log in with their passwords and check to see if they have placed any bets, and the status of those bets.
- **Safe Betting Dashboard**
   - Users will be able to see total volume across all websites for specific bets, and which websites are providing the best odds on any bets they want to take.
- **Email Notification**
   - Our api will check the users placed bets and automatically email them if the bet closes, and the results of the bet.
- **Safe Betting System**
   - Users can set max monetary betting and max bets per day in order to refrain from falling for predatory gambling tactics, and practice moderation so no harmful decisions are made.

## 1.3 Functional Requirements

| ID | Requirement Name | Actor | Trigger | Success Scenario | Failure Scenario |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Cross-Market Comparison** | Student/User | User searches for a specific event (e.g., Celtics win NBA Finals). | User searches; system calls Kalshi/Polymarket APIs, calculates/displays payouts, and redirects user to the selected market. | APIs are down/rate-limited; APIs yield no results despite a relevant bet existing on the source sites. |
| **2** | **Frequency Warning** | Student/User | User hits a preset limit of bets within a specific time span (e.g., 24hrs). | User hits limit; system displays a warning with a gambling hotline and Five College resources before redirecting. | "Bet Counter" fails to persist due to server/browser issues; counter increases without a bet actually being placed. |
| **3** | **Automated Data Collection** | System Backend | Time interval reached (e.g., every 5 seconds). | System authenticates with APIs, fetches latest odds, formats data, and updates the cache. | External API is down or rate-limited; system relies on (potentially stale) cached data. |
| **4** | **Real-Time Alert Notification** | Student/User, System Backend | Price/odd shift > threshold (default 10%) or market closes. | Backend detects threshold change and successfully sends notifications (pop-up or email) to tracking users. | Database is full; user-side connection fails, causing the notification to drop despite system success. |
| **5** | **User Log-in and Log-out** | Student/User | User enters website (log-in prompt) or chooses to terminate session (log-out). | Correct credentials grant access to saved data; logging out successfully terminates the session. | Incorrect credentials grant access; log-out fails to terminate session; server fails to recognize valid credentials. |
| **6** | **Add a Bet to "Placed Bets"** | User | User places a bet on a third-party site and clicks "Add Bet" to monitor it. | System links the user and bet in the database; the bet appears under the "My Bets" tab upon login. | Bet is not added to the database; user is unable to monitor the state of the bet via the website. |
| **7** | **View Bet Price History** | User | User selects a specific market/sport for detailed information. | System retrieves historical price data and displays a timeline or chart showing price fluctuations. | Historical data is unavailable; system defaults to showing only current market data. |
| **8** | **Arbitrage Opportunity Detection** | Backend | Market data is pulled from gambling platforms. | System compares prices, calculates potential arbitrage, and flags opportunities for users. | Incomplete or mismatched data prevents detection; APIs fail to return updated market data. |
## 1.4 Non-Functional Requirements
* The system must throttle requests to call Kalshi API’s at most 20 times per second, and Polymarket API at most 15-20 per second. Additionally, it is important not to store any data without considering legal constraints, as such all computation must be done in real-time and prohibited from writing it to storage.
* Support 3000 concurrent users, based on a calculation of 10% students being interested in this area from the 5 colleges. The system shall maintain a response time of < 4 seconds for data retrieval and redirection of users to external sites while maintaining 3000 concurrent users. 
As a result of this support constraint, and additional parameter must be added into non-functional requirement #1, being: A middle-of-the-way caching system to support high user loads but in the backend we are still restricted by Kalshi and Polymarket rate limits. There will be strict Time-To-Live of under 15-20 seconds (will vary depending on users online (longer times for less users, shorter when more users)
* Let’s add a security constraint. Since we are dealing with user accounts and sensitive data, the system must encrypt all passwords and accounts behind AES-256 onto the server storage. Also, all data transmitted between a client and server must be on a secured TLS 1.3 channel.
## 1.5 Challenges & Risks

### 1. Data Scalability and Performance
Prediction market prices can update frequently, and storing historical price changes or monitoring
multiple markets could create growing data volumes and performance challenges as the platform scales.

**Solution:** Use scalable cloud infrastructure, caching, and efficient databases to handle frequent
updates and ensure the platform can process and display odds comparisons quickly.

---

### 2. Integration Challenges with Gambling Providers
Kalshi and Polymarket provide data through different APIs and formats, which can make it difficult
to consistently retrieve and compare market prices across the two platforms.

**Solution:** Build a small integration layer that connects to each platform's API and converts
their data into a standardized internal format so prices and markets can be compared reliably.

---

### 3. Technical Limitations in Odds Comparison and Transparency
Prediction markets often present odds in different formats and structures, which can make direct
comparisons difficult or misleading for users.

**Solution:** Implement a data normalization layer that converts all odds into a standardized format
and aligns similar betting markets to enable clear, transparent comparisons across providers.

## 2. Design

### 2.1 Architecture Design

Our project will work on a **Client-Server architecture**. This ensures that the frontend and backend are cleanly separated, as the server logic is where most of our project work is.

- **Client (Frontend only):** A React/Vite application running in the user's browser. The client is responsible for presentation and user interaction. It also handles UI (dashboard, odds comparisons, frequency warnings) and communicates with the server via RESTful HTTP requests. It has no persistent state or direct database access.
- **Server (Backend):** A Python-based application using the FastAPI framework. This will be the central processing for the entire platform. The server receives requests from the client, deals with core logic, handles authentication, and securely manages data storage. It uses Python asynchronous methods to run background processes that fetch and normalize data from Kalshi and Polymarket APIs without blocking client requests.
- **Database:** PostgreSQL relational database, accessible only by the Server, which ensures data reads and writes are validated by backend middleware only.

#### Object Oriented Design

- **Encapsulation** — The internal state of our external API connections is hidden. The `KalshiAPIClient` securely encapsulates its API keys and connection logic. The rest of the application cannot access these details and simply receives the returned data.
- **Abstraction** — We will use a customized object for our data (`MarketNormalizer`). Regardless of the JSON structure returned by Kalshi or Polymarket, the server abstracts these differences away by transforming the data into our specialized object model (`MarketData`).
- **Modularity** — The server is modularized into distinct routing layers: Authentication, Market Data, User Profiles, and a distinct caching layer. If we need to add a second or third sport to the platform in the future, we simply create a new file with all different parties involved; everything else stays the same.

#### Major Classes

- **`BaseMarketClient`** — Abstract class that blueprints interaction with external prediction markets. It says that any subclass must implement a `fetch_live_odds()` method.
- **`KalshiAPIClient` & `PolymarketAPIClient`** — Inherit from `BaseMarketClient` and are responsible for authentication, headers, and rate-limiting rules.
- **`MarketNormalizer`** — Takes unstructured, dissimilar data (JSON) from Kalshi and Polymarket and turns them into a standardized model (`MarketData`).
- **`BettingEngine`** — Core business logic controller. Manages user betting actions, checks their database records to enforce daily frequency and monetary limits, etc.

### 2.2 UI Design

Home page showing most popular bets (sorted by highest total volume):

*[Insert home page mockup image here]*

Figma Mockup of frequency warning:

*[Insert frequency warning mockup image here]*

Figma Mockup of user page:

*[Insert user page mockup image here]*

### 2.3 Data Model

- **Users**
  - Stores authentication and user-specific constraints (e.g., betting limits).
  - Passwords are stored as hashed values for security.
  - Separating users ensures scalability and secure account management.
- **Markets**
  - Represents external betting markets from Kalshi and Polymarket.
  - The combination of `(external_id, platform)` ensures uniqueness across APIs.
  - This abstraction allows the system to normalize data from different providers into a consistent format.
- **Placed Bets**
  - Acts as a junction between users and markets.
  - Enables tracking of which user is monitoring which bet.
  - Supports one-to-many relationships (one user → many bets, one market → many bets).
- **Price History**
  - Stores time-series data for market odds.
  - Designed to support frequent updates (every few seconds) without overwriting previous values.
  - Enables historical analysis, charting, and arbitrage detection.
  - Indexed by `(market_id, recorded_at)` for efficient querying.
- **User Watchlist**
  - Implements a many-to-many relationship between users and markets.
  - Allows users to track multiple markets and receive alerts.
  - Stores alert thresholds to support personalized notifications.

### 2.4 Tech Stack with Justification

- **Frontend: React with Vite** — React has a huge user base and is used very commonly in industry. We lack experience in frontend, so its popularity allows us to take advantage of strong documentation, community support, and lots of libraries for whatever we please. Vite speeds up the development and testing process with its optimization and hot module replacement.
- **Backend: Python with FastAPI** — FastAPI was chosen for its high performance and built-in support for asynchronous programming, which is critical for handling frequent API polling from external sources like Kalshi and Polymarket without blocking user requests. Python allows for rapid development and clean integration with data processing tasks such as normalization and arbitrage detection.
- **Database: PostgreSQL** — PostgreSQL was selected as the database due to its strong support for relational data, ensuring data integrity through foreign keys and constraints while efficiently handling structured relationships between users, markets, and bets. Together, this stack provides a scalable and reliable backend capable of supporting real-time updates and concurrent users.

#### Test Frameworks

- **Vitest and React Testing Library (frontend):** Works out of the box with Vite and our existing setup. Covers unit tests for utility functions and component-level tests, which is great since none of us have much frontend experience, so having general unit tests is great to build off of.
- **Pytest (backend):** Built-in support through FastAPI so we can test endpoints without actually having to run the server. Additionally, can use a mock, in-memory database instead of actually interacting with the real database.

### 2.5 Challenges and Risks

#### 1. Cross-Platform Market Matching

**Challenge:** Kalshi and Polymarket have no shared identifier between their platforms, and notably have completely different naming systems. For example, Kalshi categorizes NBA events under "Professional Basketball (M)", and under this category labels a team as their city (e.g., "Boston" for the Celtics). Meanwhile, Polymarket uses the literal names, so "NBA" as the category and "Celtics" for the team name. This makes it nearly impossible to reliably match a market between the two platforms either with simple text searching or even fuzzy search.

**Solution:** By reducing the scope to only sports with a set number of teams (NBA, NFL, NHL, MLB, etc.), we can hard-code mappings to each platform, reducing the need for any complex search algorithms. If a user looks up "Celtics", then we can use a hash-map or some other data structure to see how exactly we should query both Kalshi and Polymarket to get the correct market that the user is looking for. Since we're only choosing sports with a set number of teams, there will never be any concerns of potentially looking up an event that we have not hard-coded.

---

#### 2. Determining Bet Resolution Due to Settlement Timing

**Challenge:** Our platform relies on Kalshi and Polymarket's status to determine when a game has ended and bets should be resolved. However, the market doesn't always resolve the instant that the official event (a sports game for us) ends, as normally they would have to hear from an official source, then settle the market accordingly. This causes a source of delay between when a game ends and our platform updating the bet status.

**Solution:** The Kalshi API includes a `status` and `result` field that we can use to determine when a market ends. So, we can regularly poll the Kalshi API for all placed bets on our platform and update any bets accordingly. Alternatively, if this results in a rate-limiting concern (see next challenge), we could introduce another API that determines when games end (such as the ESPN API), and when a game ends, give some delay to allow Kalshi to settle the market, then start the queries. Also, to manage user expectations, the UI can be updated to indicate that bets are "pending settlement" rather than immediately showing a status.

---

#### 3. Rate Limiting Concerns

**Challenge:** Prediction market prices update frequently, which creates the problem of growing data volumes and performance challenges on our end. Also, Kalshi and Polymarket enforce API rate limits. If our system attempts to pull fresh data every time a user requests something, our server will get banned.

**Solution:** We will use a middle-of-the-way caching service which is where all user requests go. In the meantime, it will obey the rate limits and be as up-to-date on the data as it can (by way of an asynchronous worker). Then, it deletes the data after a specified amount of time due to the changing nature of markets. Furthermore, we can pay to have a higher ceiling on the rate limits.

### 2.6 Work Plan

#### High-Level Timeline

**Sprint 1: Infrastructure & Prototyping (April 9 – April 18)**

- **Objective:** Establish a foundation for our idea.
- **Key Tasks:** Initialize the React, FastAPI, and PostgreSQL environments. Set up database connection pooling. Create static mock API endpoints (e.g., hardcoded JSON responses) so the frontend can build the UI without waiting for the live data pipeline.
- **Deliverable:** A locally running client-server pair where the frontend can successfully ping the backend.

**Sprint 2: Core Functionality & Midpoint Preparation (By End of April – 29th)**

- **Objective:** Connect a live data pipeline and demonstrate a tangible use case.
- **Key Tasks:** Replace mock API endpoints with live database/Redis queries. Implement the user authentication flow (JWT generation and verification). Finalize the automated background scraping and normalization scripts.
- **Deliverable:** A functional prototype where a user can log in, view live, normalized cross-platform NBA odds, and trigger a bet limit warning.

**Sprint 3: Deliverable Finalization & Polish (April 29 – May 11)**

- **Objective:** Refine the system based on feedback from friends and finalize project documentation.
- **Key Tasks:** Tune the cache parameters for optimal performance. Address any bugs discovered during the process. Stress-test and run all unit tests. Conduct a final code review.
- **Deliverable:** Submission of the finalized PDF design document and a fully functioning codebase.

#### Task Distribution

**Turag**

- Set up React frontend with Vite, including frontend project structure.
- Build Home page with cross-platform odds displayed.
- Build "Bet Windows" for when a user clicks on a bet, which contains the link to both the Kalshi bet and the Polymarket bet.
- Build search and filtering pages/results.
- Build pages for each independent sport (NBA, NFL, Tennis, etc.), but just start with NBA for now.
- Build "My Bets" page, which includes placed bets, bet frequency counter, total win/loss, etc.
- Implement frequency warning with gambling resources, and subsequent lockout if limit is hit.
- Create mock data and API abstraction for parallel frontend and backend development.
- Integrate frontend with backend once API endpoints are created.
- Assist with the backend as needed, since this project is very backend-heavy.

**Rohit**

- Establish the Python/FastAPI server.
- RESTful API routing structure.
- Implement user authentication middleware, session management (JWT), and AES-256 encryption.
- `.env` securely stores API keys, JWT secrets, etc.
- Connect FastAPI server to PostgreSQL database.
- Assist on making a Redis client to act as middle-of-the-way cache.
- Create the connection dependency injections so the database and cache are properly opened and closed on every API request.
- Core API routing (endpoints): Auth routes, Market routes, Betting routes, etc.
- Frequency warning interceptor on the Betting route.

**Kevin**

- Designed and implemented the PostgreSQL schema with all five tables: `users`, `markets`, `placed_bets`, `price_history`, and `user_watchlist`.
- Wrote SQLAlchemy ORM models in `models.py` mapping Python classes to database tables.
- Built `connection.py` with connection pooling via SQLAlchemy's `SessionLocal`, exposing a `get_db()` function to import directly into FastAPI routes.
- Wrote `seed.py` to populate the local database with test users, markets, and bets so all teammates can develop without waiting for live API data.
- Configured `.env` for secure local credential storage and created `.gitignore` to prevent secrets and cache files from being committed to GitHub.
- Created `.env.example` as a template so teammates can set up their own local database instances without sharing passwords.

**Tyler**

- Read Kalshi and Polymarket documentation.
- Dummy API calls to fetch example data.
- Model out data normalization schema.
- Implement external calling feature to both APIs.
- Hardcode text file based on NBA teams (to make Kalshi/Polymarket associations).
- Code the model for the data normalization layer; pipeline all API data through this layer, the cache, and into the database.

## Recording

[Project Recording](https://drive.google.com/file/d/1ryL4njg-YLB546kZXYExX7hq7rYrRYYT/view?usp=drive_link)
