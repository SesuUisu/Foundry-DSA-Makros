//Würfelt für ausgewählte Token als Gruppe v0.2.2



main();

async function main() {
       
    //Tokenauswahl
    if(canvas.tokens.controlled.length == 0){
        ui.notifications.error("Bitte einen Token auswählen.");
        return;
    };
    
    const tokens = canvas.tokens.controlled;
    const tokenLength = tokens.length;
    
    //Talent/Eigenschaftsauswahl
    const wurftyp = `
        <div style='display:flex'><span style='flex:1'>
            <form action#>
                <div style='margin-top:5px';><input type="radio" id="typauswahl1" name="typauswahl" value="0" checked></div>
                <div style='margin-top:15px';><input type="radio" id="typauswahl2" name="typauswahl" value="1"></div>
            </form>
        </div>
    `
    
    const talentwahl = `
        <div style='display:flex;margin-left:5px'><span style='flex:1'>
            <form action#>
                <label style='display:inline-block; margin-top:5px'  for="talentSelect">Talent: </label>
                <select name="talentOption" id="talentSelect" style="float:right">
                    <option value="Menschenkenntnis">Menschenkenntnis</option>
                    <option value="Selbstbeherrschung">Selbstbeherrschung</option>
                    <option value="Sinnenschärfe">Sinnenschärfe</option>
                </select>
            </form>
        </span></div>
    `
    
    const eigenschaftswahl = `
        <div style='display:flex;margin-top:5px;margin-left:5px'><span style='flex:1'>
            <form action#>
                <label style='display:inline-block; margin-top:5px' for="attSelect">Eigenschaft: </label>
                <select name="attOption" id="attSelect" style="float:right">
                    <option value="MU">Mut</option>
                    <option value="KL">Klugheit</option>
                    <option value="IN">Intuition</option>
                    <option value="CH">Charisma</option>
                    <option value="FF">Fingerfertigkeit</option>
                    <option value="GE">Gewandheit</option>
                    <option value="KO">Konstitution</option>
                    <option value="KK">Körperkraft</option>
                    <option value="MR">Magieresistenz</option>
                </select>
            </form>
        </span></div>
    `
    
    const dialogInput = "<div style='display:flex'; float:left;>" + wurftyp + "<div>" + talentwahl + eigenschaftswahl + "</div></div>"

    new Dialog({
        title: "Gruppenwurf",
        content: dialogInput,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }, accept: {
                icon: '<i class="fas fa-check"></i>', label: "Würfeln", callback: () => {tokens.forEach(groupRoll)
            }
            }
        }
    }).render(true);
    


    //Gruppenwurf
    async function groupRoll(token, index){
        output = "";
        logger = 0;
    
        typauswahl = document.querySelector('input[name="typauswahl"]:checked').value;
        let roll = new Roll('3d20').roll({async:true});
        roll.then(roll =>{

            
            const tokenName = token.actor.name; 
            const courage = token.actor.system.base.basicAttributes.courage.value;
            const cleverness = token.actor.system.base.basicAttributes.cleverness.value;
            const intuition = token.actor.system.base.basicAttributes.intuition.value;
            const charisma = token.actor.system.base.basicAttributes.charisma.value;
            const dexterity = token.actor.system.base.basicAttributes.dexterity.value;
            const agility = token.actor.system.base.basicAttributes.agility.value;
            const constitution = token.actor.system.base.basicAttributes.constitution.value;
            const strength = token.actor.system.base.basicAttributes.strength.value;
            const magicResistance = token.actor.system.base.combatAttributes.passive.magicResistance.value; 
            
            let w1 = roll.terms[0].results[0].result;
            let w2 = roll.terms[0].results[1].result;
            let w3 = roll.terms[0].results[2].result;
            if(typauswahl == 0){
                talentName = talentSelect.value
                talent = token.actor.items.find(item => item.name == talentName);
                talentUnd = (talent === undefined)? 1: 0;
                if(talentUnd == 1){talentValue = 0}else{talentValue = talent.system.value};
                if (isNaN(talentValue) || talentValue === "" || talentValue == null){
                    talentValue = 0
                }

                
                wSum1 = w1 + w2
                wSum2 = w1 + w3
                wSum3 = w2 + w3
                wSum4 = w1 + w2 + w3
                luck = " ";
                if(wSum1 == 2 || wSum2 == 2 || wSum3 == 2){
                    if(wSum4 == 3){
                        luck = "++";
                    }else{
                        luck = "+";
                    };
                };
                if(wSum1 == 40 || wSum2 == 40 || wSum3 == 40){
                    if(wSum4 == 60){
                        luck = "--";
                    }else{
                        luck = "-";
                    };
                };
                
                switch(talentName){
                    case "Menschenkenntnis":
                        att1 = cleverness;
                        att2 = intuition;
                        att3 = charisma;
                        att1Name = "KL";
                        att2Name = "IN";
                        att3Name = "CH";
                        break;
                    case "Selbstbeherrschung": 
                        att1 = courage;
                        att2 = constitution;
                        att3 = strength;
                        att1Name = "MU";
                        att2Name = "KO";
                        att3Name = "KK";
                        break;
                    case "Sinnenschärfe": 
                        att1 = cleverness;
                        att2 = intuition;
                        att3 = intuition;
                        att1Name = "KL";
                        att2Name = "IN";
                        att3Name = "IN";
                        break;
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
                
                talentResult = talentValue - w1pen - w2pen - w3pen;
                maxDifficulty = Math.min(w1max, w2max, w3max) + talentResult
                
                header = "<tr style='font-size:80%'><th style='text-align:left'>" + talentName + "</th><th style='border-left:1px solid black'>" + att1Name + "</th><th style='border-left:1px solid black'>" + att2Name + "</th><th style='border-left:1px solid black'>" + att3Name + "</th><th style='border-left:1px solid black'>W/P*</th><th style='border-left:1px solid black'>B/M</th><th style='border-left:1px solid black'>G</th></tr>" 
                
                output += "<tr><td style='text-align:left; width:40%' rowspan=2>" + tokenName + "</td><td style='border-left:1px solid black'><i>" + att1 + "</td><td style='border-left:1px solid black'><i>" + att2 + "</td><td style='border-left:1px solid black'><i>" + att3 + "</td><td style='border-left:1px solid black'><i>" + talentValue + "</td><td style='border-left:1px solid black' rowspan=2>" + maxDifficulty  + "</td><td style='border-left:1px solid black' rowspan=2>" + luck + "</td></tr>" + "<tr><td style='border-left:1px solid black'>" + w1 + "</td><td style='border-left:1px solid black'>" + w2 + "</td><td style='border-left:1px solid black'>" + w3 + "</td><td style='border-left:1px solid black'>" + talentResult  + "</td></tr>"
                
                
            }else{
                attName = attSelect.value
                
                switch(attName){
                    case "MU": 
                        att1 = courage;
                        break;
                    case "KL": 
                        att1 = cleverness;
                        break;
                    case "IN": 
                        att1 = intuition;
                        break;
                    case "CH": 
                        att1 = charisma;
                        break;
                    case "FF": 
                        att1 = dexterity;
                        break;
                    case "GE": 
                        att1 = agility;
                        break;
                    case "KO": 
                        att1 = constitution;
                        break;
                    case "KK": 
                        att1 = strength;
                        break;
                    case "MR": 
                        att1 = magicResistance;
                        break;
                };
                
                maxDifficulty = att1 - w1
                luck = "";                
                
                if(w1 == 1){
                    luck = "+";
                };
                if(w1 == 20){
                    luck = "-";
                };
                header = "<tr style='font-size:80%'><th style='text-align:left'>" + "</th><th style='border-left:1px solid black'>" + attName + "</th><th style='border-left:1px solid black'>Wurf</th><th style='border-left:1px solid black'>B/M</th><th style='border-left:1px solid black'>G</th></tr>" 
                output += "<tr><td style='text-align:left'>" + tokenName + "</td><td style='border-left:1px solid black'><i>" + att1 + "</td><td style='border-left:1px solid black'>" + w1 + "</td><td style='border-left:1px solid black'>" + maxDifficulty + "</td><td style='border-left:1px solid black'>" + luck + "</td></tr>"
                
            };
            logger += 1;
            outputMessage(header + output)
        });
    };
    
    
    function outputMessage(message){
        if(logger == tokenLength){
             ChatMessage.create({
                content: "<table style='text-align:center'>" + message + "</table>", 
                user: game.user._id,
                blind: true,
                whisper: game.users.filter(u => u.isGM).map(u => u.id)
            });
        }
    }
}
