from app import create_app
from app.extensions import db
from app.models import KidsLesson

app = create_app()

def generate_english_alphabets():
    letters = []
    words = {
        'A': ('Apple', 'ஆப்பிள்', '🍎', 'A is for Apple. It is a sweet red fruit.', 'A என்பது ஆப்பிள். இது ஒரு இனிமையான சிவப்பு பழம்.'),
        'B': ('Ball', 'பந்து', '⚽', 'B is for Ball. I like to kick the ball.', 'B என்பது பந்து. நான் பந்தை உதைக்க விரும்புகிறேன்.'),
        'C': ('Cat', 'பூனை', '🐱', 'C is for Cat. The cat says meow.', 'C என்பது பூனை. பூனை மியாவ் என்று கூறுகிறது.'),
        'D': ('Dog', 'நாய்', '🐶', 'D is for Dog. The dog wags its tail.', 'D என்பது நாய். நாய் தன் வாலை ஆட்டுகிறது.'),
        'E': ('Elephant', 'யானை', '🐘', 'E is for Elephant. It has a long trunk.', 'E என்பது யானை. இதற்கு நீண்ட தும்பிக்கை உள்ளது.'),
        'F': ('Fish', 'மீன்', '🐟', 'F is for Fish. It swims in the water.', 'F என்பது மீன். இது தண்ணீரில் நீந்துகிறது.'),
        'G': ('Goat', 'ஆடு', '🐐', 'G is for Goat. It eats green grass.', 'G என்பது ஆடு. இது பச்சை புல் சாப்பிடுகிறது.'),
        'H': ('Hat', 'தொப்பி', '🎩', 'H is for Hat. I wear a hat on my head.', 'H என்பது தொப்பி. நான் தலையில் தொப்பி அணிகிறேன்.'),
        'I': ('Ice cream', 'ஐஸ்கிரீம்', '🍦', 'I is for Ice cream. It is cold and sweet.', 'I என்பது ஐஸ்கிரீம். இது குளிர்ச்சியாகவும் இனிப்பாகவும் இருக்கும்.'),
        'J': ('Juice', 'பழச்சாறு', '🧃', 'J is for Juice. I drink apple juice.', 'J என்பது பழச்சாறு. நான் ஆப்பிள் சாறு குடிக்கிறேன்.'),
        'K': ('Kite', 'பட்டம்', '🪁', 'K is for Kite. It flies high in the sky.', 'K என்பது பட்டம். இது வானத்தில் உயரமாக பறக்கிறது.'),
        'L': ('Lion', 'சிங்கம்', '🦁', 'L is for Lion. It is the king of the jungle.', 'L என்பது சிங்கம். இது காட்டின் ராஜா.'),
        'M': ('Monkey', 'குரங்கு', '🐒', 'M is for Monkey. It jumps on trees.', 'M என்பது குரங்கு. இது மரங்களில் குதிக்கும்.'),
        'N': ('Nest', 'கூடு', '🪹', 'N is for Nest. The bird lives in a nest.', 'N என்பது கூடு. பறவை ஒரு கூட்டில் வாழ்கிறது.'),
        'O': ('Orange', 'ஆரஞ்சு', '🍊', 'O is for Orange. It is a juicy fruit.', 'O என்பது ஆரஞ்சு. இது ஒரு பழச்சாறு நிறைந்த பழம்.'),
        'P': ('Pig', 'பன்றி', '🐷', 'P is for Pig. It says oink oink.', 'P என்பது பன்றி. இது ஆயிங்க் ஆயிங்க் என்று கூறுகிறது.'),
        'Q': ('Queen', 'ராணி', '👑', 'Q is for Queen. She wears a crown.', 'Q என்பது ராணி. அவர் கிரீடம் அணிகிறார்.'),
        'R': ('Rabbit', 'முயல்', '🐰', 'R is for Rabbit. It loves to eat carrots.', 'R என்பது முயல். இது கேரட் சாப்பிட விரும்புகிறது.'),
        'S': ('Sun', 'சூரியன்', '☀️', 'S is for Sun. It shines brightly.', 'S என்பது சூரியன். இது பிரகாசமாக ஒளிர்கிறது.'),
        'T': ('Tiger', 'புலி', '🐅', 'T is for Tiger. It has orange and black stripes.', 'T என்பது புலி. இதற்கு ஆரஞ்சு மற்றும் கருப்பு கோடுகள் உள்ளன.'),
        'U': ('Umbrella', 'குடை', '☂️', 'U is for Umbrella. It protects us from rain.', 'U என்பது குடை. இது மழையிலிருந்து நம்மைப் பாதுகாக்கிறது.'),
        'V': ('Van', 'வேன்', '🚐', 'V is for Van. We go to school in a van.', 'V என்பது வேன். நாங்கள் வேனில் பள்ளிக்குச் செல்கிறோம்.'),
        'W': ('Watermelon', 'தர்பூசணி', '🍉', 'W is for Watermelon. It is red inside.', 'W என்பது தர்பூசணி. இது உள்ளே சிவப்பு நிறமாக இருக்கும்.'),
        'X': ('Xylophone', 'சைலோபோன்', '🎹', 'X is for Xylophone. It makes sweet music.', 'X என்பது சைலோபோன். இது இனிமையான இசையை உருவாக்குகிறது.'),
        'Y': ('Yak', 'யாக்', '🐂', 'Y is for Yak. It lives in the mountains.', 'Y என்பது யாக். இது மலைகளில் வாழ்கிறது.'),
        'Z': ('Zebra', 'வரிக்குதிரை', '🦓', 'Z is for Zebra. It has black and white stripes.', 'Z என்பது வரிக்குதிரை. இது கருப்பு வெள்ளை கோடுகளைக் கொண்டுள்ளது.')
    }
    
    import string
    for char in string.ascii_uppercase:
        lower = char.lower()
        word_info = words.get(char, (char, char, '❓', f'{char} is for {char}', f'{char} என்பது {char}'))
        letters.append({
            "char": char,
            "lowercase": lower,
            "phonics": lower,
            "word": word_info[0],
            "tamil_word": word_info[1],
            "emoji": word_info[2],
            "sentence": word_info[3],
            "sentence_ta": word_info[4]
        })
    return letters

