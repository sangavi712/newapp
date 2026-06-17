# pyrefly: ignore [missing-import]
from app.extensions import db
# pyrefly: ignore [missing-import]
from app.models import UserProfile, KnowledgeTree, Streak

def award_xp(user_id, amount):
    profile = UserProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return

    profile.xp += amount
    
    # Simple leveling formula: Level = (XP / 100) + 1
    new_level = (profile.xp // 100) + 1
    if new_level > profile.level:
        profile.level = new_level
        
    update_knowledge_tree(user_id, amount)
    db.session.commit()

def update_knowledge_tree(user_id, xp_gained):
    tree = KnowledgeTree.query.filter_by(user_id=user_id).first()
    if not tree:
        return
        
    tree.growth_points += xp_gained
    
    # Tree stage logic (max 5)
    new_stage = min((tree.growth_points // 200) + 1, 5)
    tree.stage = new_stage

def award_coins(user_id, amount):
    profile = UserProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return
    profile.coins = (profile.coins or 0) + amount
    db.session.commit()
