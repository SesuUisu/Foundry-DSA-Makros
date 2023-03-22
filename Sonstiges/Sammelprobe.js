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
        talent_dialog += `<option value=${talent._id}> ${talent.name}</option>`;
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
        let number_crit_suc = 0;
        let number_crit_fail = 0;
        let results = [];
        while (number_rolls < maxroll && accum_tap < target) {
            const result = await rollSkill(item[0], mod);
            number_rolls += 1;
            //showRollToChat(result);
            if (checkOccurence(result, 20)) {
                result.success = false;
                number_crit_fail += 1;
            } else if (checkOccurence(result, 1)) {
                result.success = true;
                accum_tap += Math.max(Number(item[0].system.value), 1);
                result.roll.total = Math.max(Number(item[0].system.value), 1);
                number_crit_suc += 1;
            } else if (result.success) {
                accum_tap += Math.max(Number(result.roll.total), 1);
            }
            results.push(result);

        }


        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            flavor: `Sammelprobe ${item[0].name} +${mod} (${item[0].system.value}) [${target} TaP* / ${maxroll}]`,
            content: createMeassgeContent(results, accum_tap, number_rolls, number_crit_suc, number_crit_fail)
        };
        ChatMessage.create(chatData, {});

    }
}

function createMeassgeContent(results, accum_tap, number_rolls, number_crit_suc, number_crit_fail) {
    const content = results.reduce((acc, result) => {
        let section = result.roll.dice.reduce((acc, dice) => {
            let rollDiceParts = `${dice.number}d${dice.faces}`;
            let diceTotal = dice.results.reduce((acc, die) => {
                if (!die.discarded) acc += die.result;
                return acc;
            }, 0);
            let diceList = dice.results.reduce((total, e) => {
                let discarded = e.discarded ? "discarded" : "";
                let exploded = e.exploded ? "exploded" : "";
                let critFail = dice.faces === e.result ? "max" : e.result === 1 ? "min" : "";
                total += `<li class="roll die ${discarded} ${exploded} d${dice.faces} ${critFail}">${e.result}</li>`;
                return total;
            }, ``);
            acc += `<section class="tooltip-part">
                        <div class="dice">
                            <header class="part-header flexrow">
                                <span class="part-formula">${rollDiceParts}</span>
                                <span class="part-total">${diceTotal}</span>
                            </header>
                            <ol class="dice-rolls">
                                ${diceList}
                            </ol>
                        </div>
                    </section>`;

            return acc;
        }, ``);
        acc += `
            <div class="dice-roll">
                <div class="dice-result">
                   <div class="flexrow">`;
        const c = result.roll.dice.map(function (e, i) {
            return [e, result.options.testAttributeData[i]];
        });

        for (const d of c) {
            acc += `<div class="dice-total roll-row">
                <div class="roll ">${d[0].total}</div>
                <div class="roll-info">${d[1].name} (${d[1].value})</div>
            </div>`;
        }
        //<div class="dice-formula">${rollFormula}</div>;
        acc += `</div> 
                <div class="dice-tooltip" style="display:none;">
                        ${section}
                    </div>
                    <h4 class="dice-total">${result.roll.total}</h4>
                </div>
            </div>
        `;
        return acc;
    }, '');
    for (let result of results) {
        game.dice3d?.showForRoll(result.roll);
    }
    return content;
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