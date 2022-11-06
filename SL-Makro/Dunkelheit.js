// Dunkelheitseinstellung v0.0.1

main ();

async function main(){
    const currentDarkness = canvas.scene.darkness;
    const currentDarknessLevel = Math.round(currentDarkness * 16);
    const cssContent = `
        <style>
            .descField {
                display: flex;
                float: left;
                width: 18%;
            }
            .descField2 {
                display: flex;
                float: left;
                width: 25%;
            }
            .descField3 {
                float: left
                width: 12%;
                text-align: right;
            }
        </style>
    `;
    const dialogContent = `
        <form>
            <div>
                <label>Dunkelheitsstufe:</label>
                <input type="range" min="0" max="16" value="` + currentDarknessLevel + `" class="slider" id="darknessSlider" name="darknessSlider">
            </div>
        </form>
    `; 
    const dialogContentDesc = `
        <div class="descField" title="Stufe 0">🠕 <br>Tageslicht</div>
        <div class="descField" title="Stufe 3">🠕 <br>Dämmerung</div>
        <div class="descField2" title="Stufe 6">🠕 <br>Vollmondnacht</div>
        <div class="descField" title="Stufe 10">🠕 <br>mondlose Nacht</div>
        <div class="descField3" title="Stufe 16">🠕 <br>Finsternis</div>
    `; 
    
    new Dialog({
        title: "Dunkelheitseinstellung",
        content: cssContent + dialogContent + dialogContentDesc + "<hr>",
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>', label: "Schließen"
            }, 
            accept: {
                icon: '<i class="fas fa-check"></i>', label: "Anwenden", callback: htmlCallback
                }
            },
        default: "accept",
        render: () => console.log(""),
        close: () => console.log("")
    },{width : 600}).render(true);
    
    async function htmlCallback(html){
        newDarkness = Number(html.find("#darknessSlider")[0]?.value || 0)/16;
        await canvas.scene.update({"darkness": newDarkness},{ animateDarkness: true })
    };
};