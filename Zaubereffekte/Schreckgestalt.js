//Schreckgestalt 1 v0.0.1

"use strict";
main();

async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
    const schreckgestalt_key = "Schreckgestalt";
    if (canvas.tokens.controlled.length === 0 || canvas.tokens.controlled.length > 1) {
        ui.notifications.error("Bitte einen Token auswählen.");
        return;
    }

    //Charakter Werte
    let tokenName = token.actor.name;


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
    const headerDialog = "<h2> Schreckgestalt für <br><i>" + tokenName + "</i></h2>";

    const valueDialog = divFlexStart + "Malus von <input id='attr_mod'" + divInputNumber + divFlexEnd;

    
    new Dialog({
        title: "Schreckgestalt 1",
        content: headerDialog + valueDialog,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }, accept: {
                icon: '<i class="fas fa-check"></i>', label: "Anwenden", callback: htmlCallback
            },
            remove: {
                icon: '<i class="fa-solid fa-trash-can"></i>',
                label: "Entfernen",
                callback: () => removeEffect(token, schreckgestalt_key)
            },
        },
        default: "accept",
        render: () => console.log("Schreckgestalt wurde geöffnet"),
        close: () => console.log("Schreckgestalt wurde geschlossen")
    }).render(true);

    async function htmlCallback(html) {
        const value = Number(html.find("#attr_mod")[0]?.value || 0);
        const vaeContent = "folgende Werte verringert um " + value + ":<br><hr>MU<br>KL<br>CH<br>FF<br>AT<br>PA<br>AW<br>FK<br>INI<hr><br>je halbe Stunde darf ein Punkt abgebaut werden (nicht automatisch)";
        const timeValue = value;
        
        await applyEffect(token,value,timeValue,vaeContent);
    }


    function getEffectData(value, timeValue,vaeContent) {
        const attrChanges = [
            {
                key: "system.base.basicAttributes.courage.value",
                value: -value,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.basicAttributes.cleverness.value",
                value: -value,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.basicAttributes.charisma.value",
                value: -value,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.basicAttributes.dexterity.value",
                value: -value,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.baseAttack.value",
                value: -value,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.baseParry.value",
                value: -value,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.dodge.value",
                value: -value,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.baseRangedAttack.value",
                value: -value,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.baseInitiative.value",
                value: -value,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
        ];
        const effectDuration = timeValue * 60 * 30;
        return {
            label: "Schreckgestalt",
            icon: "icons/svg/terror.svg",
            changes: attrChanges,
            duration: {
                "seconds": effectDuration,
                },

            flags: {
                core: {
                    statusId: schreckgestalt_key,
                },
                "visual-active-effects.data":{
                    intro: "Schreckgestalt aktiviert",
                    content: vaeContent,
                }
            },
        };
    }

    async function applyEffect(token, value, timeValue,vaeContent) {
        if (value > 0) {
            const effectData = getEffectData( value, timeValue,vaeContent);
            return setEffect(token, effectData, schreckgestalt_key, timeValue,vaeContent);
        } else {
            return removeEffect(token, schreckgestalt_key, timeValue,vaeContent);
        }
    }

    function removeEffect(token, effect_id, timeValue,vaeContent) {
        let effect = token.actor.effects.find((effect) => effect.getFlag('core', 'statusId') === effect_id);
        if (effect) {
            return effect.delete();
        }
    }

    function setEffect(token, effectData, effect_id, timeValue,vaeContent) {
        let effect = token.actor.effects.find((effect) => effect.getFlag('core', 'statusId') === effect_id);
        if (effect) {
            return effect.update(effectData);
        } else {
            return token.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

        }
    }


}