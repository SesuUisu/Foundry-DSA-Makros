//Nächtliche Regeneration v0.9.3
/**
 Makro zur Vereinfachung der nächtlichen Regeneration
 Berücksichtigt Vorteile (Schnelle Heilung, Astrale Regeneration), Nachteile (Verwöhnt, Schlechte Heilung, Astraler Block, Schlafwandler, Schlafstörung), Sonderfertigkeit (Regeneration) sowie äußere Einflusse (Schlafplatz, Wachehalten, Ruhestörung, Erkrankung) - werden automatisch ausgewählt, wenn im Token oder Actor angelegt sind.
 **/
main();

async function main() {

    //Überprüfe, ob ein Token ausgewählt wurde
    if (canvas.tokens.controlled.length === 0 || canvas.tokens.controlled.length > 1) {
        ui.notifications.error("Bitte einen Token auswählen.");
        return;
    }

    //Charakter Werte
    let tokenName = token.actor.name;

    const lepValue = token.actor.system.base.resources.vitality.value;
    const lepMax = token.actor.system.base.resources.vitality.max;
    const aspValue = token.actor.system.base.resources.astralEnergy.value;
    const aspMax = token.actor.system.base.resources.astralEnergy.max;
    const kapValue = token.actor.system.base.resources.karmicEnergy.value;
    const kapMax = token.actor.system.base.resources.karmicEnergy.max;
    const aupValue = token.actor.system.base.resources.endurance.value;
    const aupMax = token.actor.system.base.resources.endurance.max;

    const constValue = token.actor.system.base.basicAttributes.constitution.value;
    const intuValue = token.actor.system.base.basicAttributes.intuition.value;
    const cleverValue = token.actor.system.base.basicAttributes.cleverness.value;

    const showLep = lepValue < lepMax;
    const showAsp = aspMax > 0 && aspValue < aspMax;
    const showKap = kapMax > 0 && kapValue < kapMax;

    ////Vor-/Nachtteile/SF
    const verwohnt = token.actor.items.find(item => item.name === "Verwöhnt");
    const schlafwandler = token.actor.items.find(item => item.name === "Schlafwandler");
    const schlafstorung = token.actor.items.find(item => item.name === "Schlafstörungen");


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
    const headerDialog = "<h2> Nächtliche Regeneration von<br><i>" + tokenName + "</i></h2>";
    let modDialog = "";
    if (showLep) {
        modDialog += divFlexStart + "LeP-Modifikator <input id='lepFillMod'" + divInputNumber + divFlexEnd;
    }
    if (showAsp) {
        modDialog += divFlexStart + "AsP-Modifikator <input id='aspFillMod'" + divInputNumber + divFlexEnd;
    }
    if (showKap) {
        modDialog += divFlexStart + "KaP-Modifikator <input id='kapFillMod'" + divInputNumber + divFlexEnd;
    }
    let attrModDialog = "";
    if (showLep) {
        attrModDialog += divFlexStart + "KO-Modifikator <input id='constFillMod'" + divInputNumber + divFlexEnd;
    }
    if (showAsp) {
        attrModDialog += divFlexStart + "IN-Modifikator <input id='intuFillMod'" + divInputNumber + divFlexEnd;
    }
    ////Checkbox inputs
    const unruheDialog = divFlexStart + "Ruhestörung <input id='unruhe'" + divInputBox + divInputUnchecked + divFlexEnd;
    const wacheDialog = divFlexStart + "Wache gehalten <input id='wache'" + divInputBox + divInputUnchecked + divFlexEnd;

    ////Dropdown inputs
    const platzDialog = divFlexStart + `
		<form action"#">
			<label for="platz">Schlafplatz</label>
			<select name="schlafplatz" id="platz" style="float:right">
				<option value="-1">schlechter Lagerplatz -1/-1</option>
				<option value="0" selected>Schlafsaal +0/+0</option>
				<option value="1">Einzelzimmer +1/+1</option>
				<option value="2">Suite +2/+2</option>
			</select>
		</form>
	` + divFlexEnd;

    let regenerationDialog = headerDialog + modDialog + hr + attrModDialog;
    ////Vor-/Nachtteile/SF Input mit autofill
    // Verwöhnt
    const verwohntDialog = createVerwohntDialog(verwohnt);
    regenerationDialog += verwohntDialog;

    if (showLep) {
        // Schlechte Regeneration und Schnelle Heilung
        const heilDialog = createHeilDialog(token);
        regenerationDialog += hr + heilDialog;
    }
    if (showAsp) {
        const aspRegDialog = createAspRegDialog(token);
        regenerationDialog += hr + aspRegDialog;
    }
    regenerationDialog += hr + platzDialog + unruheDialog + wacheDialog;
    // Schlafwandler
    if (schlafwandler) {
        regenerationDialog += createWandelDialog(schlafwandler);
    }
    // Schlafstörung
    if (schlafstorung) {
        regenerationDialog += createInsomniaDialog(schlafstorung);
    }
    const krankDialog = divFlexStart + "Erkrankt <input id='krank'" + divInputBox + divInputUnchecked + divFlexEnd;
    regenerationDialog += hr + krankDialog;
    //Dialog-Fenster
    new Dialog({
        title: "Nächtliche Regeneration",
        content: regenerationDialog,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }, accept: {
                icon: '<i class="fas fa-check"></i>', label: "Würfeln", callback: htmlCallback
            }
        },
        default: "accept",
        render: () => console.log("Regeneration wurde geöffnet"),
        close: () => console.log("Regeneration wurde geschlossen")
    }).render(true);


    function createWandelDialog(schlafwandler) {
        let wandelCheck = divInputUnchecked;
        let wandelOutput = "";
        if (schlafwandler) {
            let schlafRoll = new Roll('1d20').roll({async: false});
            const rollWandelValue = schlafRoll.terms[0].results[0].result;
            schlafRoll.toMessage({
                flavor: "Schlafwandler", speaker: ChatMessage.getSpeaker({token: token.document})
            });
            if (rollWandelValue <= 5) {
                wandelCheck = divInputChecked;
                wandelOutput = "<span style='color:#800;'> w20: " + rollWandelValue + "</span>";
                ui.notifications.warn("Schlafwandel wurde ausgelöst!");
               var table = game.tables.find(table => table.name === "Schlafwandel");
table.draw();
            } else {
                wandelCheck = divInputUnchecked;
                wandelOutput = "<span style='color:#888;'> w20: " + rollWandelValue + "</span>";
            }

        }
        return divFlexStart + "Schlafwandeln <input id='wandel'" + divInputBox + wandelCheck + wandelOutput + divFlexEnd;
    }

    function createInsomniaDialog(schlafstorung) {
        let insomniaCheck = divInputUnchecked;
        let insomniaDialogOutput = "";
        if (schlafstorung) {
            let schlafstorungRoll = new Roll('1d20').roll({async: false});
            const rollStorungValue = schlafstorungRoll.terms[0].results[0].result;
            const schlafstorungValue = schlafstorung.system.value;
            schlafstorungRoll.toMessage({
                flavor: "Schlafstörung " + schlafstorungValue,
                speaker: ChatMessage.getSpeaker({token: token.document})
            });
            insomniaCheck = divInputUnchecked;
            insomniaDialogOutput = " " + schlafstorungValue + "<span style='color:#888;'> w20: " + rollStorungValue + "</span>";
            if (schlafstorungValue === 1) {
                if (rollStorungValue <= 5) {
                    insomniaCheck = divInputChecked;
                    insomniaDialogOutput = " " + schlafstorungValue + "<span style='color:#800;'> w20: " + rollStorungValue + "</span>";
                    ui.notifications.warn("Schlafstörung wurde ausgelöst!");
                }
            } else {
                if (rollStorungValue <= 10) {
                    insomniaCheck = divInputChecked;
                    insomniaDialogOutput = " " + schlafstorungValue + "<span style='color:#800;'> w20: " + rollStorungValue + "</span>";
                    ui.notifications.warn("Schlafstörung wurde ausgelöst!");
                }
            }

        }
        return divFlexStart + "Schlafstörung <input id='insomnia'" + divInputBox + insomniaCheck + insomniaDialogOutput + divFlexEnd;
    }

    function createVerwohntDialog(verwohnt) {
        const verwohntValue = Number(verwohnt?.data.value || 0);
        return divFlexStart + `
				<form action"#">
					<label for="tantrum">Verwöhnt</label>
					<select name="tantrumN" id="tantrum" style="float:right; width: 50px;">
						<option value="0"` + (verwohntValue === 0 ? 'selected' : '') + `>0</option>
						<option value="1"` + (verwohntValue === 1 ? 'selected' : '') + `>1</option>
						<option value="2"` + (verwohntValue === 2 ? 'selected' : '') + `>2</option>
						<option value="3"` + (verwohntValue === 3 ? 'selected' : '') + `>3</option>
						<option value="4"` + (verwohntValue === 4 ? 'selected' : '') + `>4</option>
						<option value="5"` + (verwohntValue === 5 ? 'selected' : '') + `>5</option>
						<option value="6"` + (verwohntValue === 6 ? 'selected' : '') + `>6</option>
						<option value="7"` + (verwohntValue === 7 ? 'selected' : '') + `>7</option>
						<option value="8"` + (verwohntValue === 8 ? 'selected' : '') + `>8</option>
						<option value="9"` + (verwohntValue === 9 ? 'selected' : '') + `>9</option>
						<option value="10"` + (verwohntValue === 10 ? 'selected' : '') + `>10</option>
						<option value="11"` + (verwohntValue === 11 ? 'selected' : '') + `>11</option>
						<option value="12"` + (verwohntValue === 12 ? 'selected' : '') + `>12</option>
					</select>
				</form>
			` + divFlexEnd;
    }

    function createHeilDialog(token) {
        let schnHeil = token.actor.items.find(item => item.name === "Schnelle Heilung");
        let schlHeil = token.actor.items.find(item => item.name === "Schlechte Regeneration");
        // Schlechte Regeneration
        let schlHeilCheck = schlHeil ? divInputChecked : divInputUnchecked;
        const schlHeilDialog = divFlexStart + "Schlechte Heilung <input id='badReg'" + divInputBox + schlHeilCheck + divFlexEnd;
        // Schnelle Heilung
        const schnHeilValue = Number(schnHeil?.data.value || 0);


        const schnHeilDialog = divFlexStart + ` 
				<form action"#">
					<label for="fastReg">Schnelle Heilung</label>
					<select name="schnelle reg" id="fastReg" style="float:right; width: 50px;">
						<option value="0"` + (schnHeilValue === 0 ? "selected" : '') + `>0</option>
						<option value="1"` + (schnHeilValue === 1 ? "selected" : '') + `>I</option>
						<option value="2"` + (schnHeilValue === 2 ? "selected" : '') + `>II</option>
						<option value="3"` + (schnHeilValue === 3 ? "selected" : '') + `>III</option>
					</select>
				</form>
			` + divFlexEnd;
        return schlHeilDialog + schnHeilDialog;
    }

    function createAspRegDialog(token) {
        let astraReg = token.actor.items.find(item => item.name === "Astrale Regeneration");
        let astraBlock = token.actor.items.find(item => item.name === "Astraler Block");
        let sfReg1 = token.actor.items.find(item => item.name === "Regeneration I");
        let sfReg2 = token.actor.items.find(item => item.name === "Regeneration II");
        let sfReg3 = token.actor.items.find(item => item.name === "Meisterliche Regeneration");
        // Astraler Block
        let astraBlockCheck = astraBlock ? divInputChecked : divInputUnchecked;
        const astraBlockDialog = divFlexStart + "Astraler Block <input id='astraBlock'" + divInputBox + astraBlockCheck + divFlexEnd;

        // Astrale Regeneration
        let astraRegValue = astraReg?.data.value || 0;
        let astraRegSel0 = "";
        let astraRegSel1 = "";
        let astraRegSel2 = "";
        let astraRegSel3 = "";
        switch (astraRegValue) {
            case 0:
                astraRegSel0 = "selected";
                break;
            case 1:
                astraRegSel1 = "selected";
                break;
            case 2:
                astraRegSel2 = "selected";
                break;
            case 3:
                astraRegSel3 = "selected";
                break;
        }

        let astraRegDialog = divFlexStart + ` 
				<form action"#">
					<label for="astraReg">Astrale Regeneration</label>
					<select name="astraRegn" id="astraReg" style="float:right; width: 50px;">
						<option value="0"` + astraRegSel0 + `>0</option>
						<option value="1"` + astraRegSel1 + `>I</option>
						<option value="2"` + astraRegSel2 + `>II</option>
						<option value="3"` + astraRegSel3 + `>III</option>
					</select>
				</form>
			` + divFlexEnd;
        // Regeneration
        let sfRegValue = 0;
        if (sfReg3) {
            sfRegValue = 3;
        } else if (sfReg2) {
            sfRegValue = 2;
        } else if (sfReg1) {
            sfRegValue = 1;
        }


        let sfRegSel0 = "";
        let sfRegSel1 = "";
        let sfRegSel2 = "";
        let sfRegSel3 = "";
        let sfRegSel4 = "";
        switch (sfRegValue) {
            case 0:
                sfRegSel0 = "selected";
                break;
            case 1:
                sfRegSel1 = "selected";
                break;
            case 2:
                sfRegSel2 = "selected";
                break;
            case 3:
                sfRegSel3 = "selected";
                break;
        }

        const sfRegDialog = divFlexStart + ` 
				<form action"#">
					<label for="sfReg">Regeneration (SF)</label>
					<select name="sfRegn" id="sfReg" style="float:right">
						<option value="0"` + sfRegSel0 + `>0</option>
						<option value="1"` + sfRegSel1 + `>I</option>
						<option value="2"` + sfRegSel2 + `>II</option>
						<option value="3"` + sfRegSel3 + `>meisterlich (KL)</option>
						<option value="4"` + sfRegSel4 + `>meisterlich (IN)</option>
					</select>
				</form>
			` + divFlexEnd;
        return astraBlockDialog + astraRegDialog + sfRegDialog;
    }

    function createLepRegOutput(rollLepValue, rollConstValue, html, tantrumInput, placeInput, disturbedInput, wandelInput, insomniaInput, guardingInput, sickInput) {
        let lepFInput = html.find("#lepFillMod")[0]?.valueAsNumber;
        let constFInput = html.find("#constFillMod")[0]?.valueAsNumber;
        const fastRegInput = Number(html.find("#fastReg")[0]?.value || 0);
        const badRegInput = html.find("#badReg")[0]?.checked || false;

        let lepFOutput;
        if (isNaN(lepFInput) || lepFInput === "") {
            lepFInput = 0;
            lepFOutput = "<span style='color:#800000;'>FEHLER: Manuelle LeP-Eingabe nicht übernommen.</span> <br>";
        } else {
            lepFOutput = toSignedString(lepFInput) + " LeP (manuelle Eingabe)<br>";
        }
        let constFOutput;
        if (isNaN(constFInput) || constFInput === "") {
            constFInput = 0;
            constFOutput = "<span style='color:#800000;'>FEHLER: Manuelle KO-Eingabe nicht übernommen.</span> <br>";
        } else {
            constFOutput = toSignedString(constFInput) + " KO (manuelle Eingabe)<br>";
        }
        let rollLepOutput = "+" + rollLepValue + " LeP (1w6)<br>";
        //Schnelle Heilung
        const lepRegMod = fastRegInput;
        const constRegMod = -fastRegInput;
        let lepRegModOutput = "";
        let constRegModOutput = "";
        switch (fastRegInput) {
            case 1:
                lepRegModOutput = "+1 LeP (Schnelle Heilung I) <br>";
                constRegModOutput = "-1 KO (Schnelle Heilung I) <br>";
                break;
            case 2:
                lepRegModOutput = "+2 LeP (Schnelle Heilung II) <br>";
                constRegModOutput = "-2 KO (Schnelle Heilung II) <br>";
                break;
            case 3:
                lepRegModOutput = "+3 LeP (Schnelle Heilung III) <br>";
                constRegModOutput = "-3 KO (Schnelle Heilung III) <br>";
                break;
        }
        //Schlechte Regeneration
        let badLepRegMod = 0;
        let constBadRegMod = 0;
        let badLepRegModOutput = "";
        let constBadRegModOutput = "";
        if (badRegInput == true) {
            badLepRegMod = -1;
            constBadRegMod = 2;
            badLepRegModOutput = "-1 LeP (Schlechte Regeneration) <br>";
            constBadRegModOutput = "+2 KO (Schlechte Regeneration) <br>";
        }
        //Verwöhnt ff
        let tantrumOutput = (tantrumInput > 0) ? "+" + tantrumInput + " (Verwöhnt) <br>" : "";

        //Berechnung KO
        const constMod = constFInput + constRegMod + constBadRegMod + tantrumInput;
        let constModOutput = "<i> " + toSignedString(constMod) + "</i>";
        const constTotal = rollConstValue + constMod;
        let constBonus = 0;
        let constBonusOutput = "+0 LeP (KO misslungen)<br>";
        let constOutput;
        if (constTotal > constValue) {
            if (tantrumInput > 0) {
                constBonus = -1;
                constBonusOutput = "-1 LeP (KO misslungen (Verwöhnt))<br>";
            }
            constOutput = "KO: <span style='color:#800000;'><b>" + rollConstValue + constModOutput + "</b></span> (" + constValue + ")";
        } else {
            constBonus = 1;
            constOutput = "KO: <span style='color:#008000;'><b>" + rollConstValue + constModOutput + "</b></span> (" + constValue + ")";
            constBonusOutput = "+1 LeP (KO gelungen)<br>";
        }
        //Schlafstörung
        let lepInsomnia = insomniaInput ? 1 : 0;
        let lepInsomniaOutput = insomniaInput ? "-1 LeP (Schlafstörung)<br>" : "";

        //Schlafplatz-Modifikator
        let lepPlace = placeInput;
        let lepPlaceOutput;
        switch (placeInput) {
            case -1:
                lepPlaceOutput = "-1 LeP (Schlechter Lagerplatz)<br>";
                break;
            case 0:
                lepPlaceOutput = "+0 LeP (Schlafsaal)<br>";
                break;
            case 1:
                lepPlaceOutput = "+1 LeP (Einzelzimmer)<br>";
                break;
            case 2:
                lepPlaceOutput = "+2 LeP (Suite)<br>";
                break;
        }
        //Ruhestörung
        let lepDisturbed = disturbedInput ? -1 : 0;
        let lepDisturbedOutput = disturbedInput ? "-1 LeP (Ruhestörung)<br>" : "";

        //Schlafwandel
        let lepWandel = wandelInput ? -1 : 0;
        let lepWandelOutput = wandelInput ? "-1 LeP (Schlafwandel)<br>" : "";

        //Wache
        let lepGuarding = guardingInput ? -1 : 0;
        let lepGuardingOutput = guardingInput ? "-1 LeP (Wache gehalten)<br>" : "";
        //Berechnung LeP
        let lepAdd = Math.max(rollLepValue + lepFInput + constBonus + lepRegMod + badLepRegMod + lepPlace + lepDisturbed + lepGuarding + lepWandel + lepInsomnia, 0);

        if (sickInput === true) {
            lepAdd = 0;
        }

        let newLep = lepValue + lepAdd;
        let lepUpdate = newLep;

        if (newLep > lepMax) {
            lepUpdate = lepMax;
            lepAdd = lepMax - lepValue;
        }
        const lepOutput = "LeP +<b>" + lepAdd + "</b>";
        let lepDetailOutput = rollLepOutput + lepFOutput + constBonusOutput + lepRegModOutput + badLepRegModOutput + lepPlaceOutput + lepDisturbedOutput + lepGuardingOutput + lepWandelOutput + lepInsomniaOutput;
        if (sickInput == true) {
            lepDetailOutput = "Charakter ist erkrankt:<br> Keine LeP-Regeneration";
        }
        const constDetailOutput = constFOutput + constRegModOutput + constBadRegModOutput + tantrumOutput;
        return [lepUpdate, lepOutput, constOutput, lepDetailOutput, constDetailOutput];
    }

    function createAspRegOutput(rollAspValue, rollIntuValue, html, tantrumInput, placeInput, disturbedInput, wandelInput, insomniaInput, guardingInput, sickInput) {
        let aspFInput = html.find("#aspFillMod")[0]?.valueAsNumber;
        let intuFInput = html.find("#intuFillMod")[0]?.valueAsNumber;
        const sfRegInput = Number(html.find("#sfReg")[0]?.value || 0);
        const astraRegInput = Number(html.find("#astraReg")[0]?.value || 0);
        const astraBlockInput = html.find("#astraBlock")[0]?.checked || false;
        let aspFOutput;

        if (isNaN(aspFInput) || aspFInput === "") {
            aspFInput = 0;
            aspFOutput = "<span style='color:#800000;'>FEHLER: Manuelle AsP-Eingabe nicht übernommen.</span> <br>";
        } else {
            aspFOutput = toSignedString(aspFInput) + " AsP (manuelle Eingabe)<br>";
        }
        let intuFOutput;
        if (isNaN(intuFInput) || intuFInput === "") {
            intuFInput = 0;
            intuFOutput = "<span style='color:#800000;'>FEHLER: Manuelle IN-Eingabe nicht übernommen.</span> <br>";
        } else {
            intuFOutput = toSignedString(intuFInput) + " IN (manuelle Eingabe)<br>";
        }
        //Regeneration SF
        let sfRegAsp = sfRegInput;
        let sfRegOutputH = " AsP (Regeneration (SF))<br>";
        let rollAspOutputH = " AsP (1w6)<br>";

        if (sfRegInput === 3) {
            rollAspValue = Math.round(cleverValue / 3);
            rollAspOutputH = " AsP (KL/3)<br>";
        } else if (sfRegInput === 4) {
            rollAspValue = Math.round(intuValue / 3);
            rollAspOutputH = " AsP (IN/3)<br>";
            sfRegAsp = 3;
        }
        const sfRegOutput = toSignedString(sfRegAsp) + sfRegOutputH;
        const rollAspOutput = "+" + rollAspValue + rollAspOutputH;
        //Astrale Regeneration
        let aspRegMod = 0;
        let intuRegMod = 0;
        let aspRegModOutput = "";
        let intuRegModOutput = "";
        switch (astraRegInput) {
            case 1:
                aspRegMod = 1;
                intuRegMod = -1;
                aspRegModOutput = "+1 AsP (Astrale Reg. I) <br>";
                intuRegModOutput = "-1 IN (Astrale Reg. I) <br>";
                break;
            case 2:
                aspRegMod = 2;
                intuRegMod = -2;
                aspRegModOutput = "+2 AsP (Astrale Reg. II) <br>";
                intuRegModOutput = "-2 IN (Astrale Reg. II) <br>";
                break;
            case 3:
                aspRegMod = 3;
                intuRegMod = -3;
                aspRegModOutput = "+3 AsP (Astrale Reg. III) <br>";
                intuRegModOutput = "-3 IN (Astrale Reg. III) <br>";
                break;
        }
        //Astraler Block
        let aspBlockMod = 0;
        let intuAstraBlockMod = 0;
        let astraBlockModOutput = "";
        let intuAstraBlockModOutput = "";
        if (astraBlockInput === true) {
            aspBlockMod = -1;
            intuAstraBlockMod = 2;
            astraBlockModOutput = "-1 AsP (Astraler Block) <br>";
            intuAstraBlockModOutput = "+2 IN (Astraler Block) <br>";
        }

        //Verwöhnt ff
        const tantrumOutput = (tantrumInput > 0) ? "+" + tantrumInput + " (Verwöhnt) <br>" : "";

        //Berechnung IN
        let intuMod = intuFInput + intuRegMod + intuAstraBlockMod + tantrumInput;
        const intuOutputAdd = "<i> " + toSignedString(intuMod) + "</i>";
        const intuTotal = rollIntuValue + intuMod;
        let intuBonus;
        let intuBonusOutput;
        let intuOutput;
        if (intuTotal > intuValue) {
            if (tantrumInput > 0) {
                intuBonus = -1;
                intuBonusOutput = "-1 AsP (IN misslungen (Verwöhnt))<br>";
                intuOutput = "IN: <span style='color:#888;'><b>" + rollIntuValue + intuOutputAdd + "</b></span> (" + intuValue + ")";
            } else {
                intuBonus = 0;
                intuBonusOutput = "+0 AsP (IN misslungen)<br>";
                intuOutput = "IN: <span style='color:#800000;'><b>" + rollIntuValue + intuOutputAdd + "</b></span> (" + intuValue + ")";
            }
        } else {
            if (sfRegInput >= 3) {
                intuBonus = 2;
                intuBonusOutput = "+2 AsP (IN gelungen)<br>";
            } else {
                intuBonus = 1;
                intuBonusOutput = "+1 AsP (IN gelungen)<br>";
            }
            intuOutput = "IN: <span style='color:#008000;'><b>" + rollIntuValue + intuOutputAdd + "</b></span> (" + intuValue + ")";
        }

        //Schlafstörung und AuP
        const aspInsomnia = insomniaInput ? -1 : 0;
        const aspInsomniaOutput = insomniaInput ? "-1 AsP (Schlafstörung)<br>" : "";

        //Schlafplatz-Modifikator
        let aspPlace = placeInput;
        let aspPlaceOutput;
        switch (placeInput) {
            case -1:
                aspPlaceOutput = "-1 AsP (Schlechter Lagerplatz)<br>";
                break;
            case 0:
                aspPlaceOutput = "+0 AsP (Schlafsaal)<br>";
                break;
            case 1:
                aspPlaceOutput = "+1 AsP (Einzelzimmer)<br>";
                break;
            case 2:
                aspPlaceOutput = "+2 AsP (Suite)<br>";
                break;
        }
        //Ruhestörung
        const aspDisturbed = disturbedInput ? -1 : 0;
        const aspDisturbedOutput = disturbedInput ? "-1 AsP (Ruhestörung)<br>" : "";

        //Schlafwandel
        const aspWandel = wandelInput ? -1 : 0;
        const aspWandelOutput = wandelInput ? "-1 AsP (Schlafwandel)<br>" : "";

        //Wache
        const aspGuarding = guardingInput ? -1 : 0;
        const aspGuardingOutput = guardingInput ? "-1 AsP (Wache gehalten)<br>" : "";

        //Berechnung AsP
        let aspAdd = Math.max(rollAspValue + aspFInput + intuBonus + sfRegAsp + aspRegMod + aspBlockMod + aspPlace + aspDisturbed + aspGuarding + aspWandel + aspInsomnia, 0);

        if (sickInput === true && aspAdd > 1) {
            aspAdd = 1;
        }
        let newAsp = aspValue + aspAdd;
        let aspUpdate = newAsp;

        if (newAsp > aspMax) {
            aspUpdate = aspMax;
            aspAdd = aspMax - aspValue;
        }
        const aspOutput = "AsP +<b>" + aspAdd + "</b>";
        let aspDetailOutput = rollAspOutput + aspFOutput + intuBonusOutput + sfRegOutput + aspRegModOutput + astraBlockModOutput + aspPlaceOutput + aspDisturbedOutput + aspGuardingOutput + aspWandelOutput + aspInsomniaOutput;
        const intuDetailOutput = intuFOutput + intuRegModOutput + intuAstraBlockModOutput + tantrumOutput;

        if (sickInput == true) {
            aspDetailOutput = "Charakter ist erkrankt:<br> AsP-Regeneration auf 1 beschränkt";
        }
        return [aspUpdate, aspOutput, intuOutput, aspDetailOutput, intuDetailOutput];
    }

    function createKapRegOutput(html) {
        //Berechnung KaP
        const kapFInput = html.find("#kapFillMod")[0]?.valueAsNumber;
        const rollKapValue = 1;
        const rollKapOutput = "+" + rollKapValue + " KaP (Basis)<br>";
        let kapFOutput;
        let kapAdd = rollKapValue;
        if (isNaN(kapFInput) || kapFInput === "") {
            kapFOutput = "<span style='color:#800000;'>FEHLER: Manuelle KaP-Eingabe nicht übernommen.</span> <br>";
        } else {
            kapFOutput = toSignedString(kapFInput) + " KaP (manuelle Eingabe)<br>";
            kapAdd += kapFInput;
        }
        if (kapAdd < 0) {
            kapAdd = 0;
        }
        let newKap = kapValue + kapAdd;
        let kapUpdate = newKap;
        if (newKap > kapMax) {
            kapUpdate = kapMax;
            kapAdd = kapMax - kapValue;
        }
        const kapOutput = "KaP +<b>" + kapAdd + "</b>";
        const kapDetailOutput = rollKapOutput + kapFOutput;
        return [kapUpdate, kapOutput, kapDetailOutput];
    }

    function createAupRegOutput(insomniaInput, aupvalue) {
        //Schlafstörung und AuP
        let aupAdd;
        let aupUpdate;
        let aupDetailOutput;
        if (insomniaInput == true) {
            const aupHadd = Math.round(aupMax * 0.75);
            if (aupHadd < aupvalue) {
                aupAdd = 0;
                aupDetailOutput = "AuP bereits über 3/4";
                aupUpdate = aupvalue;
            } else {
                aupAdd = aupHadd - aupvalue;
                aupDetailOutput = "AuP über Nacht auf 3/4 regeneriert";
                aupUpdate = aupHadd;
            }
        } else {
            aupAdd = aupMax - aupvalue;
            aupUpdate = aupMax;
            aupDetailOutput = "AuP über Nacht voll regeneriert";
        }
        const aupOutput = "AuP +<b>" + aupAdd + "</b>";
        return [aupUpdate, aupOutput, aupDetailOutput];
    }

    async function htmlCallback(html) {
        const tantrumInput = Number(html.find("#tantrum")[0]?.value || 0);
        const placeInput = Number(html.find("#platz")[0].value);
        const disturbedInput = html.find("#unruhe")[0].checked;
        const guardingInput = html.find("#wache")[0].checked;
        const wandelInput = html.find("#wandel")[0]?.checked || false;
        const insomniaInput = html.find("#insomnia")[0]?.checked || false;
        const sickInput = html.find("#krank")[0].checked;

        //Würfelwurf
        let bigRoll = new Roll(buildRollExp(showLep, showAsp)).roll({async: true});
        bigRoll.then(roll => {
            const [rollLepValue, rollConstValue, rollAspValue, rollIntuValue] = getRollValues(roll, showLep, showAsp);
            const [lepUpdate, lepOutput, constOutput, lepDetailOutput, constDetailOutput] = createLepRegOutput(rollLepValue, rollConstValue, html, tantrumInput, placeInput, disturbedInput, wandelInput, insomniaInput, guardingInput, sickInput);
            const [aspUpdate, aspOutput, intuOutput, aspDetailOutput, intuDetailOutput] = createAspRegOutput(rollAspValue, rollIntuValue, html, tantrumInput, placeInput, disturbedInput, wandelInput, insomniaInput, guardingInput, sickInput);
            const [kapUpdate, kapOutput, kapDetailOutput] = createKapRegOutput(html);
            const [aupUpdate, aupOutput, aupDetailOutput] = createAupRegOutput(insomniaInput, aupValue);
            //Token-Werte aktualisieren
            token.actor.update({
                'system.base.resources.vitality.value': lepUpdate,
                'system.base.resources.astralEnergy.value': aspUpdate,
                'system.base.resources.karmicEnergy.value': kapUpdate,
                'system.base.resources.endurance.value': aupUpdate
            });
            //Chatausgabe
            let message = "<table><tr><th colspan=2>Nächtliche Regeneration</th><tr>";
            if (showLep) {
                const physMessage = "<tr><td><details><summary>" + lepOutput + "</summary>" + lepDetailOutput + "</details></td><td><details ><summary>" + constOutput + "</summary>" + constDetailOutput + "</details></td></tr>";
                message += physMessage;
            }
            if (showAsp) {
                const astraMessage = "<tr><td><details ><summary>" + aspOutput + "</summary>" + aspDetailOutput + "</details></td><td><details ><summary>" + intuOutput + "</summary>" + intuDetailOutput + "</details></td></tr>";
                message += astraMessage;
            }
            if (showKap) {
                const karmicMessage = "<tr><td><details ><summary>" + kapOutput + "</summary>" + kapDetailOutput + "</details></td><td></td></tr>";
                message += karmicMessage;
            }
            const enduMessage = "<tr><td><details ><summary>" + aupOutput + "</summary>" + aupDetailOutput + "</details></td><td></td></tr></table>";
            message += enduMessage;

            roll.toMessage({
                flavor: message, speaker: ChatMessage.getSpeaker({token: token.document})
            });
        });
    }

    function toSignedString(n) {
        return (n > 0 ? '+' : '') + n.toString();
    }

    function buildRollExp(showLep, showAsp) {
        let roll = [];
        if (showLep) {
            roll.push('1d6');
            roll.push('1d20');
        }
        if (showAsp) {
            roll.push('1d6');
            roll.push('1d20');
        }
        return '{' + roll.join(',') + '}';
    }

    function getRollValues(roll, showLep, showAsp) {
        let rollLepValue = 0;
        let rollConstValue = 0;
        let rollAspValue = 0;
        let rollIntuValue = 0;
        if (showLep) {
            rollLepValue = roll.dice[0].values[0];
            rollConstValue = roll.dice[1].values[0];
        }
        if (showLep && showAsp) {
            rollAspValue = roll.dice[2].values[0];
            rollIntuValue = roll.dice[3].values[0];
        } else if (showAsp && !showLep) {
            rollAspValue = roll.dice[0].values[0];
            rollIntuValue = roll.dice[1].values[0];
        }
        return [rollLepValue, rollConstValue, rollAspValue, rollIntuValue];
    }
}