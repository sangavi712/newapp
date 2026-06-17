from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
# pyrefly: ignore [missing-import]
from app.models import MusicTrack, UserMusicInteraction, MusicPlaylist, MusicPlaylistTrack, User, Streak
# pyrefly: ignore [missing-import]
from app.extensions import db
# pyrefly: ignore [missing-import]
from app.gamification import award_xp, award_coins
from datetime import datetime, date, timedelta
import random

music_bp = Blueprint('music', __name__, url_prefix='/api/music')

@music_bp.route('', methods=['GET'])
@jwt_required()
def get_music():
    category = request.args.get('category', 'All')
    search = request.args.get('search', '').strip().lower()
    is_rhyme_filter = request.args.get('is_rhyme', None) # 'true' or 'false'

    query = MusicTrack.query

    if category != 'All':
        query = query.filter_by(category=category)

    if is_rhyme_filter == 'true':
        query = query.filter_by(is_rhyme=True)
    elif is_rhyme_filter == 'false':
        query = query.filter_by(is_rhyme=False)

    all_tracks = query.all()

    # Search filter
    if search:
        all_tracks = [t for t in all_tracks if (
            search in t.title_en.lower() or 
            (t.title_ta and search in t.title_ta.lower()) or 
            (t.artist and search in t.artist.lower()) or
            (t.lyrics_en and search in t.lyrics_en.lower()) or
            (t.lyrics_ta and search in t.lyrics_ta.lower())
        )]

    track_list = [{
        'id': t.id,
        'title_en': t.title_en,
        'title_ta': t.title_ta,
        'artist': t.artist,
        'category': t.category,
        'audio_url': t.audio_url,
        'is_rhyme': t.is_rhyme,
        'illustration_emoji': t.illustration_emoji,
        'lyrics_en': t.lyrics_en,
        'lyrics_ta': t.lyrics_ta,
        'lyrics_sync': t.lyrics_sync,
        'melody_notes': t.melody_notes,
        'play_count': t.play_count
    } for t in all_tracks]

    return jsonify(track_list), 200

@music_bp.route('/recommend', methods=['POST'])
@jwt_required()
def recommend_music():
    data = request.get_json() or {}
    mood = data.get('mood', 'happy').lower()

    # Dynamic recommendation based on mood
    query = MusicTrack.query
    if mood == 'sleep' or mood == 'relaxing':
        query = query.filter(MusicTrack.category.in_(['Sleep Music', 'Relaxing Music', 'Study Music']))
    elif mood == 'happy' or mood == 'motivational':
        query = query.filter(MusicTrack.category.in_(['Motivational Songs', 'Happy Songs', 'Folk Songs']))
    elif mood == 'kids' or mood == 'rhyme':
        query = query.filter_by(is_rhyme=True)
    
    recommended = query.limit(5).all()
    if not recommended:
        recommended = MusicTrack.query.limit(5).all()

    track_list = [{
        'id': t.id,
        'title_en': t.title_en,
        'title_ta': t.title_ta,
        'artist': t.artist,
        'category': t.category,
        'audio_url': t.audio_url,
        'is_rhyme': t.is_rhyme,
        'illustration_emoji': t.illustration_emoji,
        'lyrics_en': t.lyrics_en,
        'lyrics_ta': t.lyrics_ta,
        'lyrics_sync': t.lyrics_sync,
        'melody_notes': t.melody_notes,
        'play_count': t.play_count
    } for t in recommended]

    return jsonify(track_list), 200

@music_bp.route('/interaction', methods=['POST'])
@jwt_required()
def save_interaction():
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    track_id = data.get('track_id')
    is_favorite = data.get('is_favorite')
    is_liked = data.get('is_liked')
    progress = data.get('play_progress')

    if not track_id:
        return jsonify({'message': 'track_id is required'}), 400

    inter = UserMusicInteraction.query.filter_by(user_id=current_user_id, track_id=track_id).first()
    if not inter:
        inter = UserMusicInteraction(user_id=current_user_id, track_id=track_id)
        db.session.add(inter)

    if is_favorite is not None:
        inter.is_favorite = is_favorite
    if is_liked is not None:
        inter.is_liked = is_liked
    if progress is not None:
        inter.play_progress = float(progress)
    
    inter.last_played = datetime.utcnow()

    # If completed play, increment track play count
    if progress and float(progress) >= 0.9:
        track = MusicTrack.query.get(track_id)
        if track:
            track.play_count += 1

    db.session.commit()
    return jsonify({'message': 'Music progress updated successfully!'}), 200

@music_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    current_user_id = get_jwt_identity()
    history = UserMusicInteraction.query.filter_by(user_id=current_user_id).order_by(UserMusicInteraction.last_played.desc()).all()
    
    data = []
    for h in history:
        t = MusicTrack.query.get(h.track_id)
        if t:
            data.append({
                'track_id': t.id,
                'title_en': t.title_en,
                'title_ta': t.title_ta,
                'artist': t.artist,
                'category': t.category,
                'is_rhyme': t.is_rhyme,
                'illustration_emoji': t.illustration_emoji,
                'is_favorite': h.is_favorite,
                'is_liked': h.is_liked,
                'play_progress': h.play_progress,
                'last_played': h.last_played.isoformat()
            })
    return jsonify(data), 200

