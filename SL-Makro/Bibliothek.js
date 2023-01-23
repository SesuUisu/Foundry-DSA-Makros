main();

//Bibliotheksfunde v0.0.6

async function main() {
    const currentRollMode = game.settings.get("core","rollMode");

    //Tabellen
    const tables = game.tables;
    const typ = game.tables.getName("Buchtyp");
    const thema = game.tables.getName("Buchthema");
    const besonderheit = game.tables.getName("Buchbesonderheit")
    
    //Buchname
    const typRoll = new Roll(typ.formula);
    typRoll.roll({async: true});
    const typResult = await
    tables.getName("Buchtyp").getResultsForRoll(typRoll.result);
    const typResultDat = typResult[0].text;
    const oneOrZero = Math.round(Math.random())
    const typResultData = (typResultDat.split(" / ")[1] === undefined)? typResultDat : typResultDat.split(" / ")[oneOrZero];
    
    const compResult = typRoll.result

    const themaRoll = new Roll(thema.formula);
    themaRoll.roll({async: true});
    const themaResult = await
    tables.getName("Buchthema").getResultsForRoll(themaRoll.result);
    const themaResultData = themaResult[0].text;   
    
    //Buchformat und Seitenanzahl
    const formatRoll = new Roll("2d6");
    formatRoll.roll({async: true});
    if(formatRoll.result <= 4){
        formatResult = "Octavo";
    } else if (formatRoll.result >= 9){
        formatResult = "Folio";
    } else {
        formatResult = "Quart"; 
    }
    
    const erscheinungResult = 100 + Math.round((typRoll.result * 10) + (themaRoll.result * 5)/2) + " Seiten im " + formatResult + "-Format";
    
    //Besonderheit
    const besonderheitRoll = new Roll(besonderheit.formula);
    besonderheitRoll.roll({async: true});
    const besonderheitResult = await
    tables.getName("Buchbesonderheit").getResultsForRoll(besonderheitRoll.result);
    besonderheitResultData = besonderheitResult[0].text;
    if(besonderheitResultData.split(" ")[0] === "Besonderheit:" ){
        const subTyp = besonderheitResultData.split(" ")[1]
        const subRoll = new Roll("1d6");
        subRoll.roll({async: true});
        const subResult = await
        tables.getName("Besonderheit: " + subTyp).getResultsForRoll(subRoll.result);
        besonderheitResultData = subResult[0].text;
    }
   
    
    //Talent/Zauber/SE-Anzahl mit TaW/ZfW
    const spellRoll = new Roll("1d6");
    spellRoll.roll({async: true});
    spellResult = spellRoll.result-4
    spellResult = (spellResult < 0) ? 0 : spellResult;
    
    const talentRoll = new Roll("1d6");
    talentRoll.roll({async: true});
    talentResult = talentRoll.result-2
    talentResult = (talentResult < 0) ? 0 : talentResult;
    
    zfwResult =(spellResult > 0)? " (ZfW: ": "";
    for (let i = 0; i < spellResult; i++){
        zfw = new Roll("2d6");
        zfw.roll({async: true})
        zfwTotal = Number(zfw.result)+4
        zfwResult += zfwTotal
        zfwResult += (i < spellResult-1) ? "," : ")";
    }
    
    tawResult =(talentResult > 0)? " (TaW: ": "";
    for (let i = 0; i < talentResult; i++){
        taw = new Roll("2d6");
        taw.roll({async: true})
        tawTotal = Number(taw.result)+4
        tawResult += tawTotal
        tawResult += (i < talentResult-1) ? "," : ")";
    }
    
    const seRoll = new Roll("1d6");
    seRoll.roll({async: true});
    const seResult = seRoll.result
    
    //Auflage und Wert
    const auflageRoll = new Roll("1d20");
    auflageRoll.roll({async: true});
    auflageResult = auflageRoll.result - 10;
    auflageResult = (auflageResult < 0) ? 0 : auflageResult;
    
    const werteRoll = new Roll("3d20");
    werteRoll.roll({async: true});
    const wertResult = Number(werteRoll.result) + spellResult * 20 + talentResult * 10 + seResult * 2;
    
    const message = "<b>Buch:</b> " + typResultData + " " + themaResultData + "<br><b>Voraussetzung:</b> K" + compResult + " (KL, Talent o. Zauber)<br><b>Erscheinungsweise:</b> "+ erscheinungResult + "<br><b>Sprache:</b> (Garethi, Bosparano, Tulamidya, Thorwalsch, Zyklopäisch, Zhayad) <br><b>Schrift:</b> (Kusliker Zeichen, Tulamidya, Zhayad)" + "<br><b>Auflage:</b> " + auflageResult + "<br><b>Wert:</b> " + wertResult + " Dukaten<br><b>Talent/Zauber:</b> " + talentResult + "/" + spellResult + tawResult + zfwResult + "<br><b>Talent/Zauber-SE:</b> " + seResult + "<br><b>Besonderheit:</b> " + besonderheitResultData;
   
      
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: message,
        rollMode: currentRollMode,
        whisper: game.users.filter(u => u.isGM).map(u => u._id)
    },{});
};
