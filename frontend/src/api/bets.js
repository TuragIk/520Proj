import { MOCK_USER_BETS, INITIAL_LIMITS } from "../data/mockData";

export async function getUserBets() {
  // TODO: Replace with real API call to backend
  return MOCK_USER_BETS;
}

export async function getBettingLimits() {
  // TODO: Replace with real API call to backend
  return INITIAL_LIMITS;
}