@music_bp.route('/playlists', methods=['GET', 'POST'])
@jwt_required()
def handle_playlists():
    current_user_id = get_jwt_identity()
    if request.method == 'GET':
        playlists = MusicPlaylist.query.filter_by(user_id=current_user_id).all()
        result = []
        for p in playlists:
            pt_list = MusicPlaylistTrack.query.filter_by(playlist_id=p.id).all()
            tracks = []
            for pt in pt_list:
                t = MusicTrack.query.get(pt.track_id)
                if t:
                    tracks.append({
                        'id': t.id,
                        'title_en': t.title_en,
                        'title_ta': t.title_ta,
                        'artist': t.artist,
                        'category': t.category,
                        'illustration_emoji': t.illustration_emoji
                    })
            result.append({
                'id': p.id,
                'name': p.name,
                'created_at': p.created_at.isoformat(),
                'tracks': tracks
            })
        return jsonify(result), 200
        
    elif request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        track_id = data.get('track_id')
        playlist_id = data.get('playlist_id')

        if playlist_id and track_id:
            exist = MusicPlaylistTrack.query.filter_by(playlist_id=playlist_id, track_id=track_id).first()
            if not exist:
                new_pt = MusicPlaylistTrack(playlist_id=playlist_id, track_id=track_id)
                db.session.add(new_pt)
                db.session.commit()
            return jsonify({'message': 'Track added to playlist'}), 200

        if name:
            new_p = MusicPlaylist(user_id=current_user_id, name=name)
            db.session.add(new_p)
            db.session.commit()
            return jsonify({
                'id': new_p.id,
                'name': new_p.name,
                'tracks': []
            }), 201

        return jsonify({'message': 'Invalid playlist payload'}), 400

@music_bp.route('/kids-challenge', methods=['GET'])
@jwt_required()
def get_kids_challenge():
    challenge_type = random.choice(['sound', 'phonics'])
    
    if challenge_type == 'sound':
        options = [
            {"animal": "Bird", "tamil": "பறவை", "sound_type": "chirp", "emoji": "🐦"},
            {"animal": "Cat", "tamil": "பூனை", "sound_type": "meow", "emoji": "🐱"},
            {"animal": "Cricket", "tamil": "சில்வண்டு", "sound_type": "cricket_pulse", "emoji": "🦗"},
            {"animal": "Elephant", "tamil": "யானை", "sound_type": "trumpet", "emoji": "🐘"}
        ]
        correct = random.choice(options)
        wrong = [o for o in options if o["animal"] != correct["animal"]]
        random.shuffle(wrong)
        opts = [correct['animal']] + [w['animal'] for w in wrong[:3]]
        random.shuffle(opts)
        
        return jsonify({
            'type': 'sound',
            'question_en': "Listen to the sound and guess the animal!",
            'question_ta': "ஒலியைக் கேட்டு விலங்கைக் கண்டுபிடி!",
            'sound_type': correct['sound_type'],
            'correct_answer': correct['animal'],
            'options': opts
        }), 200
    else:
        letters = ['A', 'B', 'C', 'D', 'E', 'F']
        letter = random.choice(letters)
        phonics_map = {
            'A': 'Apple (ஆப்பிள்)',
            'B': 'Ball (பந்து)',
            'C': 'Cat (பூனை)',
            'D': 'Dog (நாய்)',
            'E': 'Elephant (யானை)',
            'F': 'Fish (மீன்)'
        }
        correct = phonics_map[letter]
        wrong = [v for k, v in phonics_map.items() if k != letter]
        random.shuffle(wrong)
        opts = [correct] + wrong[:3]
        random.shuffle(opts)
        
        return jsonify({
            'type': 'phonics',
            'question_en': f"Which word starts with the letter '{letter}'?",
            'question_ta': f"'{letter}' என்ற எழுத்தில் தொடங்கும் சொல் எது?",
            'letter': letter,
            'correct_answer': correct,
            'options': opts
        }), 200

@music_bp.route('/kids-submit', methods=['POST'])
@jwt_required()
def submit_kids_challenge():
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    is_correct = data.get('is_correct', False)

    if not is_correct:
        return jsonify({'message': 'Try again next time! Keep learning.', 'xp_reward': 0, 'coin_reward': 0}), 200

    award_xp(current_user_id, 35)
    award_coins(current_user_id, 15)

    streak = Streak.query.filter_by(user_id=current_user_id).first()
    if not streak:
        streak = Streak(user_id=current_user_id, current_streak=1)
        db.session.add(streak)
    else:
        today = date.today()
        if streak.last_login_date is None or streak.last_login_date < today:
            yesterday = today - timedelta(days=1)
            if streak.last_login_date == yesterday:
                streak.current_streak += 1
                streak.highest_streak = max(streak.highest_streak, streak.current_streak)
            else:
                streak.current_streak = 1
            streak.last_login_date = today

    db.session.commit()

    return jsonify({
        'message': 'Challenge complete! +35 XP and +15 Coins awarded.',
        'xp_reward': 35,
        'coin_reward': 15,
        'streak': streak.current_streak if streak else 1
    }), 200