def generate_numbers():
    numbers = []
    tamil_digits = ['௦','௧','௨','௩','௪','௫','௬','௭','௮','௯']
    
    def to_tamil_num(n):
        return "".join([tamil_digits[int(d)] for d in str(n)])
    
    for i in range(1, 101):
        numbers.append({
            "val": i,
            "tamil_val": to_tamil_num(i),
            "word": str(i),
            "tamil_word": str(i),
            "emoji": "🎈" * min(i, 5),  # display up to 5 balloons
            "count": min(i, 5)  # cap emoji count visually to prevent lag
        })
    return numbers

def generate_tamil():
    uyir_data = [
        {"char": "அ", "word": "அம்மா", "trans": "Amma / Mother", "emoji": "👩", "sentence": "அம்மா என்னை மிகவும் நேசிக்கிறார்.", "sentence_en": "Mother loves me very much."},
        {"char": "ஆ", "word": "ஆடு", "trans": "Aadu / Goat", "emoji": "🐐", "sentence": "ஆடு புல் மேய்கிறது.", "sentence_en": "The goat eats grass."},
        {"char": "இ", "word": "இலை", "trans": "Ilai / Leaf", "emoji": "🍃", "sentence": "இலை மரத்திலிருந்து விழுகிறது.", "sentence_en": "The leaf falls from the tree."},
        {"char": "ஈ", "word": "ஈட்டி", "trans": "Eetti / Spear", "emoji": "🗡️", "sentence": "வேடன் ஈட்டி வீசினான்.", "sentence_en": "The hunter threw the spear."},
        {"char": "உ", "word": "உலக்கை", "trans": "Ulakai / Pestle", "emoji": "🥖", "sentence": "உலக்கையால் மாவு இடித்தார்.", "sentence_en": "Pounded flour with pestle."},
        {"char": "ஊ", "word": "ஊஞ்சல்", "trans": "Oonjal / Swing", "emoji": "🪢", "sentence": "நான் ஊஞ்சலில் விளையாடினேன்.", "sentence_en": "I played on the swing."},
        {"char": "எ", "word": "எலி", "trans": "Eli / Mouse", "emoji": "🐭", "sentence": "எலி ஓடியது.", "sentence_en": "The mouse ran."},
        {"char": "ஏ", "word": "ஏணி", "trans": "Eani / Ladder", "emoji": "🪜", "sentence": "ஏணியில் ஏறினான்.", "sentence_en": "Climbed the ladder."},
        {"char": "ஐ", "word": "ஐந்து", "trans": "Ainthu / Five", "emoji": "🖐️", "sentence": "எனக்கு ஐந்து விரல்கள் உள்ளன.", "sentence_en": "I have five fingers."},
        {"char": "ஒ", "word": "ஒட்டகம்", "trans": "Ottagam / Camel", "emoji": "🐪", "sentence": "ஒட்டகம் பாலைவனத்தில் வாழும்.", "sentence_en": "Camel lives in desert."},
        {"char": "ஓ", "word": "ஓடம்", "trans": "Odam / Boat", "emoji": "🛶", "sentence": "ஓடம் ஆற்றில் செல்கிறது.", "sentence_en": "Boat goes in river."},
        {"char": "ஔ", "word": "ஔவையார்", "trans": "Avvaiyar / Poet", "emoji": "👵", "sentence": "ஔவையார் பாடினார்.", "sentence_en": "Avvaiyar sang."},
    ]
    mei_data = [
        {"char": "க்", "word": "கொக்கு", "trans": "Kokku / Heron", "emoji": "🦩", "sentence": "கொக்கு மீன் பிடித்தது.", "sentence_en": "Heron caught fish."},
        {"char": "ங்", "word": "சிங்கம்", "trans": "Singam / Lion", "emoji": "🦁", "sentence": "சிங்கம் கர்ஜித்தது.", "sentence_en": "Lion roared."},
        {"char": "ச்", "word": "பச்சை", "trans": "Pachai / Green", "emoji": "🟢", "sentence": "இலை பச்சை நிறம்.", "sentence_en": "Leaf is green."},
        {"char": "ஞ்", "word": "மஞ்சள்", "trans": "Manjal / Yellow", "emoji": "🟡", "sentence": "சூரியன் மஞ்சள் நிறம்.", "sentence_en": "Sun is yellow."},
        {"char": "ட்", "word": "பட்டம்", "trans": "Pattam / Kite", "emoji": "🪁", "sentence": "பட்டம் பறந்தது.", "sentence_en": "Kite flew."},
        {"char": "ண்", "word": "கண்", "trans": "Kan / Eye", "emoji": "👁️", "sentence": "கண் பார்க்க உதவும்.", "sentence_en": "Eye helps to see."},
        {"char": "த்", "word": "வாத்து", "trans": "Vaathu / Duck", "emoji": "🦆", "sentence": "வாத்து நீந்தியது.", "sentence_en": "Duck swam."},
        {"char": "ந்", "word": "பந்து", "trans": "Panthu / Ball", "emoji": "⚽", "sentence": "பந்து உருண்டது.", "sentence_en": "Ball rolled."},
        {"char": "ப்", "word": "கப்பல்", "trans": "Kappal / Ship", "emoji": "🚢", "sentence": "கப்பல் கடலில் சென்றது.", "sentence_en": "Ship sailed in sea."},
        {"char": "ம்", "word": "மரம்", "trans": "Maram / Tree", "emoji": "🌳", "sentence": "மரம் நிழல் தரும்.", "sentence_en": "Tree gives shade."},
        {"char": "ய்", "word": "நாய்", "trans": "Naai / Dog", "emoji": "🐶", "sentence": "நாய் குரைத்தது.", "sentence_en": "Dog barked."},
        {"char": "ர்", "word": "தேர்", "trans": "Ther / Chariot", "emoji": "🛕", "sentence": "தேர் ஓடியது.", "sentence_en": "Chariot ran."},
        {"char": "ல்", "word": "பல்", "trans": "Pal / Tooth", "emoji": "🦷", "sentence": "பல் வெண்மை.", "sentence_en": "Tooth is white."},
        {"char": "வ்", "word": "செவ்வந்தி", "trans": "Sevvandhi / Chrysanthemum", "emoji": "🌼", "sentence": "செவ்வந்தி பூத்தது.", "sentence_en": "Flower bloomed."},
        {"char": "ழ்", "word": "யாழ்", "trans": "Yaazh / Harp", "emoji": "🪕", "sentence": "யாழ் இசைத்தாள்.", "sentence_en": "Played harp."},
        {"char": "ள்", "word": "வாள்", "trans": "Vaal / Sword", "emoji": "🗡️", "sentence": "வாள் கூர்மையானது.", "sentence_en": "Sword is sharp."},
        {"char": "ற்", "word": "கற்கள்", "trans": "Karkal / Stones", "emoji": "🪨", "sentence": "கற்கள் கடினமானவை.", "sentence_en": "Stones are hard."},
        {"char": "ன்", "word": "மீன்", "trans": "Meen / Fish", "emoji": "🐟", "sentence": "மீன் நீந்தியது.", "sentence_en": "Fish swam."}
    ]
    return uyir_data, mei_data

with app.app_context():
    english_lesson = KidsLesson.query.filter_by(category="english").first()
    if english_lesson:
        english_lesson.content_data = {"letters": generate_english_alphabets()}
        
    numbers_lesson = KidsLesson.query.filter_by(category="numbers").first()
    if numbers_lesson:
        numbers_lesson.content_data = {"numbers": generate_numbers()}
        
    tamil_lesson = KidsLesson.query.filter_by(category="tamil").first()
    if tamil_lesson:
        uyir, mei = generate_tamil()
        tamil_lesson.content_data = {"uyir": uyir, "mei": mei}
        
    db.session.commit()
    print("Successfully expanded all kids lessons (26 alphabets, 100 numbers, 12+18 Tamil letters)!")
