// GS einstellen v0.0.1

"use strict";
main();
async function main (){
    //Überprüfe, ob ein Token ausgewählt wurde
    if (canvas.tokens.controlled.length === 0 || canvas.tokens.controlled.length > 1) {
        ui.notifications.error("Bitte einen Token auswählen."); 
        return;
    }
    
    //Charakter-Werte
    const tokenName = token.actor.name;
    const tokenGS = token.actor.system.base.movement.speed.value;
    const tokenGE = token.actor.system.base.basicAttributes.agility.value;
    const flink = token.actor.items.find(item => item.name === "Flink");
    const behabig = token.actor.items.find(item => item.name === "Behäbig");
    const einbeinig = token.actor.items.find(item => item.name === "Einbeinig");
    const klein = token.actor.items.find(item => item.name === "Kleinwüchsig");
    const lahm = token.actor.items.find(item => item.name === "Lahm");
    const zwerg = token.actor.items.find(item => item.name === "Zwergenwuchs");
    
    var baseGS = 7;
    baseGS += (tokenGE > 10 ? 1 : 0);
    baseGS += (tokenGE > 15 ? 1 : 0);
    baseGS += (flink == undefined ? 0 : 1);
    baseGS += (behabig == undefined ? 0 : -1);
    baseGS += (einbeinig == undefined ? 0 : -3);
    baseGS += (klein == undefined ? 0 : -1);
    baseGS += (lahm == undefined ? 0 : -1);
    baseGS += (zwerg == undefined ? 0 : -2);
    
    //Dialog-input
    const headerDialog = "<h2><i>" + tokenName + "</i></h2>";
    var inputDialog = headerDialog + `
        <div>
            <form action#>
                <div>
                    <input type="radio" name="typauswahl" value="0" id="r0" checked>
                    <label for="r0">` + "GS (selbst): <input id='gsTValue' type='number' style='width:50px;float:right' value='" + tokenGS +"'/>" + `</label>
                </div>
                <div style="margin-top: 15px">
                    <input type="radio" name="typauswahl" value="1" id="r1">
                    <label for="r1">` + "GS (basierend auf <i>GE</i>+Vt+Nt): <input id='gsRValue' type='number' style='width:50px;float:right' value='" + baseGS +"' readonly='readonly'/>" + `</label>
                </div>
            </form>
        </div>
    `
    
    new Dialog({
        title: "GS einstellen",
        content: inputDialog + "<hr>",
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }, 
            accept: {
                icon: '<i class="fas fa-check"></i>', label: "Eintragen", callback: htmlCallback
            }  
        },
        default: "accept",
        render: () => console.log(),
        close: () => console.log()
    }).render(true);
    
    //Eingabe verarbeiten
    async function htmlCallback(html){  
        var typInput = document.querySelector('input[name="typauswahl"]:checked').value;
        const gsTInput = Number(html.find("#gsTValue")[0]?.value || 0);
        const gsRInput = Number(html.find("#gsRValue")[0]?.value || 0);
        
        const gsInput = (typInput == 0 ? gsTInput : gsRInput);
        //Token aktualisieren
        token.actor.update({
            'system.base.movement.speed.value': gsInput
        }); 
    }
}