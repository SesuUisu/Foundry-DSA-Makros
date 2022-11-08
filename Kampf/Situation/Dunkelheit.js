//v0.0.1 Situation
"use strict";


main();

async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
    if (canvas.tokens.controlled.length === 0) {
        //ui.notifications.error("Bitte einen Token auswählen.");
        return;
    }


    const effect_key = "Kampf_Situation";
    //Charakter Werte
    const tokenName = token.actor.name;


    //Dialog-input
    const divFlexStart = "<div style='display:flex'><span style='flex:1'>";
    const spanEnd = "</span>";
    const divFlexEnd = "</div>";
    const divInputBox = "type='checkbox' style='width:70px;float:right' />";


    ////Number inputs
    const headerDialog = "<h2> Kampf Situation für <i>" + tokenName + "</i></h2>";

    const scene_darkness = Math.round(Number(canvas.scene.darkness) * 16) || 0;
    let retval = await game.macros.getName('Token im Licht').execute();
    const token_light = Number(retval) || 0;
    const divInputNumber = " type='number' style='width:50px;float:right' />";

    const darknessDialog = divFlexStart + "Dunkelheit: <input id='darkness' min='0' value=" + scene_darkness + divInputNumber + spanEnd + divFlexEnd;
    const lightDialog = divFlexStart + "Lichtquellen: <input id='light' min='0' value=" + token_light + divInputNumber + spanEnd + divFlexEnd;
    const darknessreductionDialog = divFlexStart + "Dunkelheits-Reduktion (z.B. Katzenaugen): <input id='darkness_reduction' min='0' value=0" + divInputNumber + spanEnd + divFlexEnd;
    const darkvisionDialog = divFlexStart + "Dunkelsicht (z.B. Auges Mondes): <input id='dark_vision'" + divInputBox + spanEnd + divFlexEnd;


    new Dialog({
        title: "Lichtverhältnisse",
        content: headerDialog + darknessDialog + lightDialog + darknessreductionDialog + darkvisionDialog,
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
        const darkness = Number(html.find("#darkness")[0]?.value || 0);
        const light = Number(html.find("#light")[0]?.value || 0);
        const darkness_reduction = Number(html.find("#darkness_reduction")[0]?.value || 0);
        const dark_vision = Boolean(html.find("#dark_vision")[0]?.checked || false);

        await applyEffect(token, darkness, light, darkness_reduction, dark_vision);
    }

    async function applyEffect(token, darkness, light, darkness_reduction, dark_vision) {
        // Wege des Entdeckers s. 136
        let at_mod = 0;
        let pa_mod = 0;
        let fk_mod = 0;
        let situation = "";
        if (dark_vision) {
            darkness = 0;
            situation = "Dunkelsicht";
        }
        if (darkness > 0) {
            const nachtsicht_ad = token.actor.items.find(item => item.name === "Nachtsicht");
            const daemmerungssicht_ad = token.actor.items.find(item => item.name === "Dämmerungssicht");
            situation += "Dunkelheitsstufe: " + darkness;
            if (light > 0) {
                darkness = Math.max(0, darkness - light);
                situation += "<br>Lichtstufe: " + light;

            }
            if (darkness_reduction > 0) {
                darkness = Math.max(0, darkness - darkness_reduction);
                situation += "<br>Dunkelheits-Reduktion: " + darkness_reduction;

            }

            if (nachtsicht_ad && darkness < 16) {
                at_mod -= Math.min(Math.round(Math.floor(darkness / 2) / 2), 2);
                pa_mod -= Math.min(Math.round(Math.ceil(darkness / 2) / 2), 2);
                fk_mod -= Math.min(Math.round(darkness / 2), 5);
                situation += " (Nachtsicht)";

            } else if (daemmerungssicht_ad && darkness < 16) {
                at_mod -= Math.round(Math.floor(darkness / 2) / 2);
                pa_mod -= Math.round(Math.ceil(darkness / 2) / 2);
                fk_mod -= Math.round(darkness / 2);
                situation += " (Dämmerungssicht)";
            } else {
                at_mod -= Math.floor(darkness / 2);
                pa_mod -= Math.ceil(darkness / 2);
                fk_mod -= darkness;
            }
        }

        const vaeContent = "Automatisch angepasst:<br>Attacke-Basis: +" + at_mod + " <br>Parade-Basis: +" + pa_mod + "<br>Ausweichen: +" + pa_mod + "<br>Fernkampf-Basis: +" + fk_mod + "";

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
            {
                key: "system.base.combatAttributes.active.baseRangedAttack.value",
                value: fk_mod,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },


        ];
        const effect = {
            label: "Lichtverhältnisse",
            icon: "icons/svg/blind.svg",
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
