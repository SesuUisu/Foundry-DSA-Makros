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
  const spez = getSpez(token)
  const talents = getTalents(token, spez)

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
  }
}

function showRollToChat (result) {
  const rollSkillToChat = game.ruleset.effects.get('rollSkillToChat')
  rollSkillToChat.apply(result)
}
function getSpez (token) {
  const spezialisierung = token.actor.items.filter(item =>
    item.name.match('spezialisierung')
  )
  return spezialisierung.map(x =>
    /spezialisierung ([\p{Letter}\s]+)/u.exec(x.name)[1].trim()
  )
}

function getTalents (token, spez) {
  const checked = ['talent', 'spell']
  let talents = token.actor.items.filter(function (item) {
    if (checked.includes(item.type)) {
      let test = (x) => item.name.match(x)
      return spez.some(test)
    }
    return false
  })

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
    skillName: item.name.concat(' ', '(Spez)'),
    skillType: item.type,
    skillValue: item.system.value + 2 || 0,
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
