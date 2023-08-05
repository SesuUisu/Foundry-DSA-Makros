'use strict'
main()

async function main () {
  //Überprüfe, ob ein Token ausgewählt wurde
  if (
    canvas.tokens.controlled.length === 0 ||
    canvas.tokens.controlled.length > 1
  ) {
    ui.notifications.error('Bitte einen Token auswählen.')
    return
  }
  const spez= getSpez(token)
  const talents = getTalents(token,spez)

  const divFlexStart = "<div style='display:flex'><span style='flex:1'>"
  const divFlexEnd = '</span></div>'
  const divInputNumber = "type='number' style='width:50px;float:right'  />"
  const leftpoints = game.i18n.localize(`DSA.keepLeftTalentPoints`)
  //"DSA.keepLeftSpellPoints

  ////Number inputs
  const headerDialog =
    '<h2>Spezialisierter Probe für <i>' + token.name + '</i></h2>'

  let talent_dialog =
    divFlexStart +
    `
            <form action"#">
                <label for="talent_choice">Talent/Zauber: </label>
                <select name="talent_choice" id="talent_choice" style="float:right">`
  for (const talent of talents) {
    talent_dialog += `<option value="${talent.name}"> ${talent.name}</option>`
  }

  talent_dialog += `</select></form>` + divFlexEnd
  talent_dialog +=
    divFlexStart +
    "Modifikator <input id='mod' value=0 " +
    divInputNumber +
    divFlexEnd

  new Dialog({
    title: 'Spezialisierte Probe',
    content: headerDialog + talent_dialog,
    buttons: {
      close: {
        icon: '<i class="fas fa-times"></i>',
        label: 'Schließen'
      },
      accept: {
        icon: '<i class="fas fa-check"></i>',
        label: 'Anwenden',
        callback: htmlCallback
      }
    },
    default: 'accept',
    render: () => console.log(''),
    close: () => console.log('')
  }).render(true)

  async function htmlCallback (html) {
    const id = html.find('#talent_choice')[0].value
    const item = token.actor.items.find(x => x.name === id)
    const mod = Number(html.find('#mod')[0].value)
    const result = await rollSkill(item, mod)
    showRollToChat(result)
    //const success = game.i18n.localize(
    //  accum_tap >= target ? 'DSA.success' : 'DSA.failed'
    //)
    // let message = createMeassgeContent(results, leftpoints)
    // message += `<div class="dice-roll">
    //                     <div class="dice-result">                       
    //                         <h4 class="dice-total ${
    //                           accum_tap >= target ? 'success' : 'failure'
    //                         }">${accum_tap} von ${target} ${leftpoints}</h4>          
    //                     </div>
    //                 </div>`
    // let chatData = {
    //   user: game.user._id,
    //   speaker: ChatMessage.getSpeaker(),
    //   flavor: `Sammelprobe ${item.name} +${mod} (${item.system.value}) ${success}<br>                     
    //                 Versuche: ${number_rolls} von ${maxroll}<br>
    //                 Kritische Erfolge: ${number_crit_suc}<br>
    //                 Kritische Fehlschläge: ${number_crit_fail}
    //                     `,
    //   content: message
    // }
    // ChatMessage.create(chatData, {})
  }
}

function createMeassgeContent (results, leftpoints) {
  let content = results.reduce((acc, result) => {
    let section = result.roll.dice.reduce((acc, dice) => {
      let rollDiceParts = `${dice.number}d${dice.faces}`
      let diceTotal = dice.results.reduce((acc, die) => {
        if (!die.discarded) acc += die.result
        return acc
      }, 0)
      let diceList = dice.results.reduce((total, e) => {
        let discarded = e.discarded ? 'discarded' : ''
        let exploded = e.exploded ? 'exploded' : ''
        let critFail =
          dice.faces === e.result ? 'max' : e.result === 1 ? 'min' : ''
        total += `<li class="roll die ${discarded} ${exploded} d${dice.faces} ${critFail}">${e.result}</li>`
        return total
      }, ``)
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
                    </section>`

      return acc
    }, ``)
    acc += `
            <div class="dice-roll">
                <div class="dice-result">
                  <div class="flexrow">`
    const c = result.roll.dice.map(function (e, i) {
      return [e, result.options.testAttributeData[i]]
    })

    for (const d of c) {
      const attr_name = game.i18n.localize(`DSA.${d[1].name}_abbr`)
      acc += `<div class="dice-total roll-row" style="line-height:16px;" >
                <div class="roll" style="font-size:var(--font-size-16);">${d[0].total}</div>
                <div class="roll-info">${attr_name} (${d[1].value})</div>
            </div>`
    }
    //<div class="dice-formula">${rollFormula}</div>;
    acc += `</div> 
                <div class="dice-tooltip" style="display:none;">
                        ${section}
                    </div>
                    <h5 class="dice-total" style="font-size:var(--font-size-16);" >${result.roll.total} ${leftpoints}</h5>
                </div>
            </div>
        `
    return acc
  }, '')
  for (let result of results) {
    game.dice3d?.showForRoll(result.roll)
  }
  return content
}

function checkOccurence (result, target) {
  const roll = result.roll
  const dices = roll.dice
  const count = dices.filter(dice => dice.results[0].result === target).length
  return count >= 2
}

function showRollToChat (result) {
  const rollSkillToChat = game.ruleset.effects.get('rollSkillToChat')
  rollSkillToChat.apply(result)
}
function getSpez (token) {
  const spezialisierung = token.actor.items.filter(item =>
    item.name.match('spezialisierung')
  )
  return talent_spezialisierung.map(x =>
    /spezialisierung ([\p{Letter}\s]+)/u.exec(x.name)[1].trim()
  )
}

function getTalents (token, spez) {
  const checked =['talent','spell','combatTalent']
  let talents = token.actor.items.filter(
    item => checked.includes(item.type) && spez.includes(item.name) && item.system.category != 'combat'
  )

  const cat = {
    physical: 1,
    social: 2,
    nature: 3,
    knowledge: 4,
    language: 5,
    crafting: 6,
    karma: 7,
    gift: 8
  }

  talents.sort(
    (a, b) =>
      (cat[a.system.category] || 9) - (cat[b.system.category] || 9) ||
      a.name.localeCompare(b.name)
  )

  return talents
}

async function rollSkill (item, mod) {
  const testAttributeData = getTestAttributeData(item)
  const options = { mod: mod }
  const _rollSkill = game.ruleset.actions.get('rollSkill')

  const rollResultPromise = _rollSkill.execute({
    ...options,
    skillName: item.name,
    skillType: item.type,
    skillValue: (item.system.value +2) || 0,
    testAttributeData,
    mod: options.mod
  })
  return rollResultPromise.then(rollResult => ({
    mod: options.mod || 0,
    roll: rollResult.roll,
    success: rollResult.success,
    options: {
      ...options,
      ...rollResult.options
    }
  }))
}

function getTestAttributeData (item) {
  const testAttributes = [
    item.system.test.firstAttribute,
    item.system.test.secondAttribute,
    item.system.test.thirdAttribute
  ]
  return testAttributes.map(attributeName => {
    const attribute = token.actor.system.base.basicAttributes[attributeName]

    return { name: attributeName, value: attribute.value }
  })
}
