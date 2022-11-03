//Heilungsmakro v0.0.2

main();
async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
    if (canvas.tokens.controlled.length === 0 || canvas.tokens.controlled.length > 1) {
        ui.notifications.error("Bitte einen Token auswählen.");
        return;
    };
    if (game.user.targets.size > 1) {
        ui.notifications.error("Bitte nur einen Token anvisieren.");
        return;
    };

    const rollMode = game.settings.get('core', 'rollMode');
    // ausführender Token
    const tokenName = token.actor.name;
    const tokenAstra = token.actor.system.base.resources.astralEnergy.value;
    const tokenCle = token.actor.system.base.basicAttributes.cleverness.value;
    const tokenCha = token.actor.system.base.basicAttributes.charisma.value;
    const tokenDex = token.actor.system.base.basicAttributes.dexterity.value;
    const tokenHkw = token.actor.items.find(item => item.name === "Heilkunde Wunden");
    const tokenHkwT = (tokenHkw === undefined)? 0 : (tokenHkw.system.value === null)? 0 : tokenHkw.system.value;
    const mhwMax = (Math.min(tokenHkwT/2, tokenAstra) === tokenHkwT/2)? Math.ceil(tokenHkwT/2) : tokenAstra;

    // anvisierter Token
    if(game.user.targets.size === 1){
        targetActor = game.user.targets.values().next().value.actor;
        targetName = targetActor.name;
        targetOutput = "Auswirkung für " + targetName + ":";
        targetHeader = " von<br><i>" + targetName + "</i>";
        targetWound = targetActor.effects.find(effect => effect.getFlag('core', 'statusId') === "wunde")
        targetWoundCount = (targetWound === undefined)? 0 : Number(targetWound.label.substring(7,targetWound.label.length - 1));
        targetHealth = targetActor.system.base.resources.vitality.value;
        targetHealthMax = targetActor.system.base.resources.vitality.max;
        if(!(targetHealthMax === 0)){
            selectBanFirst = (targetHealth > 0 )? "disabled":"";
            selectBanSecond = (targetHealth < 1)? "disabled":"";
            targetHealthMinus = (targetHealth < 0)? -targetHealth : 0;
        }else{
            selectBanFirst = "";
            selectBanSecond = "";
            targetHealthMinus = 0;  
        };
    }else{
        targetActor = "";
        targetName = "";
        targetHeader = "";
        selectBanFirst = "";
        selectBanSecond = "";
        targetHealth = 0;
        targetHealthMinus = 0;
        targetHealthMax = 0;
        targetWound = "";
        targetWoundCount = 0;
        targetOutput = "Auswirkung für geheilte Person:"
    };
 
    //Dialog-input
    ////general use
    const hr = "<hr>";
    const divFlexStart = "<div style='display:flex'><span style='flex:1'>";
    const divFlexEnd = "</span></div>";
    const divInputNumber = "type='number' style='width:50px;float:right' value='";
    const divInputBox = "type='checkbox' style='width:70px;float:right' ";
    const divInputUnchecked = "/>";
    const divInputChecked = "checked />";
    
    
    headerDialog = "<h2><i>" + tokenName + "</i><br>versorgt Verletzungen" + targetHeader +"</h2>";
    inputDialog = headerDialog;
    inputDialog += divFlexStart + `
            <form action"#">
                 <label for="typeAd">Heilungsvariante:</label>
                 <select name="typeAd" id="typeAd" style="float:right">
                    <option value="0"`+ selectBanFirst +`>Erste Hilfe</option>
                    <option value="1"`+ selectBanSecond +`>Wundreinigung</option>
                    <option value="2"`+ selectBanSecond +`>Heilung fördern</option>
                    <option value="3"`+ selectBanSecond +`>Nachbehandlung</option>
                 </select>
            </form>
        `+ divFlexEnd
    inputDialog += divFlexStart + "Modifikation: <input id='modValue'" + divInputNumber  + "0'/>" + divFlexEnd + hr;
    inputDialog += divFlexStart + "Meisterhandwerk-AsP: <input id='mhwValue' min='0' max='" + mhwMax + "'" + divInputNumber  + "0'/>" + divFlexEnd + hr;
    inputDialog += divFlexStart + "LeP unter 0 <i>(bei Erster Hilfe)</i>: <input id='dmgValue' min='0'" + divInputNumber + targetHealthMinus + "'" + selectBanFirst +"/>" + divFlexEnd;
    inputDialog += divFlexStart + "Wundenanzahl: <input id='woundValue' min='0'" + divInputNumber + targetWoundCount + "'/>" + divFlexEnd;
    
    new Dialog({
        title: "Heilkunde Wunde",
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
    
    async function htmlCallback(html){
        const typeInput = Number(html.find("#typeAd")[0]?.value || 0);
        const modInput = Number(html.find("#modValue")[0]?.value || 0);
        const mhwInput = Number(html.find("#mhwValue")[0]?.value || 0);
        const dmgInput = Number(html.find("#dmgValue")[0]?.value || 0);
        const woundInput = Number(html.find("#woundValue")[0]?.value || 0);
        
        const eTaw = tokenHkwT + Math.min(mhwInput*2,tokenHkwT);
        
        switch(typeInput){
            case 0:
                mod = dmgInput * 2 + woundInput * 2;
                healType = "(Erste Hilfe)";
                timeV = "";
                timeU = " KR";
                fail = "1d6 SP";
                win = "LeP = 1";
                break;
            case 1:
                mod = woundInput * 2;
                healType = "(Wundreinigung)";
                timeV = 4;
                timeU = " SR";
                fail = "KO-Probe (Wundfieber) zusätzlich +3";
                win = "Ausbruch von Wundfieber verhindert";
                break;
            case 2:
                mod = woundInput * 3;             
                healType = "(Heilung fördern)";
                timeV = 6;
                timeU = " SR";
                fail = "KO-Probe (Wundfieber) +2<br>1d6 SP<br>Keine nächtliche Regeneration"
                win = " LeP zusätzlich zur nächtlichen Reg"
                break;
            case 3:
                mod = woundInput * 3;             
                healType = "(Nachbehandlung)";
                timeV = 6;
                timeU = " SR";
                fail = "[[1d6]] SP<br>Keine nächtliche Regeneration" 
                win = " LeP zusätzlich zur nächtlichen Reg"
                break;
        }
        mod += modInput
        modOutput = (mod >=0)? "+" + mod: mod;
        
        let healRoll = new Roll("3d20","1d6").roll({async: true});
        healRoll.then(roll =>{
            let w1 = roll.terms[0].results[0].result;
            let w2 = roll.terms[0].results[1].result;
            let w3 = roll.terms[0].results[2].result;
           
            eTawMod = eTaw - mod;
            resOne = tokenCle - w1;
            resOne += (eTawMod < 0)? eTawMod: 0;
            resTwo = tokenCha - w2;
            resTwo += (eTawMod < 0)? eTawMod: 0;
            resThree = tokenDex - w3;
            resThree += (eTawMod < 0)? eTawMod: 0;
            talentResult = (eTawMod > 0)? eTawMod : 0;
            talentResult += (resOne < 0)? resOne : 0;
            talentResult += (resTwo < 0)? resTwo : 0;
            talentResult += (resThree < 0)? resThree : 0;
            talentResult = (talentResult == 0)? 1 : talentResult;
            talentResult = Math.min(talentResult,eTaw);
            
            luck = (talentResult >= 0)? "Erfolg":"Misserfolg";
            wSum1 = w1 + w2
            wSum2 = w1 + w3
            wSum3 = w2 + w3
            wSum4 = w1 + w2 + w3
            if(wSum1 == 2 || wSum2 == 2 || wSum3 == 2){
                if(wSum4 == 3){
                    luck = "Spektakulärer Erfolg";
                }else{
                    luck = "Glücklicher Erfolg";
                };
            };
            if(wSum1 == 40 || wSum2 == 40 || wSum3 == 40){
                if(wSum4 == 60){
                    luck = "Spektakulärer Patzer";
                }else{
                    luck = "Patzer";
                };
            };
            if(typeInput === 0){timeV = Math.max(2,dmgInput - Math.max(talentResult,0))}
            if(talentResult < 0){
                failOut = fail;
            }else{
                if(typeInput == 2){
                    failOut = Math.ceil(talentResult / 2) + win;
                    woundHeal = Math.floor(talentResult/7);
                    woundKO = talentResult % 7;
                    failOut += (woundHeal >= 1)? "<br>" + woundHeal + " Wunde(n) geheilt<br>" + woundKO + " Punkt(e) Erleichterung auf Wund-KO-Probe":"";
                }else if(typeInput == 3){
                    failOut = Math.floor(talentResult / 3)  + win;
                    woundHeal = Math.floor(talentResult/5)
                    failOut += (woundHeal >= 1)? "<br>" + woundHeal + " Punkt(e) Erleichterung auf Wund-KO-Probe":"";
                }else{
                    failOut = win;
                }
            }
            aspUpdate = tokenAstra - mhwInput;
            token.actor.update({'system.base.resources.astralEnergy.value':aspUpdate});
            
            
            flavor = "Heilkunde: Wunden " + healType;
            flavor += "<br>TaW / Modi: " + eTaw + " / " + modOutput;
            flavor += (mhwInput > 0)? "<br>MhW: -" + mhwInput + " AsP":"";
            flavor += "<br>TaP*: " + talentResult + " (" + luck + ")";
            flavor += "<br>Dauer: " + timeV + timeU;
            flavor += "<br><br>" + targetOutput + "<br>" + failOut;
            
            roll.toMessage ({
                flavor: flavor,
                speaker: ChatMessage.getSpeaker({token: token.document})
            },
            {rollMode}
            );
        });
    }

}