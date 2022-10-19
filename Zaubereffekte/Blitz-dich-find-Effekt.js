//v0.2.1 Tokeneffekt für Zauberopfer

main();

async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
     if (canvas.tokens.controlled.length === 0) {
        //ui.notifications.error("Bitte einen Token auswählen.");
        return;
    };
    
    //Charakter Werte
    const tokens = canvas.tokens.controlled;
    const tokenName = token.actor.name;
    const blindkampf = token.actor.items.find(item => item.name === "Blindkampf");
    
    //Dialog-input
    const divFlexStart = "<div style='display:flex'><span style='flex:1'>";
    const divFlexEnd = "</span></div>";
    const divInputNumber = "type='number' style='width:50px;float:right' value=0 />";


    ////Number inputs
    const headerDialog = "<h2> Blitz dich find auf <br><i>" + tokenName + "</i></h2>";

    const valueWDialog = divFlexStart + "ZfW<input id='nmbr_zfw'" + divInputNumber + divFlexEnd;
    const valuePDialog = divFlexStart + "ZfP*<input id='nmbr_zfp'" + divInputNumber + divFlexEnd;
    
    new Dialog({
        title: "Blitz dich find",
        content: headerDialog + valueWDialog + valuePDialog,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }, 
            accept: {
                icon: '<i class="fas fa-check"></i>', label: "Anwenden", callback: htmlCallback
                }
            },
        default: "accept",
        render: () => console.log("Wunde wurde geöffnet"),
        close: () => console.log("Wunde wurde geschlossen")
    }, {"width": 300}).render(true);
    
    async function htmlCallback(html){
        zfw = Number(html.find("#nmbr_zfw")[0]?.value || 0);
        zfp = Number(html.find("#nmbr_zfp")[0]?.value || 0);

        if(blindkampf == undefined){
            blindMod = 1;
        }else{
            blindMod = 0.5;
        };
        await applyEffect(token, zfw, zfp, blindMod);
    };
    
    function applyEffect(token, zfw, zfp, blindMod) {
        if(zfp%2 == 0){
            atMod = zfp / 2;
            paMod = zfp / 2;
        }else{
            atMod = Math.ceil(zfp / 2);
            paMod = Math.floor(zfp / 2);
        };
            iniDebuff = 0 - Math.round(zfw  * blindMod);
            fkDebuff = 0 - Math.round(zfp  * blindMod);
            atDebuff = 0 - Math.round(atMod  * blindMod);
            paDebuff = 0 - Math.round(paMod  * blindMod);
        
        vaeContent = "Alle Zauber und Talente: " + fkDebuff + "<br><br><u>Automatisch berechnet</u><br>Attacke: " +  atDebuff + "<br>Parade: " +  paDebuff + "<br>Ausweichen: " +  paDebuff + "<br>Fernkampf: " +  fkDebuff + "<br>Initiative: " + iniDebuff; 
        
        effectData = [
            {
                key: "system.base.combatAttributes.active.baseInitiative.value",
                value: iniDebuff,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.baseAttack.value",
                value: atDebuff,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.baseParry.value",
                value: paDebuff,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.dodge.value",
                value: paDebuff,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.baseRangedAttack.value",
                value: fkDebuff,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            
        ];
        
        
        effecDuration = zfw * 3;
        effect = {
            label: "Blitz dich find",
            icon: "icons/svg/lightning.svg",
            tint: "#d9bf3a",
            changes: effectData,
            duration: {
                "seconds": effecDuration,
                },
            flags: {
                core: {
                    statusId: "Blitzdichfind"
                },
                "visual-active-effects.data":{
                    intro: "Debuff durch Blitz dich find",
                    content: vaeContent,
                }
            },
        };
        return token.actor.createEmbeddedDocuments("ActiveEffect", [effect])
    };  
       
};