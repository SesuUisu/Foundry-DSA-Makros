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
    const divFlexEnd = "</span></div>";
    const divInputNumber = "type='number' style='width:50px;float:right' value=0 />";
    const divInputBox = "type='checkbox' style='width:70px;float:right' />";


    ////Number inputs
    const headerDialog = "<h2> Kampf Situation für <i>" + tokenName + "</i></h2>";


    const lightDialog = divFlexStart + "Dunkelheit: <input id='darkness' min='0' " + divInputNumber + divFlexEnd;
    const invisibleDialog = divFlexStart + "Kampf gegen Unsichtbare <input id='invisible'" + divInputBox + divFlexEnd;
    const waterDialog = divFlexStart + `
            <form action"#">
                 <label for="water_combat">Kampf im Wasser:</label>
                 <select name="water_combat" id="water_combat" style="float:right">
                    <option value="0">Normal</option>
                    <option value="1">Kampf in knietiefem Wasser</option>
                    <option value="4">Kampf in hüfttiefem Wasser</option>
                    <option value="5">Kampf in schultertiefem Wasser</option>
                    <option value="6">Kampf unter Wasser</option>
                 </select>
            </form>
        ` + divFlexEnd;
    const position_self_Dialog = divFlexStart + `
            <form action"#">
                 <label for="combat_self_position">Eigene Position:</label>
                 <select name="combat_self_position" id="combat_self_position" style="float:right">
                    <option value="0">Normal</option>                   
                    <option value="1">Kampf aus kniender Position heraus</option>
                    <option value="2">Kampf aus liegender Position heraus</option>                                                       
                 </select>
            </form>
        ` + divFlexEnd;
    const position_enemy_Dialog = divFlexStart + `
            <form action"#">
                 <label for="combat_enemy_position">Gegner Position:</label>
                 <select name="combat_enemy_position" id="combat_enemy_position" style="float:right">
                    <option value="0">Normal</option>
                    <option value="1">Kampf gegen Knienden</option>
                    <option value="2">Kampf gegen am Boden liegenden</option>                                       
                 </select>
            </form>
        ` + divFlexEnd;
    const flyingDialog = divFlexStart + "Kampf gegen fliegende Wesen <input id='flying'" + divInputBox + divFlexEnd;


    new Dialog({
        title: "Kampf Situation",
        content: headerDialog + lightDialog + invisibleDialog + waterDialog + position_self_Dialog + position_enemy_Dialog + flyingDialog,
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
        const invisble_enemy = Boolean(html.find("#invisible")[0]?.checked || false);
        const darkness = Number(html.find("#darkness")[0]?.value || 0);
        const water_fight = Number(html.find("#water_combat")[0]?.value || 0);
        const self_position = Number(html.find("#combat_self_position")[0]?.value || 0);
        const enemy_position = Number(html.find("#combat_enemy_position")[0]?.value || 0);
        const flying_enemy = Boolean(html.find("#flying")[0]?.checked || false);

        await applyEffect(token, invisble_enemy, darkness, water_fight, self_position, enemy_position, flying_enemy);
    }

    async function applyEffect(token, invisble_enemy, darkness, water_fight, self_position, enemy_position, flying_enemy) {
        let at_mod = 0;
        let pa_mod = 0;
        let fk_mod = 0;
        if (darkness > 0) {
            const nachtsicht_ad = token.actor.items.find(item => item.name === "Nachtsicht");
            const daemmerungssicht_ad = token.actor.items.find(item => item.name === "Dämmerungssicht");
            if (nachtsicht_ad) {
                at_mod -= Math.min(Math.round(Math.floor(darkness / 2)/2),2);
                pa_mod -= Math.min(Math.round(Math.ceil(darkness / 2)/2),2);
                fk_mod -= Math.min(Math.round(darkness/2),5);
            } else if(daemmerungssicht_ad){
                at_mod -= Math.round(Math.floor(darkness / 2)/2);
                pa_mod -= Math.round(Math.ceil(darkness / 2)/2);
                fk_mod -= Math.round(darkness/2);
            } else {
                at_mod -= Math.floor(darkness / 2);
                pa_mod -= Math.ceil(darkness / 2);
                fk_mod -= darkness;
            }
        }
        if (invisble_enemy) {
            at_mod -= 6;
            pa_mod -= 6;
            fk_mod -= 8;
        }

        if (water_fight > 0) {
            const water_combat_sf = token.actor.items.find(item => item.name === "Kampf im Wasser");
            if (water_combat_sf) {
                at_mod -= Math.floor(water_fight / 2);
                pa_mod -= Math.ceil(water_fight / 2);
            } else {
                at_mod -= Math.floor(water_fight / 2) * 2;
                pa_mod -= Math.ceil(water_fight / 2) * 2;
            }
        }
        if (self_position === 1) {
            at_mod -= 1;
            pa_mod -= 1;
        } else if (self_position === 1) {
            at_mod -= 3;
            pa_mod -= 3;
        }
        if (enemy_position === 1) {
            at_mod += 1;
            pa_mod += 3;
        } else if (enemy_position === 2) {
            at_mod += 3;
            pa_mod += 5;
        }
        if (flying_enemy) {
            at_mod -= 2;
            pa_mod -= 4;
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
            label: "Kampf Situation",
            icon: "icons/svg/combat.svg",
            changes: effectData,

            flags: {
                core: {
                    statusId: effect_key
                },
                "visual-active-effects.data": {
                    intro: "Kampf Situation-Effekt:",
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
