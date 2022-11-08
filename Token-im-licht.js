// Token im Licht v0.0.1 
/* überprüft, ob ein Token im Licht steht */

return main();

function main() {
    const tokenPositionX = token.x;
    const tokenPositionY = token.y;

    const sceneLights = canvas.scene.lights;
    const tokenLights = canvas.scene.tokens;

    const gridSize = canvas.dimensions.size;
    let luminosity = 0;

    sceneLights.forEach(checkSceneLights);

    function checkSceneLights(lights) {
        let lightPositionX = lights.x;
        let lightPositionY = lights.y;
        let lightRadiusBright = lights.config.bright * gridSize / 2;
        let lightRadiusDim = lights.config.dim * gridSize / 2;
        let circleCalc = Math.sqrt((tokenPositionX - lightPositionX) * (tokenPositionX - lightPositionX) + (tokenPositionY - lightPositionY) * (tokenPositionY - lightPositionY));

        let brightTrue = (circleCalc < lightRadiusBright) ? 1 : 0;
        let dimTrue = (circleCalc < lightRadiusDim) ? 1 : 0;

        let altLuminosity = luminosity;
        if (dimTrue === 1) {
            if (brightTrue === 1) {
                luminosity = lights.config.luminosity;
            } else {
                luminosity = lights.config.luminosity / 2;
            }
        } else {
            luminosity = 0;
        }
        luminosity = (altLuminosity >= luminosity) ? altLuminosity : luminosity;
    }

    tokenLights.forEach(checkTokenLights);

    function checkTokenLights(lights) {
        let lightPositionX = lights.x;
        let lightPositionY = lights.y;
        let lightRadiusBright = lights.light.bright * gridSize / 2;
        let lightRadiusDim = lights.light.dim * gridSize / 2;
        let circleCalc = Math.sqrt((tokenPositionX - lightPositionX) * (tokenPositionX - lightPositionX) + (tokenPositionY - lightPositionY) * (tokenPositionY - lightPositionY));

        let brightTrue = (circleCalc < lightRadiusBright) ? 1 : 0;
        let dimTrue = (circleCalc < lightRadiusDim) ? 1 : 0;

        let altLuminosity = luminosity;
        if (dimTrue === 1) {
            if (brightTrue === 1) {
                luminosity = lights.light.luminosity;
            } else {
                luminosity = lights.light.luminosity / 2;
            }

        } else {
            luminosity = 0;
        }

        luminosity = (altLuminosity >= luminosity) ? altLuminosity : luminosity;
    }
    const luminosityLevel = Math.round(luminosity * 16);
    return luminosityLevel;
}