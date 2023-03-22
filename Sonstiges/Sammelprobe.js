"use strict";
main();

async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
    if (canvas.tokens.controlled.length === 0 || canvas.tokens.controlled.length > 1) {
        ui.notifications.error("Bitte einen Token auswählen.");
        return;
    }

    const talents = getTalents(token);

    const divFlexStart = "<div style='display:flex'><span style='flex:1'>";
    const divFlexEnd = "</span></div>";
    const divInputNumber = "type='number' style='width:50px;float:right' value=0 />";


    ////Number inputs
    const headerDialog = "<h2>Sammelprobe für <i>" + token.name + "</i></h2>";


    let talent_dialog = divFlexStart + `
            <form action"#">
                 <label for="talent_choice">Talent: </label>
                 <select name="talent_choice" id="talent_choice" style="float:right">`;
    for (const talent of talents) {
        talent_dialog += "<option value=" + talent._id + ">" + talent.name + "</option>";
    }

    talent_dialog += `</select></form>` + divFlexEnd;
    talent_dialog += divFlexStart + "Modifikator <input id='mod'" + divInputNumber + divFlexEnd;
    talent_dialog += divFlexStart + "Ziel TaP* <input id='target'" + divInputNumber + divFlexEnd;
    talent_dialog += divFlexStart + "Maximale Anzahl an Würfen <input id='maxroll'" + divInputNumber + divFlexEnd;


    new Dialog({
        title: "Sammel Probe",
        content: headerDialog + talent_dialog,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            },
            accept: {
                icon: '<i class="fas fa-check"></i>', label: "Anwenden", callback: htmlCallback
            },

        },
        default: "accept",
        render: () => console.log(""),
        close: () => console.log("")
    }).render(true);


    async function htmlCallback(html) {

        const id = html.find("#talent_choice")[0].value;
        const item = token.document.actorData.items.filter(item => item._id === id);
        const mod = Number(html.find("#mod")[0].value);
        const target = Number(html.find("#target")[0].value);
        const maxroll = Number(html.find("#maxroll")[0].value);
        let accum_tap = 0;
        let number_rolls = 0;
        let number_crit_suc =0;
        let number_crit_fail =0;
        while (number_rolls < maxroll && accum_tap < target) {
            const result = await rollSkill(item[0], mod);
            number_rolls += 1;
            showRollToChat(result);
            if (checkOccurence(result, 20)) {
                result.success = false;
                number_crit_fail +=1;
            } else if (checkOccurence(result, 1)) {
                result.success = true;
                accum_tap += Math.max(Number(item[0].system.value), 1);
                number_crit_suc += 1;
            } else if (result.success) {
                accum_tap += Math.max(Number(result.roll.total), 1);
            }
        }

    }

}

function checkOccurence(result, target) {
    const roll = result.roll;
    const dices = roll.dice;
    const count = dices.filter((dice) => dice.results[0].result === target).length;
    return count >= 2;
}

function showRollToChat(result) {

    const rollSkillToChat = game.ruleset.effects.get("rollSkillToChat");
    rollSkillToChat.apply(result);
}

function getTalents(token) {
    return token.document.actorData.items.filter(item => item.type === "talent");
}

function getSpells(token) {
    return token.document.actorData.items.filter(item => item.type === "spell");

}

async function rollSkill(item, mod) {
    const testAttributeData = getTestAttributeData(item);
    const options = {mod: mod};
    const _rollSkill = game.ruleset.actions.get("rollSkill");

    const rollResultPromise = _rollSkill.execute({
        ...options,
        skillName: item.name,
        skillType: item.type,
        skillValue: item.system.value,
        testAttributeData,
        mod: options.mod,
    });
    return rollResultPromise.then((rollResult) => ({
        mod: options.mod || 0,
        roll: rollResult.roll,
        success: rollResult.success,
        options: {
            ...options,
            ...rollResult.options,
        }
    }));
}

function getTestAttributeData(item) {
    const testAttributes = [item.system.test.firstAttribute, item.system.test.secondAttribute, item.system.test.thirdAttribute];
    return testAttributes.map((attributeName) => {
        const attribute = token.actor.system.base.basicAttributes[attributeName];

        return {name: attributeName, value: attribute.value};
    });
}