from app import create_app
from app.extensions import db
from app.models import CodingLesson, Vocabulary, DailyChallenge, Achievement, Story, MusicTrack, KidsLesson
from datetime import date

app = create_app()
with app.app_context():
    # Clear existing data
    db.drop_all()
    db.create_all()

    # Seed coding lessons
    lessons = [
        # Beginner
        CodingLesson(language="Python", topic="Variables and Data Types", xp_reward=30, order=1, content="""
# Variables & Data Types
In Python, variables are containers for storing data values. Unlike other languages, Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.

## Basic Data Types
* **str:** Text type, defined with single or double quotes, e.g. `name = "Alice"`
* **int:** Integer numeric type, e.g. `age = 25`
* **float:** Decimal numeric type, e.g. `height = 1.75`
* **bool:** Boolean logical type, either `True` or `False`, e.g. `is_student = True`

## Try It!
Assign a value of `10` to a variable named `x` and a value of `5` to a variable named `y`.
        """),
        CodingLesson(language="Python", topic="Conditional Statements", xp_reward=30, order=2, content="""
# Conditional Statements (if-else)
Python supports the usual logical conditions from mathematics. These conditions can be used in several ways, most commonly in "if statements" and loops.

## Syntax
```python
if a > b:
    print("a is greater than b")
elif a == b:
    print("a and b are equal")
else:
    print("b is greater than a")
```
Python relies on **indentation** (whitespace at the beginning of a line) to define scope in the code.

## Try It!
Create an `if` block that checks if `score` is greater than 80, and prints `"Pass"`.
        """),
        CodingLesson(language="Python", topic="Loops and Iteration", xp_reward=40, order=3, content="""
# Loops: for and while
Python has two primitive loop commands:
* `while` loops: executes a set of statements as long as a condition is true.
* `for` loops: used for iterating over a sequence (list, tuple, dictionary, set, or string).

## Example: For Loop
```python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
```

## Example: While Loop
```python
i = 1
while i < 6:
    print(i)
    i += 1
```
        """),
        
        # Intermediate
        CodingLesson(language="Python", topic="Functions and Arguments", xp_reward=45, order=4, content="""
# Functions
A function is a block of code which only runs when it is called. You can pass data, known as parameters, into a function. A function can return data as a result.

## Defining a Function
In Python, a function is defined using the `def` keyword:
```python
def greet(name):
    return "Hello, " + name + "!"
```

## Calling a Function
```python
message = greet("Alice")
print(message)
```
        """),
        CodingLesson(language="Python", topic="Lists and Dictionaries", xp_reward=45, order=5, content="""
# Lists & Dictionaries
Lists and Dictionaries are the most common collection data types in Python.

## Lists (Ordered, mutable)
```python
my_list = ["apple", "banana", "cherry"]
my_list.append("orange")
```

## Dictionaries (Key-value pairs, mutable)
```python
my_dict = {
    "brand": "Ford",
    "model": "Mustang",
    "year": 1964
}
print(my_dict["brand"])
```
        """),
        CodingLesson(language="Python", topic="File Handling", xp_reward=50, order=6, content="""
# File Handling
The key function for working with files in Python is the `open()` function.

## Reading a File
```python
with open("demofile.txt", "r") as file:
    content = file.read()
    print(content)
```
Using `with open(...)` is the best practice as it automatically closes the file after the block code finishes.
        """),
        
        # Advanced
        CodingLesson(language="Python", topic="Object Oriented Programming", xp_reward=60, order=7, content="""
# Object-Oriented Programming (OOP)
Python is an object-oriented programming language. Almost everything in Python is an object, with its properties and methods.

## Class Creation
```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        return f"Hi, I am {self.name}"

p1 = Person("John", 36)
print(p1.greet())
```
        """),
        CodingLesson(language="Python", topic="Error and Exception Handling", xp_reward=60, order=8, content="""
# Exception Handling (try-except)
When an error occurs, or exception as we call it, Python will normally stop and generate an error message. These exceptions can be handled using the `try` statement.

## Example
```python
try:
    print(x)
except NameError:
    print("Variable x is not defined")
except Exception as e:
    print("Something else went wrong:", e)
finally:
    print("The 'try except' is finished")
```
        """),
        CodingLesson(language="Python", topic="Decorators and Generators", xp_reward=70, order=9, content="""
# Decorators & Generators
Decorators and Generators are advanced features in Python.

## Decorators
A decorator takes in a function, adds some functionality, and returns it.
```python
def my_decorator(func):
    def wrapper():
        print("Something is happening before.")
        func()
        print("Something is happening after.")
    return wrapper
```

## Generators
Generators are functions that return an iterator using the `yield` keyword.
```python
def my_generator():
    yield 1
    yield 2
    yield 3
```
        """)
    ]

    # Seed vocabulary words
    vocab_words = [
        Vocabulary(
            word="Algorithmic",
            category="Tech/IT",
            meaning="Relating to or using a set of rules or steps to solve a problem.",
            meaning_tamil="நெறிமுறை சார்ந்த (வழிமுறை சார்ந்த)",
            emoji="💻",
            pronunciation="/ˌælɡəˈrɪðmɪk/",
            example_sentence="AI systems rely on algorithmic models to process complex user query data."
        ),
        Vocabulary(
            word="Paradigm",
            category="General",
            meaning="A typical pattern or model of something; a framework.",
            meaning_tamil="மாதிரி அல்லது கட்டமைப்பு",
            emoji="🌀",
            pronunciation="/ˈpærədaɪm/",
            example_sentence="Object-oriented programming is a major software engineering paradigm."
        ),
        Vocabulary(
            word="Synthesize",
            category="Workplace",
            meaning="Combine a number of things or ideas into a coherent whole.",
            meaning_tamil="ஒன்றிணைத்தல் (பல்வேறு கருத்துக்களை இணைத்து உருவாக்குதல்)",
            emoji="🧪",
            pronunciation="/ˈsɪnθəsaɪz/",
            example_sentence="In the presentation, she managed to synthesize feedback from multiple departments."
        ),
        Vocabulary(
            word="Asynchronous",
            category="Tech/IT",
            meaning="Not occurring or existing at the same time; executing processes in parallel.",
            meaning_tamil="ஒரே நேரத்தில் நிகழாத (தனித்தனியாக இயங்கும்)",
            emoji="⏳",
            pronunciation="/eɪˈsɪŋkrənəs/",
            example_sentence="The frontend relies on asynchronous API calls to load study dashboards instantly."
        ),
        Vocabulary(
            word="Leverage",
            category="Workplace",
            meaning="Use something to maximum advantage.",
            meaning_tamil="சாதகமாகப் பயன்படுத்துதல்",
            emoji="📈",
            pronunciation="/ˈliːvərɪdʒ/",
            example_sentence="We can leverage the AI companion tool to provide personalized feedback to learners."
        ),
        Vocabulary(
            word="Elucidate",
            category="General",
            meaning="Make something clear; explain.",
            meaning_tamil="தெளிவுபடுத்துதல் (விளக்குதல்)",
            emoji="💡",
            pronunciation="/iˈluːsɪdeɪt/",
            example_sentence="The tutor helped elucidate the concept of recursion using visual boxes."
        ),
        Vocabulary(
            word="Immersive",
            category="General",
            meaning="Providing information or images in a way that makes the user feel completely involved.",
            meaning_tamil="ஆழ்ந்த ஈடுபாடு கொண்ட",
            emoji="🕶️",
            pronunciation="/ɪˈmɜːrsɪv/",
            example_sentence="An immersive UI design includes micro-animations, transitions, and hover feedback."
        ),
        Vocabulary(
            word="Synergy",
            category="Workplace",
            meaning="The interaction or cooperation of two or more departments to produce a combined effect.",
            meaning_tamil="கூட்டு ஆற்றல் (ஒத்துழைப்பு)",
            emoji="🤝",
            pronunciation="/ˈsɪnərdʒi/",
            example_sentence="There was a great synergy between the design and engineering teams on this project."
        ),
        Vocabulary(
            word="Immutable",
            category="Tech/IT",
            meaning="Unchanging over time or unable to be changed.",
            meaning_tamil="மாற்ற முடியாத",
            emoji="🔒",
            pronunciation="/ɪˈmjuːtəbl/",
            example_sentence="Strings and tuples in Python are immutable data types."
        ),
        Vocabulary(
            word="Pragmatic",
            category="General",
            meaning="Dealing with things sensibly and realistically based on practical considerations.",
            meaning_tamil="நடைமுறைக்கேற்ற (யதார்த்தமான)",
            emoji="🎯",
            pronunciation="/præɡˈmætɪk/",
            example_sentence="A pragmatic developer focuses on creating clean code that works before over-optimizing."
        ),
        Vocabulary(
            word="Cognitive",
            category="General",
            meaning="Relating to mental processes like thinking, learning, and remembering.",
            meaning_tamil="அறிவுசார்ந்த",
            emoji="🧠",
            pronunciation="/ˈkɒɡnɪtɪv/",
            example_sentence="Solving puzzles helps improve cognitive abilities in young children."
        ),
        Vocabulary(
            word="Ephemeral",
            category="General",
            meaning="Lasting for a very short time.",
            meaning_tamil="தற்காலிகமான (குறுகிய காலமே நிலைக்கும்)",
            emoji="🦋",
            pronunciation="/ɪˈfemərəl/",
            example_sentence="The beauty of cherry blossoms is ephemeral, lasting only a few days."
        ),
        Vocabulary(
            word="Resilient",
            category="General",
            meaning="Able to withstand or recover quickly from difficult conditions.",
            meaning_tamil="மீள்திறன் கொண்ட (மீண்டு வரக்கூடிய)",
            emoji="🌱",
            pronunciation="/rɪˈzɪliənt/",
            example_sentence="The local community proved resilient and quickly rebuilt after the storm."
        ),
        Vocabulary(
            word="Substantive",
            category="Workplace",
            meaning="Having a firm basis in reality and search; important or considerable.",
            meaning_tamil="குறிப்பிடத்தக்க அல்லது முக்கியமான",
            emoji="📊",
            pronunciation="/səbˈstæntɪv/",
            example_sentence="The meeting led to substantive discussions on the school's digital curriculum."
        ),
        Vocabulary(
            word="Benevolent",
            category="General",
            meaning="Well meaning and kindly; serving a charitable purpose.",
            meaning_tamil="நற்பண்புமிக்க (கருணை உள்ளம் கொண்ட)",
            emoji="😇",
            pronunciation="/bəˈnevələnt/",
            example_sentence="The benevolent donor funded the construction of the new school library."
        )
    ]

    # Seed achievements
    achievements = [
        Achievement(name="First Step", description="Learned your first vocabulary word", icon_url="award", criteria="1_words_learned", xp_reward=50),
        Achievement(name="Word Master", description="Learned 5 vocabulary words", icon_url="5_words_learned", criteria="5_words_learned", xp_reward=100),
        Achievement(name="Hello World", description="Completed your first coding lesson", icon_url="code", criteria="1_lessons_completed", xp_reward=50),
        Achievement(name="Code Explorer", description="Completed 3 coding lessons", icon_url="terminal", criteria="3_lessons_completed", xp_reward=100),
        Achievement(name="Streak Starter", description="Maintained a 3-day study streak", icon_url="flame", criteria="streak_3", xp_reward=100)
    ]

    # Seed daily challenge
    challenge = DailyChallenge(date=date.today(), description="Complete a Python coding lesson and chat with TomBuddy AI to reinforce your learning!", xp_reward=50)

    # Seed premium stories
    stories = [
        Story(
            title_en="The Caverns of Mars",
            title_ta="செவ்வாய் கிரகத்தின் குகைகள்",
            content_en="Deep within the red dust of Mars, Commander Clara discovered a hidden cavern. As she stepped inside, her scanners registered atmospheric pressure. Removing her helmet, she gasped—not at the ancient structures, but at the sound of violin music echoing through the alien dark.",
            content_ta="செவ்வாய் கிரகத்தின் சிவப்பு தூசிகளுக்கு நடுவே, தளபதி கிளாரா ஒரு ரகசிய குகையைக் கண்டறிந்தார். அவர் உள்ளே நுழைந்தபோது, ​​அவரது ஸ்கேனர்கள் காற்று அழுத்தத்தை காட்டின. தனது ஹெல்மெட்டைக் கழற்றி, அவர் ஆச்சரியப்பட்டார்—பழங்கால கட்டமைப்புகளைக் கண்டு அல்ல, மாறாக வேற்றுக்கிரக இருளில் எதிரொலித்த வயலின் இசையைக் கேட்டு.",
            category="Sci-Fi",
            reading_time=3,
            summary_en="A space explorer Clara discovers a Martian cavern filled with breathable air and mysterious violin music.",
            summary_ta="விண்வெளி ஆய்வாளர் கிளாரா செவ்வாய் கிரகத்தில் சுவாசிக்கக்கூடிய காற்று மற்றும் விசித்திரமான வயலின் இசை நிறைந்த ஒரு குகையைக் கண்டுபிடிக்கிறார்.",
            illustration_emoji="🚀",
            is_cyoa=False
        ),
        Story(
            title_en="The Mirror of Truth",
            title_ta="உண்மைக்கண்ணாடி",
            content_en="In a quiet village, an old merchant gifted a unique glass mirror to a boastful prince. 'This mirror shows not your face, but your heart,' the merchant said. When the prince peered in, he saw a ravenous wolf looking back. Ashamed, he dedicated his life to charity, until one day he looked again and saw a radiant sun.",
            content_ta="ஒரு அமைதியான கிராமத்தில், ஒரு வயதான வர்த்தகர் ஒரு பெருமைமிக்க இளவரசனுக்கு ஒரு தனித்துவமான கண்ணாடி கண்ணாடியை பரிசாக அளித்தார். 'இந்த கண்ணாடி உங்கள் முகத்தை அல்ல, உங்கள் இதயத்தை காட்டுகிறது,' என்று வர்த்தகர் கூறினார். இளவரசன் உள்ளே பார்த்தபோது, ஒரு ஓநாய் அவனுக்குத் தெரிந்தது. வெட்கமடைந்த அவன், தன் வாழ்க்கையை தர்மத்திற்காக அர்ப்பணித்தான். ஒரு நாள் மீண்டும் பார்த்தபோது ஒரு பிரகாசமான சூரியனைக் கண்டான்.",
            category="Moral & Truth",
            reading_time=2,
            summary_en="A proud prince transforms his heart after a magical mirror reveals his inner character as a wolf.",
            summary_ta="ஒரு மந்திர கண்ணாடி இளவரசனின் இதயத்தில் உள்ள ஓநாயை காட்டிய பிறகு, அவன் தன் பண்புகளை மாற்றி நல்வழியில் செல்கிறான்.",
            illustration_emoji="🪞",
            is_cyoa=False
        ),
        Story(
            title_en="The Reversed Grandfather Clock",
            title_ta="தலைகீழ் தாத்தா கடிகாரம்",
            content_en="Detective Roger stood in the study of the deceased inventor. The grandfather clock ticked backwards, its hands spinning counterclockwise. 'Every backward tick steals a second of time,' Roger whispered. He touched the gears, and suddenly the room dissolved, returning him to the morning before the inventor vanished.",
            content_ta="மறைந்த கண்டுபிடிப்பாளரின் அறையில் துப்பறியும் நபர் ராஜர் நின்று கொண்டிருந்தார். அங்கிருந்த தாத்தா கடிகாரம் பின்னோக்கி ஓடியது. 'ஒவ்வொரு பின்னோக்கிய நொடியும் காலத்தை திருடுகிறது,' என்று ராஜர் கிசுகிசுத்தார். அவர் கியர்களைத் தொட்டதும், திடீரென அந்த அறை மறைந்து, கண்டுபிடிப்பாளர் மாயமாவதற்கு முந்தைய காலை நேரத்திற்கு அவரை அழைத்துச் சென்றது.",
            category="Mystery",
            reading_time=4,
            summary_en="Detective Roger unravels a grandfather clock that acts as a time-reversal portal.",
            summary_ta="தாத்தா கடிகாரம் ஒரு காலப் பயண வாசல் என்பதை துப்பறியும் நபர் ராஜர் கண்டுபிடிக்கிறார்.",
            illustration_emoji="🕰️",
            is_cyoa=False
        ),
        Story(
            title_en="The Giggling Pumpkin",
            title_ta="சிரிக்கும் பூசணிக்காய்",
            content_en="Leo loved Halloween, but his pumpkin was strange. Every time he raised his carving knife, the pumpkin giggled. 'Stop that, it tickles!' it squeaked. Realizing he had a sentient vegetable, Leo put googly eyes on it, fed it pumpkin pie, and they watched funny movies together all night.",
            content_ta="லியோவிற்கு ஹாலோவீன் பிடிக்கும், ஆனால் அவனது பூசணிக்காய் விசித்திரமாக இருந்தது. அவன் கத்தியை தூக்கும் போதெல்லாம், பூசணிக்காய் சிரித்தது. 'நிறுத்து, கூச்சமாக இருக்கிறது!' என்று அது கத்தியது. தனக்கு உணர்வுள்ள ஒரு காய் கிடைத்ததை உணர்ந்த லியோ, அதற்கு கண்களை ஒட்டி, பூசணி கேக் ஊட்டி, இரவு முழுவதும் நகைச்சுவை படங்களை ஒன்றாகப் பார்த்தான்.",
            category="Fun",
            reading_time=3,
            summary_en="A funny pumpkin giggles when carved, prompting Leo to keep it as a movie-watching companion.",
            summary_ta="செதுக்கும்போது சிரிக்கும் பூசணிக்காயை லியோ தன் திரைப்படத் துணையாக வைத்துக்கொள்கிறான்.",
            illustration_emoji="🎃",
            is_cyoa=False
        ),
        Story(
            title_en="The Mysterious Cabin",
            title_ta="மர்மமான மரக்கூடம்",
            content_en="You stand at a fork in the dark forest. To your left, a pathway leads to a warm, glowing cabin. To your right, a narrow trail goes deep into the foggy mountains.",
            content_ta="இருண்ட காட்டின் நடுவே நீங்கள் நிற்கிறீர்கள். உங்களது இடது பக்கத்தில் ஒரு சூடான, ஒளிரும் மரக்கூடம் உள்ளது. வலது பக்கத்தில் பனிமூட்டமான மலைகளுக்குள் செல்லும் பாதை உள்ளது.",
            category="Adventure",
            reading_time=5,
            summary_en="An interactive branch adventure choosing between a warm forest cabin and foggy mountain trails.",
            summary_ta="ஒளிரும் மரக்கூடம் அல்லது மலைப் பாதையைத் தேர்ந்தெடுக்கும் ஊடாடும் சாகசம்.",
            illustration_emoji="🌲",
            is_cyoa=True,
            cyoa_data={
                "start": {
                    "text_en": "You stand at a fork in the dark forest. To your left, a pathway leads to a warm, glowing cabin. To your right, a narrow trail goes deep into the foggy mountains.",
                    "text_ta": "இருண்ட காட்டின் நடுவே நீங்கள் நிற்கிறீர்கள். உங்களது இடது பக்கத்தில் ஒரு சூடான, ஒளிரும் மரக்கூடம் உள்ளது. வலது பக்கத்தில் பனிமூட்டமான மலைகளுக்குள் செல்லும் பாதை உள்ளது.",
                    "choices": [
                        {"text_en": "Go to the cabin", "text_ta": "மரக்கூடத்திற்குச் செல்லுங்கள்", "next": "cabin"},
                        {"text_en": "Hike the mountains", "text_ta": "மலைகளில் ஏறுங்கள்", "next": "mountain"}
                    ]
                },
                "cabin": {
                    "text_en": "You open the cabin door. A fire is crackling. On the table sits a hot cup of tea and a mysterious leather diary.",
                    "text_ta": "மரக்கூடத்தின் கதவை நீங்கள் திறக்கிறீர்கள். நெருப்பு எரிந்து கொண்டிருக்கிறது. மேஜையில் ஒரு சூடான தேநீர் மற்றும் ஒரு மர்மமான தோல் நாட்குறிப்பு உள்ளது.",
                    "choices": [
                        {"text_en": "Drink the tea", "text_ta": "தேநீரைக் குடியுங்கள்", "next": "tea"},
                        {"text_en": "Read the diary", "text_ta": "நாட்குறிப்பைப் படியுங்கள்", "next": "diary"}
                    ]
                },
                "mountain": {
                    "text_en": "You walk up the misty path. Suddenly, you hear a deep rumble and see a friendly looking dragon flying towards you.",
                    "text_ta": "நீங்கள் மூடுபனி பாதையில் நடக்கிறீர்கள். திடீரென்று, ஒரு சத்தத்தைக் கேட்டு, உங்களிடம் ஒரு நட்பு டிராகன் பறந்து வருவதைக் காண்கிறீர்கள்.",
                    "choices": [
                        {"text_en": "Say hello to the dragon", "text_ta": "டிராகனிடம் ஹலோ சொல்லுங்கள்", "next": "dragon_hello"},
                        {"text_en": "Hide behind a rock", "text_ta": "பாறையின் பின்னால் ஒளிந்து கொள்ளுங்கள்", "next": "hide"}
                    ]
                },
                "tea": {
                    "text_en": "The tea gives you instant strength and magic vision! You can now see hidden portals in the forest. You win!",
                    "text_ta": "தேநீர் உங்களுக்கு உடனடி வலிமையையும் மந்திர பார்வையையும் தருகிறது! இப்போது காட்டில் மறைந்திருக்கும் வாசல்களை நீங்கள் பார்க்கலாம். வெற்றி!",
                    "choices": []
                },
                "diary": {
                    "text_en": "The diary details a treasure location under the old oak tree. You follow it and find gold coins! You win!",
                    "text_ta": "பழைய ஆலமரத்தின் அடியில் இருக்கும் புதையலை நாட்குறிப்பு விவரிக்கிறது. அதைப் பின்பற்றி தங்கக் காசுகளைக் கண்டுபிடிக்கிறீர்கள்! வெற்றி!",
                    "choices": []
                },
                "dragon_hello": {
                    "text_en": "The dragon smiles, lets you ride on its back, and flies you safely to a golden castle in the clouds! You win!",
                    "text_ta": "டிராகன் புன்னகைத்து, தன் முதுகில் உங்களை ஏற்றிக் கொண்டு, மேகங்களில் இருக்கும் தங்கக் கோட்டைக்கு உங்களை அழைத்துச் செல்கிறது! வெற்றி!",
                    "choices": []
                },
                "hide": {
                    "text_en": "You hide. The dragon passes by. You find your way back home safely but empty handed.",
                    "text_ta": "நீங்கள் ஒளிந்துகொள்கிறீர்கள். டிராகன் கடந்து செல்கிறது. நீங்கள் பத்திரமாக வீட்டிற்குத் திரும்புகிறீர்கள் ஆனால் புதையல் கிடைக்கவில்லை.",
                    "choices": []
                }
            }
        )
    ]

    # Seed premium music tracks & rhymes
    music_tracks = [
        MusicTrack(
            title_en="Twinkle Twinkle Little Star",
            title_ta="மினுமினுக்கும் விண்மீனே",
            artist="BuddyLearn Kids",
            category="English Rhymes",
            audio_url="",
            is_rhyme=True,
            illustration_emoji="🌟",
            lyrics_en="Twinkle, twinkle, little star,\nHow I wonder what you are!\nUp above the world so high,\nLike a diamond in the sky.",
            lyrics_ta="மினுமினுக்கும் விண்மீனே,\nநீ யார் என்று வியக்கிறேன்!\nஉலகிற்கு மேலே மிக உயரத்தில்,\nவானில் ஒரு வைரத்தைப் போல.",
            lyrics_sync=[
                {"time": 0, "text_en": "Twinkle, twinkle, little star", "text_ta": "மினுமினுக்கும் விண்மீனே"},
                {"time": 4, "text_en": "How I wonder what you are!", "text_ta": "நீ யார் என்று வியக்கிறேன்!"},
                {"time": 8, "text_en": "Up above the world so high", "text_ta": "உலகிற்கு மேலே மிக உயரத்தில்"},
                {"time": 12, "text_en": "Like a diamond in the sky.", "text_ta": "வானில் ஒரு வைரத்தைப் போல."}
            ],
            melody_notes=[
                {"note": "C4", "duration": 0.5}, {"note": "C4", "duration": 0.5},
                {"note": "G4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
                {"note": "A4", "duration": 0.5}, {"note": "A4", "duration": 0.5},
                {"note": "G4", "duration": 1.0},
                {"note": "F4", "duration": 0.5}, {"note": "F4", "duration": 0.5},
                {"note": "E4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
                {"note": "D4", "duration": 0.5}, {"note": "D4", "duration": 0.5},
                {"note": "C4", "duration": 1.0}
            ]
        ),
        MusicTrack(
            title_en="Nila Nila Odi Vaa",
            title_ta="நிலா நிலா ஓடி வா",
            artist="பாரம்பரிய தமிழ் பாட்டு",
            category="Tamil Rhymes",
            audio_url="",
            is_rhyme=True,
            illustration_emoji="🌙",
            lyrics_en="Moon, Moon, run to me,\nDo not stay in the hills.\nBring the golden plate for me,\nCome and play with me.",
            lyrics_ta="நிலா நிலா ஓடி வா,\nநில்லாமல் ஓடி வா.\nமலை மீது ஏறி வா,\nமல்லிகைப் பூ கொண்டு வா.",
            lyrics_sync=[
                {"time": 0, "text_en": "Moon, Moon, run to me", "text_ta": "நிலா நிலா ஓடி வா"},
                {"time": 4, "text_en": "Do not stay in the hills.", "text_ta": "நில்லாமல் ஓடி வா."},
                {"time": 8, "text_en": "Bring the golden plate for me", "text_ta": "மலை மீது ஏறி வா"},
                {"time": 12, "text_en": "Come and play with me.", "text_ta": "மல்லிகைப் பூ கொண்டு வா."}
            ],
            melody_notes=[
                {"note": "E4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
                {"note": "A4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
                {"note": "E4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
                {"note": "A4", "duration": 1.0},
                {"note": "C5", "duration": 0.5}, {"note": "A4", "duration": 0.5},
                {"note": "G4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
                {"note": "D4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
                {"note": "C4", "duration": 1.0}
            ]
        ),
        MusicTrack(
            title_en="Focus Beats",
            title_ta="கவனக்குவிப்பு இசை",
            artist="Lofi Study Engine",
            category="Study Music",
            audio_url="",
            is_rhyme=False,
            illustration_emoji="📚",
            lyrics_en="Instrumental music designed to keep your focus intact.",
            lyrics_ta="உங்கள் கவனத்தை சிதறடிக்காமல் இருக்க வடிவமைக்கப்பட்ட இசைக்கருவி இசை.",
            lyrics_sync=[
                {"time": 0, "text_en": "Relax your mind...", "text_ta": "மனதை தளர்த்திக் கொள்ளுங்கள்..."},
                {"time": 4, "text_en": "Focus on the screen.", "text_ta": "திரையில் கவனம் செலுத்துங்கள்."},
                {"time": 8, "text_en": "Code your way to success.", "text_ta": "வெற்றிக்கான வழியை உருவாக்குங்கள்."}
            ],
            melody_notes=[
                {"note": "C3", "duration": 1.0}, {"note": "E3", "duration": 1.0},
                {"note": "G3", "duration": 1.0}, {"note": "B3", "duration": 1.0},
                {"note": "A3", "duration": 1.0}, {"note": "C4", "duration": 1.0},
                {"note": "E4", "duration": 1.0}, {"note": "G4", "duration": 1.0}
            ]
        ),
        MusicTrack(
            title_en="Alphabet Song A-Z",
            title_ta="ஆங்கில நெடுங்கணக்கு பாடல்",
            artist="BuddyLearn Learning",
            category="Alphabet Songs (A-Z)",
            audio_url="",
            is_rhyme=True,
            illustration_emoji="🔤",
            lyrics_en="A B C D E F G\nH I J K L M N O P\nQ R S T U V\nW X Y and Z",
            lyrics_ta="ஏ பி சி டி இ எஃப் ஜி\nஎச் ஐ ஜே கே எல் எம் என் ஓ பி\nகியூ ஆர் எஸ் டி யு வி\nடபிள்யூ எக்ஸ் ஒய் மற்றும் இசட்",
            lyrics_sync=[
                {"time": 0, "text_en": "A B C D E F G", "text_ta": "ஏ பி சி டி இ எஃப் ஜி"},
                {"time": 4, "text_en": "H I J K L M N O P", "text_ta": "எச் ஐ ஜே கே எல் எம் என் ஓ பி"},
                {"time": 8, "text_en": "Q R S T U V", "text_ta": "கியூ ஆர் எஸ் டி யு வி"},
                {"time": 12, "text_en": "W X Y and Z", "text_ta": "டபிள்யூ எக்ஸ் ஒய் மற்றும் இசட்"}
            ],
            melody_notes=[
                {"note": "C4", "duration": 0.5}, {"note": "C4", "duration": 0.5},
                {"note": "G4", "duration": 0.5}, {"note": "G4", "duration": 0.5},
                {"note": "A4", "duration": 0.5}, {"note": "A4", "duration": 0.5},
                {"note": "G4", "duration": 1.0},
                {"note": "F4", "duration": 0.5}, {"note": "F4", "duration": 0.5},
                {"note": "E4", "duration": 0.5}, {"note": "E4", "duration": 0.5},
                {"note": "D4", "duration": 0.5}, {"note": "D4", "duration": 0.5},
                {"note": "C4", "duration": 1.0}
            ]
        ),
        MusicTrack(
            title_en="Sleepy Lullaby",
            title_ta="தாலாட்டு பாடல்",
            artist="Gentle Dreamer",
            category="Sleep Music",
            audio_url="",
            is_rhyme=False,
            illustration_emoji="💤",
            lyrics_en="Close your eyes, sleep tight,\nThe stars are shining bright.",
            lyrics_ta="கண்களை மூடி, நிம்மதியாக தூங்குங்கள்,\nவிண்மீன்கள் பிரகாசமாக ஒளிர்கின்றன.",
            lyrics_sync=[
                {"time": 0, "text_en": "Close your eyes, sleep tight", "text_ta": "கண்களை மூடி, நிம்மதியாக தூங்குங்கள்"},
                {"time": 5, "text_en": "The stars are shining bright.", "text_ta": "விண்மீன்கள் பிரகாசமாக ஒளிர்கின்றன."}
            ],
            melody_notes=[
                {"note": "G3", "duration": 1.5}, {"note": "E3", "duration": 1.5},
                {"note": "G3", "duration": 1.5}, {"note": "E3", "duration": 1.5},
                {"note": "D3", "duration": 2.0}, {"note": "F3", "duration": 2.0},
                {"note": "C3", "duration": 3.0}
            ]
        )
    ]

    # Seed kids early learning lessons
    kids_lessons = [
        KidsLesson(
            category="english",
            title_en="English Alphabets & Phonics",
            title_ta="ஆங்கில எழுத்துக்கள் மற்றும் ஒலியியல்",
            content_data={
                "letters": [
                    {"char": "A", "lowercase": "a", "phonics": "æ", "word": "Apple", "tamil_word": "ஆப்பிள்", "emoji": "🍎", "sentence": "A is for Apple. It is a sweet red fruit.", "sentence_ta": "A என்பது ஆப்பிள். இது ஒரு இனிமையான சிவப்பு பழம்."},
                    {"char": "B", "lowercase": "b", "phonics": "b", "word": "Ball", "tamil_word": "பந்து", "emoji": "⚽", "sentence": "B is for Ball. I like to kick the ball.", "sentence_ta": "B என்பது பந்து. நான் பந்தை உதைக்க விரும்புகிறேன்."},
                    {"char": "C", "lowercase": "c", "phonics": "k", "word": "Cat", "tamil_word": "பூனை", "emoji": "🐱", "sentence": "C is for Cat. The cat says meow.", "sentence_ta": "C என்பது பூனை. பூனை மியாவ் என்று கூறுகிறது."},
                    {"char": "D", "lowercase": "d", "phonics": "d", "word": "Dog", "tamil_word": "நாய்", "emoji": "🐶", "sentence": "D is for Dog. The dog wags its tail.", "sentence_ta": "D என்பது நாய். நாய் தன் வாலை ஆட்டுகிறது."}
                ]
            }
        ),
        KidsLesson(
            category="tamil",
            title_en="Tamil Uyir & Mei Letters",
            title_ta="தமிழ் உயிரெழுத்துக்கள் மற்றும் மெய்யெழுத்துக்கள்",
            content_data={
                "uyir": [
                    {"char": "அ", "word": "அம்மா", "trans": "Amma / Mother", "emoji": "👩", "sentence": "அம்மா என்னை மிகவும் நேசிக்கிறார்.", "sentence_en": "Mother loves me very much."},
                    {"char": "ஆ", "word": "ஆடு", "trans": "Aadu / Goat", "emoji": "🐐", "sentence": "ஆடு புல் மேய்கிறது.", "sentence_en": "The goat eats grass."},
                    {"char": "இ", "word": "இலை", "trans": "Ilai / Leaf", "emoji": "🍃", "sentence": "இலை மரத்திலிருந்து விழுகிறது.", "sentence_en": "The leaf falls from the tree."}
                ],
                "mei": [
                    {"char": "க்", "word": "கொக்கு", "trans": "Kokku / Heron", "emoji": "🦩", "sentence": "கொக்கு ஆற்றில் மீன் பிடிக்கிறது.", "sentence_en": "The heron catches fish in the river."}
                ]
            }
        ),
        KidsLesson(
            category="numbers",
            title_en="Learn English & Tamil Numbers",
            title_ta="எண்களைக் கற்றல்",
            content_data={
                "numbers": [
                    {"val": 1, "tamil_val": "௧", "word": "One", "tamil_word": "ஒன்று", "emoji": "🍎", "count": 1},
                    {"val": 2, "tamil_val": "௨", "word": "Two", "tamil_word": "இரண்டு", "emoji": "⚽⚽", "count": 2},
                    {"val": 3, "tamil_val": "௩", "word": "Three", "tamil_word": "மூன்று", "emoji": "🎈🎈🎈", "count": 3},
                    {"val": 4, "tamil_val": "௪", "word": "Four", "tamil_word": "நான்கு", "emoji": "🚗🚗🚗🚗", "count": 4},
                    {"val": 5, "tamil_val": "௫", "word": "Five", "tamil_word": "ஐந்து", "emoji": "⭐⭐⭐⭐⭐", "count": 5}
                ]
            }
        ),
        KidsLesson(
            category="pictures",
            title_en="Picture Dictionary",
            title_ta="பட அகராதி",
            content_data={
                "items": [
                    {"category": "Animals", "name_en": "Lion", "name_ta": "சிங்கம்", "emoji": "🦁", "sentence": "The lion is the king of the forest.", "sentence_ta": "சிங்கம் காட்டின் ராஜா."},
                    {"category": "Animals", "name_en": "Elephant", "name_ta": "யானை", "emoji": "🐘", "sentence": "The elephant has a long trunk.", "sentence_ta": "யானைக்கு ஒரு நீண்ட தும்பிக்கை உள்ளது."},
                    {"category": "Fruits", "name_en": "Mango", "name_ta": "மாம்பழம்", "emoji": "🥭", "sentence": "Mango is the national fruit of India.", "sentence_ta": "மாம்பழம் இந்தியாவின் தேசிய பழமாகும்."},
                    {"category": "Fruits", "name_en": "Banana", "name_ta": "வாழைப்பழம்", "emoji": "🍌", "sentence": "Banana is a healthy yellow fruit.", "sentence_ta": "வாழைப்பழம் ஒரு ஆரோக்கியமான மஞ்சள் பழம்."},
                    {"category": "Shapes", "name_en": "Circle", "name_ta": "வட்டம்", "emoji": "⭕", "sentence": "The sun is shaped like a circle.", "sentence_ta": "சூரியன் வட்ட வடிவில் உள்ளது."},
                    {"category": "Shapes", "name_en": "Square", "name_ta": "சதுரம்", "emoji": "🟩", "sentence": "A chess board is shaped like a square.", "sentence_ta": "சதுரங்க பலகை சதுர வடிவில் உள்ளது."}
                ]
            }
        )
    ]

    db.session.add_all(lessons)
    db.session.add_all(vocab_words)
    db.session.add_all(achievements)
    db.session.add(challenge)
    db.session.add_all(stories)
    db.session.add_all(music_tracks)
    db.session.add_all(kids_lessons)
    
    db.session.commit()
    print("Database seeded successfully with lessons, words, achievements, stories, music tracks, and kids lessons!")
