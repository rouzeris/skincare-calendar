const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");
const { withTamagui } = require("@tamagui/metro-plugin");

const config = getDefaultConfig(__dirname);

// Apply Tamagui first
const tamaguiConfig = withTamagui(config, {
  components: ['tamagui'],
  config: './tamagui.config.ts',
});

// Then apply Rork
module.exports = withRorkMetro(tamaguiConfig);
