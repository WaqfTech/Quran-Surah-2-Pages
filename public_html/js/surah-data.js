const surahData = [
    {
      "number": 1,
      "englishName": "Al-Fatiha (The Opener)",
      "arabicName": "الفاتحة"
    },
    {
      "number": 2,
      "englishName": "Al-Baqarah (The Cow)",
      "arabicName": "البقرة"
    },
    {
      "number": 3,
      "englishName": "Al-Imran (Family of Imran)",
      "arabicName": "آل عمران"
    },
    {
      "number": 4,
      "englishName": "An-Nisa (The Women)",
      "arabicName": "النساء"
    },
    {
      "number": 5,
      "englishName": "Al-Ma'idah (The Table Spread)",
      "arabicName": "المائدة"
    },
    {
      "number": 6,
      "englishName": "Al-Anam (The Cattle)",
      "arabicName": "الأنعام"
    },
    {
      "number": 7,
      "englishName": "Al-A'raf (The Heights)",
      "arabicName": "الأعراف"
    },
    {
      "number": 8,
      "englishName": "Al-Anfal (The Spoils of War)",
      "arabicName": "الأنفال"
    },
    {
      "number": 9,
      "englishName": "At-Taubah (The Repentance)",
      "arabicName": "التوبة"
    },
    {
      "number": 10,
      "englishName": "Yunus (Jonah)",
      "arabicName": "يونس"
    },
    {
      "number": 11,
      "englishName": "Hud (Hud)",
      "arabicName": "هود"
    },
    {
      "number": 12,
      "englishName": "Yusuf (Joseph)",
      "arabicName": "يوسف"
    },
    {
      "number": 13,
      "englishName": "Ar-Ra'd (Thunder)",
      "arabicName": "الرعد"
    },
    {
      "number": 14,
      "englishName": "Ibrahim (Abraham)",
      "arabicName": "إبراهيم"
    },
    {
      "number": 15,
      "englishName": "Al-Hijr (The Stoneland)",
      "arabicName": "الحجر"
    },
    {
      "number": 16,
      "englishName": "An-Nahl (The Bee)",
      "arabicName": "النحل"
    },
    {
      "number": 17,
      "englishName": "Al-Isra (The Night Journey)",
      "arabicName": "الإسراء"
    },
    {
      "number": 18,
      "englishName": "Al-Kahf (The Cave)",
      "arabicName": "الكهف"
    },
    {
      "number": 19,
      "englishName": "Maryam (Mary)",
      "arabicName": "مريم"
    },
    {
      "number": 20,
      "englishName": "Ta-Ha (Ta-Ha)",
      "arabicName": "طه"
    },
    {
      "number": 21,
      "englishName": "Al-Anbiya (The Prophets)",
      "arabicName": "الأنبياء"
    },
    {
      "number": 22,
      "englishName": "Al-Hajj (The Pilgrimage)",
      "arabicName": "الحج"
    },
    {
      "number": 23,
      "englishName": "Al-Mu'minun (The Believers)",
      "arabicName": "المؤمنون"
    },
    {
      "number": 24,
      "englishName": "An-Nur (The Light)",
      "arabicName": "النور"
    },
    {
      "number": 25,
      "englishName": "Al-Furqan (The Criterion)",
      "arabicName": "الفرقان"
    },
    {
      "number": 26,
      "englishName": "Ash-Shu'ara (The Poets)",
      "arabicName": "الشعراء"
    },
    {
      "number": 27,
      "englishName": "An-Naml (The Ants)",
      "arabicName": "النمل"
    },
    {
      "number": 28,
      "englishName": "Al-Qasas (The Story)",
      "arabicName": "القصص"
    },
    {
      "number": 29,
      "englishName": "Al-Ankabut (The Spider)",
      "arabicName": "العنكبوت"
    },
    {
      "number": 30,
      "englishName": "Ar-Rum (The Romans)",
      "arabicName": "الروم"
    },
    {
      "number": 31,
      "englishName": "Luqman (Luqman)",
      "arabicName": "لقمان"
    },
    {
      "number": 32,
      "englishName": "As-Sajdah (Prostration)",
      "arabicName": "السجدة"
    },
    {
      "number": 33,
      "englishName": "Al-Ahzab (The Confederates)",
      "arabicName": "الأحزاب"
    },
    {
      "number": 34,
      "englishName": "Saba (Sheba)",
      "arabicName": "سبأ"
    },
    {
      "number": 35,
      "englishName": "Fatir (The Originator)",
      "arabicName": "فاطر"
    },
    {
      "number": 36,
      "englishName": "Ya-Sin (Ya Sin)",
      "arabicName": "يس"
    },
    {
      "number": 37,
      "englishName": "As-Saffat (Those Who Set the Ranks)",
      "arabicName": "الصافات"
    },
    {
      "number": 38,
      "englishName": "Sad (The letter Saad)",
      "arabicName": "ص"
    },
    {
      "number": 39,
      "englishName": "Az-Zumar (The Troops)",
      "arabicName": "الزمر"
    },
    {
      "number": 40,
      "englishName": "Ghafir (The Forgiver)",
      "arabicName": "غافر"
    },
    {
      "number": 41,
      "englishName": "Fussilat (Explained in Detail)",
      "arabicName": "فصلت"
    },
    {
      "number": 42,
      "englishName": "Ash-Shura (The Consultation)",
      "arabicName": "الشورى"
    },
    {
      "number": 43,
      "englishName": "Az-Zukhruf (The Ornaments of Gold)",
      "arabicName": "الزخرف"
    },
    {
      "number": 44,
      "englishName": "Ad-Dukhan (The Smoke)",
      "arabicName": "الدخان"
    },
    {
      "number": 45,
      "englishName": "Al-Jathiyah (The Crouching)",
      "arabicName": "الجاثية"
    },
    {
      "number": 46,
      "englishName": "Al-Ahqaf (The Wind Curved Sandhill)",
      "arabicName": "الأحقاف"
    },
    {
      "number": 47,
      "englishName": "Muhammad (Muhammad)",
      "arabicName": "محمد"
    },
    {
      "number": 48,
      "englishName": "Al-Fath (The Victory)",
      "arabicName": "الفتح"
    },
    {
      "number": 49,
      "englishName": "Al-Hujurat (The Private Chambers)",
      "arabicName": "الحجرات"
    },
    {
      "number": 50,
      "englishName": "Qaf (Qaf)",
      "arabicName": "ق"
    },
    {
      "number": 51,
      "englishName": "Adh-Dhariyat (The Scatterers)",
      "arabicName": "الذاريات"
    },
    {
      "number": 52,
      "englishName": "At-Tur (The Mountain)",
      "arabicName": "الطور"
    },
    {
      "number": 53,
      "englishName": "An-Najm (The Star)",
      "arabicName": "النجم"
    },
    {
      "number": 54,
      "englishName": "Al-Qamar (The Moon)",
      "arabicName": "القمر"
    },
    {
      "number": 55,
      "englishName": "Ar-Rahman (The Beneficent)",
      "arabicName": "الرحمن"
    },
    {
      "number": 56,
      "englishName": "Al-Waqi'ah (The Inevitable)",
      "arabicName": "الواقعة"
    },
    {
      "number": 57,
      "englishName": "Al-Hadid (The Iron)",
      "arabicName": "الحديد"
    },
    {
      "number": 58,
      "englishName": "Al-Mujadila (The Pleading Women)",
      "arabicName": "المجادلة"
    },
    {
      "number": 59,
      "englishName": "Al-Hashr (The Exile)",
      "arabicName": "الحشر"
    },
    {
      "number": 60,
      "englishName": "Al-Mumtahanah (She That is to be Examined)",
      "arabicName": "الممتحنة"
    },
    {
      "number": 61,
      "englishName": "As-Saff (The Ranks)",
      "arabicName": "الصف"
    },
    {
      "number": 62,
      "englishName": "Al-Jumu'ah (Congregation Prayer)",
      "arabicName": "الجمعة"
    },
    {
      "number": 63,
      "englishName": "Al-Munafiqun (The Hypocrites)",
      "arabicName": "المنافقون"
    },
    {
      "number": 64,
      "englishName": "At-Taghabun (Mutual Disposession)",
      "arabicName": "التغابن"
    },
    {
      "number": 65,
      "englishName": "At-Talaq (The Divorce)",
      "arabicName": "الطلاق"
    },
    {
      "number": 66,
      "englishName": "At-Tahrim (The Prohibition)",
      "arabicName": "التحريم"
    },
    {
      "number": 67,
      "englishName": "Al-Mulk (The Sovereignty)",
      "arabicName": "الملك"
    },
    {
      "number": 68,
      "englishName": "Al-Qalam (The Pen)",
      "arabicName": "القلم"
    },
    {
      "number": 69,
      "englishName": "Al-Haqqah (The Reality)",
      "arabicName": "الحاقة"
    },
    {
      "number": 70,
      "englishName": "Al-Ma'arij (The Ascending Stairways)",
      "arabicName": "المعارج"
    },
    {
      "number": 71,
      "englishName": "Nuh (Noah)",
      "arabicName": "نوح"
    },
    {
      "number": 72,
      "englishName": "Al-Jinn (The Jinn)",
      "arabicName": "الجن"
    },
    {
      "number": 73,
      "englishName": "Al-Muzzammil (The Enshrouded One)",
      "arabicName": "المزمل"
    },
    {
      "number": 74,
      "englishName": "Al-Muddaththir (The Cloaked One)",
      "arabicName": "المدثر"
    },
    {
      "number": 75,
      "englishName": "Al-Qiyamah (The Resurrection)",
      "arabicName": "القيامة"
    },
    {
      "number": 76,
      "englishName": "Al-Insan (The Man)",
      "arabicName": "الإنسان"
    },
    {
      "number": 77,
      "englishName": "Al-Mursalat (The Emissaries)",
      "arabicName": "المرسلات"
    },
    {
      "number": 78,
      "englishName": "An-Naba (The Tidings)",
      "arabicName": "النبأ"
    },
    {
      "number": 79,
      "englishName": "An-Nazi'at (Those who drag forth)",
      "arabicName": "النازعات"
    },
    {
      "number": 80,
      "englishName": "Abasa (He Frowned)",
      "arabicName": "عبس"
    },
    {
      "number": 81,
      "englishName": "At-Takwir (The Overthrowing)",
      "arabicName": "التكوير"
    },
    {
      "number": 82,
      "englishName": "Al-Infitar (The Cleaving)",
      "arabicName": "الإنفطار"
    },
    {
      "number": 83,
      "englishName": "Al-Mutaffifin (The Defrauding)",
      "arabicName": "المطففين"
    },
    {
      "number": 84,
      "englishName": "Al-Inshiqaq (The Sundering)",
      "arabicName": "الإنشقاق"
    },
    {
      "number": 85,
      "englishName": "Al-Buruj (The Mansions of the Stars)",
      "arabicName": "البروج"
    },
    {
      "number": 86,
      "englishName": "At-Tariq (The Nightcommer)",
      "arabicName": "الطارق"
    },
    {
      "number": 87,
      "englishName": "Al-Ala (The Most High)",
      "arabicName": "الأعلى"
    },
    {
      "number": 88,
      "englishName": "Al-Ghashiyah (The Overwhelming)",
      "arabicName": "الغاشية"
    },
    {
      "number": 89,
      "englishName": "Al-Fajr (The Dawn)",
      "arabicName": "الفجر"
    },
    {
      "number": 90,
      "englishName": "Al-Balad (The City)",
      "arabicName": "البلد"
    },
    {
      "number": 91,
      "englishName": "Ash-Shams (The Sun)",
      "arabicName": "الشمس"
    },
    {
      "number": 92,
      "englishName": "Al-Lail (The Night)",
      "arabicName": "الليل"
    },
    {
      "number": 93,
      "englishName": "Ad-Duha (The Morning Brightness)",
      "arabicName": "الضحى"
    },
    {
      "number": 94,
      "englishName": "Ash-Sharh (The Expansion)",
      "arabicName": "الشرح"
    },
    {
      "number": 95,
      "englishName": "At-Tin (The Fig)",
      "arabicName": "التين"
    },
    {
      "number": 96,
      "englishName": "Al-Alaq (The Blood Clot)",
      "arabicName": "العلق"
    },
    {
      "number": 97,
      "englishName": "Al-Qadr (The Power)",
      "arabicName": "القدر"
    },
    {
      "number": 98,
      "englishName": "Al-Bayyina (The Evidence)",
      "arabicName": "البينة"
    },
    {
      "number": 99,
      "englishName": "Az-Zalzalah (The Earthquake)",
      "arabicName": "الزلزلة"
    },
    {
      "number": 100,
      "englishName": "Al-Adiyat (The Courser)",
      "arabicName": "العاديات"
    },
    {
      "number": 101,
      "englishName": "Al-Qari'ah (The Calamity)",
      "arabicName": "القارعة"
    },
    {
      "number": 102,
      "englishName": "At-Takathur (Vying for increase)",
      "arabicName": "التكاثر"
    },
    {
      "number": 103,
      "englishName": "Al-Asr (The Declining Day)",
      "arabicName": "العصر"
    },
    {
      "number": 104,
      "englishName": "Al-Humazah (The Slanderer)",
      "arabicName": "الهمزة"
    },
    {
      "number": 105,
      "englishName": "Al-Fil (The Elephant)",
      "arabicName": "الفيل"
    },
    {
      "number": 106,
      "englishName": "Quraysh (Quraish)",
      "arabicName": "قريش"
    },
    {
      "number": 107,
      "englishName": "Al-Ma'un (The Small Kindness)",
      "arabicName": "الماعون"
    },
    {
      "number": 108,
      "englishName": "Al-Kawthar (The Abundance)",
      "arabicName": "الكوثر"
    },
    {
      "number": 109,
      "englishName": "Al-Kafirun (The Disbelievers)",
      "arabicName": "الكافرون"
    },
    {
      "number": 110,
      "englishName": "An-Nasr (The Divine Support)",
      "arabicName": "النصر"
    },
    {
      "number": 111,
      "englishName": "Al-Masad (The Palm Fiber)",
      "arabicName": "المسد"
    },
    {
      "number": 112,
      "englishName": "Al-Ikhlas (The Sincerity)",
      "arabicName": "الإخلاص"
    },
    {
      "number": 113,
      "englishName": "Al-Falaq (The Daybreak)",
      "arabicName": "الفلق"
    },
    {
      "number": 114,
      "englishName": "An-Nas (The Mankind)",
      "arabicName": "الناس"
    }
  ];