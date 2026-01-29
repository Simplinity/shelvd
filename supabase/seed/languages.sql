-- Languages (ISO 639-1 codes)
-- Common languages for book collections
-- Source: ISO 639-1 standard

INSERT INTO languages (code, name_en, name_native) VALUES
  -- Major European languages
  ('en', 'English', 'English'),
  ('nl', 'Dutch', 'Nederlands'),
  ('de', 'German', 'Deutsch'),
  ('fr', 'French', 'Français'),
  ('es', 'Spanish', 'Español'),
  ('it', 'Italian', 'Italiano'),
  ('pt', 'Portuguese', 'Português'),
  ('ru', 'Russian', 'Русский'),
  ('pl', 'Polish', 'Polski'),
  ('cs', 'Czech', 'Čeština'),
  ('sk', 'Slovak', 'Slovenčina'),
  ('hu', 'Hungarian', 'Magyar'),
  ('ro', 'Romanian', 'Română'),
  ('bg', 'Bulgarian', 'Български'),
  ('hr', 'Croatian', 'Hrvatski'),
  ('sr', 'Serbian', 'Српски'),
  ('sl', 'Slovenian', 'Slovenščina'),
  ('uk', 'Ukrainian', 'Українська'),
  ('be', 'Belarusian', 'Беларуская'),
  
  -- Scandinavian
  ('da', 'Danish', 'Dansk'),
  ('no', 'Norwegian', 'Norsk'),
  ('sv', 'Swedish', 'Svenska'),
  ('fi', 'Finnish', 'Suomi'),
  ('is', 'Icelandic', 'Íslenska'),
  
  -- Celtic & Insular
  ('ga', 'Irish', 'Gaeilge'),
  ('cy', 'Welsh', 'Cymraeg'),
  ('gd', 'Scottish Gaelic', 'Gàidhlig'),
  ('br', 'Breton', 'Brezhoneg'),
  
  -- Baltic
  ('lt', 'Lithuanian', 'Lietuvių'),
  ('lv', 'Latvian', 'Latviešu'),
  ('et', 'Estonian', 'Eesti'),
  
  -- Classical & Ancient
  ('la', 'Latin', 'Latina'),
  ('grc', 'Ancient Greek', 'Ἑλληνική'),
  ('el', 'Greek', 'Ελληνικά'),
  ('he', 'Hebrew', 'עברית'),
  ('sa', 'Sanskrit', 'संस्कृतम्'),
  ('cu', 'Church Slavonic', 'Славе́нскїй'),
  
  -- Asian - East
  ('zh', 'Chinese', '中文'),
  ('ja', 'Japanese', '日本語'),
  ('ko', 'Korean', '한국어'),
  ('vi', 'Vietnamese', 'Tiếng Việt'),
  
  -- Asian - South
  ('hi', 'Hindi', 'हिन्दी'),
  ('bn', 'Bengali', 'বাংলা'),
  ('ta', 'Tamil', 'தமிழ்'),
  ('te', 'Telugu', 'తెలుగు'),
  ('mr', 'Marathi', 'मराठी'),
  ('ur', 'Urdu', 'اردو'),
  ('pa', 'Punjabi', 'ਪੰਜਾਬੀ'),
  ('gu', 'Gujarati', 'ગુજરાતી'),
  
  -- Asian - Southeast
  ('th', 'Thai', 'ไทย'),
  ('ms', 'Malay', 'Bahasa Melayu'),
  ('id', 'Indonesian', 'Bahasa Indonesia'),
  ('tl', 'Tagalog', 'Tagalog'),
  ('my', 'Burmese', 'မြန်မာဘာသာ'),
  ('km', 'Khmer', 'ភាសាខ្មែរ'),
  
  -- Middle Eastern
  ('ar', 'Arabic', 'العربية'),
  ('fa', 'Persian', 'فارسی'),
  ('tr', 'Turkish', 'Türkçe'),
  ('ku', 'Kurdish', 'Kurdî'),
  
  -- African
  ('sw', 'Swahili', 'Kiswahili'),
  ('am', 'Amharic', 'አማርኛ'),
  ('yo', 'Yoruba', 'Yorùbá'),
  ('ig', 'Igbo', 'Igbo'),
  ('ha', 'Hausa', 'Hausa'),
  ('zu', 'Zulu', 'isiZulu'),
  ('xh', 'Xhosa', 'isiXhosa'),
  ('af', 'Afrikaans', 'Afrikaans'),
  
  -- Other European
  ('eu', 'Basque', 'Euskara'),
  ('ca', 'Catalan', 'Català'),
  ('gl', 'Galician', 'Galego'),
  ('mt', 'Maltese', 'Malti'),
  ('sq', 'Albanian', 'Shqip'),
  ('mk', 'Macedonian', 'Македонски'),
  ('bs', 'Bosnian', 'Bosanski'),
  
  -- Constructed
  ('eo', 'Esperanto', 'Esperanto'),
  ('ia', 'Interlingua', 'Interlingua'),
  
  -- Regional/Historical
  ('yi', 'Yiddish', 'ייִדיש'),
  ('fy', 'Frisian', 'Frysk'),
  ('lb', 'Luxembourgish', 'Lëtzebuergesch'),
  ('oc', 'Occitan', 'Occitan'),
  ('rm', 'Romansh', 'Rumantsch'),
  
  -- Sign languages (for accessibility)
  ('sgn', 'Sign Language', 'Sign Language'),
  
  -- Unknown/Multiple
  ('mul', 'Multiple languages', 'Multiple'),
  ('und', 'Undetermined', 'Undetermined'),
  ('zxx', 'No linguistic content', 'No linguistic content')
ON CONFLICT (code) DO NOTHING;
