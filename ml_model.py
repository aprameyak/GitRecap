import numpy as np
import os
import requests
from sklearn.linear_model import LinearRegression

GITHUB_API_URL = "http://localhost:5000/analyze/{}"

def predict_contributions(username):
    response = requests.get(GITHUB_API_URL.format(username))
    if response.status_code != 200:
        return {"error": "Unable to fetch user data"}
    
    data = response.json()
    weekly_commits = data['stats']['activity']['weekly_commits']

    weeks = np.array(range(1, 53)).reshape(-1, 1)
    commits = np.array(weekly_commits).reshape(-1, 1)

    model = LinearRegression()
    model.fit(weeks, commits)

    future_weeks = np.array(range(53, 105)).reshape(-1, 1)
    future_predictions = model.predict(future_weeks)

    prediction_total = int(sum(max(0, round(c[0])) for c in future_predictions))

    return {
         "weekly_predictions": prediction_total
    }

