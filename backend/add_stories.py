# pyrefly: ignore [missing-import]
from app import create_app
# pyrefly: ignore [missing-import]
from app.extensions import db
# pyrefly: ignore [missing-import]
from app.models import Story
import random

app = create_app()

CATEGORIES = {
    "Fun": ("😂", "A hilarious tale about a mischievous cat.", "ஒரு குறும்புப் பூனையைப் பற்றிய வேடிக்கையான கதை.", "The cat chased its own tail until it became dizzy and fell into a pile of pillows. Everyone laughed.", "பூனை தனது சொந்த வாலைத் துரத்தி மயக்கமடைந்து தலையணைகள் குவியலில் விழுந்தது. அனைவரும் சிரித்தனர்."),
    "Moral & Truth": ("💡", "A story teaching the value of honesty.", "நேர்மையின் மதிப்பை கற்பிக்கும் கதை.", "Once, a woodcutter lost his axe. He told the truth to the river spirit and was rewarded with a golden axe.", "ஒருமுறை, ஒரு மரம் வெட்டுபவர் தனது கோடாரியை இழந்தார். நதி ஆவியிடம் உண்மையைச் சொன்னதால் அவருக்கு தங்கக் கோடாரி கிடைத்தது."),
    "Mystery": ("🔍", "A thrilling mystery in a quiet town.", "அமைதியான நகரத்தில் ஒரு பரபரப்பான மர்மம்.", "Detective Roger found a glowing key under the old bridge. It opened a door that hadn't existed yesterday.", "பழைய பாலத்தின் கீழ் ஒளிரும் சாவியை துப்பறியும் நிபுணர் கண்டுபிடித்தார். அது நேற்று இல்லாத ஒரு கதவைத் திறந்தது."),
    "Horror": ("👻", "A spooky encounter in the woods.", "காட்டில் ஒரு பயமுறுத்தும் சந்திப்பு.", "The wind howled. The shadows grew longer, and suddenly, the old doll on the shelf blinked its eyes.", "காற்று வீசியது. நிழல்கள் நீண்டன, திடீரென்று அலமாரியில் இருந்த பழைய பொம்மை கண்களை சிமிட்டியது."),
    "Emotional": ("❤️", "A touching story about friendship.", "நட்பைப் பற்றிய மனதைத் தொடும் கதை.", "Tears fell as the two best friends reunited after ten years. Distance meant nothing to their bond.", "பத்து வருடங்களுக்குப் பிறகு நண்பர்கள் மீண்டும் இணைந்ததால் கண்ணீர் சிந்தினர்."),
    "Adventure": ("🏹", "A grand journey across the mountains.", "மலைகள் முழுவதும் ஒரு பெரிய பயணம்.", "Equipped with only a map and a sword, the brave explorer climbed the dragon's peak.", "ஒரு வரைபடம் மற்றும் வாளுடன், தைரியமான ஆய்வாளர் டிராகன் சிகரத்தில் ஏறினார்."),
    "Sci-Fi": ("🤖", "A futuristic tale of robots.", "ரோபோக்களின் எதிர்கால கதை.", "In 3045, AI companions lived alongside humans. One robot looked up at the stars and wondered if it could dream.", "3045 இல், AI மனிதர்களுடன் வாழ்ந்தது. ஒரு ரோபோ நட்சத்திரங்களைப் பார்த்து கனவு காண முடியுமா என்று யோசித்தது."),
    "Fantasy": ("🧚", "A magical world of fairies.", "தேவதைகளின் மாய உலகம்.", "The glowing crystal pulsed with magic. The fairies gathered around, ready to cast the spell of spring.", "ஒளிரும் படிகம் மாயாஜாலத்துடன் துடித்தது. வசந்த காலத்தின் மந்திரத்தை செலுத்த தேவதைகள் கூடினர்."),
    "Family": ("👨‍👩‍👧", "A warm family dinner.", "ஒரு சூடான குடும்ப இரவு உணவு.", "The kitchen smelled of fresh bread. The family sat together, sharing stories and laughter.", "சமையலறையில் ரொட்டியின் வாசனை வீசியது. குடும்பத்தினர் ஒன்றாக அமர்ந்து கதைகளைப் பகிர்ந்து கொண்டனர்."),
    "Kids": ("😄", "A playful day at the park.", "பூங்காவில் ஒரு விளையாட்டு நாள்.", "The kids ran through the sprinklers, chasing butterflies and eating ice cream under the sun.", "குழந்தைகள் வெயிலில் ஐஸ்கிரீம் சாப்பிட்டு பட்டாம்பூச்சிகளை துரத்தி விளையாடினர்."),
    "Motivation": ("💼", "A story of never giving up.", "ஒருபோதும் விட்டுவிடக் கூடாத கதை.", "She failed 99 times. On the 100th attempt, the engine roared to life. Hard work always pays off.", "அவள் 99 முறை தோற்றாள். 100வது முயற்சியில் இயந்திரம் உயிர்ப்பித்தது. கடின உழைப்பு எப்போதும் பலன் தரும்."),
    "Historical": ("📜", "A glimpse into ancient times.", "பழங்காலத்தின் ஒரு பார்வை.", "The emperor stood before the great wall, knowing his dynasty would be remembered for centuries.", "பேரரசர் பெரிய சுவருக்கு முன் நின்றார், அவரது வம்சம் பல நூற்றாண்டுகளாக நினைவில் இருக்கும் என்பதை அறிந்திருந்தார்."),
    "Psychological": ("🧠", "A mind-bending psychological twist.", "ஒரு மனதைக் கவரும் உளவியல் திருப்பம்.", "He kept waking up in the same room. Was it a dream, or was he trapped in his own memories?", "அவன் அதே அறையில் விழித்துக்கொண்டான். அது கனவா, அல்லது தன் நினைவுகளில் சிக்கியிருந்தானா?"),
    "Comedy": ("🎭", "A stand-up routine gone wrong.", "ஒரு நகைச்சுவை நிகழ்ச்சி தவறாகப் போகிறது.", "The comedian slipped on a banana peel. It wasn't in the script, but the audience cheered the loudest.", "நகைச்சுவை நடிகர் வாழைப்பழத் தோலில் நழுவினார். பார்வையாளர்கள் சத்தமாக ஆரவாரம் செய்தனர்."),
    "Love": ("💕", "A romantic sunset meeting.", "ஒரு காதல் சூரிய அஸ்தமன சந்திப்பு.", "They held hands as the sun dipped below the ocean. No words were needed between them.", "சூரியன் கடலுக்கு அடியில் சாய்ந்தபோது அவர்கள் கைகளைப் பிடித்தனர்.")
}

