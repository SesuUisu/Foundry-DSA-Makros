// v0.2 Adlerschwinge 


main();

async function main() {
    //Überprüfe, ob ein Token ausgewählt wurde
     if (canvas.tokens.controlled.length === 0 || canvas.tokens.controlled.length > 1) {
        ui.notifications.error("Bitte einen Token auswählen.");
        return;
    };
    
    
    
    //Tierwerte maximal
    const tier = "Silberwolf";
    const at = 10;
    const pa = 7;
    const ff = 5;
    const ge = 13;
    const ko = 14;
    const kk = 14;
    const rs = 2;
    const gs = 12;
 /*   
    const ini = 9;
    const lep = 23;
    const aup = 100;
 */   
    
    
    //Charakter Werte
    const tokens = canvas.tokens.controlled;
    const tokenName = token.actor.name;
    const baseDex = token.actor.system.base.basicAttributes.dexterity.value;
    const baseAgi = token.actor.system.base.basicAttributes.agility.value;
    const baseCon = token.actor.system.base.basicAttributes.constitution.value;
    const baseStr = token.actor.system.base.basicAttributes.strength.value;
    const baseGs = token.actor.system.base.movement.speed.value;

    //Dialog-input
    const divFlexStart = "<div style='display:flex'><span style='flex:1'>";
    const divFlexEnd = "</span></div>";
    const divInputNumber = "type='number' style='width:50px;float:right' value=1 />";


    ////Number inputs
    const headerDialog = "<h2> Adlerschwinge Wolfsgestalt (" + tier + ") von <br><i>" + tokenName + "</i></h2>";

    const valueDialog = divFlexStart + "Wirkungsdauer (in Std.)<input id='nmbr_time'" + divInputNumber + divFlexEnd;
    titleIn = "Adlerschwinge Wolfsgestalt (" + tier + ")";
    
    new Dialog({
        title: titleIn,
        content: headerDialog + valueDialog,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }, 
            accept: {
                icon: '<i class="fas fa-check"></i>', label: "Anwenden", callback: htmlCallback
                }
            },
        default: "accept",
        render: () => console.log("Wolfszeit"),
        close: () => console.log()
    }, {"width": 300}).render(true);
    
    

    
    //Funktion
    async function htmlCallback(html){
        //Zauberwert
        adlerschwinge = token.actor.items.find(item => item.name === "Adlerschwinge Wolfsgestalt (" + tier + ")");
        zfw = (adlerschwinge.system.value === 0)? 1 : adlerschwinge.system.value;
        
        zfAt = Math.min(at, zfw * 2);
        zfPa = Math.min(pa, zfw * 2);
        
        tempDex = Math.min(ff, zfw * 2) - baseDex;
        tempAgi = Math.min(ge, zfw * 2) - baseAgi;
        tempCon = Math.min(ko, zfw * 2) - baseCon;
        tempStr = Math.min(kk, zfw * 2) - baseStr;
        
        time = Number(html.find("#nmbr_time")[0]?.value || 0);
        
        //Kampfwert
        raufen = token.actor.items.find(item => item.name === "Raufen");
        taw = raufen.system.value;

        atMod = (taw > 5 && zfw > at * 0.5)? Math.ceil(taw * 0.5) : 0;
        paMod = (taw > 5 && zfw > pa * 0.5)? Math.floor(taw * 0.5) : 0;
        
        
        tawAt = raufen.system.combat.attack;
        tawPa = raufen.system.combat.parry;
        atBase = token.actor.system.base.combatAttributes.active.baseAttack.value;
        paBase = token.actor.system.base.combatAttributes.active.baseParry.value;
        doBase = token.actor.system.base.combatAttributes.active.dodge.value;
        iniBase = token.actor.system.base.combatAttributes.active.baseInitiative.value;
        
        tempAt = zfAt - atBase - tawAt + atMod;
        tempPa = zfPa - paBase - tawPa + paMod;
        tempDo = zfPa - doBase - tawPa + paMod;
        tempMove = gs - baseGs
               
        await applyEffect(token, time, raufen, tempAt, tempPa, tempDo, tempMove,tempDex,tempAgi,tempCon,tempStr, rs);
    };
    




    function applyEffect(token, time, raufen, tempAt, tempPa , tempDo, tempMove,tempRs,tempDex,tempAgi,tempCon,tempStr) {
        
        effectData = [
            
            {
                key: "system.base.basicAttributes.dexterity.value",
                value: tempDex,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },{
                key: "system.base.basicAttributes.agility.value",
                value: tempAgi,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.basicAttributes.constitution.value",
                value: tempCon,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.basicAttributes.strength.value",
                value: tempStr,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.baseAttack.value",
                value: tempAt,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.baseParry.value",
                value: tempPa,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.active.dodge.value",
                value: tempDo,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.combatAttributes.passive.physicalResistance.value",
                value: rs,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD
            },
            {
                key: "system.base.movement.speed.value",
                value: tempMove,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            },
       
        ];
        effectDuration = time * 60 * 60;
        effect = {
            label: "Wolfsgestalt",
            icon: "modules/game-icons-net/whitetransparent/wolf-head.svg",
            changes: effectData,
            duration: {
                "seconds": effectDuration,
                },
            flags: {
                core: {
                    statusId: "Wolfsgestalt"
                }
            },
        };
     return token.actor.createEmbeddedDocuments("ActiveEffect", [effect])
    };  
 
};