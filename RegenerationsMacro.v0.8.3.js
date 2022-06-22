//Nächtliche Regeneration v0.8.3
/** 
Makro zur Vereinfachung der nächtlichen Regeneration
Berücksichtigt Vorteile (Schnelle Heilung, Astrale Regeneration), Nachteile (Verwöhnt, Schlechte Heilung, Astraler Block, Schlafwandler, Schlafstörung), Sonderfertigkeit (Regeneration) sowie äußere Einflusse (Schlafplatz, Wachehalten, Ruhestörung, Erkrankung) - werden automatisch ausgewählt, wenn im Token oder Actor angelegt sind. 
**/ 
main()

async function main(){

	//Überprüfe, ob ein Token ausgewählt wurde
	if(canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1){
		ui.notifications.error("Bitte einen Token auswählen.");
		return;
	}
	
	//Charakter Werte
	let tokenName = token.actor.data.name;
	
	let lepValue = token.actor.data.data.base.resources.vitality.value;
	let lepMax = token.actor.data.data.base.resources.vitality.max;
	let aspValue = token.actor.data.data.base.resources.astralEnergy.value;
	let aspMax = token.actor.data.data.base.resources.astralEnergy.max;
	let kapValue = token.actor.data.data.base.resources.karmicEnergy.value;
	let kapMax = token.actor.data.data.base.resources.karmicEnergy.max;
	let aupValue = token.actor.data.data.base.resources.endurance.value;
	let aupMax = token.actor.data.data.base.resources.endurance.max;

	let constValue = token.actor.data.data.base.basicAttributes.constitution.value;
	let intuValue = token.actor.data.data.base.basicAttributes.intuition.value;
	let cleverValue = token.actor.data.data.base.basicAttributes.cleverness.value;
	
	
	////Vor-/Nachtteile/SF
	let verwohnt = token.actor.items.find(item => item.data.name == "Verwöhnt");
	let schnHeil = token.actor.items.find(item => item.data.name == "Schnelle Heilung");
	let schlHeil = token.actor.items.find(item => item.data.name == "Schlechte Regeneration");
	let astraReg = token.actor.items.find(item => item.data.name == "Astrale Regeneration");
	let astraBlock = token.actor.items.find(item => item.data.name == "Astraler Block");
	let sfReg1 = token.actor.items.find(item => item.data.name == "Regeneration I");
	let sfReg2 = token.actor.items.find(item => item.data.name == "Regeneration II");
	let sfReg3 = token.actor.items.find(item => item.data.name == "Meisterliche Regeneration");
	let schlafwandler = token.actor.items.find(item => item.data.name == "Schlafwandler");
	let schlafstorung = token.actor.items.find(item => item.data.name == "Schlafstörungen");
	

	//Dialog-input
	////general use
	let hr = "<hr>";
	let divFlexStart = "<div style='display:flex'><span style='flex:1'>";
	let divFlexEnd = "</span></div>";
	let divInputNumber = "type='number' style='width:50px;float:right' value=0 />";
	let divInputBox = "type='checkbox' style='width:70px;float:right' ";
	let divInputUnchecked = "/>";
	let divInputChecked = "checked />";
	
	
	////Number inputs
	let headerDialog = "<h2> Nächtliche Regeneration von<br><i>" + tokenName + "</i></h2>";
	let lepModDialog = divFlexStart + "LeP-Modifikator <input id='lepFillMod'" + divInputNumber + divFlexEnd;
	let aspModDialog = divFlexStart + "AsP-Modifikator <input id='aspFillMod'" + divInputNumber + divFlexEnd;
	let kapModDialog = divFlexStart + "KaP-Modifikator <input id='kapFillMod'" + divInputNumber + divFlexEnd;
	let constModDialog = divFlexStart + "KO-Modifikator <input id='constFillMod'" + divInputNumber + divFlexEnd;
	let intuModDialog = divFlexStart + "IN-Modifikator <input id='intuFillMod'" + divInputNumber + divFlexEnd;

	////Checkbox inputs
	let unruheDialog = divFlexStart + "Ruhestörung <input id='unruhe'" + divInputBox + divInputUnchecked+ divFlexEnd;
	let wacheDialog = divFlexStart + "Wache gehalten <input id='wache'" + divInputBox + divInputUnchecked + divFlexEnd;
	let krankDialog = divFlexStart + "Erkrankt <input id='krank'" + divInputBox + divInputUnchecked + divFlexEnd;
	
	////Dropdown inputs
	let platzDialog = divFlexStart + `
		<form action"#">
			<label for="platz">Schlafplatz</label>
			<select name="schlafplatz" id="platz" style="float:right">
				<option value="worse">schlechter Lagerplatz -1/-1</option>
				<option value="low" selected>Schlafsaal +0/+0</option>
				<option value="mid">Einzelzimmer +1/+1</option>
				<option value="high">Suite +2/+2</option>
			</select>
		</form>
	` + divFlexEnd;
	
	////Vor-/Nachtteile/SF Input mit autofill
	let schlafRoll = new Roll('1d20').roll({async:true});
	schlafRoll.then(roll => {	

		var rollWandelValue = roll.dice[0].values[0];
		
		if(schlafwandler == undefined ||schlafwandler == null){
			var wandelCheck = divInputUnchecked;
			var wandelOutput = "";
		}else{
			roll.toMessage({
				flavor:"Schlafwandler", 
				speaker: ChatMessage.getSpeaker({token: token.document})
			});
			if(rollWandelValue <= 5){
				var wandelCheck = divInputChecked;
				var wandelOutput = "<span style='color:#800;'> w20: " + rollWandelValue + "</span>";
				ui.notifications.warn("Schlafwandel wurde ausgelöst!");
			}else{
				var wandelCheck = divInputUnchecked;
				var wandelOutput = "<span style='color:#888;'> w20: " + rollWandelValue + "</span>";
			};
		};
		let wandelDialog = divFlexStart + "Schlafwandeln <input id='wandel'" + divInputBox + wandelCheck + wandelOutput + divFlexEnd;
		
		let schlafstorungRoll = new Roll('1d20').roll({async:true});
		schlafstorungRoll.then(roll => {		
			
			var rollStorungValue = roll.dice[0].values[0];
			if(schlafstorung == undefined ||schlafstorung == null){
				var insomniaCheck = divInputUnchecked;
				var insomniaDialogOutput = "";
			}else{
				var schlafstorungValue = schlafstorung.data.data.value
				roll.toMessage({
					flavor:"Schlafstörung " + schlafstorungValue, 
					speaker: ChatMessage.getSpeaker({token: token.document})
				});
				if(schlafstorungValue == 1){
					if(rollStorungValue <= 5){
						var insomniaCheck = divInputChecked;
						var insomniaDialogOutput = " " + schlafstorungValue + "<span style='color:#800;'> w20: " + rollStorungValue + "</span>";
					ui.notifications.warn("Schlafstörung wurde ausgelöst!");
					}else{
						var insomniaCheck = divInputUnchecked;
						var insomniaDialogOutput = " " + schlafstorungValue + "<span style='color:#888;'> w20: " + rollStorungValue + "</span>";
					};
				}else{
					if(rollStorungValue <= 10){
						var insomniaCheck = divInputChecked;
						var insomniaDialogOutput = " " + schlafstorungValue + "<span style='color:#800;'> w20: " + rollStorungValue + "</span>";
					ui.notifications.warn("Schlafstörung wurde ausgelöst!");
					}else{
						var insomniaCheck = divInputUnchecked;
						var insomniaDialogOutput = " " + schlafstorungValue + "<span style='color:#888;'> w20: " + rollStorungValue + "</span>";
					};
				};
				
				
			};		
			let insomniaDialog = divFlexStart + "Schlafstörung <input id='insomnia'" + divInputBox + insomniaCheck + insomniaDialogOutput + divFlexEnd;

			
			if(schlHeil == undefined || schlHeil == null){
				var schlHeilCheck = divInputUnchecked;
			}else{
				var schlHeilCheck = divInputChecked;
			};	
			let schlHeilDialog = divFlexStart + "Schlechte Heilung <input id='badReg'" + divInputBox + schlHeilCheck + divFlexEnd;
			
			
			if(astraBlock == undefined || astraBlock == null){
				var astraBlockCheck = divInputUnchecked;
			}else{
				var astraBlockCheck = divInputChecked;
			};
			let astraBlockDialog = divFlexStart + "Astraler Block <input id='astraBlock'" + divInputBox + astraBlockCheck + divFlexEnd;
			
			
			if(schnHeil == undefined || schnHeil == null){
				var schnHeilValue = 0;
			}else{
				var schnHeilValue = schnHeil.data.data.value;
			};	

			var schnHeilSel0 = "";
			var schnHeilSel1 = "";
			var schnHeilSel2 = "";
			var schnHeilSel3 = "";
			switch(schnHeilValue){
				case 0: 
					var schnHeilSel0 = "selected";
					break;
				case 1: 
					var schnHeilSel1 = "selected";
					break;
				case 2: 
					var schnHeilSel2 = "selected";
					break;
				case 3: 
					var schnHeilSel3 = "selected";
					break;
			};	
			let schnHeilDialog = divFlexStart + ` 
				<form action"#">
					<label for="fastReg">Schnelle Heilung</label>
					<select name="schnelle reg" id="fastReg" style="float:right; width: 50px;">
						<option value="0"` + schnHeilSel0 + `>0</option>
						<option value="1"` + schnHeilSel1 + `>I</option>
						<option value="2"` + schnHeilSel2 + `>II</option>
						<option value="3"` + schnHeilSel3 + `>III</option>
					</select>
				</form>
			` + divFlexEnd;
			
			
			if(astraReg == undefined || astraReg == null){
				var astraRegValue = 0;
			}else{
				var astraRegValue = astraReg.data.data.value;
			};	
			var astraRegSel0 = ""
			var astraRegSel1 = ""
			var astraRegSel2 = ""
			var astraRegSel3 = ""
			switch(astraRegValue){
				case 0: 
					var astraRegSel0 = "selected";
					break;
				case 1: 
					var astraRegSel1 = "selected";
					break;
				case 2: 
					var astraRegSel2 = "selected";
					break;
				case 3: 
					var astraRegSel3 = "selected";
					break;
			};		
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

			if(sfReg2 == undefined || sfReg2 == null){
				if(sfReg1 == undefined || sfReg1 == null){
					var sfRegValue = 0
				}else{
					var sfRegValue = 1
				};
			}else{
				if(sfReg3 == undefined || sfReg3 == null){
					var sfRegValue = 2
				}else{
					var sfRegValue = 3
				};
			};
			var sfRegSel0 = "";
			var sfRegSel1 = "";
			var sfRegSel2 = "";
			var sfRegSel3 = "";
			var sfRegSel4 = "";
			switch(sfRegValue){
				case 0: 
					var sfRegSel0 = "selected";
					break;
				case 1: 
					var sfRegSel1 = "selected";
					break;
				case 2: 
					var sfRegSel2 = "selected";
					break;
				case 3: 
					var sfRegSel3 = "selected";
					break;
			};		
			let sfRegDialog = divFlexStart + ` 
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
			
			if(verwohnt == undefined || verwohnt == null){
				var verwohntValue = 0;
			}else{
				var verwohntValue = verwohnt.data.data.value;
			};	
			var verwohntSel0 = "";
			var verwohntSel1 = "";
			var verwohntSel2 = "";
			var verwohntSel3 = "";
			var verwohntSel4 = "";
			var verwohntSel5 = "";
			var verwohntSel6 = "";
			var verwohntSel7 = "";
			var verwohntSel8 = "";
			var verwohntSel9 = "";
			var verwohntSel10 = "";
			var verwohntSel11 = "";
			var verwohntSel12 = "";
			switch(verwohntValue){
				case 0: 
					var verwohntSel0 = "selected"
					break;
				case 1: 
					var verwohntSel1 = "selected"
					break;
				case 2: 
					var verwohntSel2 = "selected"
					break;
				case 3: 
					var verwohntSel3 = "selected"
					break;
				case 4: 
					var verwohntSel4 = "selected"
					break;
				case 5: 
					var verwohntSel5 = "selected"
					break;
				case 6: 
					var verwohntSel6 = "selected"
					break;
				case 7: 
					var verwohntSel7 = "selected"
					break;
				case 8: 
					var verwohntSel8 = "selected"
					break;
				case 9: 
					var verwohntSel9 = "selected"
					break;
				case 10: 
					var verwohntSel10 = "selected"
					break;
				case 11: 
					var verwohntSel11 = "selected"
					break;
				case 12: 
					var verwohntSel12 = "selected"
					break;
			};
			let verwohntDialog = divFlexStart+ `
				<form action"#">
					<label for="tantrum">Verwöhnt</label>
					<select name="tantrumN" id="tantrum" style="float:right; width: 50px;">
						<option value="0"` + verwohntSel0 + `>0</option>
						<option value="1"` + verwohntSel1 + `>1</option>
						<option value="2"` + verwohntSel2 + `>2</option>
						<option value="3"` + verwohntSel3 + `>3</option>
						<option value="4"` + verwohntSel4 + `>4</option>
						<option value="5"` + verwohntSel5 + `>5</option>
						<option value="6"` + verwohntSel6 + `>6</option>
						<option value="7"` + verwohntSel7 + `>7</option>
						<option value="8"` + verwohntSel8 + `>8</option>
						<option value="9"` + verwohntSel9 + `>9</option>
						<option value="10"` + verwohntSel10 + `>10</option>
						<option value="11"` + verwohntSel11 + `>11</option>
						<option value="12"` + verwohntSel12 + `>12</option>
					</select>
				</form>
			` + divFlexEnd;

			
			//Dialog scheme
			let regenerationDialog = headerDialog + lepModDialog + aspModDialog +kapModDialog + hr + constModDialog + intuModDialog + verwohntDialog + hr + schnHeilDialog + schlHeilDialog + hr + sfRegDialog + astraRegDialog + astraBlockDialog + hr + platzDialog + unruheDialog + wacheDialog + wandelDialog + insomniaDialog + hr + krankDialog;

			//Dialog-Fenster
			new Dialog({
				title: "Nächtliche Regeneration",
				content: regenerationDialog,
				buttons: {
					close: {
						icon: '<i class="fas fa-times"></i>',
						label: "Schließen"
					},
					accept: {
						icon: '<i class="fas fa-check"></i>',
						label: "Würfeln",
						callback: (html) => {
							
							//Input übernehmen und überprüfen
							var lepFInput = html.find("#lepFillMod")[0].valueAsNumber;
							var aspFInput = html.find("#aspFillMod")[0].valueAsNumber;
							var kapFInput = html.find("#kapFillMod")[0].valueAsNumber;
							var constFInput = html.find("#constFillMod")[0].valueAsNumber;
							var intuFInput = html.find("#intuFillMod")[0].valueAsNumber;
							var tantrumInput = Number(html.find("#tantrum")[0].value);
							var fastRegInput = Number(html.find("#fastReg")[0].value);
							var badRegInput = html.find("#badReg")[0].checked;
							var sfRegInput = Number(html.find("#sfReg")[0].value);
							var astraRegInput = Number(html.find("#astraReg")[0].value);
							var astraBlockInput = html.find("#astraBlock")[0].checked;
							var placeInput = html.find("#platz")[0].value;
							var disturbedInput = html.find("#unruhe")[0].checked;
							var guardingInput = html.find("#wache")[0].checked;
							var wandelInput = html.find("#wandel")[0].checked;	
							var insomniaInput = html.find("#insomnia")[0].checked;
							var sickInput = html.find("#krank")[0].checked;
							
							if(isNaN(lepFInput) || lepFInput === ""){
								var lepFInput = 0;
								var lepFOutput = "<span style='color:#800000;'>FEHLER: Manuelle LeP-Eingabe nicht übernommen.</span> <br>";
							}else{
								var lepFOutputH = lepFInput + " LeP (manuelle Eingabe)<br>";
								if(lepFInput < 0){
									var lepFOutput = lepFOutputH;
								}else{
									var lepFOutput = "+" + lepFOutputH;
								};
							};					
							if(isNaN(aspFInput) || aspFInput === ""){
								var aspFInput = 0;
								var aspFOutput = "<span style='color:#800000;'>FEHLER: Manuelle AsP-Eingabe nicht übernommen.</span> <br>";
							}else{
								var aspFOutputH = aspFInput + " AsP (manuelle Eingabe)<br>";
								if(aspFInput < 0){
									var aspFOutput = aspFOutputH;
								}else{
									var aspFOutput = "+" + aspFOutputH;
								};
							};					
							if(isNaN(kapFInput) || kapFInput === ""){
								var kapFInput = 0;
								var kapFOutput = "<span style='color:#800000;'>FEHLER: Manuelle KaP-Eingabe nicht übernommen.</span> <br>";
							}else{
								var kapFOutputH = kapFInput + " KaP (manuelle Eingabe)<br>";
								if(kapFInput < 0){
									var kapFOutput = kapFOutputH;
								}else{
									var kapFOutput = "+" + kapFOutputH;
								};
							};					
							if(isNaN(constFInput) || constFInput === ""){
								var constFInput = 0;
								var constFOutput = "<span style='color:#800000;'>FEHLER: Manuelle KO-Eingabe nicht übernommen.</span> <br>";
							}else{
								var constFOutputH = constFInput + " KO (manuelle Eingabe)<br>";
								if(constFInput < 0){
									var constFOutput = constFOutputH;
								}else{
									var constFOutput = "+" + constFOutputH;
								};
							};					
							if(isNaN(intuFInput) || intuFInput === ""){
								var intuFInput = 0;
								var intuFOutput = "<span style='color:#800000;'>FEHLER: Manuelle IN-Eingabe nicht übernommen.</span> <br>";
							}else{
								var intuFOutputH = intuFInput + " IN (manuelle Eingabe)<br>";
								if(intuFInput < 0){
									var intuFOutput = intuFOutputH;
								}else{
									var intuFOutput = "+" + intuFOutputH;
								};
							};
							
							
							//Würfelwurf
							let bigRoll = new Roll('2d6 + 2d20').roll({async:true});
							
							bigRoll.then(roll => {
								
								var rollLepValue = roll.dice[0].values[0];
								var rollAspValue = roll.dice[0].values[1];
								var rollConstValue = roll.dice[1].values[0];
								var rollIntuValue = roll.dice[1].values[1];
								var rollKapValue = 1;
								
								var rollLepOutput = "+" + rollLepValue + " LeP (1w6)<br>";
								var rollKapOutput = "+" + rollKapValue + " KaP (Basis)<br>";
								
								//Regeneration SF
								var sfRegAsp = sfRegInput;
								var sfRegOutputH = " AsP (Regeneration (SF))<br>";
								var rollAspOutputH = " AsP (1w6)<br>";

								if(sfRegInput == 3){
									var rollAspValue = Math.round(cleverValue / 3);
									var rollAspOutputH = " AsP (KL/3)<br>";
								};
								if(sfRegInput == 4){
									var rollAspValue = Math.round(intuValue / 3);
									var rollAspOutputH = " AsP (IN/3)<br>";
									var sfRegAsp = 3;
								};
								if(sfRegInput > 0){
									var sfRegOutput = "+" + sfRegAsp + sfRegOutputH;
								}else{
									var sfRegOutput = "";
								};
								var rollAspOutput = "+" + rollAspValue + rollAspOutputH;

								//Schnelle Heilung
								switch(fastRegInput){
									case 0:
										var lepRegMod = 0;
										var constRegMod = 0;
										var lepRegModOutput = "";
										var constRegModOutput = "";	
										break;
									case 1:
										var lepRegMod = 1;
										var constRegMod = -1;
										var lepRegModOutput = "+1 LeP (Schnelle Heilung I) <br>";
										var constRegModOutput = "-1 KO (Schnelle Heilung I) <br>";	
										break;
									case 2:
										var lepRegMod = 2;
										var constRegMod = -2;
										var lepRegModOutput = "+2 LeP (Schnelle Heilung II) <br>";
										var constRegModOutput = "-2 KO (Schnelle Heilung II) <br>";	
										break;
									case 3:
										var lepRegMod = 3;
										var constRegMod = -3;
										var lepRegModOutput = "+3 LeP (Schnelle Heilung III) <br>";
										var constRegModOutput = "-3 KO (Schnelle Heilung III) <br>";	
										break;
								};
								
								//Astrale Regeneration
								switch(astraRegInput){
									case 0:
										var aspRegMod = 0;
										var intuRegMod = 0;
										var aspRegModOutput = "";
										var intuRegModOutput = "";
										break;
									case 1:
										var aspRegMod = 1;
										var intuRegMod = -1;
										var aspRegModOutput = "+1 AsP (Astrale Reg. I) <br>";
										var intuRegModOutput = "-1 IN (Astrale Reg. I) <br>";	
										break;
									case 2:
										var aspRegMod = 2;
										var intuRegMod = -2;
										var aspRegModOutput = "+2 AsP (Astrale Reg. II) <br>";
										var intuRegModOutput = "-2 IN (Astrale Reg. II) <br>";	
										break;
									case 3:
										var aspRegMod = 3;
										var intuRegMod = -3;
										var aspRegModOutput = "+3 AsP (Astrale Reg. III) <br>";
										var intuRegModOutput = "-3 IN (Astrale Reg. III) <br>";	
										break;
								};	
								
								//Astraler Block
								if(astraBlockInput == false){
										var aspBlockMod = 0;
										var intuAstraBlockMod = 0;
										var astraBlockModOutput = "";
										var intuAstraBlockModOutput = "";		
								}else{
										var aspBlockMod = -1;
										var intuAstraBlockMod = 2;
										var astraBlockModOutput = "-1 AsP (Astraler Block) <br>";
										var intuAstraBlockModOutput = "+2 IN (Astraler Block) <br>";		
								};
								
								//Schlechte Regeneration
								if(badRegInput == false){
										var badLepRegMod = 0;
										var constBadRegMod = 0;
										var badLepRegModOutput = "";
										var constBadRegModOutput = "";		
								}else{
										var badLepRegMod = -1;
										var constBadRegMod = 2;
										var badLepRegModOutput = "-1 LeP (Schlechte Regeneration) <br>";
										var constBadRegModOutput = "+2 KO (Schlechte Regeneration) <br>";		
								};	
								
								//Verwöhnt ff
								if(tantrumInput != 0){
									var tantrumOutput = "+" + tantrumInput + " Verwöhnt <br>";
								}else{
									var tantrumOutput = "";
								};
								
								//Berechnung KO
								var constMod = constFInput + constRegMod + constBadRegMod + tantrumInput;
								if(constMod < 0){
									var constModOutput = "<i> " + constMod + "</i>";
								}else{
									var constModOutput = "<i> +" + constMod + "</i>";	
								};
								var constTotal = rollConstValue + constMod;
								
								if(constTotal > constValue){
									if(tantrumInput != 0){
										var constBonus = -1;
										var constBonusOutput = "-1 LeP (KO misslungen)<br>";
									}else{
										var constBonus = 0;
										var constBonusOutput = "+0 LeP (KO misslungen)<br>";
									};
									var constOutput = "KO: <span style='color:#800000;'><b>" + rollConstValue + constModOutput + "</b></span> (" + constValue +")";
								}else{
									var constBonus = 1;
									var constOutput = "KO: <span style='color:#008000;'><b>" + rollConstValue + constModOutput + "</b></span> (" + constValue +")";
									var constBonusOutput = "+1 LeP (KO gelungen)<br>"
								};

								
								//Berechnung IN
								var intuMod = intuFInput + intuRegMod + intuAstraBlockMod;
								if(intuMod < 0){
									var intuOutputAdd = "<i> " + intuMod + "</i>"
								}else{
									var intuOutputAdd = "<i> +" + intuMod + "</i>";
								};
								var intuTotal = rollIntuValue + intuMod;
								
								if(tantrumInput != 0 && constTotal > constValue){
									var intuBonus = -1;
									var intuBonusOutput = "-1 AsP (KO misslungen (Verwöhnt))<br>";
									var intuOutput = "IN: <span style='color:#888;'><b>" + rollIntuValue + intuOutputAdd + "</b></span> (" + intuValue + ")";
								}else{
									if(intuTotal > intuValue){
										var intuBonus = 0;
										var intuBonusOutput = "+0 AsP (IN misslungen)<br>";
										var intuOutput = "IN: <span style='color:#800000;'><b>" + rollIntuValue + intuOutputAdd + "</b></span> (" + intuValue + ")";
									}else{
										if(sfRegInput >= 3){
											var intuBonus= 2;
											var intuBonusOutput = "+2 AsP (IN gelungen)<br>";
										}else{
											var intuBonus = 1;
											var intuBonusOutput = "+1 AsP (IN gelungen)<br>";
										};
										var intuOutput = "IN: <span style='color:#008000;'><b>" + rollIntuValue + intuOutputAdd + "</b></span> (" + intuValue + ")";
									};							
								};
								
								
								//Schlafstörung und AuP
								if(insomniaInput == true){
									var lepInsomnia = -1;
									var aspInsomnia = -1;
									var lepInsomniaOutput = "-1 LeP (Schlafstörung)<br>";
									var aspInsomniaOutput = "-1 AsP (Schlafstörung)<br>";
									var aupHadd = Math.round(aupMax * 0.75);
									if(aupHadd < aupValue){
										var aupAdd = 0;
										var aupDetailOutput = "AuP bereits über 3/4";
										var aupUpdate = aupValue;
									}else{
										var aupadd = aupHadd - aupvalue;			
										var aupDetailOutput = "AuP über Nacht auf 3/4 regeneriert";
										var aupUpdate = aupHadd;
									};
								}else{
									var lepInsomnia = 0;
									var aspInsomnia = 0;
									var lepInsomniaOutput = "";
									var aspInsomniaOutput = "";
									var aupAdd = aupMax - aupValue;
									var aupUpdate = aupMax;
									var aupDetailOutput = "AuP über Nacht voll regeneriert";
								};
								var aupOutput = "AuP +<b>" + aupAdd + "</b>";
														
								
								//Schlafplatz-Modifikator
								switch(placeInput){
									case "worse":
										var lepPlace = -1;
										var aspPlace = -1;
										var lepPlaceOutput = "-1 LeP (Schlechter Lagerplatz)<br>";
										var aspPlaceOutput = "-1 AsP (Schlechter Lagerplatz)<br>";
										break;
									case "low":
										var lepPlace = 0;
										var aspPlace = 0;
										var lepPlaceOutput = "+0 LeP (Schlafsaal)<br>";
										var aspPlaceOutput = "+0 AsP (Schlafsaal)<br>";
										break;
									case "mid":
										var lepPlace = 1;
										var aspPlace = 1;
										var lepPlaceOutput = "+1 LeP (Einzelzimmer)<br>";
										var aspPlaceOutput = "+1 AsP (Einzelzimmer)<br>";
										break;
									case "high":
										var lepPlace = 2;
										var aspPlace = 2;
										var lepPlaceOutput = "+2 LeP (Suite)<br>";
										var aspPlaceOutput = "+2 AsP (Suite)<br>";
										break;
								};	
								
								//Ruhestörung
								if(disturbedInput == true){
									var lepDisturbed = -1;
									var aspDisturbed = -1;
									var lepDisturbedOutput = "-1 LeP (Ruhestörung)<br>";
									var aspDisturbedOutput = "-1 AsP (Ruhestörung)<br>";
								}else{
									var lepDisturbed = 0;
									var aspDisturbed = 0;
									var lepDisturbedOutput = "";
									var aspDisturbedOutput = "";
								};
								
								//Schlafwandel
								if(wandelInput == true){
									var lepWandel = -1;
									var aspWandel = -1;
									var lepWandelOutput = "-1 LeP (Schlafwandel)<br>";
									var aspWandelOutput = "-1 AsP (Schlafwandel)<br>";
								}else{
									var lepWandel = 0;
									var aspWandel = 0;
									var lepWandelOutput = "";
									var aspWandelOutput = "";
								};
								
								
								//Wache
								if(guardingInput == true){
									var lepGuarding = -1;
									var aspGuarding = -1;
									var lepGuardingOutput = "-1 LeP (Wache gehalten)<br>";
									var aspGuardingOutput = "-1 AsP (Wache gehalten)<br>";
								}else{
									var lepGuarding = 0;
									var aspGuarding = 0;
									var lepGuardingOutput = "";
									var aspGuardingOutput = "";
								};
									
								//Berechnung LeP
								var lepAdd = rollLepValue + lepFInput + constBonus + lepRegMod + badLepRegMod + lepPlace + lepDisturbed + lepGuarding + lepWandel + lepInsomnia;
								
								if(lepAdd < 0 || sickInput == true){
									var lepAdd = 0;
								};
								let newLep = lepValue + lepAdd;
								if(newLep > lepMax){
									var lepUpdate = lepMax;
									let lepAdd = lepMax - lepValue;
								} else {
									var lepUpdate = newLep;
								};
								var lepOutput = "LeP +<b>" + lepAdd + "</b>";
								
								//Berechnung AsP
								var aspAdd = rollAspValue + aspFInput + intuBonus + sfRegAsp + aspRegMod + aspBlockMod + aspPlace + aspDisturbed + aspGuarding + aspWandel + aspInsomnia;
								
								if(sickInput == true && aspAdd > 1){
									var aspAdd = 1;
								};
								if(aspAdd < 0){
									var aspAdd = 0; 
								};
								let newAsp = aspValue + aspAdd;
								if(newAsp > aspMax){
									var aspUpdate = aspMax;
									let aspAdd = aspMax - aspValue;
								} else {
									var aspUpdate = newAsp;
								};
								var aspOutput = "AsP +<b>" + aspAdd + "</b>";
								
								//Berechnung KaP
								var kapAdd = rollKapValue + kapFInput;
								if(kapAdd < 0){
									var kapAdd = 0;
								};
								let newKap = kapValue + kapAdd;

								if(newKap > kapMax){
									var kapUpdate = kapMax;
									let kapOver = kapMax - kapValue;
									var kapOutput = "KaP +<b>" + kapOver + "</b>";
								} else {
									var kapUpdate = newKap;
									var kapOutput = "KaP +<b>" + kapAdd + "</b>";
								};
								
														
								//Token-Werte aktualisieren
								token.actor.update({'data.base.resources.vitality.value': lepUpdate, 'data.base.resources.astralEnergy.value': aspUpdate, 'data.base.resources.karmicEnergy.value': kapUpdate, 'data.base.resources.endurance.value': aupUpdate});
								
								//Chatausgabe
								var lepDetailOutput = rollLepOutput + lepFOutput + constBonusOutput + lepRegModOutput + badLepRegModOutput + lepPlaceOutput + lepDisturbedOutput + lepGuardingOutput + lepWandelOutput + lepInsomniaOutput;
								var aspDetailOutput = rollAspOutput + aspFOutput + intuBonusOutput + sfRegOutput + aspRegModOutput + astraBlockModOutput + aspPlaceOutput + aspDisturbedOutput + aspGuardingOutput + aspWandelOutput + aspInsomniaOutput;
								var constDetailOutput = constFOutput  + constRegModOutput + constBadRegModOutput + tantrumOutput;
								var intuDetailOutput = intuFOutput + intuRegModOutput + intuAstraBlockModOutput;
								var kapDetailOutput = rollKapOutput + kapFOutput;

								if(sickInput == true){
									var lepDetailOutput = "Charakter ist erkrankt:<br> Keine LeP-Regeneration";
									var aspDetailOutput = "Charakter ist erkrankt:<br> AsP-Regeneration auf 1 beschränkt";
								};
								var headerMessage = "<table><tr><th colspan=2>Nächtliche Regeneration</th><tr>"
								var physMessage = "<tr><td><details closed><summary>"
									+ lepOutput +
									"</summary>"
									+ lepDetailOutput +
									"</details></td><td><details closed><summary>"
									+ constOutput +
									"</summary>"
									+ constDetailOutput +
									"</details></td></tr>";
								if(aspMax > 0){ 
									var astraMessage = "<tr><td><details closed><summary>"
										+ aspOutput +
										"</summary>"
										+ aspDetailOutput +
										"</details></td><td><details closed><summary>"
										+ intuOutput +
										"</summary>"
										+ intuDetailOutput +
										"</details></td></tr>";
								}else{
									var astraMessage = "";
								};
								if(kapMax > 0){ 
									var karmicMessage = "<tr><td><details closed><summary>"
										+ kapOutput +
										"</summary>"
										+ kapDetailOutput +
										"</details></td><td></td></tr>";
								}else{
									var karmicMessage = "";
								};
								var enduMessage = "<tr><td><details closed><summary>"
									+ aupOutput +
									"</summary>"
									+ aupDetailOutput + 
									"</details></td><td></td></tr></table>";
								
								
								var message = headerMessage + physMessage + astraMessage + karmicMessage + enduMessage;
				
								roll.toMessage({
									flavor: message, 
									speaker: ChatMessage.getSpeaker({token: token.document})	
								});
							});
						}
					}
				},
				default: "accept",
				render: html => console.log ("Regeneration wurde geöffnet"),
				close: html => console.log ("Regeneration wurde geschlossen")
			}).render(true)
			return;
		});
	});
}