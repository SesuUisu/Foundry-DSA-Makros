//v0.0.1 Ueberzahl
"use strict";


main();

async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
    if (canvas.tokens.controlled.length === 0) {
        //ui.notifications.error("Bitte einen Token auswählen.");
        return;
    }


    const effect_key = "Überzahl";
    //Charakter Werte
    const tokenName = token.actor.name;


    //Dialog-input
    const divFlexStart = "<div style='display:flex'><span style='flex:1'>";
    const divFlexEnd = "</span></div>";
    const divInputNumber = "type='number' style='width:50px;float:right' value=0 />";
    const divInputBox = "type='checkbox' style='width:70px;float:right' />";


    ////Number inputs
    const headerDialog = "<h2> Überzahl für <br><i>" + tokenName + "</i></h2>";

    const enemyDialog = divFlexStart + "Überzahl der Gegner<input id='nmbr_enemy' min='0'" + divInputNumber + divFlexEnd;
    const friendDialog = divFlexStart + "Freunde in der Überzahl<input id='check_friends'" + divInputBox + divFlexEnd;

    new Dialog({
        title: "Überzahl",
        content: headerDialog + enemyDialog + friendDialog,
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

    async function htmlCallback(html) {
        let friends = Boolean(html.find("#check_friends")[0]?.checked || false);
        let enemies = Number(html.find("#nmbr_enemy")[0]?.value || 0);

        await applyEffect(token, friends, enemies);
    }

    async function applyEffect(token, friends, enemies) {
        let at_mod = 0;
        let pa_mod = 0;
        let icon = "icons/svg/down.svg";
        if (friends) {
            at_mod = 1;
            icon = "icons/svg/up.svg";
        } else {
            pa_mod = -Math.max(0, Math.min(2, enemies));
        }


        const vaeContent = "Automatisch angepasst:<br>Attacke-Basis: +" + at_mod + " <br>Parade-Basis: +" + pa_mod + "<br>Ausweichen: +" + pa_mod + "";

        const effectData = [
            {
                key: "system.base.combatAttributes.active.baseAttack.value",
                value: at_mod,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.baseParry.value",
                value: pa_mod,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.dodge.value",
                value: pa_mod,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },


        ];
        const effect = {
            label: "Überzahl",
            icon: icon,
            changes: effectData,

            flags: {
                core: {
                    statusId: effect_key
                },
                "visual-active-effects.data": {
                    intro: "Überzahl-Effekt:",
                    content: vaeContent,
                }
            },
        };
        await removeEffect(token, effect_key);
        return token.actor.createEmbeddedDocuments("ActiveEffect", [effect]);
    }

    function removeEffect(token, effect_id) {
        let effect = token.actor.effects.find((effect) => effect.getFlag('core', 'statusId') === effect_id);
        if (effect) {
            return effect.delete();
        }

    }
}
