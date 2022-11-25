// Beute eines Labors v0.0.1 WdA31
main();

async function main() {
    const currentRollMode = game.settings.get("core","rollMode");
    
    //Tabellen
    const tables = game.tables;
    const beute = tables.getName("1. Beute eines Labors");
    const archLab = tables.getName("2. Archaisches Labor");
    const hexLab = tables.getName("2. Hexenküche");
    const alchLab = tables.getName("2. Alchimistenlabor");
    const beifang = tables.getName("2. Beifang");
    const quality = tables.getName("3. Qualität");
    const groupList = tables.getName("4. Zutat - Gruppe");
    const smell = tables.getName("5. Zufall - Geruch/Geschmack");
    const consistence = tables.getName("5. Zufall - Konsistenz");
    const color = tables.getName("5. Zufall - Farbe");
    const effect = tables.getName("5. Zufall - Wirkung");

    //Bestimmung der Menge
    const beuteRoll = new Roll(beute.formula);
    beuteRoll.roll({async: true});
    const beuteResult = await beute.getResultsForRoll(beuteRoll.result);
    const beuteResultDataText = beuteResult[0].text;
    const beuteResultData = beuteResultDataText.split(/x|,\s/);
    const labCount = Number(beuteResultData[0]);
    const beiCount = Number(beuteResultData[2]);
    const ingridientCount = Number(beuteResultData[4]);
    
    //vorhandene Tränke
    archOutput = "<i>Archaisches Labor:</i><br>";
    hexOutput = "<br><i>Hexenküche:</i><br>";
    alchOutput = "<br><i>Alchimistenlabor</i><br>";
    
    for(i = 0; i < labCount; i++){
        const labRoll = new Roll("3d6");
        labRoll.roll({async: true});
        const archLabResult = await archLab.getResultsForRoll(labRoll.result);
        const archLabText = archLabResult[0].text;
        const hexLabResult = await hexLab.getResultsForRoll(labRoll.result);
        hexLabText = hexLabResult[0].text;
        const alchLabResult = await alchLab.getResultsForRoll(labRoll.result);
        alchLabText = alchLabResult[0].text;
        if(hexLabText === "Zufalls-Elixier"){
            const conRoll = new Roll(consistence.formula);
            conRoll.roll({async: true})
            const conResult = await consistence.getResultsForRoll(conRoll.result);
            const conText = conResult[0].text;
            const smellRoll = new Roll(smell.formula);
            smellRoll.roll({async: true})
            const smellResult = await smell.getResultsForRoll(smellRoll.result);
            const smellText = smellResult[0].text;
            const colorRoll = new Roll(color.formula);
            colorRoll.roll({async: true})
            const colorResult = await color.getResultsForRoll(colorRoll.result);
            const colorText = colorResult[0].text;
            const effectRoll = new Roll(effect.formula);
            effectRoll.roll({async: true})
            const effectResult = await effect.getResultsForRoll(effectRoll.result);
            const effectText = effectResult[0].text;
            
            hexLabText += " (" + conText + ", " + smellText + ", " + colorText + ", " + effectText + ")";
            alchLabText += " (" + conText + ", " + smellText + ", " + colorText + ", " + effectText + ")";
        }
        
        const qualityArchRoll = new Roll(quality.formula);
        qualityArchRoll.roll({async: true});
        const qualityArchResult = await quality.getResultsForRoll(qualityArchRoll.result);   
        const qualityArchText = qualityArchResult[0].text;        
        const qualityHexRoll = new Roll(quality.formula);
        qualityHexRoll.roll({async: true});
        const qualityHexResult = await quality.getResultsForRoll(qualityHexRoll.result);
        const qualityHexText = qualityHexResult[0].text;
        const qualityAlchRoll = new Roll(quality.formula);
        qualityAlchRoll.roll({async: true});
        const qualityAlchResult = await quality.getResultsForRoll(qualityAlchRoll.result);
        const qualityAlchText = qualityAlchResult[0].text;
        
        
        archOutput += archLabText + " (" + qualityArchText + ")<br>";
        hexOutput += hexLabText + " (" + qualityHexText + ")<br>";
        alchOutput += alchLabText + " (" + qualityAlchText + ")<br>";
    }
    
    //vorhandener Beifang
    beifangOutput = "<br><i>Beifang:</i><br>";
    for(i = 0; i < beiCount; i++){
        const beiRoll = new Roll(beifang.formula);
        beiRoll.roll({async: true});
        const beiResult = await beifang.getResultsForRoll(beiRoll.result);
        const beiText = beiResult[0].text;
        beifangOutput += beiText + "<br>";
    }
    //vorhandene Zutaten
    ingridientOutput = "<br><i>Zutaten:</i><br>";  
    for(i = 0; i < ingridientCount; i++){
        const groupRoll = new Roll(groupList.formula);
        groupRoll.roll({async: true});
        const groupResult = await groupList.getResultsForRoll(groupRoll.result);
        const groupText = groupResult[0].text;
        const group = tables.getName(groupText);
        const ingRoll = new Roll(group.formula);
        ingRoll.roll({async: true});
        const ingResult = await group.getResultsForRoll(ingRoll.result);
        const ingText = ingResult[0].text;
        ingridientOutput += ingText + "<br>";
    }
    
    //Output
    const message = "<b>Beute im Labor:</b><br>" + archOutput + hexOutput + alchOutput + beifangOutput + ingridientOutput;
    
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: message,
        rollMode: currentRollMode,
        whisper: game.users.filter(u => u.isGM).map(u => u._id)
    },{});
};
