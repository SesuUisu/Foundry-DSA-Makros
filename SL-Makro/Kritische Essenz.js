main();

//Kritische Essenz v0.0.3

async function main() {
    const currentRollMode = game.settings.get("core","rollMode");
    numRoll = [];
    
    //Dialog-input
    ////general use
    const hr = "<hr>";
    const divFlexStart = "<div style='display:flex'><span style='flex:1'>";
    const divFlexEnd = "</span></div>";
    const divInputNumber = "type='number' style='width:50px;float:right' value='";
    const divInputBox = "type='checkbox' style='width:70px;float:right' ";
    const divInputUnchecked = "/>";
    const divInputChecked = "checked />";
    
    
    const headerDialog = "<h3>Kritische Essenz</h3>";
    inputDialog = headerDialog;
    inputDialog += divFlexStart + "Kraftlinienstärke: <input id='modValue'" + divInputNumber  + "1'/>" + divFlexEnd;
    inputDialog += divFlexStart + "verwendete AsP: <input id='aspValue'" + divInputNumber  + "1'/>" + divFlexEnd + hr;
    inputDialog += divFlexStart + `
            <form action"#">
                 <label for="sfAd">Kraftlinienmagie:</label>
                 <select name="sfAd" id="sfAd" style="float:right">
                    <option value="0">-</option>
                    <option value="1">I</option>
                    <option value="2">II</option>
                 </select>
            </form>
        `+ divFlexEnd
    inputDialog += divFlexStart + `
            <form action"#">
                 <label for="ritAd">Großritual:</label>
                 <select name="ritAd" id="ritAd" style="float:right">
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                 </select>
            </form>
        `+ divFlexEnd

    
    new Dialog({
        title: "Kritische Essenz",
        content: inputDialog + hr,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }, 
            accept: {
                icon: '<i class="fas fa-check"></i>', label: "Würfeln", callback: htmlCallback
            }  
        },
        default: "accept",
        render: () => console.log(),
        close: () => console.log()
    }).render(true);
    
    async function rolling(sfInput,critValue,numRoll){
        const typRoll = new Roll("1d20");
        typRoll.roll({async: true});
        const typResult = Number(typRoll.result);
        numRoll.push(typResult)
        
        if((typResult >= 19 && sfInput === 0) || typResult === 20){
            rolling(sfInput,critValue,numRoll)
        }
    }
    
    async function htmlCallback(html){
        const sfInput = Number(html.find("#sfAd")[0]?.value || 0);
        const ritInput = Number(html.find("#ritAd")[0]?.value || 0);
        const modInput = Number(html.find("#modValue")[0]?.value || 0);
        const aspInput = Number(html.find("#aspValue")[0]?.value || 0);
        critValue = 0;
        
        critValueF = await rolling(sfInput,critValue,numRoll);
        
        
        critValue = numRoll.reduce(function(a,b){
            return a + b;
        });
        
        critValue += modInput + Math.round(aspInput/10) + ritInput;
        critValue += (sfInput === 1) ? -5 : 0; 
        critValue += (sfInput === 2) ? -10 : 0; 
        critValue = (critValue <= 0) ? 1 : critValue;
        
        const tables = game.tables;
        const typ = game.tables.getName("Kritische Essenz");
        
        const critResult = await typ.getResultsForRoll(critValue);
        const critResultDat = critResult[0].text;
        
        const detailsOut = "Wert <i>(Würfel)</i>: " + critValue + " <i>(" + numRoll + ")</i><br>LS/KS: " + modInput + "<br>AsP: " + aspInput + "<br>Kraftlinienmagie: " + sfInput + "<br>Ritual: " + ritInput;
        
        const message = "<b>Nebenwirkung der kritischen Essenz:</b><br><details><summary>" + critResultDat + "</summary>" + detailsOut + "</details>";
       
          
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: message,
            rollMode: currentRollMode,
            whisper: game.users.filter(u => u.isGM).map(u => u._id)
        },{});
    }
}