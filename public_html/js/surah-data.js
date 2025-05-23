const surahData = [
  {
    "number": 1,
    "englishName": "Al-Fatiha (The Opener)",
    "arabicName": "الفاتحة",
    "startPage": 1,
    "endPage": 1,
    "totalAyas": 7
  },
  {
    "number": 2,
    "englishName": "Al-Baqarah (The Cow)",
    "arabicName": "البقرة",
    "startPage": 2,
    "endPage": 49,
    "totalAyas": 286
  },
  {
    "number": 3,
    "englishName": "Al-Imran (Family of Imran)",
    "arabicName": "آل عمران",
    "startPage": 50,
    "endPage": 76,
    "totalAyas": 200
  },
  {
    "number": 4,
    "englishName": "An-Nisa (The Women)",
    "arabicName": "النساء",
    "startPage": 77,
    "endPage": 106,
    "totalAyas": 176
  },
  {
    "number": 5,
    "englishName": "Al-Ma'idah (The Table Spread)",
    "arabicName": "المائدة",
    "startPage": 107,  // Corrected from 106 to 107
    "endPage": 127,
    "totalAyas": 120
  },
  {
    "number": 6,
    "englishName": "Al-Anam (The Cattle)",
    "arabicName": "الأنعام",
    "startPage": 128,
    "endPage": 150,
    "totalAyas": 165
  },
  {
    "number": 7,
    "englishName": "Al-A'raf (The Heights)",
    "arabicName": "الأعراف",
    "startPage": 151,
    "endPage": 176,
    "totalAyas": 206
  },
  {
    "number": 8,
    "englishName": "Al-Anfal (The Spoils of War)",
    "arabicName": "الأنفال",
    "startPage": 177,
    "endPage": 186,
    "totalAyas": 75
  },
  {
    "number": 9,
    "englishName": "At-Taubah (The Repentance)",
    "arabicName": "التوبة",
    "startPage": 187,
    "endPage": 207,
    "totalAyas": 129
  },
  {
    "number": 10,
    "englishName": "Yunus (Jonah)",
    "arabicName": "يونس",
    "startPage": 208,
    "endPage": 221,
    "totalAyas": 109
  },
  {
    "number": 11,
    "englishName": "Hud (Hud)",
    "arabicName": "هود",
    "startPage": 221,
    "endPage": 235,
    "totalAyas": 123
  },
  {
    "number": 12,
    "englishName": "Yusuf (Joseph)",
    "arabicName": "يوسف",
    "startPage": 235,
    "endPage": 248,
    "totalAyas": 111
  },
  {
    "number": 13,
    "englishName": "Ar-Ra'd (Thunder)",
    "arabicName": "الرعد",
    "startPage": 249,
    "endPage": 255,
    "totalAyas": 43
  },
  {
    "number": 14,
    "englishName": "Ibrahim (Abraham)",
    "arabicName": "إبراهيم",
    "startPage": 255,
    "endPage": 261,
    "totalAyas": 52
  },
  {
    "number": 15,
    "englishName": "Al-Hijr (The Stoneland)",
    "arabicName": "الحجر",
    "startPage": 262,
    "endPage": 267,
    "totalAyas": 99
  },
  {
    "number": 16,
    "englishName": "An-Nahl (The Bee)",
    "arabicName": "النحل",
    "startPage": 267,
    "endPage": 281,
    "totalAyas": 128
  },
  {
    "number": 17,
    "englishName": "Al-Isra (The Night Journey)",
    "arabicName": "الإسراء",
    "startPage": 282,
    "endPage": 293,
    "totalAyas": 111
  },
  {
    "number": 18,
    "englishName": "Al-Kahf (The Cave)",
    "arabicName": "الكهف",
    "startPage": 293,
    "endPage": 304,
    "totalAyas": 110
  },
  {
    "number": 19,
    "englishName": "Maryam (Mary)",
    "arabicName": "مريم",
    "startPage": 305,
    "endPage": 312,
    "totalAyas": 98
  },
  {
    "number": 20,
    "englishName": "Ta-Ha (Ta-Ha)",
    "arabicName": "طه",
    "startPage": 312,
    "endPage": 321,
    "totalAyas": 135
  },
  {
    "number": 21,
    "englishName": "Al-Anbiya (The Prophets)",
    "arabicName": "الأنبياء",
    "startPage": 322,
    "endPage": 331,
    "totalAyas": 112
  },
  {
    "number": 22,
    "englishName": "Al-Hajj (The Pilgrimage)",
    "arabicName": "الحج",
    "startPage": 332,
    "endPage": 341,
    "totalAyas": 78
  },
  {
    "number": 23,
    "englishName": "Al-Mu'minun (The Believers)",
    "arabicName": "المؤمنون",
    "startPage": 342,
    "endPage": 349,
    "totalAyas": 118
  },
  {
    "number": 24,
    "englishName": "An-Nur (The Light)",
    "arabicName": "النور",
    "startPage": 350,
    "endPage": 359,
    "totalAyas": 64
  },
  {
    "number": 25,
    "englishName": "Al-Furqan (The Criterion)",
    "arabicName": "الفرقان",
    "startPage": 359,
    "endPage": 366,
    "totalAyas": 77
  },
  {
    "number": 26,
    "englishName": "Ash-Shu'ara (The Poets)",
    "arabicName": "الشعراء",
    "startPage": 367,
    "endPage": 376,
    "totalAyas": 227
  },
  {
    "number": 27,
    "englishName": "An-Naml (The Ants)",
    "arabicName": "النمل",
    "startPage": 377,
    "endPage": 385,
    "totalAyas": 93
  },
  {
    "number": 28,
    "englishName": "Al-Qasas (The Story)",
    "arabicName": "القصص",
    "startPage": 385,
    "endPage": 396,
    "totalAyas": 88
  },
  {
    "number": 29,
    "englishName": "Al-Ankabut (The Spider)",
    "arabicName": "العنكبوت",
    "startPage": 396,
    "endPage": 404,
    "totalAyas": 69
  },
  {
    "number": 30,
    "englishName": "Ar-Rum (The Romans)",
    "arabicName": "الروم",
    "startPage": 404,
    "endPage": 410,
    "totalAyas": 60
  },
  {
    "number": 31,
    "englishName": "Luqman (Luqman)",
    "arabicName": "لقمان",
    "startPage": 411,
    "endPage": 414,
    "totalAyas": 34
  },
  {
    "number": 32,
    "englishName": "As-Sajdah (Prostration)",
    "arabicName": "السجدة",
    "startPage": 415,
    "endPage": 417,
    "totalAyas": 30
  },
  {
    "number": 33,
    "englishName": "Al-Ahzab (The Confederates)",
    "arabicName": "الأحزاب",
    "startPage": 418,
    "endPage": 427,
    "totalAyas": 73
  },
  {
    "number": 34,
    "englishName": "Saba (Sheba)",
    "arabicName": "سبأ",
    "startPage": 428,
    "endPage": 434,
    "totalAyas": 54
  },
  {
    "number": 35,
    "englishName": "Fatir (The Originator)",
    "arabicName": "فاطر",
    "startPage": 434,
    "endPage": 440,
    "totalAyas": 45
  },
  {
    "number": 36,
    "englishName": "Ya-Sin (Ya Sin)",
    "arabicName": "يس",
    "startPage": 440,
    "endPage": 445,
    "totalAyas": 83
  },
  {
    "number": 37,
    "englishName": "As-Saffat (Those Who Set the Ranks)",
    "arabicName": "الصافات",
    "startPage": 446,
    "endPage": 452,
    "totalAyas": 182
  },
  {
    "number": 38,
    "englishName": "Sad (The letter Saad)",
    "arabicName": "ص",
    "startPage": 453,
    "endPage": 458,
    "totalAyas": 88
  },
  {
    "number": 39,
    "englishName": "Az-Zumar (The Troops)",
    "arabicName": "الزمر",
    "startPage": 458,
    "endPage": 467,
    "totalAyas": 75
  },
  {
    "number": 40,
    "englishName": "Ghafir (The Forgiver)",
    "arabicName": "غافر",
    "startPage": 467,
    "endPage": 476,
    "totalAyas": 85
  },
  {
    "number": 41,
    "englishName": "Fussilat (Explained in Detail)",
    "arabicName": "فصلت",
    "startPage": 477,
    "endPage": 482,
    "totalAyas": 54
  },
  {
    "number": 42,
    "englishName": "Ash-Shura (The Consultation)",
    "arabicName": "الشورى",
    "startPage": 483,
    "endPage": 489,
    "totalAyas": 53
  },
  {
    "number": 43,
    "englishName": "Az-Zukhruf (The Ornaments of Gold)",
    "arabicName": "الزخرف",
    "startPage": 489,
    "endPage": 495,
    "totalAyas": 89
  },
  {
    "number": 44,
    "englishName": "Ad-Dukhan (The Smoke)",
    "arabicName": "الدخان",
    "startPage": 496,
    "endPage": 498,
    "totalAyas": 59
  },
  {
    "number": 45,
    "englishName": "Al-Jathiyah (The Crouching)",
    "arabicName": "الجاثية",
    "startPage": 499,
    "endPage": 502,
    "totalAyas": 37
  },
  {
    "number": 46,
    "englishName": "Al-Ahqaf (The Wind Curved Sandhill)",
    "arabicName": "الأحقاف",
    "startPage": 502,
    "endPage": 506,
    "totalAyas": 35
  },
  {
    "number": 47,
    "englishName": "Muhammad (Muhammad)",
    "arabicName": "محمد",
    "startPage": 507,
    "endPage": 510,
    "totalAyas": 38
  },
  {
    "number": 48,
    "englishName": "Al-Fath (The Victory)",
    "arabicName": "الفتح",
    "startPage": 511,
    "endPage": 515,
    "totalAyas": 29
  },
  {
    "number": 49,
    "englishName": "Al-Hujurat (The Private Chambers)",
    "arabicName": "الحجرات",
    "startPage": 515,
    "endPage": 517,
    "totalAyas": 18
  },
  {
    "number": 50,
    "englishName": "Qaf (Qaf)",
    "arabicName": "ق",
    "startPage": 518,
    "endPage": 520,
    "totalAyas": 45
  },
  {
    "number": 51,
    "englishName": "Adh-Dhariyat (The Scatterers)",
    "arabicName": "الذاريات",
    "startPage": 520,
    "endPage": 523,
    "totalAyas": 60
  },
  {
    "number": 52,
    "englishName": "At-Tur (The Mountain)",
    "arabicName": "الطور",
    "startPage": 523,
    "endPage": 525,
    "totalAyas": 49
  },
  {
    "number": 53,
    "englishName": "An-Najm (The Star)",
    "arabicName": "النجم",
    "startPage": 526,
    "endPage": 528,
    "totalAyas": 62
  },
  {
    "number": 54,
    "englishName": "Al-Qamar (The Moon)",
    "arabicName": "القمر",
    "startPage": 528,
    "endPage": 531,
    "totalAyas": 55
  },
  {
    "number": 55,
    "englishName": "Ar-Rahman (The Beneficent)",
    "arabicName": "الرحمن",
    "startPage": 531,
    "endPage": 534,
    "totalAyas": 78
  },
  {
    "number": 56,
    "englishName": "Al-Waqi'ah (The Inevitable)",
    "arabicName": "الواقعة",
    "startPage": 534,
    "endPage": 537,
    "totalAyas": 96
  },
  {
    "number": 57,
    "englishName": "Al-Hadid (The Iron)",
    "arabicName": "الحديد",
    "startPage": 537,
    "endPage": 541,
    "totalAyas": 29
  },
  {
    "number": 58,
    "englishName": "Al-Mujadila (The Pleading Women)",
    "arabicName": "المجادلة",
    "startPage": 542,
    "endPage": 545,
    "totalAyas": 22
  },
  {
    "number": 59,
    "englishName": "Al-Hashr (The Exile)",
    "arabicName": "الحشر",
    "startPage": 545,
    "endPage": 548,
    "totalAyas": 24
  },
  {
    "number": 60,
    "englishName": "Al-Mumtahanah (She That is to be Examined)",
    "arabicName": "الممتحنة",
    "startPage": 549,
    "endPage": 551,
    "totalAyas": 13
  },
  {
    "number": 61,
    "englishName": "As-Saff (The Ranks)",
    "arabicName": "الصف",
    "startPage": 551,
    "endPage": 552,
    "totalAyas": 14
  },
  {
    "number": 62,
    "englishName": "Al-Jumu'ah (Congregation Prayer)",
    "arabicName": "الجمعة",
    "startPage": 553,
    "endPage": 554,
    "totalAyas": 11
  },
  {
    "number": 63,
    "englishName": "Al-Munafiqun (The Hypocrites)",
    "arabicName": "المنافقون",
    "startPage": 554,
    "endPage": 555,
    "totalAyas": 11
  },
  {
    "number": 64,
    "englishName": "At-Taghabun (Mutual Disposession)",
    "arabicName": "التغابن",
    "startPage": 556,
    "endPage": 557,
    "totalAyas": 18
  },
  {
    "number": 65,
    "englishName": "At-Talaq (The Divorce)",
    "arabicName": "الطلاق",
    "startPage": 558,
    "endPage": 559,
    "totalAyas": 12
  },
  {
    "number": 66,
    "englishName": "At-Tahrim (The Prohibition)",
    "arabicName": "التحريم",
    "startPage": 560,
    "endPage": 561,
    "totalAyas": 12
  },
  {
    "number": 67,
    "englishName": "Al-Mulk (The Sovereignty)",
    "arabicName": "الملك",
    "startPage": 562,
    "endPage": 564,
    "totalAyas": 30
  },
  {
    "number": 68,
    "englishName": "Al-Qalam (The Pen)",
    "arabicName": "القلم",
    "startPage": 564,
    "endPage": 566,
    "totalAyas": 52
  },
  {
    "number": 69,
    "englishName": "Al-Haqqah (The Reality)",
    "arabicName": "الحاقة",
    "startPage": 566,
    "endPage": 568,
    "totalAyas": 52
  },
  {
    "number": 70,
    "englishName": "Al-Ma'arij (The Ascending Stairways)",
    "arabicName": "المعارج",
    "startPage": 568,
    "endPage": 570,
    "totalAyas": 44
  },
  {
    "number": 71,
    "englishName": "Nuh (Noah)",
    "arabicName": "نوح",
    "startPage": 570,
    "endPage": 571,
    "totalAyas": 28
  },
  {
    "number": 72,
    "englishName": "Al-Jinn (The Jinn)",
    "arabicName": "الجن",
    "startPage": 572,
    "endPage": 573,
    "totalAyas": 28
  },
  {
    "number": 73,
    "englishName": "Al-Muzzammil (The Enshrouded One)",
    "arabicName": "المزمل",
    "startPage": 574,
    "endPage": 575,
    "totalAyas": 20
  },
  {
    "number": 74,
    "englishName": "Al-Muddaththir (The Cloaked One)",
    "arabicName": "المدثر",
    "startPage": 575,
    "endPage": 577,
    "totalAyas": 56
  },
  {
    "number": 75,
    "englishName": "Al-Qiyamah (The Resurrection)",
    "arabicName": "القيامة",
    "startPage": 577,
    "endPage": 578,
    "totalAyas": 40
  },
  {
    "number": 76,
    "englishName": "Al-Insan (The Man)",
    "arabicName": "الإنسان",
    "startPage": 578,
    "endPage": 580,
    "totalAyas": 31
  },
  {
    "number": 77,
    "englishName": "Al-Mursalat (The Emissaries)",
    "arabicName": "المرسلات",
    "startPage": 580,
    "endPage": 581,
    "totalAyas": 50
  },
  {
    "number": 78,
    "englishName": "An-Naba (The Tidings)",
    "arabicName": "النبأ",
    "startPage": 582,
    "endPage": 583,
    "totalAyas": 40
  },
  {
    "number": 79,
    "englishName": "An-Nazi'at (Those who drag forth)",
    "arabicName": "النازعات",
    "startPage": 583,
    "endPage": 584,
    "totalAyas": 46
  },
  {
    "number": 80,
    "englishName": "Abasa (He Frowned)",
    "arabicName": "عبس",
    "startPage": 585,
    "endPage": 585,
    "totalAyas": 42
  },
  {
    "number": 81,
    "englishName": "At-Takwir (The Overthrowing)",
    "arabicName": "التكوير",
    "startPage": 586,
    "endPage": 586,
    "totalAyas": 29
  },
  {
    "number": 82,
    "englishName": "Al-Infitar (The Cleaving)",
    "arabicName": "الإنفطار",
    "startPage": 587,
    "endPage": 587,
    "totalAyas": 19
  },
  {
    "number": 83,
    "englishName": "Al-Mutaffifin (The Defrauding)",
    "arabicName": "المطففين",
    "startPage": 587,
    "endPage": 589,
    "totalAyas": 36
  },
  {
    "number": 84,
    "englishName": "Al-Inshiqaq (The Sundering)",
    "arabicName": "الإنشقاق",
    "startPage": 589,
    "endPage": 589,
    "totalAyas": 25
  },
  {
    "number": 85,
    "englishName": "Al-Buruj (The Mansions of the Stars)",
    "arabicName": "البروج",
    "startPage": 590,
    "endPage": 590,
    "totalAyas": 22
  },
  {
    "number": 86,
    "englishName": "At-Tariq (The Nightcommer)",
    "arabicName": "الطارق",
    "startPage": 591,
    "endPage": 591,
    "totalAyas": 17
  },
  {
    "number": 87,
    "englishName": "Al-Ala (The Most High)",
    "arabicName": "الأعلى",
    "startPage": 591,
    "endPage": 592,
    "totalAyas": 19
  },
  {
    "number": 88,
    "englishName": "Al-Ghashiyah (The Overwhelming)",
    "arabicName": "الغاشية",
    "startPage": 592,
    "endPage": 592,
    "totalAyas": 26
  },
  {
    "number": 89,
    "englishName": "Al-Fajr (The Dawn)",
    "arabicName": "الفجر",
    "startPage": 593,
    "endPage": 594,
    "totalAyas": 30
  },
  {
    "number": 90,
    "englishName": "Al-Balad (The City)",
    "arabicName": "البلد",
    "startPage": 594,
    "endPage": 594,
    "totalAyas": 20
  },
  {
    "number": 91,
    "englishName": "Ash-Shams (The Sun)",
    "arabicName": "الشمس",
    "startPage": 595,
    "endPage": 595,
    "totalAyas": 15
  },
  {
    "number": 92,
    "englishName": "Al-Lail (The Night)",
    "arabicName": "الليل",
    "startPage": 595,
    "endPage": 596,
    "totalAyas": 21
  },
  {
    "number": 93,
    "englishName": "Ad-Duha (The Morning Brightness)",
    "arabicName": "الضحى",
    "startPage": 596,
    "endPage": 596,
    "totalAyas": 11
  },
  {
    "number": 94,
    "englishName": "Ash-Sharh (The Expansion)",
    "arabicName": "الشرح",
    "startPage": 596,
    "endPage": 596,
    "totalAyas": 8
  },
  {
    "number": 95,
    "englishName": "At-Tin (The Fig)",
    "arabicName": "التين",
    "startPage": 597,
    "endPage": 597,
    "totalAyas": 8
  },
  {
    "number": 96,
    "englishName": "Al-Alaq (The Blood Clot)",
    "arabicName": "العلق",
    "startPage": 597,
    "endPage": 597,
    "totalAyas": 19
  },
  {
    "number": 97,
    "englishName": "Al-Qadr (The Power)",
    "arabicName": "القدر",
    "startPage": 598,
    "endPage": 598,
    "totalAyas": 5
  },
  {
    "number": 98,
    "englishName": "Al-Bayyina (The Evidence)",
    "arabicName": "البينة",
    "startPage": 598,
    "endPage": 599,
    "totalAyas": 8
  },
  {
    "number": 99,
    "englishName": "Az-Zalzalah (The Earthquake)",
    "arabicName": "الزلزلة",
    "startPage": 599,
    "endPage": 599,
    "totalAyas": 8
  },
  {
    "number": 100,
    "englishName": "Al-Adiyat (The Courser)",
    "arabicName": "العاديات",
    "startPage": 599,
    "endPage": 600,
    "totalAyas": 11
  },
  {
    "number": 101,
    "englishName": "Al-Qari'ah (The Calamity)",
    "arabicName": "القارعة",
    "startPage": 600,
    "endPage": 600,
    "totalAyas": 11
  },
  {
    "number": 102,
    "englishName": "At-Takathur (Vying for increase)",
    "arabicName": "التكاثر",
    "startPage": 600,
    "endPage": 600,
    "totalAyas": 8
  },
  {
    "number": 103,
    "englishName": "Al-Asr (The Declining Day)",
    "arabicName": "العصر",
    "startPage": 601,
    "endPage": 601,
    "totalAyas": 3
  },
  {
    "number": 104,
    "englishName": "Al-Humazah (The Slanderer)",
    "arabicName": "الهمزة",
    "startPage": 601,
    "endPage": 601,
    "totalAyas": 9
  },
  {
    "number": 105,
    "englishName": "Al-Fil (The Elephant)",
    "arabicName": "الفيل",
    "startPage": 601,
    "endPage": 601,
    "totalAyas": 5
  },
  {
    "number": 106,
    "englishName": "Quraysh (Quraish)",
    "arabicName": "قريش",
    "startPage": 602,
    "endPage": 602,
    "totalAyas": 4
  },
  {
    "number": 107,
    "englishName": "Al-Ma'un (The Small Kindness)",
    "arabicName": "الماعون",
    "startPage": 602,
    "endPage": 602,
    "totalAyas": 7
  },
  {
    "number": 108,
    "englishName": "Al-Kawthar (The Abundance)",
    "arabicName": "الكوثر",
    "startPage": 602,
    "endPage": 602,
    "totalAyas": 3
  },
  {
    "number": 109,
    "englishName": "Al-Kafirun (The Disbelievers)",
    "arabicName": "الكافرون",
    "startPage": 603,
    "endPage": 603,
    "totalAyas": 6
  },
  {
    "number": 110,
    "englishName": "An-Nasr (The Divine Support)",
    "arabicName": "النصر",
    "startPage": 603,
    "endPage": 603,
    "totalAyas": 3
  },
  {
    "number": 111,
    "englishName": "Al-Masad (The Palm Fiber)",
    "arabicName": "المسد",
    "startPage": 603,
    "endPage": 603,
    "totalAyas": 5
  },
  {
    "number": 112,
    "englishName": "Al-Ikhlas (The Sincerity)",
    "arabicName": "الإخلاص",
    "startPage": 604,
    "endPage": 604,
    "totalAyas": 4
  },
  {
    "number": 113,
    "englishName": "Al-Falaq (The Daybreak)",
    "arabicName": "الفلق",
    "startPage": 604,
    "endPage": 604,
    "totalAyas": 5
  },
  {
    "number": 114,
    "englishName": "An-Nas (The Mankind)",
    "arabicName": "الناس",
    "startPage": 604,
    "endPage": 604,
    "totalAyas": 6
  }
];

// Example usage:
// console.log(surahData[1]); // Logs data for Surah Al-Baqarah including pages and ayah count