ADJ = ["Secret", "Golden", "Lost", "Midnight", "Whispering", "Hidden", "Crimson", "Silent", "Eternal", "Magical"]
NOUN = ["Chronicles", "Journey", "Dream", "Echo", "Shadow", "Light", "Symphony", "Enigma", "Tale", "Memory"]

with app.app_context():
    added = 0
    for cat_name, (emoji, sum_en, sum_ta, cont_en, cont_ta) in CATEGORIES.items():
        count = Story.query.filter_by(category=cat_name).count()
        needed = 10 - count
        if needed > 0:
            for i in range(needed):
                title_en = f"The {random.choice(ADJ)} {random.choice(NOUN)} {i+1}"
                title_ta = f"{cat_name} கதை {i+1}"
                
                story = Story(
                    title_en=title_en,
                    title_ta=title_ta,
                    content_en=f"{cont_en} This is chapter {i+1} of the amazing {cat_name} saga. " * 3,
                    content_ta=f"{cont_ta} இது அற்புதமான {cat_name} சரித்திரத்தின் அத்தியாயம் {i+1}. " * 3,
                    category=cat_name,
                    reading_time=random.randint(2, 5),
                    summary_en=sum_en,
                    summary_ta=sum_ta,
                    illustration_emoji=emoji,
                    is_cyoa=False
                )
                db.session.add(story)
                added += 1
    
    if added > 0:
        db.session.commit()
        print(f"Successfully generated {added} stories to reach the 10-per-category minimum.")
    else:
        print("All categories already have 10 stories.")
