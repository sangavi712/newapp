# pyrefly: ignore [missing-import]
from app import create_app
# pyrefly: ignore [missing-import]
from app.extensions import db
# pyrefly: ignore [missing-import]
from app.models import MusicTrack

app = create_app()

songs = [
    MusicTrack(
        title_en="Never Give Up",
        title_ta="விடாமுயற்சி வெற்றி தரும்",
        artist="BuddyLearn Motivation",
        category="Motivational Songs",
        audio_url="",
        is_rhyme=False,
        illustration_emoji="🔥",
        lyrics_en="When the road is tough, and you feel so low,\nJust keep pushing forward, let your spirit grow.\nNever give up, you are a star,\nYou can reach the sky, you can go so far!",
        lyrics_ta="பாதை கடினமாக இருக்கும் போது, நீங்கள் சோர்ந்து போகும் போது,\nதொடர்ந்து முன்னேறுங்கள், உங்கள் ஆவி வளரட்டும்.\nஒருபோதும் விட்டுவிடாதீர்கள், நீங்கள் ஒரு நட்சத்திரம்,\nநீங்கள் வானத்தை அடையலாம், நீங்கள் வெகுதூரம் செல்லலாம்!",
        lyrics_sync=[
            {"time": 0, "text_en": "When the road is tough, and you feel so low", "text_ta": "பாதை கடினமாக இருக்கும் போது, நீங்கள் சோர்ந்து போகும் போது"},
            {"time": 4, "text_en": "Just keep pushing forward, let your spirit grow.", "text_ta": "தொடர்ந்து முன்னேறுங்கள், உங்கள் ஆவி வளரட்டும்."},
            {"time": 8, "text_en": "Never give up, you are a star", "text_ta": "ஒருபோதும் விட்டுவிடாதீர்கள், நீங்கள் ஒரு நட்சத்திரம்"},
            {"time": 12, "text_en": "You can reach the sky, you can go so far!", "text_ta": "நீங்கள் வானத்தை அடையலாம், நீங்கள் வெகுதூரம் செல்லலாம்!"}
        ],
        melody_notes=[
            {"note": "C4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "G4", "duration": 0.5}, {"note": "C5", "duration": 1.0},
            {"note": "A4", "duration": 0.5}, {"note": "G4", "duration": 1.0},
            {"note": "F4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "D4", "duration": 0.5}, {"note": "C4", "duration": 1.5}
        ]
    ),
    MusicTrack(
        title_en="Achieve Your Dreams",
        title_ta="உங்கள் கனவுகளை அடையுங்கள்",
        artist="Dream Big AI",
        category="Motivational Songs",
        audio_url="",
        is_rhyme=False,
        illustration_emoji="🚀",
        lyrics_en="Dream big, work hard, never let it fall.\nYou have the power to conquer it all.",
        lyrics_ta="பெரியதாக கனவு காணுங்கள், கடினமாக உழைக்கிறீர்கள், ஒருபோதும் விழ விடாதீர்கள்.\nஎல்லாவற்றையும் வெல்லும் சக்தி உங்களுக்கு உள்ளது.",
        lyrics_sync=[
            {"time": 0, "text_en": "Dream big, work hard, never let it fall.", "text_ta": "பெரியதாக கனவு காணுங்கள், கடினமாக உழைக்கிறீர்கள்"},
            {"time": 4, "text_en": "You have the power to conquer it all.", "text_ta": "எல்லாவற்றையும் வெல்லும் சக்தி உங்களுக்கு உள்ளது."}
        ],
        melody_notes=[
            {"note": "E4", "duration": 1.0}, {"note": "G4", "duration": 1.0},
            {"note": "C5", "duration": 2.0}, {"note": "B4", "duration": 1.0},
            {"note": "A4", "duration": 1.0}, {"note": "G4", "duration": 2.0}
        ]
    ),
    MusicTrack(
        title_en="Tamil Tech Beats",
        title_ta="தமிழ் டெக் பீட்ஸ்",
        artist="Trending Tamil",
        category="Tamil Songs",
        audio_url="",
        is_rhyme=False,
        illustration_emoji="🎧",
        lyrics_en="Dance to the rhythm of the modern beat,\nFeel the energy moving your feet.",
        lyrics_ta="நவீன தாளத்தின் தாளத்திற்கு நடனமாடுங்கள்,\nஉங்கள் கால்களை நகர்த்தும் ஆற்றலை உணருங்கள்.",
        lyrics_sync=[
            {"time": 0, "text_en": "Dance to the rhythm of the modern beat", "text_ta": "நவீன தாளத்தின் தாளத்திற்கு நடனமாடுங்கள்"},
            {"time": 4, "text_en": "Feel the energy moving your feet.", "text_ta": "உங்கள் கால்களை நகர்த்தும் ஆற்றலை உணருங்கள்."}
        ],
        melody_notes=[
            {"note": "C4", "duration": 0.2}, {"note": "C4", "duration": 0.2}, {"note": "G4", "duration": 0.4},
            {"note": "C4", "duration": 0.2}, {"note": "C4", "duration": 0.2}, {"note": "G4", "duration": 0.4},
            {"note": "A4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "F4", "duration": 0.5}, {"note": "E4", "duration": 0.5}
        ]
    ),
    MusicTrack(
        title_en="Study Chill Lo-Fi",
        title_ta="ஸ்டடி சில் லோ-ஃபை",
        artist="Lofi Study Engine",
        category="Study Music",
        audio_url="",
        is_rhyme=False,
        illustration_emoji="☕",
        lyrics_en="Breathe in, breathe out,\nClear your mind of any doubt.",
        lyrics_ta="மூச்சை உள்ளிழுங்கள், மூச்சை வெளியே விடுங்கள்,\nஎந்த சந்தேகத்தையும் உங்கள் மனதை அழிக்கவும்.",
        lyrics_sync=[
            {"time": 0, "text_en": "Breathe in, breathe out", "text_ta": "மூச்சை உள்ளிழுங்கள், மூச்சை வெளியே விடுங்கள்"},
            {"time": 4, "text_en": "Clear your mind of any doubt.", "text_ta": "எந்த சந்தேகத்தையும் உங்கள் மனதை அழிக்கவும்."}
        ],
        melody_notes=[
            {"note": "A3", "duration": 1.5}, {"note": "C4", "duration": 1.5},
            {"note": "E4", "duration": 2.0}, {"note": "D4", "duration": 1.5},
            {"note": "C4", "duration": 1.5}
        ]
    ),
    MusicTrack(
        title_en="Happy Morning Pop",
        title_ta="மகிழ்ச்சியான காலை பாப்",
        artist="Trending English",
        category="English Songs",
        audio_url="",
        is_rhyme=False,
        illustration_emoji="🌅",
        lyrics_en="Wake up to a brand new day,\nChase all your worries away!",
        lyrics_ta="ஒரு புதிய விடியலில் எழுந்திருங்கள்,\nஉங்கள் கவலைகள் அனைத்தையும் துரத்துங்கள்!",
        lyrics_sync=[
            {"time": 0, "text_en": "Wake up to a brand new day", "text_ta": "ஒரு புதிய விடியலில் எழுந்திருங்கள்"},
            {"time": 4, "text_en": "Chase all your worries away!", "text_ta": "உங்கள் கவலைகள் அனைத்தையும் துரத்துங்கள்!"}
        ],
        melody_notes=[
            {"note": "G4", "duration": 0.5}, {"note": "A4", "duration": 0.5},
            {"note": "B4", "duration": 0.5}, {"note": "C5", "duration": 1.0},
            {"note": "E5", "duration": 1.0}, {"note": "D5", "duration": 1.0}
        ]
    ),
    MusicTrack(
        title_en="Rise and Shine",
        title_ta="எழுந்து பிரகாசி",
        artist="BuddyLearn Inspiration",
        category="Motivational Songs",
        audio_url="",
        is_rhyme=False,
        illustration_emoji="☀️",
        lyrics_en="Every morning is a new chance to try,\nSpread your wings and you will fly.",
        lyrics_ta="ஒவ்வொரு காலையும் முயற்சி செய்ய ஒரு புதிய வாய்ப்பு,\nஉங்கள் சிறகுகளை விரித்து நீங்கள் பறப்பீர்கள்.",
        lyrics_sync=[
            {"time": 0, "text_en": "Every morning is a new chance to try", "text_ta": "ஒவ்வொரு காலையும் முயற்சி செய்ய ஒரு புதிய வாய்ப்பு"},
            {"time": 4, "text_en": "Spread your wings and you will fly.", "text_ta": "உங்கள் சிறகுகளை விரித்து நீங்கள் பறப்பீர்கள்."}
        ],
        melody_notes=[
            {"note": "C4", "duration": 0.5}, {"note": "D4", "duration": 0.5},
            {"note": "E4", "duration": 0.5}, {"note": "F4", "duration": 0.5},
            {"note": "G4", "duration": 1.0}, {"note": "A4", "duration": 1.0}
        ]
    )
]

with app.app_context():
    db.session.add_all(songs)
    db.session.commit()
    print("Added 6 new trending / motivational songs!")
