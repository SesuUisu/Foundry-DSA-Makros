//v0.0.1 Axxeleratus


main();

async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
     if (canvas.tokens.controlled.length === 0) {
        //ui.notifications.error("Bitte einen Token auswählen.");
        return;
    };
    
    
    const effect_key = "Axxeleratus";
    //Charakter Werte
    const tokenName = token.actor.name;
    const inibase = token.actor.system.base.combatAttributes.active.baseInitiative.value;
    const gsbase = token.actor.system.base.movement.speed.value;
    const pabase = token.actor.system.base.combatAttributes.active.baseParry.value;
    const dodgebase = token.actor.system.base.combatAttributes.active.dodge.value;
    const athletics = token.actor.items.find(item => item.name === "Athletik")
    const athleticsTaw = (athletics === undefined || athletics === null)? 0: athletics.system.value;
    
    //Dialog-input
    const divFlexStart = "<div style='display:flex'><span style='flex:1'>";
    const divFlexEnd = "</span></div>";
    const divInputNumber = "type='number' style='width:50px;float:right' value=0 />";
    const divInputBox = "type='checkbox' style='width:70px;float:right' />";


    ////Number inputs
    const headerDialog = "<h2> Axxeleratus auf <br><i>" + tokenName + "</i></h2>";

    const valuePDialog = divFlexStart + "ZfP*<input id='nmbr_zfp' min='0'" + divInputNumber + divFlexEnd;
    const variantDialog = divFlexStart + "Variante: Blitzgeschwind<input id='blitzgeschwind'" + divInputBox + divFlexEnd;
    
    new Dialog({
        title: "Axxeleratus",
        content: headerDialog + valuePDialog + variantDialog,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }, 
            accept: {
                icon: '<i class="fas fa-check"></i>', label: "Anwenden", callback: htmlCallback
                },
            remove: {
                icon: '<i class="fa-solid fa-trash-can"></i>',
                label: "Entfernen",
                callback: () => removeEffect(token, effect_key)
                }
            },
        default: "accept",
        render: () => console.log(""),
        close: () => console.log("")
    }, {"width": 300}).render(true);
    
    async function htmlCallback(html){
        variant = Number(html.find("#blitzgeschwind")[0]?.checked || false);
        zfp = Number(html.find("#nmbr_zfp")[0]?.value || 0);

        await applyEffect(token, variant, zfp);
    };
    
    async function applyEffect(token, variant, zfp) {

        iniBuff = inibase;
        paBuff = +2;
        dodgeBuff = +4;
        gsBuff = gsbase;
        gsBuff += (blitzgeschwind == true)? zfp * 2: 0;
        athleticsBuff = athleticsTaw * 2;
        athleticsBuff += (blitzgeschwind == true)? zfp * 2: 0;
        
        
        vaeContent = "Automatisch angepasst:<br>Parade-Basis: +" + dodgeBuff + "<br>Ausweichen: +" + dodgeBuff + "<br>Ini-Basis: +" + iniBuff + "<br>GS: +" + gsBuff + "<hr>" + "weitere Boni:<br>Athletik (Sprint/Sprünge): +" + athleticsBuff + "<br>Nahkampf-TP: +2<br>gegnerische PA: +2<br>Schnellziehen<br>Schnellladen"; 
        
        effectData = [
            {
                key: "system.base.combatAttributes.active.baseInitiative.value",
                value: iniBuff,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.baseParry.value",
                value: paBuff,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.dodge.value",
                value: dodgeBuff,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.movement.speed.value",
                value: gsBuff,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            
        ];
        
        
        effecDuration = zfp * 3 * 6;
        effect = {
            label: "Axxeleratus",
            icon: "icons/svg/upgrade.svg",
            changes: effectData,
            duration: {
                "seconds": effecDuration,
                },
            flags: {
                core: {
                    statusId: "Axxeleratus"
                },
                "visual-active-effects.data":{
                    intro: "Axxeleratus-Effekt:",
                    content: vaeContent,
                }
            },
        };
        await removeEffect(token, effect_key);
        return token.actor.createEmbeddedDocuments("ActiveEffect", [effect])
    };  
    
    function removeEffect(token, effect_id) {
        let effect = token.actor.effects.find((effect) => effect.getFlag('core', 'statusId') === effect_id);
        if (effect) {
            return effect.delete();
        }

    }
};