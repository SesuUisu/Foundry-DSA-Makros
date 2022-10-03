//Schaden eingeben v0.0.1

main();

async function main (){

    //Überprüfe, ob ein Token ausgewählt wurde
    if (canvas.tokens.controlled.length === 0 || canvas.tokens.controlled.length > 1) {
        ui.notifications.error("Bitte einen Token auswählen.");
        return;
    };
     
     //Charakter Werte
    let tokenName = token.actor.name;

    const lepValue = token.actor.system.base.resources.vitality.value;
    const lepMax = token.actor.system.base.resources.vitality.max;
    const aupValue = token.actor.system.base.resources.endurance.value;
    const aupMax = token.actor.system.base.resources.endurance.max;
     
    const constValue = token.actor.system.base.basicAttributes.constitution.value;
    const eisern = (token.actor.items.find(item => item.name === "Eisern") === undefined)? 0: 2;
    const zah = (token.actor.items.find(item => item.name === "Zäher Hund") === undefined)? 0: 1;
    const glasknochen = (token.actor.items.find(item => item.name === "Glasknochen")=== undefined)? 0: -2;
     
    const ws1 = Math.ceil(constValue / 2) + eisern + glasknochen;
    const ws2 = Math.ceil(constValue) + eisern + glasknochen;
    const ws3 = Math.ceil(constValue * 1.5) + eisern + glasknochen;

    const physicalResistance = token.actor.system.base.combatAttributes.passive.physicalResistance.value;
     
     
    //Dialog-input
    ////general use
    const hr = "<hr>";
    const divFlexStart = "<div style='display:flex'><span style='flex:1'>";
    const divFlexEnd = "</span></div>";
    const divInputNumber = "type='number' style='width:50px;float:right' value=0 />";
    const divInputBox = "type='checkbox' style='width:70px;float:right' ";
    const divInputUnchecked = "/>";
    const divInputChecked = "checked />";
     
     
    ////Number inputs
    const headerDialog = "<h2><i>" + tokenName + "</i><br>erhält Schaden</h2>";
    let modDialog = "";
    modDialog += divFlexStart + "Schaden: <input id='hitValue'" + divInputNumber + divFlexEnd;
     
    let typeDialog = "";
    typeDialog += divFlexStart + `
            <form action"#">
                 <label for="type">Schadensart</label>
                 <select name="type" id="type" style="float:right">
                    <option value="0">TP</option>
                    <option value="1">SP</option>
                 </select>
            </form>
        `+ divFlexEnd;
    typeDialog += divFlexStart + `
            <form action"#">
                 <label for="typeAd">LeP/AuP-Schaden</label>
                 <select name="typeAd" id="typeAd" style="float:right">
                    <option value="0">LeP</option>
                    <option value="1">AuP+LeP/2</option>
                    <option value="2">AuP</option>
                 </select>
            </form>
        `+ divFlexEnd;
    woundDialog = divFlexStart + `
            <form action"#">
                 <label for="wound">Wundschwelle</label>
                 <select name="wound" id="wound" style="float:right">
                    <option value="-4">-4</option>
                    <option value="-3">-3</option>
                    <option value="-2">-2</option>
                    <option value="-1">-1</option>
                    <option value="0" selected>±0</option>
                    <option value="1">+1</option>
                    <option value="2">+2</option>
                    <option value="3">+3</option>
                    <option value="4">+4</option>
                 </select>
            </form>
        `+ divFlexEnd;
   armourDialog = divFlexStart + `
            <form action"#">
                 <label for="armor">Rüstungsschutz</label>
                 <select name="armor" id="armor" style="float:right">
                    <option value="-4">-4</option>
                    <option value="-3">-3</option>
                    <option value="-2">-2</option>
                    <option value="-1">-1</option>
                    <option value="0" selected>±0</option>
                    <option value="1">+1</option>
                    <option value="2">+2</option>
                    <option value="3">+3</option>
                    <option value="4">+4</option>
                 </select>
            </form>
        `+ divFlexEnd;
        
   addWoundDialog = divFlexStart + `
            <form action"#">
                 <label for="woundAdd">Zusatzwunde durch Manöver</label>
                 <select name="woundAdd" id="woundAdd" style="float:right">
                    <option value="0" selected>±0</option>
                    <option value="1">+1</option>
                    <option value="2">+2</option>
                 </select>
            </form>
        `+ divFlexEnd;
   critDialog = divFlexStart + `
            <label for="crit">Kritischer Treffer</label><input type="checkbox" id="crit" name="crit" style="float:right">
        `+ divFlexEnd;
    
    schadenDialog = headerDialog + modDialog + typeDialog + "<hr>" + woundDialog + armourDialog + "<hr>" + addWoundDialog + critDialog;
    
    new Dialog({
        title: "Schaden erhalten",
        content: schadenDialog,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }, 
            accept: {
                icon: '<i class="fas fa-check"></i>', label: "Eintragen", callback: htmlCallback
            }  
        },
        default: "accept",
        render: () => console.log("Schaden erhalten wurde geöffnet"),
        close: () => console.log("Schaden erhalten wurde geschlossen")
    }).render(true);
    
    async function htmlCallback(html){
        const hitInput = Number(html.find("#hitValue")[0]?.value || 0);
        const typInput = Number(html.find("#type")[0]?.value || 0);
        const typAdInput = Number(html.find("#typeAd")[0]?.value || 0);
        const woundInput = Number(html.find("#wound")[0]?.value || 0);
        const woundAddInput = Number(html.find("#woundAdd")[0]?.value || 0);
        const armorInput = Number(html.find("#armor")[0]?.value || 0);
        const critInput = html.find("#crit")[0].checked;
        
        //crit
        critDMG = (critInput === true)? hitInput * 2 : hitInput;

        //RS
        tempRes = (armorInput < (0 - physicalResistance))? 0 : physicalResistance + armorInput;
        
        //TP o SP     
        dmg = (typInput === 0)? critDMG - tempRes : critDMG;     
        dmg = (dmg < 0)? 0 : dmg;
        
        //LeP o AuP
        hitInputAu = 0;
        hitInputLe = 0;
        switch(typAdInput){
          case 0: 
            hitInputLe = dmg;
            break;
          case 1:
            hitInputLe = Math.ceil(dmg / 2);
            hitInputAu = dmg;
            break;
          case 2:
            hitInputAu = dmg;
            break;
        };
        
        //WS
        woundCount = 0;
        if(hitInputLe > ws1 + woundInput){
            woundCount += 1;
        };
        if(hitInputLe > ws2 + woundInput){
            woundCount += 1;
        };
        if(hitInputLe > ws3 + woundInput){
            woundCount += 1;
        };
        if(woundCount > 0){
            woundCount += woundAddInput;
            game.macros.getName("Wunden").execute()
        };
        if(woundCount > 0 && critInput === true){
            woundCount += 1;  
        };
        
        aupRoll(aupValue,hitInputLe,hitInputAu,woundCount) 
    }
        

    function aupRoll(aupValue,hitInputLe,hitInputAu,woundCount){
        aupDice = woundCount + "d6";
        aupRoll = new Roll(aupDice).roll({async:true})
        aupRoll.then(roll =>{
            aupCheck = aupValue - hitInputAu + roll.total;
            hitInputAuCheck = (aupCheck < 0)? aupValue: aupCheck;

            lepCheck = lepValue - hitInputLe;
            down = "";
            downText = "Held ist kampfunfähig.<br><br>";
            if(lepCheck < 2){
                down = downText;
                
            }else if(lepCheck < 6){
                if(!(eisern > 0 || zah > 0) ){
                    down = downText;
                };
            };
            if(aupCheck < 1){
                down = downText;
                
            };
            aupOutput = aupValue - hitInputAuCheck
            message = down + "Schaden erhalten:<br>LeP: " + hitInputLe + "<br>AuP: " +  aupOutput + "<br>Davon AuP-Verlust durch " + woundCount + " Wunde(n):";
            roll.toMessage({
                flavor: message, speaker: ChatMessage.getSpeaker({token: token.document})
            });
            
            updating(hitInputLe, hitInputAuCheck)
        });
    }

    function updating(hitInputLe, hitInputAuCheck){
       
        lepUpdate = lepValue - hitInputLe;
        aupUpdate = hitInputAuCheck;
        
        token.actor.update({
            'system.base.resources.vitality.value': lepUpdate,
            'system.base.resources.endurance.value': aupUpdate
        });
    }
}