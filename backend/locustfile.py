from locust import HttpUser, task, between


class MarketUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def get_markets(self):
        self.client.get("/markets")

    @task(2)
    def get_schedule(self):
        self.client.get("/schedule/nba")

    @task(1)
    def get_health(self):
        self.client.get("/health")
