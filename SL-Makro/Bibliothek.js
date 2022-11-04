main();

async function main() {
    const tables = game.tables;
    const typ = game.tables.getName("Buchtyp");
    const thema = game.tables.getName("Buchthema");
    
    const typRoll = new Roll(typ.formula);
    typRoll.roll();
    const typResult = await
    tables.getName("Buchtyp").getResultsForRoll(typRoll.result);
    const typResultData = typResult[0].data.text;
    const compResult = typRoll.result

    const themaRoll = new Roll(thema.formula);
    themaRoll.roll();
    const themaResult = await
    tables.getName("Buchthema").getResultsForRoll(themaRoll.result);
    const themaResultData = themaResult[0].data.text;   
    
    const auflageRoll = new Roll("1d20");
    auflageRoll.roll();
    const auflageResult = auflageRoll.result
    
    const werteRoll = new Roll("3d20");
    werteRoll.roll();
    const wertResult = werteRoll.result
    
    const spellRoll = new Roll("1d6");
    spellRoll.roll();
    spellResult = spellRoll.result-4
    spellResult = (spellResult < 0)? 0: spellResult;
    
    const talentRoll = new Roll("1d6");
    talentRoll.roll();
    const talentResult = talentRoll.result
    
    const message = "<b>Buch:</b> " + typResultData + " " + themaResultData + "<br><b>Komplexität:</b> " + compResult + " (KL/Talent/Zauber)<br><b>Auflage:</b> " + auflageResult + "<br><b>Wert:</b> " + wertResult + "<br><b>Zauber-Anzahl:</b> " + spellResult + "<br><b>Talent/Zauber-SE-Anzahl:</b> " + talentResult
       
    ChatMessage.create({
        speaker,content: message
    });
};
