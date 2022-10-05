//Schildkampf-PA-Boni v0.0.1

"use strict";
main();

async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
    const shield_key = "shieldfight";
    if (canvas.tokens.controlled.length === 0 || canvas.tokens.controlled.length > 1) {
        ui.notifications.error("Bitte einen Token auswählen.");
        return;
    }

    //Charakter Werte
    let tokenName = token.actor.name;
    
    
    
    
 /*
    const weaponID = token.actor.system.base.combatState.primaryHand
    const weaponData = token.actor.items.find(item => item._id === weaponID);
    weaponType = weaponData.system.talents;


    Waffen-PA >=15 PA+1
    Waffen-PA >=18 PA+1
    Waffen-PA >=21 PA+1
  
    weaponType.forEach(getParry);
    function getParry(combatTalent){
        combatStyle = token.actor.items.find(item => item.name === combatTalent && item.type === "combatTalent")
        talentValue = combatStyle.system.value; 
        
        
    };
 */ 
        
        
        
        
        
    let lefthandSF = (token.actor.items.find(item => item.name === "Linkhand" && item.type === "specialAbility") === undefined)? 0: 1;
    let shieldSF = (token.actor.items.find(item => item.name === "Schildkampf I" && item.type === "specialAbility") === undefined)? 0: 2;
    let shieldAdSF = (token.actor.items.find(item => item.name === "Schildkampf II" && item.type === "specialAbility") === undefined)? 0: 2;
    let shieldMasterSF = (token.actor.items.find(item => item.name === "Waffenmeister (Schild)" && item.type === "specialAbility") === undefined)? 0: 2;

    let value = lefthandSF + shieldAdSF + shieldSF + shieldMasterSF;
    
    let vaeContent1 = (lefthandSF != 0)? "Parade-Bonus durch Linkhand<br>": "";
    let vaeContent2 = (shieldSF != 0)? "Parade-Bonus durch Schildkampf I<br>": "";
    let vaeContent3 = (shieldAdSF != 0)? "Parade-Bonus durch Schildkampf II<br>": "";
    let vaeContent4 = (shieldMasterSF != 0)? "Parade-Bonus durch Waffenmeister (Schild)":"";
        
    let vaeContent = vaeContent1 + vaeContent2 + vaeContent3 + vaeContent4;
        


    let effect_id = "Schildkampf";
    applyEffect(token, value, effect_id);



    function getEffectData(value) {
        const attrChanges = [
             {
                key: "system.base.combatAttributes.active.baseParry.value",
                value: value,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
        ];
        return {
            label: effect_id,
            icon: "modules/game-icons-net/whitetransparent/attached-shield.svg",
            changes: attrChanges,
            flags: {
                core: {
                    statusId: shield_key,
                },
                "visual-active-effects.data":{
                    intro: "Schildkampf aktiviert",
                    content: vaeContent,
                }
            },
        };
    }

    function applyEffect(token, value) {
        let effectTrue = (token.actor.effects.find(effect => effect.label === effect_id));

        if (effectTrue === undefined) {
            const effectData = getEffectData( value);
            return setEffect(token, effectData, shield_key);
        } else {
            return removeEffect(token, shield_key);
        }
    }

    function removeEffect(token, effect_id) {
        let effect = token.actor.effects.find((effect) => effect.getFlag('core', 'statusId') === effect_id);
        if (effect) {
            return effect.delete();
        }
    }

    function setEffect(token, effectData, effect_id) {
        let effect = token.actor.effects.find((effect) => effect.getFlag('core', 'statusId') === effect_id);
        if (effect) {
            return effect.update(effectData);
        } else {
            return token.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

        }
    }


}