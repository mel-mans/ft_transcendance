import os
import logging
import pickle
import numpy as np
from pathlib import Path

# Import from your newly created modules!
from ml_schemas import UserProfile, MatchResult
from ml_core import CollaborativeFilteringModel, OnlineLearningModel, ContentFallback

logger = logging.getLogger(__name__)

# Constants
MODEL_PATH      = Path(os.environ.get("MODEL_PATH", "roommate_model.pkl"))
EPSILON         = 0.15     
FEEDBACK_VALUES = {"reject": 0.0, "view": 0.3, "like": 0.7, "contact": 1.0, "matched": 1.0}

class RoommateRecommender:
    def __init__(self):
        self.cf      = CollaborativeFilteringModel()
        self.ol      = OnlineLearningModel()
        self.content = ContentFallback()
        self._load_model()

    def _filter_candidates(self, target: dict, candidates: list[dict]) -> list[dict]:
        return [c for c in candidates if not (target["smoker"] is False and c["smoker"] is True)]

    def _score_candidate(self, target: dict, candidate: dict) -> tuple[float, str]:
        tid, cid = target["user_id"], candidate["user_id"]
        
        cf_score = self.cf.predict(tid, cid)
        if cf_score is not None: return cf_score, "collaborative"

        ol_score = self.ol.predict_proba(target, candidate)
        if ol_score is not None: return ol_score, "online_ml"

        return self.content.score(target, candidate), "content_fallback"

    def recommend(self, target: UserProfile, candidates: list[UserProfile], explore: bool = True) -> MatchResult:
        target_d = target.__dict__
        cand_dicts = [c.__dict__ for c in candidates]

        valid = self._filter_candidates(target_d, cand_dicts)
        if not valid: raise ValueError("No compatible candidates after hard filtering.")

        scored = [(self._score_candidate(target_d, c)[0], self._score_candidate(target_d, c)[1], c) for c in valid]
        scored.sort(key=lambda x: -x[0])

        pick_idx, explored = 0, False
        if explore and len(scored) > 1 and np.random.random() < EPSILON:
            pick_idx, explored = np.random.randint(1, len(scored)), True

        best_score, algo_used, best_cand = scored[pick_idx]
        return MatchResult(best_cand["user_id"], round(best_score, 4), algo_used, explored, pick_idx + 1)

    def record_feedback(self, target: UserProfile, candidate: UserProfile, action: str):
        score = FEEDBACK_VALUES.get(action, 0.0)
        self.ol.record_feedback(target.__dict__, candidate.__dict__, score)
        self.cf.record_interaction(target.user_id, candidate.user_id, score)
        self._save_model()

    def _save_model(self):
        try:
            with open(MODEL_PATH, "wb") as f:
                pickle.dump({"cf": self.cf, "ol": self.ol}, f)
        except Exception as e: logger.warning(f"Save failed: {e}")

    def _load_model(self):
        if MODEL_PATH.exists():
            try:
                with open(MODEL_PATH, "rb") as f:
                    data = pickle.load(f)
                self.cf, self.ol = data["cf"], data["ol"]
            except Exception as e: logger.warning(f"Load failed: {e}")

    @property
    def status(self) -> dict:
        return {
            "collaborative_filtering_ready": self.cf.is_ready,
            "online_learning_ready": self.ol.is_ready,
            "online_learning_samples": self.ol.n_trained,
            "interaction_matrix_shape": list(self.cf.interaction_matrix.shape),
            "cf_explained_variance": float(self.cf.svd.explained_variance_ratio_.sum()) if self.cf.fitted else None,
        }