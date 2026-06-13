# pyrefly: ignore [missing-import]
from app import create_app
# pyrefly: ignore [missing-import]
from app.extensions import db
# pyrefly: ignore [missing-import]
from app.models import MusicTrack

app = create_app()

def update_songs():
    # 1. Twinkle Twinkle Little Star
    twinkle = MusicTrack.query.filter_by(title_en="Twinkle Twinkle Little Star").first()
    if twinkle:
        twinkle.lyrics_en = "Twinkle, twinkle, little star,\nHow I wonder what you are!\nUp above the world so high,\nLike a diamond in the sky.\nTwinkle, twinkle, little star,\nHow I wonder what you are!"
        twinkle.lyrics_ta = "மினுமினுக்கும் விண்மீனே,\nநீ யார் என்று வியக்கிறேன்!\nஉலகிற்கு மேலே மிக உயரத்தில்,\nவானில் ஒரு வைரத்தைப் போல.\nமினுமினுக்கும் விண்மீனே,\nநீ யார் என்று வியக்கிறேன்!"
        twinkle.lyrics_sync = [
            {"time": 0, "text_en": "Twinkle, twinkle, little star", "text_ta": "மினுமினுக்கும் விண்மீனே"},
            {"time": 4, "text_en": "How I wonder what you are!", "text_ta": "நீ யார் என்று வியக்கிறேன்!"},
            {"time": 8, "text_en": "Up above the world so high", "text_ta": "உலகிற்கு மேலே மிக உயரத்தில்"},
            {"time": 12, "text_en": "Like a diamond in the sky.", "text_ta": "வானில் ஒரு வைரத்தைப் போல."},
            {"time": 16, "text_en": "Twinkle, twinkle, little star", "text_ta": "மினுமினுக்கும் விண்மீனே"},
            {"time": 20, "text_en": "How I wonder what you are!", "text_ta": "நீ யார் என்று வியக்கிறேன்!"}
        ]
        twinkle.melody_notes = [
            {"note": "C4", "duration": 0.5}, {"note": "C4", "duration": 0.5},
            {"note": "G4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "A4", "duration": 0.5}, {"note": "A4", "duration": 0.5},
            {"note": "G4", "duration": 1.0},
            {"note": "F4", "duration": 0.5}, {"note": "F4", "duration": 0.5},
            {"note": "E4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "D4", "duration": 0.5}, {"note": "D4", "duration": 0.5},
            {"note": "C4", "duration": 1.0},
            {"note": "C4", "duration": 0.5}, {"note": "C4", "duration": 0.5},
            {"note": "G4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "A4", "duration": 0.5}, {"note": "A4", "duration": 0.5},
            {"note": "G4", "duration": 1.0},
            {"note": "F4", "duration": 0.5}, {"note": "F4", "duration": 0.5},
            {"note": "E4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "D4", "duration": 0.5}, {"note": "D4", "duration": 0.5},
            {"note": "C4", "duration": 1.0}
        ]

    # 2. Never Give Up
    never_give_up = MusicTrack.query.filter_by(title_en="Never Give Up").first()
    if never_give_up:
        never_give_up.lyrics_sync = [
            {"time": 0, "text_en": "When the road is tough, and you feel so low", "text_ta": "பாதை கடினமாக இருக்கும் போது, நீங்கள் சோர்ந்து போகும் போது"},
            {"time": 4, "text_en": "Just keep pushing forward, let your spirit grow.", "text_ta": "தொடர்ந்து முன்னேறுங்கள், உங்கள் ஆவி வளரட்டும்."},
            {"time": 8, "text_en": "Never give up, you are a star", "text_ta": "ஒருபோதும் விட்டுவிடாதீர்கள், நீங்கள் ஒரு நட்சத்திரம்"},
            {"time": 12, "text_en": "You can reach the sky, you can go so far!", "text_ta": "நீங்கள் வானத்தை அடையலாம், நீங்கள் வெகுதூரம் செல்லலாம்!"},
            {"time": 16, "text_en": "Through the darkest night, you will find the light", "text_ta": "இருண்ட இரவில், நீங்கள் ஒளியைக் காண்பீர்கள்"},
            {"time": 20, "text_en": "Keep your dreams alive, everything will be alright.", "text_ta": "உங்கள் கனவுகளை உயிரோடு வைத்திருங்கள், எல்லாம் சரியாகிவிடும்."},
            {"time": 24, "text_en": "Never give up, you are a star", "text_ta": "ஒருபோதும் விட்டுவிடாதீர்கள், நீங்கள் ஒரு நட்சத்திரம்"},
            {"time": 28, "text_en": "You can reach the sky, you can go so far!", "text_ta": "நீங்கள் வானத்தை அடையலாம், நீங்கள் வெகுதூரம் செல்லலாம்!"}
        ]
        never_give_up.melody_notes = [
            {"note": "C4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "G4", "duration": 0.5}, {"note": "C5", "duration": 1.0},
            {"note": "A4", "duration": 0.5}, {"note": "G4", "duration": 1.0},
            {"note": "F4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "D4", "duration": 0.5}, {"note": "C4", "duration": 1.5},
            {"note": "E4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "C5", "duration": 0.5}, {"note": "E5", "duration": 1.0},
            {"note": "D5", "duration": 0.5}, {"note": "C5", "duration": 1.0},
            {"note": "A4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "F4", "duration": 0.5}, {"note": "E4", "duration": 1.5}
        ]

    # 3. Achieve Your Dreams
    achieve = MusicTrack.query.filter_by(title_en="Achieve Your Dreams").first()
    if achieve:
        achieve.lyrics_sync = [
            {"time": 0, "text_en": "Dream big, work hard, never let it fall.", "text_ta": "பெரியதாக கனவு காணுங்கள், கடினமாக உழைக்கிறீர்கள்"},
            {"time": 4, "text_en": "You have the power to conquer it all.", "text_ta": "எல்லாவற்றையும் வெல்லும் சக்தி உங்களுக்கு உள்ளது."},
            {"time": 8, "text_en": "Every single step is a victory won,", "text_ta": "ஒவ்வொரு அடியும் ஒரு வெற்றி"},
            {"time": 12, "text_en": "Keep on moving till the race is done.", "text_ta": "பந்தயம் முடியும் வரை தொடர்ந்து செல்லுங்கள்."},
            {"time": 16, "text_en": "Dream big, work hard, never let it fall.", "text_ta": "பெரியதாக கனவு காணுங்கள், கடினமாக உழைக்கிறீர்கள்"},
            {"time": 20, "text_en": "You have the power to conquer it all.", "text_ta": "எல்லாவற்றையும் வெல்லும் சக்தி உங்களுக்கு உள்ளது."}
        ]
        achieve.melody_notes = [
            {"note": "E4", "duration": 1.0}, {"note": "G4", "duration": 1.0},
            {"note": "C5", "duration": 2.0}, {"note": "B4", "duration": 1.0},
            {"note": "A4", "duration": 1.0}, {"note": "G4", "duration": 2.0},
            {"note": "F4", "duration": 1.0}, {"note": "E4", "duration": 1.0},
            {"note": "D4", "duration": 2.0}, {"note": "C4", "duration": 1.0},
            {"note": "D4", "duration": 1.0}, {"note": "E4", "duration": 2.0}
        ]

    # 4. Tamil Tech Beats
    tech_beats = MusicTrack.query.filter_by(title_en="Tamil Tech Beats").first()
    if tech_beats:
        tech_beats.lyrics_sync = [
            {"time": 0, "text_en": "Dance to the rhythm of the modern beat", "text_ta": "நவீன தாளத்தின் தாளத்திற்கு நடனமாடுங்கள்"},
            {"time": 4, "text_en": "Feel the energy moving your feet.", "text_ta": "உங்கள் கால்களை நகர்த்தும் ஆற்றலை உணருங்கள்."},
            {"time": 8, "text_en": "Technology and music, hand in hand", "text_ta": "தொழில்நுட்பமும் இசையும், கைகோர்த்து"},
            {"time": 12, "text_en": "We are the creators of a brand new land.", "text_ta": "நாம் ஒரு புதிய நிலத்தை உருவாக்குபவர்கள்."},
            {"time": 16, "text_en": "Dance to the rhythm of the modern beat", "text_ta": "நவீன தாளத்தின் தாளத்திற்கு நடனமாடுங்கள்"},
            {"time": 20, "text_en": "Feel the energy moving your feet.", "text_ta": "உங்கள் கால்களை நகர்த்தும் ஆற்றலை உணருங்கள்."}
        ]
        tech_beats.melody_notes = [
            {"note": "C4", "duration": 0.2}, {"note": "C4", "duration": 0.2}, {"note": "G4", "duration": 0.4},
            {"note": "C4", "duration": 0.2}, {"note": "C4", "duration": 0.2}, {"note": "G4", "duration": 0.4},
            {"note": "A4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "F4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "C4", "duration": 0.2}, {"note": "C4", "duration": 0.2}, {"note": "G4", "duration": 0.4},
            {"note": "C4", "duration": 0.2}, {"note": "C4", "duration": 0.2}, {"note": "G4", "duration": 0.4},
            {"note": "A4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "F4", "duration": 0.5}, {"note": "E4", "duration": 0.5}
        ]

    db.session.commit()

with app.app_context():
    update_songs()
    print("Updated songs with full lyrics!")
