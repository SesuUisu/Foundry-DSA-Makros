//v0.0.1 Distanzklasse
"use strict";


main();

async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
    if (canvas.tokens.controlled.length === 0) {
        //ui.notifications.error("Bitte einen Token auswählen.");
        return;
    }


    const effect_key = "Distanzklasse";
    //Charakter Werte
    const tokenName = token.actor.name;


    //Dialog-input
    const divFlexStart = "<div style='display:flex'><span style='flex:1'>";
    const divFlexEnd = "</span></div>";


    ////Number inputs
    const headerDialog = "<h2> Distanzklasse für <i>" + tokenName + "</i></h2>";


    const dkDialog = divFlexStart + `
            <form action"#">
                 <label for="dk_choice">Waffe ist</label>
                 <select name="dk_choice" id="dk_choice" style="float:right">
                    <option value="-2">zwei oder mehr Kategorien zu kurz</option>
                    <option value="-1">eine Kategorie zu kurz</option>
                    <option value="0" selected>passend</option>
                    <option value="1">eine Kategorie zu lang</option>
                    <option value="2">zwei oder mehr Kategorien zu lang</option>
                 </select>
            </form>
        ` + divFlexEnd;


    new Dialog({
        title: "Kampf Situation",
        content: headerDialog + dkDialog,
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
    }).render(true);

    async function htmlCallback(html) {

        const dk = Number(html.find("#dk_choice")[0]?.value || 0);


        await applyEffect(token, dk);
    }

    async function applyEffect(token, dk) {
        await removeEffect(token, effect_key);
        if (dk === 0) {
            return;
        }
        let at_mod = 0;
        let pa_mod = 0;
        let situation = "";
        if (dk === -2) {
            situation = "Waffe zwei oder mehr Kategorien zu kurz";
            at_mod = -999;
        } else if (dk===-1){
            situation = "Waffe eine Kategorien zu kurz";
            at_mod = -6;
        } else if (dk===1){
            situation = "Waffe eine Kategorien zu lang";
            at_mod = -6;
            pa_mod = -6;
        } else if (dk===2){
            situation = "Waffe zwei oder mehr Kategorien zu lang";
            at_mod = -999;
            pa_mod = -999;
        }


        const vaeContent = "Automatisch angepasst:<br>Attacke-Basis: +" + at_mod + " <br>Parade-Basis: +" + pa_mod + "";

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


        ];
        const effect = {
            label: "Distanzklasse",
            icon: "icons/svg/thrust.svg",
            changes: effectData,

            flags: {
                core: {
                    statusId: effect_key
                },
                "visual-active-effects.data": {
                    intro: situation,
                    content: vaeContent,
                }
            },
        };
        return token.actor.createEmbeddedDocuments("ActiveEffect", [effect]);
    }

    function removeEffect(token, effect_id) {
        let effect = token.actor.effects.find((effect) => effect.getFlag('core', 'statusId') === effect_id);
        if (effect) {
            return effect.delete();
        }

    }
}
