"use strict";
main();

async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
    const armatrutz_key = "armatrutz";
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
    const headerDialog = "<h2> Armatrutz für <br><i>" + tokenName + "</i></h2>";

    const valueDialog = divFlexStart + "RS Bonus <input id='attr_mod'" + divInputNumber + divFlexEnd;

    
    new Dialog({
        title: "Attributo",
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
                callback: () => removeEffect(token, armatrutz_key)
            },
        },
        default: "accept",
        render: () => console.log("Armatrutz wurde geöffnet"),
        close: () => console.log("Armatrutz wurde geschlossen")
    }).render(true);

    async function htmlCallback(html) {
        const value = Number(html.find("#attr_mod")[0]?.value || 0);
        const timeValue = 5;
        
        await applyEffect(token,  value, timeValue);
    }


    function getEffectData(value, timeValue) {
        const attrChanges = [
             {
                key: "system.base.combatAttributes.passive.physicalResistance.value",
                value: value,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
        ];
        effectDuration = timeValue * 60;
        return {
            label: "Armatrutz",
            icon: "modules/game-icons-net/whitetransparent/armor-upgrade.svg",
            changes: attrChanges,
            duration: {
                "seconds": effectDuration,
                },

            flags: {
                core: {
                    statusId: armatrutz_key,
                },
            },
        };
    }

    async function applyEffect(token, value, timeValue) {
        if (value > 0) {
            const effectData = getEffectData( value, timeValue);
            return setEffect(token, effectData, armatrutz_key, timeValue);
        } else {
            return removeEffect(token, armatrutz_key, timeValue);
        }
    }

    function removeEffect(token, effect_id, timeValue) {
        let effect = token.actor.effects.find((effect) => effect.getFlag('core', 'statusId') === effect_id);
        if (effect) {
            return effect.delete();
        }
    }

    function setEffect(token, effectData, effect_id, timeValue) {
        let effect = token.actor.effects.find((effect) => effect.getFlag('core', 'statusId') === effect_id);
        if (effect) {
            return effect.update(effectData);
        } else {
            return token.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

        }
    }


}