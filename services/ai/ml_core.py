import logging
import numpy as np
import pandas as pd
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# Constants for the ML Models
MIN_CF_INTERACTIONS = 20       
LATENT_FACTORS      = 10       

class FeatureBuilder:
    def profile_to_vec(self, p: dict) -> np.ndarray:
        return np.array([
            p["budget_max"],
            p["cleanliness"],
            1.0 if p["sleep_schedule"] == "early_bird" else 0.0,
            1.0 if p["smoker"] else 0.0,
            1.0 if p["has_pets"] else 0.0,
        ], dtype=float)

    def pair_features(self, target: dict, candidate: dict) -> np.ndarray:
        t = self.profile_to_vec(target)
        c = self.profile_to_vec(candidate)

        budget_diff    = abs(t[0] - c[0]) / (max(t[0], c[0]) + 1e-9)
        clean_diff     = abs(t[1] - c[1]) / 4.0          
        schedule_match = float(t[2] == c[2])             
        smoker_compat  = float(not (t[3] == 0 and c[3] == 1))  
        pet_match      = float(t[4] == c[4])
        avg_budget     = (t[0] + c[0]) / 2.0
        avg_clean      = (t[1] + c[1]) / 2.0

        return np.array([
            budget_diff, clean_diff, schedule_match, smoker_compat, pet_match,
            avg_budget, avg_clean, t[1] * c[1], schedule_match * pet_match,
        ], dtype=float)

class OnlineLearningModel:
    def __init__(self):
        self.clf = SGDClassifier(loss="log_loss", learning_rate="optimal", random_state=42, max_iter=1, warm_start=True)
        self.scaler    = MinMaxScaler()
        self.fb        = FeatureBuilder()
        self.n_trained = 0
        self.fitted    = False
        self._X_buffer, self._y_buffer = [], []

    def record_feedback(self, target: dict, candidate: dict, score: float):
        self._X_buffer.append(self.fb.pair_features(target, candidate))
        self._y_buffer.append(int(score >= 0.5))
        if len(self._X_buffer) >= 5:
            self._flush_train()

    def _flush_train(self):
        X, y = np.array(self._X_buffer), np.array(self._y_buffer)
        if not self.fitted:
            if len(set(y)) < 2: return
            self.clf.partial_fit(self.scaler.fit_transform(X), y, classes=[0, 1])
            self.fitted = True
        else:
            self.clf.partial_fit(self.scaler.transform(X), y)
        self.n_trained += len(y)
        self._X_buffer.clear()
        self._y_buffer.clear()

    def predict_proba(self, target: dict, candidate: dict) -> float:
        if not self.fitted: return None   
        x = self.fb.pair_features(target, candidate).reshape(1, -1)
        return float(self.clf.predict_proba(self.scaler.transform(x))[0][1])   

    @property
    def is_ready(self) -> bool:
        return self.fitted and self.n_trained >= 10

class CollaborativeFilteringModel:
    def __init__(self, n_components: int = LATENT_FACTORS):
        self.n_components  = n_components
        self.svd           = TruncatedSVD(n_components=n_components, random_state=42)
        self.user_factors, self.item_factors = {}, {}
        self.interaction_matrix = pd.DataFrame()
        self.fitted        = False

    def record_interaction(self, user_id: int, candidate_id: int, score: float):
        if candidate_id not in self.interaction_matrix.columns:
            self.interaction_matrix[candidate_id] = 0.0
        if user_id not in self.interaction_matrix.index:
            self.interaction_matrix.loc[user_id] = 0.0
        self.interaction_matrix.at[user_id, candidate_id] = score
        if (self.interaction_matrix > 0).values.sum() >= MIN_CF_INTERACTIONS:
            self._fit()

    def _fit(self):
        matrix = self.interaction_matrix.fillna(0).values
        if min(matrix.shape) <= self.n_components: return  
        try:
            user_item = self.svd.fit_transform(matrix)
            item_factors = self.svd.components_.T
            for i, uid in enumerate(self.interaction_matrix.index):
                self.user_factors[uid] = user_item[i]
            for j, cid in enumerate(self.interaction_matrix.columns):
                self.item_factors[cid] = item_factors[j]
            self.fitted = True
        except Exception as e:
            logger.warning(f"Fit failed: {e}")

    def predict(self, user_id: int, candidate_id: int):
        if not self.fitted: return None
        u, v = self.user_factors.get(user_id), self.item_factors.get(candidate_id)
        if u is None or v is None: return None
        return float(1 / (1 + np.exp(-float(np.dot(u, v)))))

    @property
    def is_ready(self) -> bool: return self.fitted

class ContentFallback:
    def score(self, target: dict, candidate: dict) -> float:
        df = pd.DataFrame([target, candidate])
        num = MinMaxScaler().fit_transform(df[["budget_max", "cleanliness"]])
        cat = OneHotEncoder(sparse_output=False).fit_transform(df[["sleep_schedule", "smoker", "has_pets"]])
        vecs = np.hstack([num, cat])
        return float(cosine_similarity([vecs[0]], [vecs[1]])[0][0])