main();

async function main() {
    
    //Tokenauswahl
    if(canvas.tokens.controlled.length == 0){
        ui.notifications.error("Bitte einen Token auswählen.");
        return;
    };

    const tokens = canvas.tokens.controlled;
    const tokenLength = tokens.length;
    

    //Talentgruppen

    const fight = ["Anderthalbhänder","Belagerungswaffen","Dolche","Fechtwaffen","Hiebwaffen","Infanteriewaffen","Kettenstäbe","Kettenwaffen","Lanzenreiten","Raufen","Ringen","Säbel","Schwerter","Speere","Stäbe","Zweihandflegel","Zweihand-Hiebwaffen","Zweihandschwerter/-säbel"];
    const longrange = ["Armbrust","Blasrohr","Bogen","Diskus","Peitsche","Schleuder","Wurfbeile","Wurfmesser","Wurfspeere"];
    const physical = ["Akrobatik","Athletik","Fliegen","Gaukeleien","Klettern","Körperbeherrschung","Reiten","Schleichen","Schwimmen","Selbstbeherrschung","Sich Verstecken","Singen","Sinnenschärfe","Skifahren","Stimmen Imitieren","Taschendiebstahl","Tanzen","Zechen"];
    const social = ["Betören","Etikette","Gassenwissen","Lehren","Menschenkenntnis","Schauspielerei","Schriftlicher Ausdruck","Sich Verkleiden","Überreden","Überzeugen"];
    const nature = ["Fährtensuchen","Fallenstellen","Fesseln/Entfesseln","Fischen/Angeln","Orientierung","Wettervorhersage","Wildnisleben","Wachehalten"];
    const known = ["Anatomie","Baukunst","Brett-/Kartenspiel","Geographie","Geschichtswissen","Gesteinskunde","Götter/Kulte","Heraldik","Hüttenkunde","Kriegskunst","Kryptographie","Magiekunde","Mechanik","Pflanzenkunde","Philosophie","Rechnen","Rechtskunde","Sagen/Legenden","Schätzen","Sprachenkunde","Staatskunst","Sternkunde","Tierkunde"];
    const langue = ["Alaani","Alt-Imperial/Aureliani","Altes Kemi","Angram","Asdharia","Atak","Bosparano","Drachisch","Ferkina","Füchsisch","Garethi","Goblinisch","Grolmisch","Hjaldingsch","Isdira","Koboldisch","Mahrisch","Mohisch","Molochisch","Neckergesang","Nujuka","Oloarkh","Ologhaijan","Rabensprache","Rissoal","Rogolan","Rssahh","Ruuz","Thorwalsch","Trollisch","Tulamidya","Urtulamidya","Z'Lit","Zelemja","Zhayad","Zhulchammaqra","Zyklopäisch"];
    const script = ["(Alt-)Imperiale Zeichen","Altes Alaani","Altes Amulashtra","Altes Kemi","Amulashtra","Angram","Arkanil","Chrmk","Chuchas","Drakhard-Zinken","Drakned-Glyphen","Geheiligte Glyphen von Unau","Gimaril-Glyphen","Gjalskisch","Hjaldingsche Runen","Isdira/Asdharia","Kusliker Zeichen","Mahrische Glyphen","Nanduria","Rogolan","Trollische Raumbilderschrift","Tulamidya","Urtulamidya","Zhayad"];
    const labour = ["Abrichten","Ackerbau","Alchimie","Bergbau","Bogenbau","Boote Fahren","Brauer","Drucker","Fahrzeug Lenken","Falschspiel","Feinmechanik","Feuersteinbearbeitung","Fleischer","Gerber/Kürschner","Glaskunst","Grobschmied","Handel","Hauswirtschaft","Heilkunde Gift","Heilkunde Krankheiten","Heilkunde Seele","Heilkunde Wunden","Holzbearbeitung","Instrumentenbauer","Kartographie","Kochen","Kristallzucht","Lederarbeiten","Malen/Zeichnen","Maurer","Metallguss","Musizieren","Schlösser Knacken","Schnaps Brennen","Schneidern","Seefahrt","Seiler","Steinmetz","Steinschneider/Juwelier","Stellmacher","Stoffe Färben","Tätowieren","Töpfern","Viehzucht","Webkunst","Winzer","Zimmermann"];
    const spell = ["Abvenenum reine Speise","Accuratum Zaubernadel","Adamantium Erzstruktur","Adlerauge Luchsenohr","Adlerschwinge Wolfsgestalt","Aeolitus Windgebraus","Aerofugo Vakuum","Aerogelo Atemqual","Alpgestalt","Analys Arkanstruktur","Ängste lindern","Animatio stummer Diener","Applicatus Zauberspeicher","Aquafaxius Wasserstrahl","Aquasphaero Wasserball","Arachnea Krabbeltier","Arcanovi Artefakt","Archofaxius Erzstrahl","Archosphaero Erzball","Armatrutz","Atemnot","Attributo","Aufgeblasen Abgehoben","Auge des Limbus","Aureolus Güldenglanz","Auris Nasus Oculus","Axxeleratus Blitzgeschwind","Balsam Salabunde","Band und Fessel","Bannbaladin","Bärenruhe Winterschlaf","Beherrschung brechen","Beschwörung vereiteln","Bewegung stören","Blendwerk","Blick aufs Wesen","Blick durch fremde Augen","Blick in die Gedanken","Blick in die Vergangenheit","Blitz dich find","Böser Blick","Brenne toter Stoff!","Caldofrigo heiß und kalt","Chamaelioni Mimikry","Chimaeroform Hybridgestalt","Chronoklassis Urfossil","Chrononautos Zeitenfahrt","Claudibus Clavistibor","Corpofesso Gliederschmerz","Corpofrigo Kälteschock","Cryptographo Zauberschrift","Custodosigil Diebesbann","Dämonenbann","Delicioso Gaumenschmaus","Desintegratus Pulverstaub","Destructibo Arcanitas","Dichter und Denker","Dschinnenruf","Dunkelheit","Duplicatus Doppelbild","Ecliptifactus Schattenkraft","Eigenschaft wiederherstellen","Eigne Ängste quälen dich!","Einfluss bannen","Eins mit der Natur","Eisenrost und Patina","Eiseskälte Kämpferherz","Elementarbann","Elementarer Diener","Elfenstimme Flötenton","Erinnerung verlasse dich!","Exposami Lebenskraft","Falkenauge Meisterschuss","Favilludo Funkentanz","Firnlauf","Flim Flam Funkel","Fluch der Pestilenz","Foramen Foraminor","Fortifex arkane Wand","Frigifaxius Eisstrahl","Frigisphaero Eisball","Fulminictus Donnerkeil","Gardianum Zauberschild","Gedankenbilder Elfenruf","Gefäß der Jahre","Gefunden!","Geisterbann","Geisterruf","Gletscherwand","Granit und Marmor","Große Gier","Große Verwirrung","Halluzination","Harmlose Gestalt","Hartes schmelze!","Haselbusch und Ginsterkraut","Heilkraft bannen","Hellsicht trüben","Herbeirufung vereiteln","Herr über das Tierreich","Herzschlag ruhe!","Hexenblick","Hexengalle","Hexenholz","Hexenknoten","Hexenkrallen","Hexenspeichel","Hilfreiche Tatze, rettende Schwinge","Höllenpein zerreiße dich!","Holterdipolter","Horriphobus Schreckgestalt","Humofaxius Humusstrahl","Humosphaero Humusball","Ignifaxius Feuerstrahl","Ignisphaero Feuerball","Ignorantia Ungesehn","Illusion auflösen","Immortalis Lebenszeit","Imperavi Handlungszwang","Impersona Maskenbild","Infinitum Immerdar","Invercano Spiegeltrick","Invocatio maior","Invocatio minor","Iribaars Hand","Juckreiz, dämlicher!","Karnifilio Raserei","Katzenaugen","Klarum Purum","Klickeradomms","Koboldgeschenk","Koboldovision","Komm Kobold Komm","Körperlose Reise","Krabbelnder Schrecken","Kraft des Erzes","Krähenruf","Krötensprung","Kulminatio Kugelblitz","Kusch!","Lach dich gesund","Lachkrampf","Langer Lulatsch","Last des Alters","Leib der Erde","Leib der Wogen","Leib des Eises","Leib des Erzes","Leib des Feuers","Leib des Windes","Leidensbund","Levthans Feuer","Limbus versiegeln","Lockruf und Feenfüße","Lunge des Leviatan","Madas Spiegel","Magischer Raub","Mahlstrom","Manifesto Element","Meister der Elemente","Meister minderer Geister","Memorabia Falsifir","Memorans Gedächtniskraft","Menetekel Flammenschrift","Metamagie neutralisieren","Metamorpho Gletscherform","Motoricus","Movimento Dauerlauf","Murks und Patz","Nackedei","Nebelleib","Nebelwand und Morgendunst","Nekropathia Seelenreise","Nihilogravo Schwerelos","Nuntiovolo Botenvogel","Objecto Obscuro","Objectofixo","Objectovoco","Objekt entzaubern","Oculus Astralis","Odem Arcanum","Orcanofaxius Luftstrahl","Orcanosphaero Orkanball","Pandaemonium","Panik überkomme euch!","Papperlapapp","Paralysis starr wie Stein","Pectetondo Zauberhaar","Penetrizzel Tiefenblick","Pentagramma Sphärenbann","Pestilenz erspüren","Pfeil der Luft","Pfeil des Eises","Pfeil des Erzes","Pfeil des Feuers","Pfeil des Humus","Pfeil des Wassers","Planastrale Anderswelt","Plumbumbarum schwerer Arm","Projektimago Ebenbild","Protectionis Kontrabann","Psychostabilis","Radau","Reflectimago Spiegelschein","Reptilea Natternest","Respondami","Reversalis Revidum","Ruhe Körper, ruhe Geist","Salander Mutander","Sanftmut","Sapefacta Zauberschwamm","Satuarias Herrlichkeit","Schabernack","Schadenszauber bannen","Schelmenkleister","Schelmenlaune","Schelmenmaske","Schelmenrausch","Schleier der Unwissenheit","Schwarz und Rot","Schwarzer Schrecken","Seelentier erkennen","Seelenwanderung","Seidenweich Schuppengleich","Seidenzunge Elfenwort","Sensattacco Meisterstreich","Sensibar Empathicus","Serpentialis Schlangenleib","Silentium","Sinesigil unerkannt","Skelettarius","Solidirid Weg aus Licht","Somnigravis tiefer Schlaf","Spinnenlauf","Spurlos Trittlos","Standfest Katzengleich","Staub wandle!","Stein wandle!","Stillstand","Sumus Elixiere","Tauschrausch","Tempus Stasis","Tiere besprechen","Tiergedanken","Tlalucs Odem Pestgestank","Totes handle!","Transformatio Formgestalt","Transmutare Körperform","Transversalis Teleport","Traumgestalt","Unberührt von Satinav","Unitatio Geistesbund","Unsichtbarer Jäger","Veränderung aufheben","Verschwindibus","Verständigung stören","Verwandlung beenden","Vipernblick","Visibili Vanitar","Vocolimbo hohler Klang","Vogelzwitschern Glockenspiel","Wand aus Dornen","Wand aus Flammen","Wand aus Erz","Wand aus Luft","Wand aus Wogen","Warmes Blut","Wasseratem","Weiches erstarre!","Weihrauchwolke Wohlgeruch","Weisheit der Bäume","Weiße Mähn und goldener Huf","Wellenlauf","Wettermeisterschaft","Widerwille Ungemach","Windhose","Windstille","Wipfellauf","Xenographus Schriftenkunde","Zagibu Ubigaz","Zappenduster","Zauberklinge Geisterspeer","Zaubernahrung Hungerbann","Zauberwesen der Natur","Zauberzwang","Zorn der Elemente","Zunge lähmen","Zwingtanz"];
    const ritualknown = ["Liturgiekenntnis (Angrosch)","Liturgiekenntnis (Aves)","Liturgiekenntnis (Boron)","Liturgiekenntnis (Efferd)","Liturgiekenntnis (Firun)","Liturgiekenntnis (Hesinde)","Liturgiekenntnis (Ifirn)","Liturgiekenntnis (Ingerimm)","Liturgiekenntnis (Kor)","Liturgiekenntnis (Namenloser)","Liturgiekenntnis (Nandus)","Liturgiekenntnis (Nandus)","Liturgiekenntnis (Peraine)","Liturgiekenntnis (Phex)","Liturgiekenntnis (Praios)","Liturgiekenntnis (Rahja)","Liturgiekenntnis (Rondra)","Liturgiekenntnis (Swafnir)","Liturgiekenntnis (Travia)","Liturgiekenntnis (Tsa)","Ritualkenntnis (Achaz-Schamane)","Ritualkenntnis (Alchimist)","Ritualkenntnis (Derwisch)","Ritualkenntnis (Durro-Dûn)","Ritualkenntnis (Ferkina-Schamane)","Ritualkenntnis (Geode)","Ritualkenntnis (Gildenmagie)","Ritualkenntnis (Gjalsker-Schamane)","Ritualkenntnis (Goblin-Schamane)","Ritualkenntnis (Hexen)","Ritualkenntnis (Kristallomantie)","Ritualkenntnis (Nivesen-Schamane)","Ritualkenntnis (Ork-Schamane)","Ritualkenntnis (Runenzauberei)","Ritualkenntnis (Scharlatan)","Ritualkenntnis (Seher)","Ritualkenntnis (Trollzacker-Schamane)","Ritualkenntnis (Vertrautentier)","Ritualkenntnis (Waldmenschen-Schamane)","Ritualkenntnis (Tocamuyac-Schamane)","Ritualkenntnis (Utulu-Schamane)","Ritualkenntnis (Zaubertänzer)","Ritualkenntnis (Zaubertänzer - Hazaqi)","Ritualkenntnis (Zaubertänzer - Majuna)","Ritualkenntnis (Zaubertänzer - novadische Sharisad)","Ritualkenntnis (Zaubertänzer - tulamidische Sharisad)","Ritualkenntnis (Zibilja)"]
    const gift = ["Empathie","Gefahreninstinkt","Geräuschhexerei","Magiegespür","Prophezeien","Tierempathie","Zwergnase"]
    const advantage = ["Adlige Abstammung","Adliges Erbe","Amtsadel","Affinität zu Geistern","Affinität zu Elementaren","Affinität zu Dämonen","Akademische Ausbildung (Gelehrter)","Akademische Ausbildung (Magier)","Akademische Ausbildung (Krieger)","Altersresistenz","Astrale Regeneration","Astralmacht","Ausdauernd","Ausdauernder Zauberer","Ausrüstungsvorteil","Balance","Beidhändig","Beseelte Knochenkeule","Besonderer Besitz","Breitgefächerte Bildung","Dämmerungssicht","Eidetisches Gedächtnis","Eigeboren","Eisenaffine Aura","Eisern","Entfernungssinn","Ererbte Knochenkeule","Feenfreund","Feste Matrix","Flink","Gebildet","Geweiht","Glück","Glück im Spiel","Gut Aussehend","Guter Ruf","Gutes Gedächtnis","Halbzauberer","Herausragende Balance","Herausragender Sechster Sinn","Herausragender Sinn Gehör","Herausragender Sinn Sicht","Herausragender Sinn Tastsinn","Herausragender Sinn Geruchssinn","Herausragendes Aussehen","Hitzeresistenz","Hohe Lebenskraft","Hohe Magieresistenz","Immunität","Innerer Kompass","Kälteresistenz","Kampfrausch","Koboldfreund","Linkshänder","Machtvoller Vertrauter","Magiedilettant","Nachtsicht","Natürliche Waffen 1W6","Natürliche Waffen 1W6+1","Natürlicher Rüstungsschutz","Resistenz", "Richtungssinn","Schlangenmensch","Schnelle Heilung","Schutzgeist","Schwer zu verzaubern","Soziale Anpassungsfähigkeit","Tierfreund","Verbindungen","Verhüllte Aura","Veteran","Viertelzauberer","Vollzauberer","Vom Schicksal begünstigt","Wesen der Nacht","Wohlklang","Wolfskind","Zäher Hund","Zauberhaar","Zeitgefühl","Zusätzliche Gliedmaßen Arme","Zusätzliche Gliedmaßen Armpaar","Zusätzliche Gliedmaßen Balanceschwanz","Zusätzliche Gliedmaßen Beinpaar","Zusätzliche Gliedmaßen Beinpaar (2.)","Zusätzliche Gliedmaßen Beinpaar (3.)","Zusätzliche Gliedmaßen Bemuskelter Schwanz","Zusätzliche Gliedmaßen Flügel","Zusätzliche Gliedmaßen Schwanz","Zweistimmiger Gesang","Zwergnase"];
//Fehlende Vorteile: Begabungen, Herausragende Eigenschaft, Kräfte-/Talentschub, Übernatürliche Begabung (siehe Zauber), Meisterhandwerk
    const disadvantage = ["Aberglaube","Albino","Angst vor Feuer","Angst vor Insekten","Angst vor Menschenmassen","Angst vor Nagetieren","Angst vor Pelztieren","Angst vor Reptilien","Angst vor Spinnen","Angst vor Wasser","Animalische Magie","Arkanophobie","Arroganz","Artefaktgebunden","Astraler Block","Autoritätsgläubig","Behäbig","Blutdurst","Blutrausch","Brünstigkeit","Dunkelangst","Einarmig","Einäugig","Einbeinig","Einbildungen","Eingeschränkte Elementarnähe Eis","Eingeschränkte Elementarnähe Erde","Eingeschränkte Elementarnähe Fels","Eingeschränkte Elementarnähe Feuer","Eingeschränkte Elementarnähe Wasser","Eingeschränkter Sinn Gehör","Eingeschränkter Sinn Geruchssinn","Eingeschränkter Sinn Sicht","Eingeschränkter Sinn Tastsinn","Einhändig","Eitelkeit","Elfische Weltsicht","Farbenblind","Feind","Feste Gewohnheit","Festgefügtes Denken","Fettleibig","Fluch der Finsternis","Geiz","Gerechtigkeitswahn","Gesucht","Glasknochen","Goldgier","Größenwahn","Heimwehkrank","Hitzempfindlichkeit","Höhenangst","Impulsiv","Jähzorn","Kälteempfindlichkeit","Kältestarre","Kein Vertrauter","Kleinwüchsig","Körpergebundene Kraft","Krankhafte Reinlichkeit","Krankheitsanfällig","Kristallgebunden","Kurzatmig","Lahm","Lästige Mindergeister","Lichtempfindlich","Lichtscheu","Loyalität","Madas Fluch","Medium","Meeresangst","Miserable Eigenschaft","Mondsüchtig","Moralkodex","Nachtblind","Nahrungsrestriktion","Neid","Neugier","Niedrige Astralkraft","Niedrige Lebenskraft","Niedrige Magieresistenz","Pechmagnet","Platzangst","Prinzipientreue","Rachsucht","Randgruppe","Raubtiergeruch","Raumangst","Rückschlag","Schlafstörungen","Schlafwandler","Schlechte Regeneration","Schlechter Ruf","Schneller Alternd","Schulden","Schwache Ausstrahlung","Schwacher Astralkörper","Schwanzlos","Seffer Manich","Selbstgespräche","Sensibler Geruchssinn","Sippenlosigkeit","Sonnensucht","Speisegebote","Spielsucht","Sprachfehler","Spruchhemmung","Stigma","Streitsucht","Stubenhocker","Sucht","Thesisgebunden","Tollpatsch","Totenangst","Übler Geruch","Unangenehme Stimme","Unansehnlich","Unfähigkeit für","Unfrei","Ungebildet","Unstet","Unverträglichkeit mit verarbeitetem Metall","Vergesslichkeit","Verpflichtung","Verschwendungssucht","Verwöhnt","Vorurteile","Wahnvorstellungen","Wahrer Name","Weltfremd"];
//Fehlende Nachteile: Miserable Eigenschaft

    const skill = [""];
    const magskill = [""];
    
    const talentList = nature.concat(physical,social,known,labour,fight,longrange,spell,ritualknown,gift,advantage,disadvantage);
    talentValueList = {};
    langueValueList = {};
    scriptValueList = {};
    tokenList = [];
    count = 0;
    countLangue = 0;
    countScript = 0;

       
    //Funktionen
    ////Abfrage pro Charakter
    tokens.forEach(groupOverview);
    function groupOverview(token, index){
        
        tokenName = token.data.name
        tokenShortName = tokenName.split(" ")[0];
        tokenList.push(tokenShortName);
        
        
        //Suche Werte
        talentList.forEach(checkTalent);
        function checkTalent(talentName){
            letterCount = talentName.length;
            talent = token.actor.items.find(item => item.data.name.substring(0,letterCount) === talentName);

            
            //Datenbereinigung
            if(talent == undefined){
                talentValue = undefined;
            }else{
                talentValue = talent.data.data.value;
                if(talentValue == null){
                    talentValue = 0;
                };
                talentType = talent.data.type;
                if(talentValue == 0 && (talentType == "advantage" || talentType == "disadvantage")){
                    talentValue = "✓";
                };
            }; 
            
            //Füge Werte zum Talentobjekt
            if(count < talentList.length){
                count += 1;
                talentValueList[talentName] = [];
            };
            talentValueName = talentValueList[talentName];
            talentValueName.push(talentValue);
        };
        
        
        langue.forEach(checkLangue);
        function checkLangue(talentName){
            talent = token.actor.items.find(item => item.data.name === talentName && item.data.type === "language"); 
            
            //Datenbereinigung
            if(talent == undefined){
                talentValue = undefined;
            }else{
                talentValue = talent.data.data.value;
                if(talentValue == null){
                    talentValue = 0;
                };
            }; 
            
            //Füge Werte zum Talentobjekt
            if(countLangue < langue.length){
                countLangue += 1;
                langueValueList[talentName] = [];
            };
            langueValueName = langueValueList[talentName];
            langueValueName.push(talentValue);
        };

    
        script.forEach(checkScript);
        function checkScript(talentName){
            talent = token.actor.items.find(item => item.data.name === talentName && item.data.type === "scripture"); 
            
            //Datenbereinigung
            if(talent == undefined){
                talentValue = undefined;
            }else{
                talentValue = talent.data.data.value;
                if(talentValue == null){
                    talentValue = 0;
                };
            }; 
            
            //Füge Werte zum Talentobjekt
            if(countScript < script.length){
                countScript += 1;
                scriptValueList[talentName] = [];
            };
            scriptValueName = scriptValueList[talentName];
            scriptValueName.push(talentValue);
        };
    };  
    
    
    //Output 
    ////Layout
    shortWidth = "width='60' style='text-align: center'";
    longWidth = "width='180'";
    
    textDetailStart = "<details><summary>";
    textDetailMid = "</summary><table>";
    textDetailEnd = "</table></details>";
    tr = "<tr>";
    etr = "</tr>";
    td = "<td " + shortWidth + " >";
    th = "<th " + shortWidth + " >";
    tdl = "<td " + longWidth + " >";
    thl = "<th " + longWidth + " >";
    etd = "</td>";
    eth = "</th>";
    
    
    //Detail-Boxen einfügen für alle Kategorien
    
    fightOutput = textDetailStart + "Nahkampf" + textDetailMid; 
    longrangeOutput = textDetailStart + "Fernkampf" + textDetailMid; 
    physicalOutput = textDetailStart + "Körper" + textDetailMid; 
    socialOutput = textDetailStart + "Gesellschaft" + textDetailMid; 
    natureOutput = textDetailStart + "Natur" + textDetailMid; 
    knownOutput = textDetailStart + "Wissen" + textDetailMid; 
    labourOutput = textDetailStart + "Handwerk" + textDetailMid; 
    langueOutput = textDetailStart + "Sprache" + textDetailMid; 
    scriptOutput = textDetailStart + "Schrift" + textDetailMid;   
    spellOutput = textDetailStart + "Zauber" + textDetailMid; 
    ritualknownOutput = textDetailStart + "RkW/LkW" + textDetailMid; 
    giftOutput = textDetailStart + "Gaben" + textDetailMid; 
    advantageOutput = textDetailStart + "Vorteile" + textDetailMid; 
    disadvantageOutput = textDetailStart + "Nachteile" + textDetailMid; 
    
    
    //Namen einfügen in Tabelle
    nameAdd = tr + thl + "Name" + eth; 
    
    tokenList.forEach(addName)
    function addName(tokenShortName){
        nameAdd += th + tokenShortName + eth;
    };
        fightOutput += nameAdd + etr; 
        longrangeOutput += nameAdd + etr;  
        physicalOutput += nameAdd + etr;  
        socialOutput += nameAdd + etr;  
        natureOutput += nameAdd + etr; 
        knownOutput += nameAdd + etr; 
        labourOutput += nameAdd + etr; 
        langueOutput += nameAdd + etr; 
        scriptOutput += nameAdd + etr;   
        spellOutput += nameAdd + etr;  
        ritualknownOutput += nameAdd + etr;  
        giftOutput += nameAdd + etr; 
        advantageOutput += nameAdd + etr;
        disadvantageOutput += nameAdd + etr;
    

    //Sortierfunktion
    Object.keys(talentValueList).forEach(outputTalentFunction);
    function outputTalentFunction(talentName){
        //Säubern von unnötigen Talenten
        talentValueOutput = "";
        countUndefined = 0;
        for (let i = 0; i < tokenLength; i++){
            talentValueSingle = talentValueList[talentName][i];
            if(talentValueSingle == undefined){
                talentValueSingle = "&nbsp;"
                countUndefined += 1;
            };
            talentValueOutput += td + talentValueSingle + etd;
        };
        
        
        if(countUndefined < tokenLength){

            //Sortieren in Kategorie
            talentAdd = tr + tdl + talentName + etd + talentValueOutput + etr;
            
            fightTalent = fight.includes(talentName);
            if(fightTalent){
                fightOutput += talentAdd;
            };            
            longrangeTalent = longrange.includes(talentName);
            if(longrangeTalent){
                longrangeOutput += talentAdd;
            };            
            physicalTalent = physical.includes(talentName);
            if(physicalTalent){
                physicalOutput += talentAdd;
            };            
            socialTalent = social.includes(talentName);
            if(socialTalent){
                socialOutput += talentAdd;
            };            
            natureTalent = nature.includes(talentName);
            if(natureTalent){
                natureOutput += talentAdd;
            };            
            knownTalent = known.includes(talentName);
            if(knownTalent){
                knownOutput += talentAdd;
            };            
            labourTalent = labour.includes(talentName);
            if(labourTalent){
                labourOutput += talentAdd;
            };            
            spellTalent = spell.includes(talentName);
            if(spellTalent){
                spellOutput += talentAdd;
            };            
            ritualknownTalent = ritualknown.includes(talentName);
            if(ritualknownTalent){
                ritualknownOutput += talentAdd;
            };            
            giftTalent = gift.includes(talentName);
            if(giftTalent){
                giftOutput += talentAdd;
            };            
            advantageTalent = advantage.includes(talentName);
            if(advantageTalent){
                advantageOutput += talentAdd;
            };  
            disadvantageTalent = disadvantage.includes(talentName);
            if(disadvantageTalent){
                disadvantageOutput += talentAdd;
            };
        };
    };
    Object.keys(langueValueList).forEach(outputLangueFunction);
    function outputLangueFunction(talentName){
        //Säubern von unnötigen Talenten
        talentValueOutput = "";
        countUndefined = 0;
        for (let i = 0; i < tokenLength; i++){
            talentValueSingle = langueValueList[talentName][i];
            if(talentValueSingle == undefined){
                talentValueSingle = "&nbsp;"
                countUndefined += 1;
            };
            talentValueOutput += td + talentValueSingle + etd;
        };
        if(countUndefined < tokenLength){
            talentAdd = tr + tdl + talentName + etd + talentValueOutput + etr;
            langueOutput += talentAdd;
        };
    };
    Object.keys(scriptValueList).forEach(outputScriptFunction);
    function outputScriptFunction(talentName){
        //Säubern von unnötigen Talenten
        talentValueOutput = "";
        countUndefined = 0;
        for (let i = 0; i < tokenLength; i++){
            talentValueSingle = scriptValueList[talentName][i];
            if(talentValueSingle == undefined){
                talentValueSingle = "&nbsp;"
                countUndefined += 1;
            };
            talentValueOutput += td + talentValueSingle + etd;
        };
        if(countUndefined < tokenLength){
            talentAdd = tr + tdl + talentName + etd + talentValueOutput + etr;
            scriptOutput += talentAdd;
        };
    };
    //Schließen der Detailbox
    fightOutput += textDetailEnd; 
    longrangeOutput += textDetailEnd; 
    physicalOutput += textDetailEnd; 
    socialOutput += textDetailEnd; 
    natureOutput += textDetailEnd; 
    knownOutput += textDetailEnd; 
    labourOutput += textDetailEnd; 
    langueOutput += textDetailEnd; 
    scriptOutput += textDetailEnd;   
    spellOutput += textDetailEnd; 
    ritualknownOutput += textDetailEnd;   
    giftOutput += textDetailEnd; 
    advantageOutput += textDetailEnd;
    disadvantageOutput += textDetailEnd;


    //Dialog
    dialogButton =  `<style>
        .dialog-buttons {
        max-height: 27px;
    }
    </style>`

    dialogInput = fightOutput + longrangeOutput + physicalOutput + socialOutput + natureOutput + knownOutput + labourOutput + langueOutput + scriptOutput + spellOutput + ritualknownOutput + giftOutput + advantageOutput + disadvantageOutput + dialogButton;
    
    
    windowWidth = tokenLength * 60 + 180
    const myDialogOptions = {
        height: 600,
        width: windowWidth
    };
    
    new Dialog({
        title: "Gruppenübersicht",
        content: dialogInput,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }
        }
    }, myDialogOptions).render(true);
}
