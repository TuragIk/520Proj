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
## 1.2 Features
## 1.3 Functional Requirements
## 1.4 Non-Functional Requirements
* The system must throttle requests to call Kalshi API’s at most 20 times per second, and Polymarket API at most 15-20 per second. Additionally, it is important not to store any data without considering legal constraints, as such all computation must be done in real-time and prohibited from writing it to storage.
* Support 3000 concurrent users, based on a calculation of 10% students being interested in this area from the 5 colleges. The system shall maintain a response time of < 4 seconds for data retrieval and redirection of users to external sites while maintaining 3000 concurrent users. 
As a result of this support constraint, and additional parameter must be added into non-functional requirement #1, being: A middle-of-the-way caching system to support high user loads but in the backend we are still restricted by Kalshi and Polymarket rate limits. There will be strict Time-To-Live of under 15-20 seconds (will vary depending on users online (longer times for less users, shorter when more users)
* Let’s add a security constraint. Since we are dealing with user accounts and sensitive data, the system must encrypt all passwords and accounts behind AES-256 onto the server storage. Also, all data transmitted between a client and server must be on a secured TLS 1.3 channel.
## 1.5 Challenges & Risks
