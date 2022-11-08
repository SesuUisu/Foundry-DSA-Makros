// Token im Licht v0.0.2 
/* überprüft, ob ein Token im Licht steht */

return main();

function main() {
    const tokenPositionX = token.x;
    const tokenPositionY = token.y;

    const sceneLights = canvas.scene.lights;
    const tokenLights = canvas.scene.tokens;

    const gridSize = canvas.dimensions.size;
    let activatedLight = [];
    
    //Lichter aus Szene
    sceneLights.forEach(checkSceneLights);

    function checkSceneLights(lights) {
        let lightPositionX = lights.x;
        let lightPositionY = lights.y;
        let lightRadiusBright = lights.config.bright * gridSize / 2;
        let lightRadiusDim = lights.config.dim * gridSize / 2;
        let circleCalc = Math.sqrt((tokenPositionX - lightPositionX) * (tokenPositionX - lightPositionX) + (tokenPositionY - lightPositionY) * (tokenPositionY - lightPositionY));

        let brightTrue = (circleCalc < lightRadiusBright) ? 1 : 0;
        let dimTrue = (circleCalc < lightRadiusDim) ? 1 : 0;
        
        if(brightTrue === 1 || dimTrue === 1){
            locLight = (brightTrue === 1) ? "bright" : "dim";
            luminosity = lights.config.luminosity;
            trueLight = {"location":locLight,"radiusBright":lightRadiusBright/100,"radiusDim":lightRadiusDim/100,"luminosity":luminosity};
           activatedLight.push(trueLight);
        }
    }

    //Lichter von Token-Lichtquellen
    tokenLights.forEach(checkTokenLights);

    function checkTokenLights(lights) {
        let lightPositionX = lights.x;
        let lightPositionY = lights.y;
        let lightRadiusBright = lights.light.bright * gridSize / 2;
        let lightRadiusDim = lights.light.dim * gridSize / 2;
        let circleCalc = Math.sqrt((tokenPositionX - lightPositionX) * (tokenPositionX - lightPositionX) + (tokenPositionY - lightPositionY) * (tokenPositionY - lightPositionY));

        let brightTrue = (circleCalc < lightRadiusBright) ? 1 : 0;
        let dimTrue = (circleCalc < lightRadiusDim) ? 1 : 0;
        
        if(brightTrue === 1 || dimTrue === 1){
            locLight = (brightTrue === 1) ? "bright" : "dim";
            luminosity = lights.light.luminosity;
            trueLight = {"location":locLight,"radiusBright":lightRadiusBright/100,"radiusDim":lightRadiusDim/100,"luminosity":luminosity};
            activatedLight.push(trueLight);
        }
    }
    return activatedLight;
}