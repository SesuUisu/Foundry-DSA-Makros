//Würfelt für ausgewählte Token als Gruppe v0.1.1


if(canvas.tokens.controlled.length == 0){
    ui.notifications.error("Bitte einen Token auswählen.");
    return;
};


const tokens = canvas.tokens.controlled;

const talentwahl= `
    <div style='display:flex'><span style='flex:1'>
        <form action#>
            <label for="talentSelect">Talent:</label>
            <select name="option" id="talentSelect" style="float:right">
                <option value="Menschenkenntnis">Menschenkenntnis</option>
                <option value="Selbstbeherrschung">Selbstbeherrschung</option>
                <option value="Sinnenschärfe">Sinnenschärfe</option>
            </select>
        </form>
    </span></div>
`

new Dialog({
    title: "Gruppenwurf",
    content: talentwahl,
    buttons: {
        close: {
            icon: '<i class="fas fa-times"></i>', label: "Schließen"
        }, accept: {
            icon: '<i class="fas fa-check"></i>', label: "Würfeln", callback: () => {tokens.forEach(groupRoll)}
        }
    }
}).render(true);
    

async function groupRoll(token, index){
    
    let roll = new Roll('3d20').roll({async:true});
    roll.then(roll =>{
        
        const talentName = talentSelect.value
        const talent = token.actor.items.find(item => item.data.name == talentName);
        const talentValue = talent.data.data.value;

        
        const tokenName = token.actor.data.name; 
        const courage = token.actor.data.data.base.basicAttributes.courage.value;
        const cleverness = token.actor.data.data.base.basicAttributes.cleverness.value;
        const intuition = token.actor.data.data.base.basicAttributes.intuition.value;
        const charisma = token.actor.data.data.base.basicAttributes.charisma.value;
        const dexterity = token.actor.data.data.base.basicAttributes.dexterity.value;
        const agility = token.actor.data.data.base.basicAttributes.agility.value;
        const constitution = token.actor.data.data.base.basicAttributes.constitution.value;
        const strength = token.actor.data.data.base.basicAttributes.strength.value;
        
        let w1 = roll.terms[0].results[0].result;
        let w2 = roll.terms[0].results[1].result;
        let w3 = roll.terms[0].results[2].result;
        
        let wSum1 = w1 + w2
        let wSum2 = w1 + w3
        let wSum3 = w2 + w3
        let wSum4 = w1 + w2 + w3
        luck = "";
        if(wSum1 == 2 || wSum2 == 2 || wSum3 == 2){
            if(wSum4 == 3){
                luck = "spektakulärer Erfolg";
            }else{
                luck = "glücklicher Erfolg";
            };
        };
        if(wSum1 == 40 || wSum2 == 40 || wSum3 == 40){
            if(wSum4 == 60){
                luck = "spektakulärer Patzre";
            }else{
                luck = "Patzer";
            };
        };
        console.log("KL", luck)
        if(talentName == "Menschenkenntnis"){
            att1 = cleverness;
            att2 = intuition;
            att3 = charisma;
            att1Name = "KL";
            att2Name = "IN";
            att3Name = "CH";
            
        };
        if(talentName == "Selbstbeherrschung"){
            att1 = courage;
            att2 = constitution;
            att3 = strength;
            att1Name = "MU";
            att2Name = "KO";
            att3Name = "KK";
        };
        if(talentName == "Sinnenschärfe"){
            att1 = cleverness;
            att2 = intuition;
            att3 = intuition;
            att1Name = "KL";
            att2Name = "IN";
            att3Name = "IN";
        };
        
        
        if(w1 > att1){
            w1pen = w1 - att1;
            w1max = 0;
        }else{
            w1pen = 0;
            w1max = att1 - w1;
        };
        if(w2 > att2){
            w2pen = w2 - att2;
            w2max = 0;
        }else{
            w2pen = 0;
            w2max = att2 - w2;
        };
        if(w3 > att3){
            w3pen = w3 - att3;
            w3max = 0;
        }else{
            w3pen = 0;
            w3max = att3 - w3;
        };
        let talentResult = talentValue - w1pen - w2pen - w3pen;
        let maxDifficulty = Math.min(w1max, w2max, w3max) + talentResult
        
        
        message = talentName + "-TaW: " + talentValue + "<br>" + att1Name + ": " + att1 + " | " + att2Name + ": " + att2 + " | " + att3Name + ": " + att3 + "<br>"  + "TaP*: " + talentResult + " | Max. Erschwernis: " + maxDifficulty + "<br>" +luck;
        roll.toMessage({
            flavor: message, 
            speaker: ChatMessage.getSpeaker({token: token.document})},
            {rollMode: 'blindroll'});
        });
    });
}