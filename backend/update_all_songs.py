# pyrefly: ignore [missing-import]
from app import create_app
# pyrefly: ignore [missing-import]
from app.extensions import db
# pyrefly: ignore [missing-import]
from app.models import MusicTrack

app = create_app()

def update_all_songs():
    # 1. Nila Nila Odi Vaa
    nila = MusicTrack.query.filter_by(title_en="Nila Nila Odi Vaa").first()
    if nila:
        nila.lyrics_sync = [
            {"time": 0, "text_en": "Moon, Moon, run to me", "text_ta": "நிலா நிலா ஓடி வா"},
            {"time": 4, "text_en": "Do not stay in the hills.", "text_ta": "நில்லாமல் ஓடி வா."},
            {"time": 8, "text_en": "Bring the golden plate for me", "text_ta": "மலை மீது ஏறி வா"},
            {"time": 12, "text_en": "Come and play with me.", "text_ta": "மல்லிகைப் பூ கொண்டு வா."},
            {"time": 16, "text_en": "Moon, Moon, run to me", "text_ta": "நிலா நிலா ஓடி வா"},
            {"time": 20, "text_en": "Do not stay in the hills.", "text_ta": "நில்லாமல் ஓடி வா."},
            {"time": 24, "text_en": "Bring the golden plate for me", "text_ta": "மலை மீது ஏறி வா"},
            {"time": 28, "text_en": "Come and play with me.", "text_ta": "மல்லிகைப் பூ கொண்டு வா."}
        ]
        nila.melody_notes = [
            {"note": "E4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "A4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "E4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "A4", "duration": 1.0},
            {"note": "C5", "duration": 0.5}, {"note": "A4", "duration": 0.5},
            {"note": "G4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "D4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "C4", "duration": 1.0},
            {"note": "E4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "A4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "E4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "A4", "duration": 1.0},
            {"note": "C5", "duration": 0.5}, {"note": "A4", "duration": 0.5},
            {"note": "G4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "D4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "C4", "duration": 1.0}
        ]

    # 2. Alphabet Song A-Z
    alphabet = MusicTrack.query.filter_by(title_en="Alphabet Song A-Z").first()
    if alphabet:
        alphabet.lyrics_sync = [
            {"time": 0, "text_en": "A B C D E F G", "text_ta": "ஏ பி சி டி இ எஃப் ஜி"},
            {"time": 4, "text_en": "H I J K L M N O P", "text_ta": "எச் ஐ ஜே கே எல் எம் என் ஓ பி"},
            {"time": 8, "text_en": "Q R S T U V", "text_ta": "கியூ ஆர் எஸ் டி யு வி"},
            {"time": 12, "text_en": "W X Y and Z", "text_ta": "டபிள்யூ எக்ஸ் ஒய் மற்றும் இசட்"},
            {"time": 16, "text_en": "Now I know my ABCs", "text_ta": "இப்போது எனக்கு ஏபிசி தெரியும்"},
            {"time": 20, "text_en": "Next time won't you sing with me", "text_ta": "அடுத்த முறை என்னுடன் பாடுவீர்களா"}
        ]
        alphabet.melody_notes = [
            {"note": "C4", "duration": 0.5}, {"note": "C4", "duration": 0.5},
            {"note": "G4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "A4", "duration": 0.5}, {"note": "A4", "duration": 0.5},
            {"note": "G4", "duration": 1.0},
            {"note": "F4", "duration": 0.5}, {"note": "F4", "duration": 0.5},
            {"note": "E4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "D4", "duration": 0.5}, {"note": "D4", "duration": 0.5},
            {"note": "C4", "duration": 1.0},
            {"note": "G4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "F4", "duration": 0.5}, {"note": "F4", "duration": 0.5},
            {"note": "E4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "D4", "duration": 1.0},
            {"note": "G4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
            {"note": "F4", "duration": 0.5}, {"note": "F4", "duration": 0.5},
            {"note": "E4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
            {"note": "D4", "duration": 1.0}
        ]

    # 3. Sleepy Lullaby
    lullaby = MusicTrack.query.filter_by(title_en="Sleepy Lullaby").first()
    if lullaby:
        lullaby.lyrics_sync = [
            {"time": 0, "text_en": "Close your eyes, sleep tight", "text_ta": "கண்களை மூடி, நிம்மதியாக தூங்குங்கள்"},
            {"time": 5, "text_en": "The stars are shining bright.", "text_ta": "விண்மீன்கள் பிரகாசமாக ஒளிர்கின்றன."},
            {"time": 10, "text_en": "Dream of magical lands so far", "text_ta": "வெகு தொலைவில் உள்ள மாய நிலங்களை கனவு காணுங்கள்"},
            {"time": 15, "text_en": "Guided by the shining star.", "text_ta": "ஒளிரும் விண்மீன் வழிகாட்டும்."},
            {"time": 20, "text_en": "Close your eyes, sleep tight", "text_ta": "கண்களை மூடி, நிம்மதியாக தூங்குங்கள்"},
            {"time": 25, "text_en": "The stars are shining bright.", "text_ta": "விண்மீன்கள் பிரகாசமாக ஒளிர்கின்றன."}
        ]
        lullaby.melody_notes = [
            {"note": "G3", "duration": 1.5}, {"note": "E3", "duration": 1.5},
            {"note": "G3", "duration": 1.5}, {"note": "E3", "duration": 1.5},
            {"note": "D3", "duration": 2.0}, {"note": "F3", "duration": 2.0},
            {"note": "C3", "duration": 3.0},
            {"note": "G3", "duration": 1.5}, {"note": "E3", "duration": 1.5},
            {"note": "G3", "duration": 1.5}, {"note": "E3", "duration": 1.5},
            {"note": "D3", "duration": 2.0}, {"note": "F3", "duration": 2.0},
            {"note": "C3", "duration": 3.0}
        ]

    # 4. Focus Beats
    focus = MusicTrack.query.filter_by(title_en="Focus Beats").first()
    if focus:
        focus.lyrics_sync = [
            {"time": 0, "text_en": "Relax your mind...", "text_ta": "மனதை தளர்த்திக் கொள்ளுங்கள்..."},
            {"time": 4, "text_en": "Focus on the screen.", "text_ta": "திரையில் கவனம் செலுத்துங்கள்."},
            {"time": 8, "text_en": "Code your way to success.", "text_ta": "வெற்றிக்கான வழியை உருவாக்குங்கள்."},
            {"time": 12, "text_en": "Let your creativity flow", "text_ta": "உங்கள் படைப்பாற்றல் பாயட்டும்"},
            {"time": 16, "text_en": "In the zone, let it show.", "text_ta": "மண்டலத்தில், அதைக் காட்டுங்கள்."}
        ]
        focus.melody_notes = [
            {"note": "C3", "duration": 1.0}, {"note": "E3", "duration": 1.0},
            {"note": "G3", "duration": 1.0}, {"note": "B3", "duration": 1.0},
            {"note": "A3", "duration": 1.0}, {"note": "C4", "duration": 1.0},
            {"note": "E4", "duration": 1.0}, {"note": "G4", "duration": 1.0},
            {"note": "C3", "duration": 1.0}, {"note": "E3", "duration": 1.0},
            {"note": "G3", "duration": 1.0}, {"note": "B3", "duration": 1.0},
            {"note": "A3", "duration": 1.0}, {"note": "C4", "duration": 1.0},
            {"note": "E4", "duration": 1.0}, {"note": "G4", "duration": 1.0}
        ]

    # 5. Add a Melody Song if not exists
    melody = MusicTrack.query.filter_by(title_en="Peaceful Melody").first()
    if not melody:
        melody = MusicTrack(
            title_en="Peaceful Melody",
            title_ta="அமைதியான மெல்லிசை",
            artist="Calm Vibes",
            category="Melody Songs",
            audio_url="",
            is_rhyme=False,
            illustration_emoji="🌸",
            lyrics_en="Feel the peaceful breeze,\nLet it put your mind at ease.\nListen to the melody so sweet,\nLet the music guide your feet.\nFeel the peaceful breeze,\nLet it put your mind at ease.",
            lyrics_ta="அமைதியான தென்றலை உணருங்கள்,\nஉங்கள் மனதை அமைதிப்படுத்தட்டும்.\nஇனிமையான மெல்லிசையை கேளுங்கள்,\nஇசை உங்கள் கால்களை வழிநடத்தட்டும்.\nஅமைதியான தென்றலை உணருங்கள்,\nஉங்கள் மனதை அமைதிப்படுத்தட்டும்.",
            lyrics_sync=[
                {"time": 0, "text_en": "Feel the peaceful breeze", "text_ta": "அமைதியான தென்றலை உணருங்கள்"},
                {"time": 4, "text_en": "Let it put your mind at ease.", "text_ta": "உங்கள் மனதை அமைதிப்படுத்தட்டும்."},
                {"time": 8, "text_en": "Listen to the melody so sweet", "text_ta": "இனிமையான மெல்லிசையை கேளுங்கள்"},
                {"time": 12, "text_en": "Let the music guide your feet.", "text_ta": "இசை உங்கள் கால்களை வழிநடத்தட்டும்."},
                {"time": 16, "text_en": "Feel the peaceful breeze", "text_ta": "அமைதியான தென்றலை உணருங்கள்"},
                {"time": 20, "text_en": "Let it put your mind at ease.", "text_ta": "உங்கள் மனதை அமைதிப்படுத்தட்டும்."}
            ],
            melody_notes=[
                {"note": "C4", "duration": 1.0}, {"note": "E4", "duration": 1.0},
                {"note": "G4", "duration": 2.0}, {"note": "A4", "duration": 1.0},
                {"note": "G4", "duration": 2.0}, {"note": "E4", "duration": 1.0},
                {"note": "C4", "duration": 2.0}, {"note": "D4", "duration": 2.0},
                {"note": "C4", "duration": 1.0}, {"note": "E4", "duration": 1.0},
                {"note": "G4", "duration": 2.0}, {"note": "A4", "duration": 1.0},
                {"note": "G4", "duration": 2.0}, {"note": "E4", "duration": 1.0},
                {"note": "C4", "duration": 2.0}, {"note": "D4", "duration": 2.0}
            ]
        )
        db.session.add(melody)

    db.session.commit()

with app.app_context():
    update_all_songs()
    print("Updated all remaining songs to full lengths!")
