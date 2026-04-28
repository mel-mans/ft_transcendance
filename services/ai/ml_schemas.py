import time
from typing import Literal
from dataclasses import dataclass, field

@dataclass
class UserProfile:
    user_id: int
    budget_max: float       
    cleanliness: int        
    sleep_schedule: Literal["early_bird", "night_owl"]
    smoker: bool
    has_pets: bool

    def validate(self):
        assert self.budget_max > 0, "budget_max must be > 0"
        assert 1 <= self.cleanliness <= 5, "cleanliness must be 1-5"
        assert self.sleep_schedule in {"early_bird", "night_owl"}

@dataclass
class FeedbackEvent:
    user_id: int
    candidate_id: int
    action: Literal["reject", "view", "like", "contact", "matched"]
    timestamp: float = field(default_factory=time.time)

@dataclass
class MatchResult:
    best_match_id: int
    confidence_score: float
    algorithm_used: str          
    exploration: bool            
    rank: int