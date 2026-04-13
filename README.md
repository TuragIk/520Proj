# 520 Proj

TODO:
- Consise description of project
- 4 Major system features
- 8 Formal use cases
- 3 Measurable system contstraints
- 3 Key risks

## Team: Dyanmite Gambling
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



## Tentative Folder Structure
```
520Proj/
├── .gitignore               
├── README.md                
├── docs/                    
│   └── 520-ProjectDocument.pdf
├── frontend/                
│   ├── package.json
│   └── src/
└── backend/                 
    ├── requirements.txt     # Python dependencies (fastapi, uvicorn, etc.)
    ├── src/
    │   ├── main.py          # FastAPI application entry point
    │   ├── api/             # API routing (e.g., markets.py, auth.py)
    │   ├── core/            # Config, security, middleware
    │   ├── db/              # Database models and connections
    │   └── services/        # Caching and external API normalizers
    └── tests/
```
