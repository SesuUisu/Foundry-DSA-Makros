"use strict";
main();

async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
    const effect_key = "wunde";
    if (canvas.tokens.controlled.length === 0 || canvas.tokens.controlled.length > 1) {
        ui.notifications.error("Bitte einen Token auswählen.");
        return;
    }

    //Charakter Werte
    let tokenName = token.actor.name;


    //Dialog-input
    const divFlexStart = "<div style='display:flex'><span style='flex:1'>";
    const divFlexEnd = "</span></div>";
    const divInputNumber = "type='number' style='width:50px;float:right' value=0 />";


    ////Number inputs
    const headerDialog = "<h2> Wunden für <br><i>" + tokenName + "</i></h2>";

    const valueDialog = divFlexStart + "Zahl der Wunden<input id='nmbr_wound'" + divInputNumber + divFlexEnd;


    new Dialog({
        title: "Wunden",
        content: headerDialog + valueDialog,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }, accept: {
                icon: '<i class="fas fa-check"></i>', label: "Anwenden", callback: htmlCallback
            }, increase: {
                icon: '<i class="fas fa-plus"></i>', label: "Erhöhen", callback: htmlCallbackIncrease
            },
            decrease: {
                icon: '<i class="fas fa-minus"></i>', label: "Senken", callback: htmlCallbackDecrease
            },
            remove: {
                icon: '<i class="fas fa-trash-can"></i>',
                label: "Alle Entfernen",
                callback: () => removeEffect(token, effect_key)
            },
        },
        default: "accept",
        render: () => console.log("Wunde wurde geöffnet"),
        close: () => console.log("Wunde wurde geschlossen")
    }, {"width": 600}).render(true);

    async function htmlCallback(html) {
        const value = Number(html.find("#nmbr_wound")[0]?.value || 0);
        await applyEffect(token, value);
    }

    async function htmlCallbackIncrease(html) {
        const value = Number(html.find("#nmbr_wound")[0]?.value || 0);
        await changeWoundsBy(token, value, effect_key);
    }

    async function htmlCallbackDecrease(html) {
        const value = Number(html.find("#nmbr_wound")[0]?.value || 0);
        await changeWoundsBy(token, -value, effect_key);
    }

    function getEffectData(number) {
        const woundChanges = [
            {
                key: "system.base.combatAttributes.active.baseAttack.value",
                value: -2 * number,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
            {
                key: "system.base.combatAttributes.active.baseParry.value",
                value: -2 * number,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            }, {
                key: "system.base.combatAttributes.active.dodge.value",
                value: -2 * number,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
            {
                key: "system.base.combatAttributes.active.baseRangedAttack.value",
                value: -2 * number,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
            {
                key: "system.base.combatAttributes.active.baseInitiative.value",
                value: -2 * number,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
            {
                key: "system.base.basicAttributes.agility.value",
                value: -2 * number,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
            {
                key: "system.base.movement.speed.value",
                value: -1 * number,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
        ];
        const vaeContent = "Attacke -2 je Wunde<br>Parade -2 je Wunde<br>Ausweichen -2 je Wunde<br>Fernkampf -2 je Wunde<br>Initiative -2 je Wunde<br>Gewandheit -2 je Wunde<br>Geschwindigkeit -1 je Wunde<br>"
        return {
            label: `Wunde (${number})`,
            icon: "icons/svg/blood.svg",
            changes: woundChanges,

            flags: {
                core: {
                    statusId: effect_key,
                },
                "visual-active-effects.data":{
                    intro: "Wundeneffekte",
                    content: vaeContent,
                }
            },
        };
    }

    async function applyEffect(token, number) {
        if (number > 0) {
            setWoundTo(token, number, effect_key);
        } else if (number <= 0) {
            return removeEffect(token, effect_key);
        }
    }

    function removeEffect(token, effect_id) {
        let effect = token.actor.effects.find((effect) => effect.getFlag('core', 'statusId') === effect_id);
        if (effect) {
            return effect.delete();
        }
    }

    function setWoundTo(token, number, effect_id) {
        if (number<=0){
            return removeEffect(token,effect_id)
        }
        let effect = token.actor.effects.find((effect) => effect.getFlag('core', 'statusId') === effect_id);

        const effectData = getEffectData(number);
        if (effect) {
            return effect.update(effectData);
        } else {
            return token.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

        }
    }

    function changeWoundsBy(token, number, effect_id) {
        let effect = token.actor.effects.find((effect) => effect.getFlag('core', 'statusId') === effect_id);
        if (effect) {
            let changes = effect.system.changes;
            let at_change = Number(changes[0].value);
            const nmbr = at_change / -2;
            return setWoundTo(token, nmbr + number,effect_id);

        } else {
            return setWoundTo(token, number,effect_id);
        }
    }


}