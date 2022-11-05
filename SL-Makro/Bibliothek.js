main();

async function main() {
    const currentRollMode = game.settings.get("core","rollMode");

    const tables = game.tables;
    const typ = game.tables.getName("Buchtyp");
    const thema = game.tables.getName("Buchthema");
    const besonderheit = game.tables.getName("Buchbesonderheit")
    
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
    
    const auflageRoll = new Roll("1d20");
    auflageRoll.roll({async: true});
    const auflageResult = auflageRoll.result
    
    const werteRoll = new Roll("3d20");
    werteRoll.roll({async: true});
    const wertResult = werteRoll.result
    
    const spellRoll = new Roll("1d6");
    spellRoll.roll({async: true});
    spellResult = spellRoll.result-4
    spellResult = (spellResult < 0)? 0: spellResult;
    
    zfwResult =(spellResult > 0)? " (ZfW: ": "";
    for (let i = 0; i < spellResult; i++){
        zfw = new Roll("2d6");
        zfw.roll({async: true})
        zfwTotal = Number(zfw.result)+4
        zfwResult += zfwTotal
        zfwResult += (i < spellResult-1)? ",":")";
    }
    
    const talentRoll = new Roll("1d6");
    talentRoll.roll({async: true});
    const talentResult = talentRoll.result
    
    const message = "<b>Buch:</b> " + typResultData + " " + themaResultData + "<br><b>Komplexität:</b> " + compResult + " (KL/Talent/Zauber)<br><b>Auflage:</b> " + auflageResult + "<br><b>Wert:</b> " + wertResult + " Dukaten<br><b>Zauber-Anzahl:</b> " + spellResult + zfwResult + "<br><b>Talent/Zauber-SE-Anzahl:</b> " + talentResult + "<br><b>Besonderheit:</b> " + besonderheitResultData;
   
      
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: message,
        rollMode: currentRollMode,
        whisper: game.users.filter(u => u.isGM).map(u => u._id)
    },{});
};
