"use strict";
main();

async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
    const attributo_key = "attributo";
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
    const headerDialog = "<h2> Attributo für <br><i>" + tokenName + "</i></h2>";

    const valueDialog = divFlexStart + "Attribut Bonus <input id='attr_mod'" + divInputNumber + divFlexEnd;

    const attributeDialog = divFlexStart + `
				<form action"#">
					<label for="attribute">Verwöhnt</label>
					<select name="attributeS" id="attribute" style="float:right; width: 100px;">
						<option value="courage">Mut</option>
						<option value="cleverness">Klugheit</option>
						<option value="intuition">Intuition</option>
						<option value="charisma">Charisma</option>
						<option value="dexterity">Fingerfertigkeit</option>
						<option value="agility">Gewandtheit</option>
						<option value="constitution">Konstitution</option>
						<option value="strength">Körperkraft</option>						
					</select>
				</form>
			` + divFlexEnd;
    const timeDialog = divFlexStart + "Wirkungsdauer (Std.) <input id='time_mod'" + divInputNumber + divFlexEnd;

    new Dialog({
        title: "Attributo",
        content: headerDialog + valueDialog + attributeDialog + timeDialog,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }, accept: {
                icon: '<i class="fas fa-check"></i>', label: "Anwenden", callback: htmlCallback
            },
            remove: {
                icon: '<i class="fa-solid fa-trash-can"></i>',
                label: "Entfernen",
                callback: () => removeEffect(token, attributo_key)
            },
        },
        default: "accept",
        render: () => console.log("Atttributo wurde geöffnet"),
        close: () => console.log("Atttributo wurde geschlossen")
    }).render(true);

    async function htmlCallback(html) {
        const value = Number(html.find("#attr_mod")[0]?.value || 0);
        const attribute = html.find("#attribute")[0]?.value;
        const timeValue = Number(html.find("#time_mod")[0]?.value || 0);


        const vaeContent = attribute + ": " + value + "<br>mögliche Neuberechnung der abgeleiteten Kampfwerte";

        await applyEffect(token, attribute, value, timeValue,vaeContent);
    }

    function changeAT(attribute, value, vaeContent) {
        //(MU+GE+KK)/5
        if (["courage", "agility", "strength"].indexOf(attribute) >= 0) {
            const old_value = token.actor.system.base.combatAttributes.active.baseAttack.value;
            const mu = token.actor.system.base.basicAttributes.courage.value;
            const ge = token.actor.system.base.basicAttributes.agility.value;
            const kk = token.actor.system.base.basicAttributes.strength.value;
            const new_value = Math.round((mu + ge + kk + value) / 5);
            if (new_value > old_value) {
                vaeContent
                return new_value - old_value;
            }
        }
        return 0;
    }

    function changePA(attribute, value, vaeContent) {
        //(IN+GE+KK)/5
        if (["intuition", "agility", "strength"].indexOf(attribute) >= 0) {
            const old_value = token.actor.system.base.combatAttributes.active.baseParry.value;
            const intu = token.actor.system.base.basicAttributes.intuition.value;
            const ge = token.actor.system.base.basicAttributes.agility.value;
            const kk = token.actor.system.base.basicAttributes.strength.value;
            const new_value = Math.round((intu + ge + kk + value) / 5);
            if (new_value > old_value) {
                return new_value - old_value;
            }
        }
        return 0;
    }

    function changeFK(attribute, value, vaeContent) {
        //(IN+FF+KK)/5
        if (["intuition", "dexterity", "strength"].indexOf(attribute) >= 0) {
            const old_value = token.actor.system.base.combatAttributes.active.baseRangedAttack.value;
            const intu = token.actor.system.base.basicAttributes.intuition.value;
            const ff = token.actor.system.base.basicAttributes.dexterity.value;
            const kk = token.actor.system.base.basicAttributes.strength.value;
            const new_value = Math.round((intu + ff + kk + value) / 5);
            if (new_value > old_value) {
                return new_value - old_value;
            }
        }
        return 0;
    }

    function getEffectData(attribute, value, timeValue,vaeContent) {
        const attrChanges = [
            {
                key: "system.base.basicAttributes." + attribute + ".value",
                value: value,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
            {
                key: "system.base.combatAttributes.active.baseAttack.value",
                value: changeAT(attribute, value, vaeContent),
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
            {
                key: "system.base.combatAttributes.active.baseParry.value",
                value: changePA(attribute, value, vaeContent),
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
            {
                key: "system.base.combatAttributes.active.dodge.value",
                value: changePA(attribute, value, vaeContent),
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
            {
                key: "system.base.combatAttributes.active.baseRangedAttack.value",
                value: changeFK(attribute, value, vaeContent),
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
        ];
        const effectDuration = timeValue * 60 * 60;
        return {
            label: "Attributo",
            icon: "icons/svg/upgrade.svg",
            changes: attrChanges,
            duration: {
                "seconds": effectDuration,
            },

            flags: {
                core: {
                    statusId: attributo_key,
                },
                "visual-active-effects.data":{
                    intro: "Anpassung einer Eigenschaft",
                    content: vaeContent,
                }
            },
        };
    }

    async function applyEffect(token, attribute, value, timeValue,vaeContent) {
        if (value > 0) {
            const effectData = getEffectData(attribute, value, timeValue,vaeContent);
            return setEffect(token, effectData, attributo_key, timeValue,vaeContent);
        } else {
            return removeEffect(token, attributo_key, timeValue);
        }
    }

    function removeEffect(token, effect_id, timeValue) {
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